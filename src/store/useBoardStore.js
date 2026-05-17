/**
 * store/useBoardStore.js
 * 수정: author 필드, attachments, updateLink/updatePost 추가
 */
import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { genId, parseTags, categoryEmoji, nextColumnColor, today } from '../utils/helpers'

/* 로컬 작성자 이름 (로그인 없이 localStorage로 유지) */
function getAuthor() {
  try {
    return localStorage.getItem('boarda_author') || '익명'
  } catch { return '익명' }
}

const useBoardStore = create((set, get) => ({

  boards: [],
  sidebarCollapsed: false,
  toasts: [],
  loading: false,
  author: getAuthor(),   // 현재 사용자 이름

  /* ── 사용자 이름 변경 ── */
  setAuthor: (name) => {
    const val = name.trim() || '익명'
    try { localStorage.setItem('boarda_author', val) } catch {}
    set({ author: val })
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  showToast: (message, type = 'success') => {
    const id = genId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3200)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ── 전체 데이터 불러오기 ── */
  fetchBoards: async () => {
    set({ loading: true })
    try {
      const [
        { data: boards },
        { data: columns },
        { data: posts },
        { data: links },
      ] = await Promise.all([
        supabase.from('boards').select('*').order('created_at', { ascending: false }),
        supabase.from('columns').select('*').order('position'),
        supabase.from('posts').select('*').order('created_at'),
        supabase.from('links').select('*').order('created_at'),
      ])

      const merged = (boards ?? []).map((b) => ({
        ...b,
        desc: b.description ?? '',
        columns: b.type === 'columns'
          ? (columns ?? [])
              .filter((c) => c.board_id === b.id)
              .map((c) => ({
                ...c,
                posts: (posts ?? []).filter((p) => p.column_id === c.id),
              }))
          : undefined,
        links: b.type === 'links'
          ? (links ?? []).filter((l) => l.board_id === b.id)
          : undefined,
      }))

      set({ boards: merged })
    } catch (e) {
      console.error('fetchBoards 오류:', e)
      get().showToast('데이터 불러오기 실패', 'error')
    } finally {
      set({ loading: false })
    }
  },

  /* ── 보드 CRUD ── */
  createBoard: async ({ type, name, desc = '', color = '#6C63FF' }) => {
    const id = genId('b')
    const { error } = await supabase.from('boards').insert({
      id, type, name, description: desc, color, author: get().author,
    })
    if (error) { get().showToast('보드 생성 실패: ' + error.message, 'error'); return null }
    await get().fetchBoards()
    get().showToast('보드가 생성되었습니다! 🎉', 'success')
    return id
  },

  deleteBoard: async (boardId) => {
    await supabase.from('boards').delete().eq('id', boardId)
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }))
    get().showToast('보드가 삭제되었습니다', 'info')
  },

  /* ── 컬럼 CRUD ── */
  addColumn: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    const id = genId('c')
    const position = (board?.columns ?? []).length
    const color = nextColumnColor(position)
    const { error } = await supabase.from('columns').insert({
      id, board_id: boardId, name: '새 컬럼', color, position, author: get().author,
    })
    if (error) { get().showToast('컬럼 추가 실패', 'error'); return null }
    await get().fetchBoards()
    return id
  },

  renameColumn: async (boardId, colId, name) => {
    await supabase.from('columns').update({ name }).eq('id', colId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          columns: b.columns.map((c) => c.id === colId ? { ...c, name } : c),
        }
      ),
    }))
  },

  deleteColumn: async (boardId, colId) => {
    await supabase.from('columns').delete().eq('id', colId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b, columns: b.columns.filter((c) => c.id !== colId),
        }
      ),
    }))
    get().showToast('컬럼이 삭제되었습니다', 'info')
  },

  /* ── 게시물 CRUD ── */
  addPost: async (boardId, colId, { title, content = '', tags = [], attachments = [] }) => {
    const id = genId('p')
    const { error } = await supabase.from('posts').insert({
      id, board_id: boardId, column_id: colId, title, content,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      attachments: attachments,
      author: get().author,
    })
    if (error) { get().showToast('게시물 추가 실패', 'error'); return null }
    await get().fetchBoards()
    get().showToast('게시물이 추가되었습니다! ✨', 'success')
    return id
  },

  updatePost: async (boardId, colId, postId, patch) => {
    const { error } = await supabase.from('posts').update(patch).eq('id', postId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards()
    get().showToast('게시물이 수정되었습니다', 'success')
  },

  deletePost: async (boardId, colId, postId) => {
    await supabase.from('posts').delete().eq('id', postId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          columns: b.columns.map((c) =>
            c.id !== colId ? c : {
              ...c, posts: c.posts.filter((p) => p.id !== postId),
            }
          ),
        }
      ),
    }))
    get().showToast('게시물이 삭제되었습니다', 'info')
  },

  /* ── 링크 CRUD ── */
  addLink: async (boardId, { title, url, desc = '', category = '기타', importance = '보통', tags = [], attachments = [] }) => {
    const id = genId('l')
    const { error } = await supabase.from('links').insert({
      id, board_id: boardId, title, url, description: desc,
      category, importance,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      emoji: categoryEmoji(category),
      attachments: attachments,
      author: get().author,
    })
    if (error) { get().showToast('링크 추가 실패', 'error'); return null }
    await get().fetchBoards()
    get().showToast('링크가 추가되었습니다! 🔗', 'success')
    return id
  },

  updateLink: async (boardId, linkId, patch) => {
    const updateData = {
      ...patch,
      ...(patch.category ? { emoji: categoryEmoji(patch.category) } : {}),
    }
    const { error } = await supabase.from('links').update(updateData).eq('id', linkId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards()
    get().showToast('링크가 수정되었습니다', 'success')
  },

  deleteLink: async (boardId, linkId) => {
    await supabase.from('links').delete().eq('id', linkId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b, links: b.links.filter((l) => l.id !== linkId),
        }
      ),
    }))
    get().showToast('링크가 삭제되었습니다', 'info')
  },

  /* ── 파일 업로드 (Supabase Storage) ── */
  uploadFile: async (file) => {
    const ext  = file.name.split('.').pop()
    const path = `${genId('file')}.${ext}`
    const { error } = await supabase.storage
      .from('boarda-files')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { get().showToast('파일 업로드 실패: ' + error.message, 'error'); return null }
    const { data } = supabase.storage.from('boarda-files').getPublicUrl(path)
    return { name: file.name, url: data.publicUrl, type: file.type, size: file.size }
  },
}))

export default useBoardStore
