/**
 * store/useAuthStore.js
 * 수정: 로컬 개발환경(npm run dev)에서도 동작하도록
 *  - VITE_USE_MOCK_AUTH=true 시 PHP/Vercel API 없이 목업 로그인
 *  - 프로덕션(Vercel)에서는 실제 /api/login 호출
 */
import { create } from 'zustand'

const TOKEN_KEY = 'boarda_token'
const USER_KEY  = 'boarda_user'

/* 개발환경 여부 판단 */
const IS_DEV  = import.meta.env.DEV
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

function loadSession() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY)
    const user  = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    return { token, user }
  } catch { return { token: null, user: null } }
}

/* ── 목업 로그인 (로컬 개발용) ── */
async function mockLogin(username, password) {
  await new Promise((r) => setTimeout(r, 600)) // 네트워크 딜레이 시뮬레이션

  /* 개발용 테스트 계정 */
  const accounts = [
    { username: 'admin',   password: 'admin123',   name: '관리자',  nickname: '관리자', role: 'admin',   is_classboard: true, school_name: '테스트학교' },
    { username: 'teacher', password: 'teacher123', name: '홍길동',  nickname: '홍선생', role: 'teacher', is_classboard: true, school_name: '테스트학교', class_name: '3학년 2반' },
    { username: 'teacher2',password: 'teacher123', name: '김영희',  nickname: '김선생', role: 'teacher', is_classboard: true, school_name: '테스트학교', class_name: '2학년 1반' },
  ]

  const found = accounts.find((a) => a.username === username && a.password === password)
  if (!found) return { ok: false, msg: '아이디 또는 비밀번호가 올바르지 않습니다' }

  /* 가짜 JWT (개발용 — 서명 없음) */
  const payload = btoa(JSON.stringify({
    id: Math.floor(Math.random() * 1000),
    username: found.username,
    name: found.name,
    nickname: found.nickname,
    role: found.role,
    is_classboard: found.is_classboard,
    school_name: found.school_name,
    class_name: found.class_name,
  }))
  const fakeToken = `dev.${payload}.sig`

  return { ok: true, token: fakeToken, user: {
    id: Math.floor(Math.random() * 1000),
    username: found.username,
    name: found.name,
    nickname: found.nickname,
    role: found.role,
    is_classboard: found.is_classboard,
    school_name: found.school_name,
    class_name: found.class_name,
  }}
}

/* ── 목업 토큰 검증 ── */
async function mockVerify(token) {
  if (!token || !token.startsWith('dev.')) return { ok: false }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { ok: true, user: payload }
  } catch { return { ok: false } }
}

const useAuthStore = create((set, get) => {
  const { token, user } = loadSession()

  return {
    token,
    user,
    loading: false,
    error: null,

    /* ── 로그인 ── */
    login: async (username, password) => {
      set({ loading: true, error: null })
      try {
        let data

        if (IS_DEV || USE_MOCK) {
          /* 개발환경: 목업 로그인 */
          data = await mockLogin(username, password)
        } else {
          /* 프로덕션: 실제 Vercel API 호출 */
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
        set({ loading: false, error: '서버에 연결할 수 없습니다' })
        return false
      }
    },

    /* ── 로그아웃 ── */
    logout: () => {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
      set({ token: null, user: null, error: null })
    },

    /* ── 토큰 재검증 ── */
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
              'Authorization': `Bearer ${token}`,
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
      } catch { /* 네트워크 오류 시 로컬 토큰 유지 */ }
    },

    /* ── 권한 헬퍼 ── */
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
