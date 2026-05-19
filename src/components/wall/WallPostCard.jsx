/**
 * components/wall/WallPostCard.jsx
 * 수정:
 *  - 자유 드래그 위치 이동 (기존 유지)
 *  - 클릭 시 z_order 최상위로 올리기
 *  - gridMode=true 일 때 DnD 핸들 표시 (WallBoardView 에서 제어)
 *  - 터치 드래그 개선 (passive 이벤트 처리)
 */
import React, { useRef, useState, useCallback } from 'react'
import useBoardStore from '../../store/useBoardStore'
import { relativeDate } from '../../utils/helpers'
import ReactionBar from '../common/ReactionBar'

export default function WallPostCard({
  boardId,
  post,
  onOpen,
  readOnly    = false,
  reactionType = 'none',
  gridMode    = false,   // 격자 모드 여부
  maxZOrder   = 0,       // 현재 최대 z_order
}) {
  const moveWallPost   = useBoardStore((s) => s.moveWallPost)
  const bringToFront   = useBoardStore((s) => s.bringWallPostToFront)
  const deleteWallPost = useBoardStore((s) => s.deleteWallPost)

  const cardRef   = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  /* ── 자유 드래그 (gridMode=false 일 때만) ── */
  const startFreeDrag = useCallback((clientX, clientY) => {
    if (readOnly || gridMode) return
    dragStart.current = {
      mouseX: clientX, mouseY: clientY,
      cardX: post.pos_x, cardY: post.pos_y,
      moved: false,
    }
    setDragging(true)
    /* 드래그 시작 시 최상위로 */
    if ((post.z_order ?? 0) < maxZOrder) bringToFront?.(boardId, post.id, maxZOrder + 1)
  }, [readOnly, gridMode, post, maxZOrder, boardId, bringToFront])

  const onMouseDown = useCallback((e) => {
    if (readOnly || gridMode) return
    if (e.target.closest('button') || e.target.closest('a')) return
    e.preventDefault()
    startFreeDrag(e.clientX, e.clientY)

    const onMove = (ev) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.mouseX
      const dy = ev.clientY - dragStart.current.mouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragStart.current.moved = true
      const el = cardRef.current
      if (el) {
        el.style.left = `${Math.max(0, dragStart.current.cardX + dx)}px`
        el.style.top  = `${Math.max(0, dragStart.current.cardY + dy)}px`
      }
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
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [readOnly, gridMode, post, boardId, moveWallPost, onOpen, startFreeDrag])

  /* ── 터치 드래그 ── */
  const onTouchStart = useCallback((e) => {
    if (readOnly || gridMode) return
    if (e.target.closest('button') || e.target.closest('a')) return
    const t = e.touches[0]
    startFreeDrag(t.clientX, t.clientY)

    const onMove = (ev) => {
      ev.preventDefault()
      const touch = ev.touches[0]
      if (!dragStart.current) return
      const dx = touch.clientX - dragStart.current.mouseX
      const dy = touch.clientY - dragStart.current.mouseY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragStart.current.moved = true
      const el = cardRef.current
      if (el) {
        el.style.left = `${Math.max(0, dragStart.current.cardX + dx)}px`
        el.style.top  = `${Math.max(0, dragStart.current.cardY + dy)}px`
      }
    }
    const onEnd = (ev) => {
      if (!dragStart.current) return
      const touch = ev.changedTouches[0]
      const dx = touch.clientX - dragStart.current.mouseX
      const dy = touch.clientY - dragStart.current.mouseY
      const moved = dragStart.current.moved
      const newX = Math.max(0, dragStart.current.cardX + dx)
      const newY = Math.max(0, dragStart.current.cardY + dy)
      setDragging(false); dragStart.current = null
      if (moved) moveWallPost(boardId, post.id, newX, newY)
      else onOpen?.(post)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }, [readOnly, gridMode, post, boardId, moveWallPost, onOpen, startFreeDrag])

  const attachCount = (post.attachments ?? []).length
  const zIndex = dragging ? 999 : (post.z_order ?? 1)

  /* ── 격자 모드: 정적 위치 (WallBoardView 에서 style 주입) ── */
  const posStyle = gridMode
    ? {}   // 격자 모드에서는 부모(flex)가 위치 결정
    : { position: 'absolute', left: post.pos_x, top: post.pos_y }

  return (
    <div
      ref={cardRef}
      className={`wall-card ${dragging ? 'dragging' : ''} ${gridMode ? 'wall-card-grid' : ''}`}
      style={{
        ...posStyle,
        width: gridMode ? '100%' : (post.width ?? 200),
        background: post.color ?? '#FFF9C4',
        zIndex,
        cursor: readOnly ? 'default' : (gridMode ? 'default' : 'grab'),
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={gridMode ? () => onOpen?.(post) : undefined}
    >
      {/* 탭 */}
      <div
        className="wall-card-tab"
        style={{ background: post.color ?? '#FFF9C4', cursor: gridMode ? 'default' : 'grab' }}
      >
        <span className="wall-card-author">✍️ {post.author || '익명'}</span>
        {!readOnly && (
          <div className="wall-card-tab-actions">
            <button className="wall-tab-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onOpen?.(post) }}
              title="수정">✏️</button>
            <button className="wall-tab-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('이 메모를 삭제하시겠습니까?'))
                  deleteWallPost(boardId, post.id)
              }}
              title="삭제">🗑️</button>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div
        className="wall-card-body"
        style={{ cursor: readOnly ? 'default' : (gridMode ? 'pointer' : 'grab') }}
      >
        {post.content || <span style={{ opacity: .4, fontStyle: 'italic' }}>내용 없음</span>}
      </div>

      {/* 푸터 */}
      <div className="wall-card-footer">
        <span className="wall-card-date">{relativeDate(post.created_at || post.createdAt)}</span>
        {attachCount > 0 && <span className="wall-card-attach-badge">📎 {attachCount}</span>}
      </div>

      {/* 반응 바 */}
      <div style={{ padding: '0 12px 10px' }}>
        <ReactionBar boardId={boardId} itemId={post.id} itemType="wall" reactionType={reactionType} />
      </div>
    </div>
  )
}