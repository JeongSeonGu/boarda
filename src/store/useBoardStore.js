/**
 * store/useBoardStore.js
 * 수정: reorderWallPosts, bringWallPostToFront 추가
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
    supabase.from('wall_posts').select('*').order('z_order').order('created_at'),
  ])
  if (bErr) throw bErr
  return (boards ?? []).map((b) => ({
    ...b, desc: b.description ?? '',
    columns: b.type === 'columns'
      ? (columns ?? []).filter((c) => c.board_id === b.id)
          .map((c) => ({ ...c, posts: (posts ?? []).filter((p) => p.column_id === c.id) }))
      : undefined,
    links:      b.type === 'links' ? (links ?? []).filter((l) => l.board_id === b.id) : undefined,
    wall_posts: b.type === 'wall'  ? (wallPosts ?? []).filter((w) => w.board_id === b.id) : undefined,
  }))
}
function urlToStoragePath(url = '') {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/object/public/boarda-files/')
    return parts[1] ?? null
  } catch { return null }
}
function collectStoragePaths(board) {
  const paths = []
  if (!board) return paths
  if (board.bg_image_key) paths.push(board.bg_image_key)
  ;(board.columns ?? []).forEach((col) =>
    (col.posts ?? []).forEach((p) =>
      (p.attachments ?? []).forEach((f) => {
        if (f.type !== 'link') { const path = urlToStoragePath(f.url); if (path) paths.push(path) }
      })
    )
  )
  ;(board.links ?? []).forEach((l) =>
    (l.attachments ?? []).forEach((f) => {
      if (f.type !== 'link') { const path = urlToStoragePath(f.url); if (path) paths.push(path) }
    })
  )
  ;(board.wall_posts ?? []).forEach((w) =>
    (w.attachments ?? []).forEach((f) => {
      if (f.type !== 'link') { const path = urlToStoragePath(f.url); if (path) paths.push(path) }
    })
  )
  return paths
}

const useBoardStore = create((set, get) => ({
  boards: [], sidebarCollapsed: false, toasts: [], loading: false,
  author: getStoredAuthor(),

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

  /* ── 보드 생성 ── */
  createBoard: async ({ type, name, desc = '', color = '#6C63FF' }) => {
    const id = genId('b')
    const { error } = await supabase.from('boards').insert({
      id, type, name, description: desc, color, author: get().author,
      is_public: false, share_mode: 'private',
    })
    if (error) { get().showToast('보드 생성 실패: ' + error.message, 'error'); return null }
    try { set({ boards: await loadAllBoards() }) } catch {}
    get().showToast('보드가 생성되었습니다! 🎉', 'success')
    return id
  },

  updateBoard: async (boardId, patch) => {
    const { error } = await supabase.from('boards').update(patch).eq('id', boardId)
    if (error) { get().showToast('설정 저장 실패: ' + error.message, 'error'); return }
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : { ...b, ...patch, desc: patch.description ?? b.desc }
      ),
    }))
    get().showToast('저장되었습니다 ✅', 'success')
  },

  deleteBoard: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    const paths = collectStoragePaths(board)
    if (paths.length > 0) {
      await supabase.storage.from('boarda-files').remove(paths).catch((e) =>
        console.warn('[deleteBoard] Storage 삭제 실패:', e.message)
      )
    }
    await supabase.from('boards').delete().eq('id', boardId)
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }))
    get().showToast('보드와 관련 파일이 삭제되었습니다', 'info')
  },

  unshareBoard: async (boardId) => {
    await get().updateBoard(boardId, {
      is_public: false, share_mode: 'private',
      share_password: null, share_edit: false,
    })
    get().showToast('공유가 해제되었습니다', 'info')
  },

  /* ══════════════════════════════════════
     드래그앤드롭 순서 변경
  ══════════════════════════════════════ */

  /** 컬럼 순서 변경 */
  reorderColumns: async (boardId, orderedColIds) => {
    set((s) => ({
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b
        const colMap = Object.fromEntries(b.columns.map((c) => [c.id, c]))
        return { ...b, columns: orderedColIds.map((id) => colMap[id]).filter(Boolean) }
      }),
    }))
    await Promise.all(
      orderedColIds.map((id, idx) =>
        supabase.from('columns').update({ position: idx }).eq('id', id)
      )
    )
  },

  /** 게시물 순서/컬럼 간 이동 */
  reorderPosts: async (boardId, srcColId, dstColId, postId, dstIndex) => {
    set((s) => ({
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b
        const cols = b.columns.map((c) => ({ ...c, posts: [...c.posts] }))
        const srcCol = cols.find((c) => c.id === srcColId)
        const dstCol = cols.find((c) => c.id === dstColId)
        if (!srcCol || !dstCol) return b
        const postIdx = srcCol.posts.findIndex((p) => p.id === postId)
        if (postIdx === -1) return b
        const [post] = srcCol.posts.splice(postIdx, 1)
        if (srcColId !== dstColId) post.column_id = dstColId
        dstCol.posts.splice(dstIndex, 0, post)
        return { ...b, columns: cols }
      }),
    }))
    if (srcColId !== dstColId) {
      await supabase.from('posts').update({ column_id: dstColId }).eq('id', postId)
    }
  },

  /** 링크 순서 변경 */
  reorderLinks: async (boardId, orderedLinkIds) => {
    set((s) => ({
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b
        const linkMap = Object.fromEntries(b.links.map((l) => [l.id, l]))
        return { ...b, links: orderedLinkIds.map((id) => linkMap[id]).filter(Boolean) }
      }),
    }))
    await Promise.all(
      orderedLinkIds.map((id, idx) =>
        supabase.from('links').update({ position: idx }).eq('id', id).then(() => {})
      )
    ).catch(() => {})
  },

  /**
   * 담벼락 격자 모드 순서 변경
   * z_order 를 인덱스 기반으로 일괄 업데이트
   */
  reorderWallPosts: async (boardId, orderedPostIds) => {
    /* 로컬 즉시 반영 */
    set((s) => ({
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b
        const postMap = Object.fromEntries(b.wall_posts.map((w) => [w.id, w]))
        return {
          ...b,
          wall_posts: orderedPostIds.map((id, idx) =>
            postMap[id] ? { ...postMap[id], z_order: idx } : null
          ).filter(Boolean),
        }
      }),
    }))
    /* DB 반영 */
    await Promise.all(
      orderedPostIds.map((id, idx) =>
        supabase.from('wall_posts').update({ z_order: idx }).eq('id', id)
      )
    )
  },

  /**
   * 자유 모드: 클릭한 카드를 최상위로 올리기
   */
  bringWallPostToFront: async (boardId, postId, newZOrder) => {
    /* 로컬 즉시 반영 */
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId ? b : {
          ...b,
          wall_posts: b.wall_posts.map((w) =>
            w.id === postId ? { ...w, z_order: newZOrder } : w
          ),
        }
      ),
    }))
    /* DB 반영 (debounce 없이 즉시 — 빈도 낮음) */
    await supabase.from('wall_posts').update({ z_order: newZOrder }).eq('id', postId)
  },

  /* ── 컬럼 CRUD ── */
  addColumn: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    const id = genId('c'), position = (board?.columns ?? []).length
    const { error } = await supabase.from('columns').insert({
      id, board_id: boardId, name: '새 컬럼',
      color: nextColumnColor(position), position, author: get().author,
    })
    if (error) { get().showToast('컬럼 추가 실패', 'error'); return null }
    await get().fetchBoards(); return id
  },
  renameColumn: async (boardId, colId, name) => {
    await supabase.from('columns').update({ name }).eq('id', colId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, columns: b.columns.map((c) => c.id === colId ? { ...c, name } : c) }) }))
  },
  deleteColumn: async (boardId, colId) => {
    await supabase.from('columns').delete().eq('id', colId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, columns: b.columns.filter((c) => c.id !== colId) }) }))
    get().showToast('컬럼이 삭제되었습니다', 'info')
  },

  /* ── 게시물 CRUD ── */
  addPost: async (boardId, colId, { title, content = '', tags = [], attachments = [] }) => {
    const id = genId('p')
    const { error } = await supabase.from('posts').insert({
      id, board_id: boardId, column_id: colId, title, content,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      attachments, author: get().author,
    })
    if (error) { get().showToast('게시물 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('게시물이 추가되었습니다! ✨', 'success'); return id
  },
  updatePost: async (boardId, colId, postId, patch) => {
    const { error } = await supabase.from('posts').update(patch).eq('id', postId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('수정되었습니다', 'success')
  },
  deletePost: async (boardId, colId, postId) => {
    await supabase.from('posts').delete().eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, columns: b.columns.map((c) => c.id !== colId ? c : {
        ...c, posts: c.posts.filter((p) => p.id !== postId) }) }) }))
    get().showToast('게시물이 삭제되었습니다', 'info')
  },

  /* ── 링크 CRUD ── */
  addLink: async (boardId, { title, url, desc = '', category = '기타', importance = '보통', tags = [], attachments = [] }) => {
    const id = genId('l')
    const { error } = await supabase.from('links').insert({
      id, board_id: boardId, title, url, description: desc, category, importance,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      emoji: categoryEmoji(category), attachments, author: get().author,
    })
    if (error) { get().showToast('링크 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('링크가 추가되었습니다! 🔗', 'success'); return id
  },
  updateLink: async (boardId, linkId, patch) => {
    const { error } = await supabase.from('links').update({
      ...patch, ...(patch.category ? { emoji: categoryEmoji(patch.category) } : {})
    }).eq('id', linkId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('수정되었습니다', 'success')
  },
  deleteLink: async (boardId, linkId) => {
    await supabase.from('links').delete().eq('id', linkId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, links: b.links.filter((l) => l.id !== linkId) }) }))
    get().showToast('링크가 삭제되었습니다', 'info')
  },

  /* ── 담벼락 CRUD ── */
  addWallPost: async (boardId, { content, color, attachments = [] }) => {
    const board = get().boards.find((b) => b.id === boardId)
    const wallPosts = board?.wall_posts ?? []
    const id = genId('w')
    const { pos_x, pos_y } = randomPos(wallPosts.length)
    const maxZ = Math.max(0, ...wallPosts.map((w) => w.z_order ?? 0))
    const { error } = await supabase.from('wall_posts').insert({
      id, board_id: boardId, content, color,
      pos_x, pos_y, width: 200,
      z_order: maxZ + 1,
      attachments, author: get().author,
    })
    if (error) { get().showToast('메모 추가 실패', 'error'); return null }
    await get().fetchBoards(); get().showToast('메모가 붙여졌습니다! 📝', 'success'); return id
  },
  updateWallPost: async (boardId, postId, patch) => {
    const { error } = await supabase.from('wall_posts').update(patch).eq('id', postId)
    if (error) { get().showToast('수정 실패', 'error'); return }
    await get().fetchBoards(); get().showToast('수정되었습니다', 'success')
  },
  moveWallPost: async (boardId, postId, pos_x, pos_y) => {
    await supabase.from('wall_posts').update({ pos_x, pos_y }).eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, wall_posts: b.wall_posts.map((w) =>
        w.id !== postId ? w : { ...w, pos_x, pos_y }) }) }))
  },
  deleteWallPost: async (boardId, postId) => {
    await supabase.from('wall_posts').delete().eq('id', postId)
    set((s) => ({ boards: s.boards.map((b) => b.id !== boardId ? b : {
      ...b, wall_posts: b.wall_posts.filter((w) => w.id !== postId) }) }))
    get().showToast('메모가 삭제되었습니다', 'info')
  },
}))

export default useBoardStore