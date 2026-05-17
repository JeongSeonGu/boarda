import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { genId, today, parseTags, categoryEmoji, nextColumnColor } from '../utils/helpers'

const useBoardStore = create((set, get) => ({
  boards: [],
  sidebarCollapsed: false,
  toasts: [],
  loading: false,

  /* ── 토스트 ── */
  showToast: (message, type = 'success') => {
    const id = genId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3200)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  /* ── 전체 보드 불러오기 ── */
  fetchBoards: async () => {
    set({ loading: true })
    const { data: boards } = await supabase
      .from('boards').select('*').order('created_at', { ascending: false })
    const { data: columns } = await supabase
      .from('columns').select('*').order('position')
    const { data: posts } = await supabase
      .from('posts').select('*').order('created_at')
    const { data: links } = await supabase
      .from('links').select('*').order('created_at')

    const merged = (boards ?? []).map((b) => ({
      ...b,
      desc: b.description,
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

    set({ boards: merged, loading: false })
  },

  /* ── 보드 생성 ── */
  createBoard: async ({ type, name, desc = '', color = '#6C63FF' }) => {
    const id = genId('b')
    const { error } = await supabase.from('boards').insert({
      id, type, name, description: desc, color,
    })
    if (error) { get().showToast('보드 생성 실패', 'error'); return null }
    await get().fetchBoards()
    get().showToast('보드가 생성되었습니다! 🎉', 'success')
    return id
  },

  /* ── 보드 삭제 ── */
  deleteBoard: async (boardId) => {
    await supabase.from('boards').delete().eq('id', boardId)
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }))
    get().showToast('보드가 삭제되었습니다', 'info')
  },

  /* ── 컬럼 추가 ── */
  addColumn: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    const id = genId('c')
    const position = (board?.columns ?? []).length
    const color = nextColumnColor(position)
    await supabase.from('columns').insert({
      id, board_id: boardId, name: '새 컬럼', color, position,
    })
    await get().fetchBoards()
    return id
  },

  /* ── 컬럼 이름 변경 ── */
  renameColumn: async (boardId, colId, name) => {
    await supabase.from('columns').update({ name }).eq('id', colId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          columns: b.columns.map((c) =>
            c.id === colId ? { ...c, name } : c
          ),
        }
      ),
    }))
  },

  /* ── 컬럼 삭제 ── */
  deleteColumn: async (boardId, colId) => {
    await supabase.from('columns').delete().eq('id', colId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          columns: b.columns.filter((c) => c.id !== colId),
        }
      ),
    }))
    get().showToast('컬럼이 삭제되었습니다', 'info')
  },

  /* ── 게시물 추가 ── */
  addPost: async (boardId, colId, { title, content = '', tags = [] }) => {
    const id = genId('p')
    await supabase.from('posts').insert({
      id,
      board_id: boardId,
      column_id: colId,
      title,
      content,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
    })
    await get().fetchBoards()
    get().showToast('게시물이 추가되었습니다! ✨', 'success')
    return id
  },

  /* ── 게시물 삭제 ── */
  deletePost: async (boardId, colId, postId) => {
    await supabase.from('posts').delete().eq('id', postId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          columns: b.columns.map((c) =>
            c.id !== colId ? c : {
              ...c,
              posts: c.posts.filter((p) => p.id !== postId),
            }
          ),
        }
      ),
    }))
    get().showToast('게시물이 삭제되었습니다', 'info')
  },

  /* ── 링크 추가 ── */
  addLink: async (boardId, { title, url, desc = '', category = '기타', importance = '보통', tags = [] }) => {
    const id = genId('l')
    await supabase.from('links').insert({
      id,
      board_id: boardId,
      title, url,
      description: desc,
      category, importance,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      emoji: categoryEmoji(category),
    })
    await get().fetchBoards()
    get().showToast('링크가 추가되었습니다! 🔗', 'success')
    return id
  },

  /* ── 링크 삭제 ── */
  deleteLink: async (boardId, linkId) => {
    await supabase.from('links').delete().eq('id', linkId)
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          links: b.links.filter((l) => l.id !== linkId),
        }
      ),
    }))
    get().showToast('링크가 삭제되었습니다', 'info')
  },
}))

export default useBoardStore