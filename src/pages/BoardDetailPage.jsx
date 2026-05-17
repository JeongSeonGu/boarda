/**
 * pages/BoardDetailPage.jsx
 * 보드 상세 페이지 — type 에 따라 ColumnsBoardView / LinksBoardView 렌더
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useBoardStore from '../store/useBoardStore';
import ColumnsBoardView from './ColumnsBoardView';
import LinksBoardView from './LinksBoardView';
import Button from '../components/common/Button';

export default function BoardDetailPage({ onShareBoard }) {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const board = useBoardStore((s) => s.boards.find((b) => b.id === boardId));

  if (!board) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>보드를 찾을 수 없습니다</h2>
        <p style={{ color: 'var(--c-muted)', marginBottom: 20 }}>삭제되었거나 잘못된 주소입니다.</p>
        <Button variant="primary" onClick={() => navigate('/')}>홈으로</Button>
      </div>
    );
  }

  return board.type === 'columns'
    ? <ColumnsBoardView board={board} onShareBoard={onShareBoard} />
    : <LinksBoardView   board={board} onShareBoard={onShareBoard} />;
}
