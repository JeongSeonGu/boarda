/**
 * components/board/BoardCard.jsx
 * 보드 목록 그리드에서 보여주는 카드
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../../store/useBoardStore';
import { relativeDate } from '../../utils/helpers';

export default function BoardCard({ board, onShare }) {
  const navigate = useNavigate();
  const deleteBoard = useBoardStore((s) => s.deleteBoard);

  const itemCount =
    board.type === 'columns'
      ? (board.columns ?? []).reduce((s, c) => s + c.posts.length, 0)
      : (board.links ?? []).length;

  const colCount =
    board.type === 'columns' ? (board.columns ?? []).length : null;

  const handleOpen = () =>
    navigate(`/board/${board.id}`);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('이 보드를 삭제하시겠습니까?')) deleteBoard(board.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(board.id);
  };

  const thumbBg = board.color + '22';
  const emoji   = board.type === 'columns' ? '📋' : '🔗';

  return (
    <article
      className="card board-card"
      onClick={handleOpen}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      aria-label={`${board.name} 보드 열기`}
    >
      {/* 썸네일 */}
      <div className="board-card-thumb" style={{ background: thumbBg }}>
        <span style={{ fontSize: 40 }}>{emoji}</span>
        <div className="board-card-type-badge">
          <span className={`badge badge-type-${board.type}`}>
            {board.type === 'columns' ? '컬럼 보드' : '링크 보드'}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="board-card-body">
        <div className="board-card-title">{board.name}</div>
        {board.desc && (
          <div className="board-card-desc">{board.desc}</div>
        )}
        <div className="board-card-meta">
          {board.type === 'columns' && <span>📂 {colCount}개 컬럼</span>}
          <span>📄 {itemCount}개 항목</span>
          <span style={{ marginLeft: 'auto' }}>🕐 {relativeDate(board.createdAt)}</span>
        </div>
      </div>

      {/* 호버 액션 */}
      <div className="board-card-actions">
        <button
          className="action-icon"
          onClick={handleShare}
          title="공유"
          aria-label="보드 공유"
        >
          🔗
        </button>
        <button
          className="action-icon danger"
          onClick={handleDelete}
          title="삭제"
          aria-label="보드 삭제"
        >
          🗑️
        </button>
      </div>
    </article>
  );
}
