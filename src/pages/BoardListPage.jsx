import React, { useCallback } from 'react'
import useBoardStore from '../store/useBoardStore'
import BoardCard from '../components/board/BoardCard'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import '../styles/board.css'

const META = {
  columns: {
    emoji: '📋',
    title: '컬럼 보드',
    desc: '섹션별로 게시물을 정리하는 칸반 스타일 보드입니다',
  },
  links: {
    emoji: '🔗',
    title: '링크 보드',
    desc: '사이트와 링크를 태그와 함께 체계적으로 관리합니다',
  },
}

export default function BoardListPage({ type, onNewBoard, onShareBoard }) {
  // ✅ 핵심 수정: 전체 boards를 가져온 후 컴포넌트에서 필터링
  //    (셀렉터 내부에서 filter()하면 매번 새 배열 → 무한루프)
  const allBoards = useBoardStore((s) => s.boards)
  const boards = allBoards.filter((b) => b.type === type)
  const m = META[type]

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            {m.emoji} {m.title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>{m.desc}</p>
        </div>
        <Button variant="primary" onClick={() => onNewBoard(type)}>
          ＋ 새 보드
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={m.emoji}
          title={`${m.title}가 없습니다`}
          desc="새 보드를 만들어 시작해보세요!"
          actionLabel="새 보드 만들기"
          onAction={() => onNewBoard(type)}
        />
      ) : (
        <div className="board-grid">
          {boards.map((b) => (
            <BoardCard key={b.id} board={b} onShare={onShareBoard} />
          ))}
        </div>
      )}
    </div>
  )
}
