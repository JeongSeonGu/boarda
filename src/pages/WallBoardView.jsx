/**
 * pages/WallBoardView.jsx
 * 수정: BoardHeader, 보드설정 모달, 배경 적용
 */
import React, { useRef } from 'react'
import useBoardStore      from '../store/useBoardStore'
import BoardHeader        from '../components/board/BoardHeader'
import WallPostCard       from '../components/wall/WallPostCard'
import WallPostModal      from '../components/wall/WallPostModal'
import BoardSettingsModal from '../components/modals/BoardSettingsModal'
import Button             from '../components/common/Button'
import { useModal }       from '../hooks/useModal'
import { getBoardBgStyle } from '../utils/boardBackground'
import '../styles/board.css'
import '../styles/wall.css'

export default function WallBoardView({ board, onShareBoard }) {
  const postModal     = useModal()
  const settingsModal = useModal()
  const canvasRef     = useRef(null)
  const wallPosts     = board.wall_posts ?? []

  const handleCanvasDoubleClick = (e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('wall-canvas')) return
    postModal.open(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BoardHeader
        board={board}
        badge={<span className="badge" style={{ background: '#FAEEDA', color: '#854F0B' }}>담벼락</span>}
        stats={[`📝 ${wallPosts.length}개 메모`, '더블클릭으로 추가']}
        onShare={() => onShareBoard(board.id)}
        onSettings={settingsModal.open}
      >
        <Button variant="primary" size="sm" onClick={() => postModal.open(null)}>＋ 메모 추가</Button>
      </BoardHeader>

      <div
        ref={canvasRef}
        className="wall-canvas"
        style={{ flex: 1, ...getBoardBgStyle(board) }}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {wallPosts.length === 0 && (
          <div className="wall-empty">
            <div className="wall-empty-icon">📝</div>
            <div className="wall-empty-text">담벼락이 비어있습니다</div>
            <div className="wall-empty-sub">빈 곳을 더블클릭하거나 ＋ 버튼으로 메모를 추가하세요</div>
          </div>
        )}
        {wallPosts.map((post) => (
          <WallPostCard key={post.id} boardId={board.id} post={post}
            onOpen={(p) => postModal.open(p)}
            reactionType={board.reaction_type ?? 'none'} />
        ))}
      </div>

      <button className="wall-fab" onClick={() => postModal.open(null)}>＋</button>

      <WallPostModal      isOpen={postModal.isOpen}     onClose={postModal.close}     boardId={board.id} post={postModal.data} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}
