/**
 * store/useBoardStore.js
 * Zustand 전역 상태 관리.
 * 보드 CRUD, 컬럼 CRUD, 게시물 CRUD, 링크 CRUD, 토스트, UI 상태.
 */

import { create } from 'zustand';
import { getSeedBoards } from '../utils/seedData';
import { genId, today, parseTags, categoryEmoji, nextColumnColor } from '../utils/helpers';

const useBoardStore = create((set, get) => ({
  /* ── 데이터 ── */
  boards: getSeedBoards(),

  /* ── UI 상태 ── */
  sidebarCollapsed: false,
  toasts: [],

  /* ======================================================
     사이드바
     ====================================================== */
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  /* ======================================================
     토스트
     ====================================================== */
  showToast: (message, type = 'success') => {
    const id = genId('toast');
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ======================================================
     보드 (Board) CRUD
     ====================================================== */

  /** 새 보드 생성 */
  createBoard: ({ type, name, desc = '', color = '#6C63FF' }) => {
    const board = {
      id: genId('b'),
      type,
      name,
      desc,
      color,
      createdAt: today(),
      ...(type === 'columns' ? { columns: [] } : { links: [] }),
    };
    set((s) => ({ boards: [board, ...s.boards] }));
    get().showToast('보드가 생성되었습니다! 🎉', 'success');
    return board.id;
  },

  /** 보드 수정 */
  updateBoard: (boardId, patch) =>
    set((s) => ({
      boards: s.boards.map((b) => (b.id === boardId ? { ...b, ...patch } : b)),
    })),

  /** 보드 삭제 */
  deleteBoard: (boardId) => {
    set((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }));
    get().showToast('보드가 삭제되었습니다', 'info');
  },

  /* ======================================================
     컬럼 (Column) CRUD — type: 'columns' 보드 전용
     ====================================================== */

  /** 컬럼 추가 */
  addColumn: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId);
    if (!board) return null;
    const col = {
      id: genId('c'),
      name: '새 컬럼',
      color: nextColumnColor((board.columns ?? []).length),
      posts: [],
    };
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id === boardId ? { ...b, columns: [...(b.columns ?? []), col] } : b
      ),
    }));
    return col.id;
  },

  /** 컬럼 이름 변경 */
  renameColumn: (boardId, colId, name) =>
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              columns: b.columns.map((c) =>
                c.id === colId ? { ...c, name } : c
              ),
            }
      ),
    })),

  /** 컬럼 색상 변경 */
  updateColumnColor: (boardId, colId, color) =>
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              columns: b.columns.map((c) =>
                c.id === colId ? { ...c, color } : c
              ),
            }
      ),
    })),

  /** 컬럼 삭제 */
  deleteColumn: (boardId, colId) => {
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : { ...b, columns: b.columns.filter((c) => c.id !== colId) }
      ),
    }));
    get().showToast('컬럼이 삭제되었습니다', 'info');
  },

  /* ======================================================
     게시물 (Post) CRUD
     ====================================================== */

  /** 게시물 추가 */
  addPost: (boardId, colId, { title, content = '', tags = [] }) => {
    const post = {
      id: genId('p'),
      title,
      content,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      createdAt: today(),
    };
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              columns: b.columns.map((c) =>
                c.id === colId ? { ...c, posts: [...c.posts, post] } : c
              ),
            }
      ),
    }));
    get().showToast('게시물이 추가되었습니다! ✨', 'success');
    return post.id;
  },

  /** 게시물 수정 */
  updatePost: (boardId, colId, postId, patch) =>
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              columns: b.columns.map((c) =>
                c.id !== colId
                  ? c
                  : {
                      ...c,
                      posts: c.posts.map((p) =>
                        p.id === postId ? { ...p, ...patch } : p
                      ),
                    }
              ),
            }
      ),
    })),

  /** 게시물 삭제 */
  deletePost: (boardId, colId, postId) => {
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              columns: b.columns.map((c) =>
                c.id !== colId
                  ? c
                  : { ...c, posts: c.posts.filter((p) => p.id !== postId) }
              ),
            }
      ),
    }));
    get().showToast('게시물이 삭제되었습니다', 'info');
  },

  /* ======================================================
     링크 (LinkItem) CRUD — type: 'links' 보드 전용
     ====================================================== */

  /** 링크 추가 */
  addLink: (
    boardId,
    { title, url, desc = '', category = '기타', importance = '보통', tags = [] }
  ) => {
    const link = {
      id: genId('l'),
      title,
      url,
      desc,
      category,
      importance,
      tags: Array.isArray(tags) ? tags : parseTags(tags),
      emoji: categoryEmoji(category),
      createdAt: today(),
    };
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : { ...b, links: [...(b.links ?? []), link] }
      ),
    }));
    get().showToast('링크가 추가되었습니다! 🔗', 'success');
    return link.id;
  },

  /** 링크 수정 */
  updateLink: (boardId, linkId, patch) =>
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : {
              ...b,
              links: b.links.map((l) =>
                l.id === linkId ? { ...l, ...patch, emoji: categoryEmoji(patch.category ?? l.category) } : l
              ),
            }
      ),
    })),

  /** 링크 삭제 */
  deleteLink: (boardId, linkId) => {
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id !== boardId
          ? b
          : { ...b, links: b.links.filter((l) => l.id !== linkId) }
      ),
    }));
    get().showToast('링크가 삭제되었습니다', 'info');
  },
}));

export default useBoardStore;
