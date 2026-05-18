/**
 * store/useBoardStore.js — 수정: setAuthor를 외부(App.jsx)에서 호출 가능하도록
 */
import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { genId, parseTags, categoryEmoji, nextColumnColor } from '../utils/helpers'

function getStoredAuthor() {
  try { return localStorage.getItem('boarda_author') || '익명' } catch { return '익명' }
}

function randomPos(index = 0) {
  const cols = 4
  return {
    pos_x: 40 + (index % cols) * 230 + Math.random() * 30,
    pos_y: 40 + Math.floor(index / cols) * 200 + Math.random() * 20,
  }
}

async function loadAllBoards() {
  const [
    { data: boards, error: bErr },
    { data: columns },
    { data: posts },
    { data: links },
    { data: wallPosts },
  ] = await Promise.all([
    supabase.from('boards').select('*').order('created_at', { ascending: false }),
    supabase.from('columns').select('*').order('position'),
    supabase.from('posts').select('*').order('created_at'),
    supabase.from('links').select('*').order('created_at'),
    supabase.from('wall_posts').select('*').order('created_at'),
  ])
  if (bErr) throw bErr
  return (boards ?? []).map((b) => ({
    ...b, desc: b.description ?? '',
    columns: b.type === 'columns'
      ? (columns ?? []).filter((c) => c.board_id === b.id)
          .map((c) => ({ ...c, posts: (posts ?? []).filter((p) => p.column_id === c.id) }))
      : undefined,
    links:     b.type === 'links' ? (links ?? []).filter((l) => l.board_id === b.id) : undefined,
    wall_posts: b.type === 'wall' ? (wallPosts ?? []).filter((w) => w.board_id === b.id) : undefined,
  }))
}

const useBoardStore = create((set, get) => ({
  boards: [],
  sidebarCollapsed: false,
  toasts: [],
  loading: false,
  author: getStoredAuthor(),

  /* 로그인 후 App.jsx에서 호출해 author 동기화 */
  setAuthor: (name) => {
    const val = (name || '').trim() || '익명'
    try { localStorage.setItem('boarda_author', val) } catch {}
    set({ author: val })
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  showToast: (message, type = 'success') => {
    const id = genId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  fetchBoards: async () => {
    set({ loading: true })
    try { set({ boards: await loadAllBoards() }) }
    catch (e) { console.error('fetchBoards:', e); get().showToast('데이터 불러오기 실패', 'error') }
    finally { set({ loading: false }) }
  },

  /* ── 보드 ── */
  createBoard: async ({ type, name, desc = '', color = '#6C63FF' }) => {
    const id = genId('b')
    const { error } = await supabase.from('boards').insert({ id, type, name, description: desc, color, author: get().author })
    if (error) { get().showToast('보드 생성 실패: ' + error.message, 'error'); return null }
    try { set({ boards: await loadAllBoards() }) } catch {}
    get().showToast('보드가 생성되었습니다! 🎉', 'success')
    return id
  },
  deleteBoard: async (boardId) => {
    await supabase.from('boards').delete().eq('id', boardId)
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }))
    get().showToast('보드가 삭제되었습니다', 'info')
  },

  /* ── 컬럼 ── */
  addColumn: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    const id = genId('c'), position = (board?.columns ?? []).length
    const { error } = await supabase.from('columns').insert({ id, board_id: boardId, name: '새 컬럼', color: nextColumnColor(position), position, author: get().author })
    if (error) { get().showToast('컬럼 추가 실패', 'error'); return null }
    await get().fetchBoards(); return id
  },
  renameColumn: async (boardId, colId, name) => {
    await supabase.from('columns').update({ name }).eq('id', colId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, columns: b.columns.map((c) => c.id === colId ? { ...c, name } : c) }) }))
  },
  deleteColumn: async (boardId, colId) => {
    await supabase.from('columns').delete().eq('id', colId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, columns: b.columns.filter((c) => c.id !== colId) }) }))
    get().showToast('컬럼이 삭제되었습니다', 'info')
  },

  /* ── 게시물 ── */
  addPost: async (boardId, colId, { title, content = '', tags = [], attachments = [] }) => {
    const id = genId('p')
    const { error } = await supabase.from('posts').insert({ id, board_id: boardId, column_id: colId, title, content, tags: Array.isArray(tags) ? tags : parseTags(tags), attachments, author: get().author })
    if (error) { get().showToast('게시물 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('게시물이 추가되었습니다! ✨', 'success'); return id
  },
  updatePost: async (boardId, colId, postId, patch) => {
    const { error } = await supabase.from('posts').update(patch).eq('id', postId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('게시물이 수정되었습니다', 'success')
  },
  deletePost: async (boardId, colId, postId) => {
    await supabase.from('posts').delete().eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, columns: b.columns.map((c) => c.id !== colId ? c : { ...c, posts: c.posts.filter((p) => p.id !== postId) }) }) }))
    get().showToast('게시물이 삭제되었습니다', 'info')
  },

  /* ── 링크 ── */
  addLink: async (boardId, { title, url, desc = '', category = '기타', importance = '보통', tags = [], attachments = [] }) => {
    const id = genId('l')
    const { error } = await supabase.from('links').insert({ id, board_id: boardId, title, url, description: desc, category, importance, tags: Array.isArray(tags) ? tags : parseTags(tags), emoji: categoryEmoji(category), attachments, author: get().author })
    if (error) { get().showToast('링크 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('링크가 추가되었습니다! 🔗', 'success'); return id
  },
  updateLink: async (boardId, linkId, patch) => {
    const { error } = await supabase.from('links').update({ ...patch, ...(patch.category ? { emoji: categoryEmoji(patch.category) } : {}) }).eq('id', linkId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('링크가 수정되었습니다', 'success')
  },
  deleteLink: async (boardId, linkId) => {
    await supabase.from('links').delete().eq('id', linkId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, links: b.links.filter((l) => l.id !== linkId) }) }))
    get().showToast('링크가 삭제되었습니다', 'info')
  },

  /* ── 담벼락 ── */
  addWallPost: async (boardId, { content, color, attachments = [] }) => {
    const board = get().boards.find((b) => b.id === boardId)
    const id = genId('w')
    const { pos_x, pos_y } = randomPos((board?.wall_posts ?? []).length)
    const { error } = await supabase.from('wall_posts').insert({ id, board_id: boardId, content, color, pos_x, pos_y, width: 200, attachments, author: get().author })
    if (error) { get().showToast('메모 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('메모가 붙여졌습니다! 📝', 'success'); return id
  },
  updateWallPost: async (boardId, postId, patch) => {
    const { error } = await supabase.from('wall_posts').update(patch).eq('id', postId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('메모가 수정되었습니다', 'success')
  },
  moveWallPost: async (boardId, postId, pos_x, pos_y) => {
    await supabase.from('wall_posts').update({ pos_x, pos_y }).eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, wall_posts: b.wall_posts.map((w) => w.id !== postId ? w : { ...w, pos_x, pos_y }) }) }))
  },
  deleteWallPost: async (boardId, postId) => {
    await supabase.from('wall_posts').delete().eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : { ...b, wall_posts: b.wall_posts.filter((w) => w.id !== postId) }) }))
    get().showToast('메모가 삭제되었습니다', 'info')
  },
}))

export default useBoardStore
