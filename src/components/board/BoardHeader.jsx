/**
 * components/board/BoardHeader.jsx
 * 공통 보드 상단 헤더 — 뒤로가기, 제목, 공유, 설정 버튼
 * 모든 보드 뷰(Columns/Links/Wall)에서 재사용
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Button from '../common/Button'

export default function BoardHeader({
  board,
  badge,           // <span> 형태의 타입 뱃지
  stats,           // 문자열 배열 ['📂 3개 컬럼', ...]
  onShare,
  onSettings,
  children,        // 추가 버튼 (컬럼추가 등)
}) {
  const navigate    = useNavigate()
  const isOwnerOf   = useAuthStore((s) => s.isOwnerOf)
  const canEdit     = useAuthStore((s) => s.canEdit)
  const canModify   = canEdit() && isOwnerOf(board?.author)

  return (
    <div className="board-detail-header">
      <button className="btn-icon" onClick={() => navigate(-1)} aria-label="뒤로 가기">←</button>

      <div className="board-detail-info">
        <h1 className="board-detail-title">{board?.name}</h1>
        <div className="board-detail-meta">
          {badge}
          {(stats ?? []).map((s, i) => <span key={i}>{s}</span>)}
          {board?.author && <span>👤 {board.author}</span>}
        </div>
      </div>

      <div className="board-detail-actions">
        <Button variant="outline" size="sm" onClick={onShare}>🔗 공유</Button>
        {/* 보드 개설자/마스터만 설정 버튼 표시 */}
        {canModify && (
          <Button variant="secondary" size="sm" onClick={onSettings}>⚙️ 보드설정</Button>
        )}
        {children}
      </div>
    </div>
  )
}
