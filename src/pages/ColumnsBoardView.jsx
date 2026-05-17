/**
 * pages/ColumnsBoardView.jsx — 수정: PostDetailModal 연결
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import ColumnCard from '../components/columns/ColumnCard'
import AddPostModal from '../components/modals/AddPostModal'
import PostDetailModal from '../components/modals/PostDetailModal'
import Button from '../components/common/Button'
import { useModal } from '../hooks/useModal'
import '../styles/board.css'
import '../styles/columns.css'

export default function ColumnsBoardView({ board, onShareBoard }) {
  const navigate  = useNavigate()
  const addColumn = useBoardStore((s) => s.addColumn)
  const [newColId, setNewColId] = useState(null)
  const postModal   = useModal()   // { colId }
  const detailModal = useModal()   // { colId, post }

  const totalPosts = (board.columns ?? []).reduce((s, c) => s + c.posts.length, 0)

  const handleAddColumn = async () => {
    const id = await addColumn(board.id)
    setNewColId(id)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* 헤더 */}
      <div className="board-detail-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>←</button>
        <div className="board-detail-info">
          <h1 className="board-detail-title">{board.name}</h1>
          <div className="board-detail-meta">
            <span className="badge badge-type-columns">컬럼 보드</span>
            <span>📂 {(board.columns ?? []).length}개 컬럼</span>
            <span>📄 {totalPosts}개 게시물</span>
            {board.author && <span>👤 {board.author}</span>}
          </div>
        </div>
        <div className="board-detail-actions">
          <Button variant="outline" size="sm" onClick={() => onShareBoard(board.id)}>🔗 공유</Button>
          <Button variant="primary" size="sm" onClick={handleAddColumn}>＋ 컬럼 추가</Button>
        </div>
      </div>

      {/* 컬럼 보드 */}
      <div className="columns-board">
        {(board.columns ?? []).map((col) => (
          <ColumnCard
            key={col.id}
            boardId={board.id}
            column={col}
            onAddPost={(colId) => postModal.open(colId)}
            onOpenPost={(colId, post) => detailModal.open({ colId, post })}
            isNew={col.id === newColId}
          />
        ))}
        <button className="add-column-btn" onClick={handleAddColumn}>＋ 컬럼 추가</button>
      </div>

      {/* 게시물 추가 모달 */}
      <AddPostModal
        isOpen={postModal.isOpen}
        onClose={postModal.close}
        boardId={board.id}
        colId={postModal.data}
      />

      {/* 게시물 상세/수정 모달 */}
      <PostDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        boardId={board.id}
        colId={detailModal.data?.colId}
        post={detailModal.data?.post}
      />
    </div>
  )
}
