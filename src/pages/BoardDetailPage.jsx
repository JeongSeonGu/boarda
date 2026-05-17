/**
 * pages/BoardDetailPage.jsx
 * 수정: 보드 생성 직후 로딩 타이밍 문제 해결
 */
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import ColumnsBoardView from './ColumnsBoardView'
import LinksBoardView from './LinksBoardView'
import Button from '../components/common/Button'

export default function BoardDetailPage({ onShareBoard }) {
  const { boardId } = useParams()
  const navigate    = useNavigate()
  const boards      = useBoardStore((s) => s.boards)
  const loading     = useBoardStore((s) => s.loading)
  const board       = boards.find((b) => b.id === boardId)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--c-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p>불러오는 중...</p>
      </div>
    )
  }

  if (!board) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>보드를 찾을 수 없습니다</h2>
        <p style={{ color: 'var(--c-muted)', marginBottom: 20 }}>삭제되었거나 잘못된 주소입니다.</p>
        <Button variant="primary" onClick={() => navigate('/')}>홈으로</Button>
      </div>
    )
  }

  return board.type === 'columns'
    ? <ColumnsBoardView board={board} onShareBoard={onShareBoard} />
    : <LinksBoardView   board={board} onShareBoard={onShareBoard} />
}
