/**
 * components/board/BoardCard.jsx
 * 수정: 폴더 이동 메뉴 추가
 */
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../../store/useBoardStore'
import { relativeDate } from '../../utils/helpers'
import '../../styles/folder.css'

const TYPE_META = {
  columns: { label:'컬럼 보드', emoji:'📋', badgeClass:'badge-type-columns' },
  links:   { label:'링크 보드', emoji:'🔗', badgeClass:'badge-type-links' },
  wall:    { label:'담벼락',     emoji:'📝', badgeStyle:{ background:'#FAEEDA', color:'#854F0B' } },
}

export default function BoardCard({ board, onShare, showFolderMove = false }) {
  const navigate         = useNavigate()
  const deleteBoard      = useBoardStore((s) => s.deleteBoard)
  const moveBoardToFolder = useBoardStore((s) => s.moveBoardToFolder)
  const folders          = useBoardStore((s) => s.folders)

  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const menuRef = useRef(null)

  /* 외부 클릭 시 메뉴 닫기 */
  useEffect(() => {
    if (!showMoveMenu) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoveMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMoveMenu])

  const meta = TYPE_META[board.type] ?? TYPE_META.columns
  const itemCount =
    board.type === 'columns'
      ? (board.columns ?? []).reduce((s, c) => s + c.posts.length, 0)
      : board.type === 'links'
      ? (board.links ?? []).length
      : (board.wall_posts ?? []).length

  const handleOpen   = () => navigate(`/board/${board.id}`)
  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('이 보드를 삭제하시겠습니까?')) deleteBoard(board.id)
  }
  const handleShare  = (e) => { e.stopPropagation(); onShare?.(board.id) }

  const handleMove = (e, folderId) => {
    e.stopPropagation()
    moveBoardToFolder(board.id, folderId)
    setShowMoveMenu(false)
  }

  return (
    <article className="card board-card" onClick={handleOpen}
      tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      aria-label={`${board.name} 보드 열기`}>

      <div className="board-card-thumb" style={{ background: board.color + '22' }}>
        <span style={{ fontSize: 40 }}>{meta.emoji}</span>
        <div className="board-card-type-badge">
          <span className={`badge ${meta.badgeClass ?? ''}`} style={meta.badgeStyle ?? {}}>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="board-card-body">
        <div className="board-card-title">{board.name}</div>
        {board.desc && <div className="board-card-desc">{board.desc}</div>}
        <div className="board-card-meta">
          <span>📄 {itemCount}개 항목</span>
          <span style={{ marginLeft: 'auto' }}>🕐 {relativeDate(board.createdAt || board.created_at)}</span>
        </div>
        {/* 공유 중 표시 */}
        {board.is_public && (
          <div style={{ marginTop: 6 }}>
            <span className="folder-share-badge">
              {board.share_mode === 'public' ? '🌐 공개' : '👤 로그인만'}
            </span>
          </div>
        )}
      </div>

      <div className="board-card-actions">
        <button className="action-icon" onClick={handleShare} title="공유">🔗</button>
        {/* 폴더 이동 버튼 */}
        {showFolderMove && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button className="action-icon"
              onClick={(e) => { e.stopPropagation(); setShowMoveMenu((v) => !v) }}
              title="폴더로 이동">📂</button>
            {showMoveMenu && (
              <div className="move-to-folder-menu" onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '8px 14px 6px', fontSize: 11,
                  fontWeight: 700, color: 'var(--c-muted)', borderBottom: '1px solid var(--c-border)' }}>
                  폴더로 이동
                </div>
                <button className={`move-to-folder-item ${!board.folder_id ? 'active' : ''}`}
                  onClick={(e) => handleMove(e, null)}>
                  📋 폴더 없음
                </button>
                {folders.map((f) => (
                  <button key={f.id}
                    className={`move-to-folder-item ${board.folder_id === f.id ? 'active' : ''}`}
                    onClick={(e) => handleMove(e, f.id)}>
                    <span>{f.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="action-icon danger" onClick={handleDelete} title="삭제">🗑️</button>
      </div>
    </article>
  )
}
