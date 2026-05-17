/**
 * components/board/BoardCard.jsx — 수정: wall 타입 뱃지/이모지 추가
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../../store/useBoardStore'
import { relativeDate } from '../../utils/helpers'

const TYPE_META = {
  columns: { label:'컬럼 보드', emoji:'📋', badgeClass:'badge-type-columns' },
  links:   { label:'링크 보드', emoji:'🔗', badgeClass:'badge-type-links' },
  wall:    { label:'담벼락',     emoji:'📝', badgeClass:'', badgeStyle:{ background:'#FAEEDA', color:'#854F0B' } },
}

export default function BoardCard({ board, onShare }) {
  const navigate    = useNavigate()
  const deleteBoard = useBoardStore((s) => s.deleteBoard)

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

  return (
    <article className="card board-card" onClick={handleOpen}
      tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      aria-label={`${board.name} 보드 열기`}>

      <div className="board-card-thumb" style={{ background: board.color + '22' }}>
        <span style={{ fontSize:40 }}>{meta.emoji}</span>
        <div className="board-card-type-badge">
          <span
            className={`badge ${meta.badgeClass ?? ''}`}
            style={meta.badgeStyle ?? {}}>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="board-card-body">
        <div className="board-card-title">{board.name}</div>
        {board.desc && <div className="board-card-desc">{board.desc}</div>}
        <div className="board-card-meta">
          <span>📄 {itemCount}개 항목</span>
          <span style={{ marginLeft:'auto' }}>🕐 {relativeDate(board.createdAt || board.created_at)}</span>
        </div>
      </div>

      <div className="board-card-actions">
        <button className="action-icon" onClick={handleShare} title="공유">🔗</button>
        <button className="action-icon danger" onClick={handleDelete} title="삭제">🗑️</button>
      </div>
    </article>
  )
}
