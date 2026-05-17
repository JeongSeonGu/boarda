/**
 * pages/ColumnsBoardView.jsx
 * 컬럼 보드 상세 뷰
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../store/useBoardStore';
import ColumnCard from '../components/columns/ColumnCard';
import AddPostModal from '../components/modals/AddPostModal';
import Button from '../components/common/Button';
import { useModal } from '../hooks/useModal';
import '../styles/board.css';
import '../styles/columns.css';

export default function ColumnsBoardView({ board, onShareBoard }) {
  const navigate = useNavigate();
  const addColumn = useBoardStore((s) => s.addColumn);
  const [newColId, setNewColId] = useState(null);
  const postModal = useModal();

  const totalPosts = (board.columns ?? []).reduce((s, c) => s + c.posts.length, 0);

  const handleAddColumn = () => {
    const id = addColumn(board.id);
    setNewColId(id);
  };

  const handleOpenPostModal = (colId) => postModal.open(colId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div className="board-detail-header">
        <button
          className="btn-icon"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <div className="board-detail-info">
          <h1 className="board-detail-title">{board.name}</h1>
          <div className="board-detail-meta">
            <span className="badge badge-type-columns">컬럼 보드</span>
            <span>📂 {(board.columns ?? []).length}개 컬럼</span>
            <span>📄 {totalPosts}개 게시물</span>
            {board.desc && <span>— {board.desc}</span>}
          </div>
        </div>
        <div className="board-detail-actions">
          <Button variant="outline" size="sm" onClick={() => onShareBoard(board.id)}>
            🔗 공유
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddColumn}>
            ＋ 컬럼 추가
          </Button>
        </div>
      </div>

      {/* 컬럼 보드 */}
      <div className="columns-board">
        {(board.columns ?? []).map((col) => (
          <ColumnCard
            key={col.id}
            boardId={board.id}
            column={col}
            onAddPost={handleOpenPostModal}
            isNew={col.id === newColId}
          />
        ))}
        <button className="add-column-btn" onClick={handleAddColumn}>
          ＋ 컬럼 추가
        </button>
      </div>

      {/* 게시물 추가 모달 */}
      <AddPostModal
        isOpen={postModal.isOpen}
        onClose={postModal.close}
        boardId={board.id}
        colId={postModal.data}
      />
    </div>
  );
}
