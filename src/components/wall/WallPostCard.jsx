/**
 * components/wall/WallPostCard.jsx — 수정: ReactionBar 추가
 */
import React, { useRef, useState, useCallback } from 'react'
import useBoardStore from '../../store/useBoardStore'
import { relativeDate } from '../../utils/helpers'
import ReactionBar from '../common/ReactionBar'

export default function WallPostCard({ boardId, post, onOpen, readOnly = false, reactionType = 'none' }) {
  const moveWallPost   = useBoardStore((s) => s.moveWallPost)
  const deleteWallPost = useBoardStore((s) => s.deleteWallPost)
  const cardRef  = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  const onMouseDown = useCallback((e) => {
    if (readOnly) return
    if (e.target.closest('button') || e.target.closest('a')) return
    e.preventDefault()
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, cardX: post.pos_x, cardY: post.pos_y, moved: false }
    setDragging(true)
    const onMove = (ev) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.mouseX
      const dy = ev.clientY - dragStart.current.mouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragStart.current.moved = true
      const el = cardRef.current
      if (el) { el.style.left = `${Math.max(0, dragStart.current.cardX + dx)}px`; el.style.top = `${Math.max(0, dragStart.current.cardY + dy)}px` }
    }
    const onUp = (ev) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.mouseX
      const dy = ev.clientY - dragStart.current.mouseY
      const moved = dragStart.current.moved
      const newX = Math.max(0, dragStart.current.cardX + dx)
      const newY = Math.max(0, dragStart.current.cardY + dy)
      setDragging(false); dragStart.current = null
      if (moved) moveWallPost(boardId, post.id, newX, newY)
      else onOpen?.(post)
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [boardId, post, readOnly, moveWallPost, onOpen])

  const attachCount = (post.attachments ?? []).length

  return (
    <div ref={cardRef} className={`wall-card ${dragging ? 'dragging' : ''}`}
      style={{ left: post.pos_x, top: post.pos_y, width: post.width ?? 200,
        background: post.color ?? '#FFF9C4', zIndex: dragging ? 100 : 1 }}
      onMouseDown={onMouseDown}>
      <div className="wall-card-tab" style={{ background: post.color ?? '#FFF9C4' }}>
        <span className="wall-card-author">✍️ {post.author || '익명'}</span>
        {!readOnly && (
          <div className="wall-card-tab-actions">
            <button className="wall-tab-btn" onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onOpen?.(post) }} title="수정">✏️</button>
            <button className="wall-tab-btn" onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); if (window.confirm('삭제하시겠습니까?')) deleteWallPost(boardId, post.id) }}
              title="삭제">🗑️</button>
          </div>
        )}
      </div>
      <div className="wall-card-body" style={{ cursor: readOnly ? 'default' : 'pointer' }}>
        {post.content || <span style={{ opacity:.4, fontStyle:'italic' }}>내용 없음</span>}
      </div>
      <div className="wall-card-footer">
        <span className="wall-card-date">{relativeDate(post.created_at || post.createdAt)}</span>
        {attachCount > 0 && <span className="wall-card-attach-badge">📎 {attachCount}</span>}
      </div>
      <div style={{ padding: '0 12px 10px' }}>
        <ReactionBar boardId={boardId} itemId={post.id} itemType="wall" reactionType={reactionType} />
      </div>
    </div>
  )
}
