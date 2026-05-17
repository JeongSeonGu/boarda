/**
 * pages/WallBoardView.jsx
 * 담벼락 보드 메인 뷰 — 포스트잇 자유 배치 캔버스
 */
import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import WallPostCard from '../components/wall/WallPostCard'
import WallPostModal from '../components/wall/WallPostModal'
import Button from '../components/common/Button'
import { useModal } from '../hooks/useModal'
import '../styles/board.css'
import '../styles/wall.css'

export default function WallBoardView({ board, onShareBoard }) {
  const navigate   = useNavigate()
  const postModal  = useModal()   // data = null(새글) | post(수정)
  const canvasRef  = useRef(null)

  const wallPosts = board.wall_posts ?? []

  /* 캔버스 빈 곳 더블클릭 → 새 메모 */
  const handleCanvasDoubleClick = (e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('wall-canvas')) return
    postModal.open(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div className="board-detail-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>←</button>
        <div className="board-detail-info">
          <h1 className="board-detail-title">{board.name}</h1>
          <div className="board-detail-meta">
            <span className="badge" style={{ background:'#FAEEDA', color:'#854F0B' }}>담벼락</span>
            <span>📝 {wallPosts.length}개 메모</span>
            {board.author && <span>👤 {board.author}</span>}
            <span style={{ fontSize:11, color:'var(--c-muted)' }}>
              · 빈 곳을 더블클릭하거나 ＋ 버튼으로 메모를 추가하세요
            </span>
          </div>
        </div>
        <div className="board-detail-actions">
          <Button variant="outline" size="sm" onClick={() => onShareBoard(board.id)}>🔗 공유</Button>
          <Button variant="primary" size="sm" onClick={() => postModal.open(null)}>＋ 메모 추가</Button>
        </div>
      </div>

      {/* 담벼락 캔버스 */}
      <div
        ref={canvasRef}
        className="wall-canvas"
        onDoubleClick={handleCanvasDoubleClick}
        style={{ flex: 1 }}
      >
        {wallPosts.length === 0 && (
          <div className="wall-empty">
            <div className="wall-empty-icon">📝</div>
            <div className="wall-empty-text">담벼락이 비어있습니다</div>
            <div className="wall-empty-sub">빈 곳을 더블클릭하거나 ＋ 버튼으로 메모를 추가하세요</div>
          </div>
        )}

        {wallPosts.map((post) => (
          <WallPostCard
            key={post.id}
            boardId={board.id}
            post={post}
            onOpen={(p) => postModal.open(p)}
          />
        ))}
      </div>

      {/* FAB 버튼 */}
      <button className="wall-fab" onClick={() => postModal.open(null)} title="메모 추가">
        ＋
      </button>

      {/* 메모 추가/수정 모달 */}
      <WallPostModal
        isOpen={postModal.isOpen}
        onClose={postModal.close}
        boardId={board.id}
        post={postModal.data}   /* null=새글, post object=수정 */
      />
    </div>
  )
}
