import { create } from 'zustand'

const TOKEN_KEY = 'boarda_token'
const USER_KEY  = 'boarda_user'

const IS_DEV   = import.meta.env.DEV
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

function loadSession() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY)
    const user  = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    return { token, user }
  } catch { return { token: null, user: null } }
}

async function mockLogin(username, password) {
  await new Promise((r) => setTimeout(r, 500))

  const accounts = [
    { username: 'admin',    password: 'admin123',   name: '관리자', nickname: '관리자', role: 'admin',   is_classboard: true, school_name: '테스트학교' },
    { username: 'teacher',  password: 'teacher123', name: '홍길동', nickname: '홍선생', role: 'teacher', is_classboard: true, school_name: '테스트학교', class_name: '3학년 2반' },
    { username: 'teacher2', password: 'teacher123', name: '김영희', nickname: '김선생', role: 'teacher', is_classboard: true, school_name: '테스트학교', class_name: '2학년 1반' },
  ]

  const found = accounts.find((a) => a.username === username && a.password === password)
  if (!found) return { ok: false, msg: '아이디 또는 비밀번호가 올바르지 않습니다' }

  const user = {
    id:            Math.floor(Math.random() * 1000),
    username:      found.username,
    name:          found.name,
    nickname:      found.nickname,
    role:          found.role,
    is_classboard: found.is_classboard,
    school_name:   found.school_name,
    class_name:    found.class_name ?? '',
  }

  const token = 'dev-token-' + found.username + '-' + Date.now()

  return { ok: true, token, user }
}

async function mockVerify(token) {
  if (!token || !token.startsWith('dev-token-')) return { ok: false }
  try {
    const user = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    if (!user) return { ok: false }
    return { ok: true, user }
  } catch { return { ok: false } }
}

const useAuthStore = create((set, get) => {
  const { token, user } = loadSession()

  return {
    token,
    user,
    loading: false,
    error: null,

    login: async (username, password) => {
      set({ loading: true, error: null })
      try {
        let data

        if (IS_DEV || USE_MOCK) {
          data = await mockLogin(username, password)
        } else {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          data = await res.json()
        }

        if (!data.ok) {
          set({ loading: false, error: data.msg || '로그인 실패' })
          return false
        }

        sessionStorage.setItem(TOKEN_KEY, data.token)
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
        set({ token: data.token, user: data.user, loading: false, error: null })
        return true

      } catch (e) {
        console.error('[login]', e)
        set({ loading: false, error: '오류: ' + e.message })
        return false
      }
    },

    logout: () => {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
      set({ token: null, user: null, error: null })
    },

    verify: async () => {
      const { token } = get()
      if (!token) return
      try {
        let data
        if (IS_DEV || USE_MOCK) {
          data = await mockVerify(token)
        } else {
          const res = await fetch('/api/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
          })
          data = await res.json()
        }
        if (!data.ok) {
          get().logout()
        } else {
          sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
          set({ user: data.user })
        }
      } catch {}
    },

    isOwnerOf: (authorName) => {
      const { user } = get()
      if (!user) return false
      if (user.role === 'admin') return true
      return (
        user.name     === authorName ||
        user.nickname === authorName ||
        user.username === authorName
      )
    },

    canEdit: () => !!get().user,
    clearError: () => set({ error: null }),
  }
})

export default useAuthStore