/**
 * pages/ColumnsBoardView.jsx
 * 수정: BoardHeader 교체, 보드설정 모달, 배경 적용, 반응 바
 */
import React, { useState } from 'react'
import useBoardStore   from '../store/useBoardStore'
import BoardHeader     from '../components/board/BoardHeader'
import ColumnCard      from '../components/columns/ColumnCard'
import AddPostModal    from '../components/modals/AddPostModal'
import PostDetailModal from '../components/modals/PostDetailModal'
import BoardSettingsModal from '../components/modals/BoardSettingsModal'
import Button          from '../components/common/Button'
import { useModal }    from '../hooks/useModal'
import { getBoardBgStyle } from '../utils/boardBackground'
import '../styles/board.css'
import '../styles/columns.css'

export default function ColumnsBoardView({ board, onShareBoard }) {
  const addColumn    = useBoardStore((s) => s.addColumn)
  const [newColId, setNewColId] = useState(null)
  const postModal     = useModal()
  const detailModal   = useModal()
  const settingsModal = useModal()

  const totalPosts = (board.columns ?? []).reduce((s, c) => s + c.posts.length, 0)

  const handleAddColumn = async () => {
    const id = await addColumn(board.id)
    setNewColId(id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BoardHeader
        board={board}
        badge={<span className="badge badge-type-columns">컬럼 보드</span>}
        stats={[`📂 ${(board.columns ?? []).length}개 컬럼`, `📄 ${totalPosts}개 게시물`]}
        onShare={() => onShareBoard(board.id)}
        onSettings={settingsModal.open}
      >
        <Button variant="primary" size="sm" onClick={handleAddColumn}>＋ 컬럼 추가</Button>
      </BoardHeader>

      {/* 배경 적용된 캔버스 */}
      <div style={{
        flex: 1, borderRadius: 'var(--r-lg)', overflow: 'auto',
        padding: '16px', ...getBoardBgStyle(board),
      }}>
        <div className="columns-board">
          {(board.columns ?? []).map((col) => (
            <ColumnCard
              key={col.id}
              boardId={board.id}
              column={col}
              reactionType={board.reaction_type ?? 'none'}
              onAddPost={(colId) => postModal.open(colId)}
              onOpenPost={(colId, post) => detailModal.open({ colId, post })}
              isNew={col.id === newColId}
            />
          ))}
          <button className="add-column-btn" onClick={handleAddColumn}>＋ 컬럼 추가</button>
        </div>
      </div>

      <AddPostModal    isOpen={postModal.isOpen}    onClose={postModal.close}    boardId={board.id} colId={postModal.data} />
      <PostDetailModal isOpen={detailModal.isOpen}  onClose={detailModal.close}  boardId={board.id} colId={detailModal.data?.colId} post={detailModal.data?.post} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}
