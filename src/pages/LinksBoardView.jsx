/**
 * pages/LinksBoardView.jsx
 * 수정: BoardHeader, 보드설정 모달, 배경 적용
 */
import React, { useState } from 'react'
import useBoardStore      from '../store/useBoardStore'
import BoardHeader        from '../components/board/BoardHeader'
import LinkCard           from '../components/links/LinkCard'
import LinksToolbar       from '../components/links/LinksToolbar'
import AddLinkModal       from '../components/modals/AddLinkModal'
import EditLinkModal      from '../components/modals/EditLinkModal'
import BoardSettingsModal from '../components/modals/BoardSettingsModal'
import EmptyState         from '../components/common/EmptyState'
import Button             from '../components/common/Button'
import { useModal }       from '../hooks/useModal'
import { useSearch }      from '../hooks/useSearch'
import { getBoardBgStyle } from '../utils/boardBackground'
import '../styles/board.css'
import '../styles/links.css'

export default function LinksBoardView({ board, onShareBoard }) {
  const addModal      = useModal()
  const editModal     = useModal()
  const settingsModal = useModal()
  const [viewMode, setViewMode] = useState('grid')

  const links = board.links ?? []
  const { query, setQuery, category, setCategory, filtered, categories } = useSearch(links)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BoardHeader
        board={board}
        badge={<span className="badge badge-type-links">링크 보드</span>}
        stats={[`🔗 ${links.length}개 링크`, `📂 ${[...new Set(links.map((l) => l.category))].length}개 분류`]}
        onShare={() => onShareBoard(board.id)}
        onSettings={settingsModal.open}
      >
        <Button variant="primary" size="sm" onClick={addModal.open}>＋ 링크 추가</Button>
      </BoardHeader>

      <div style={{ flex: 1, borderRadius: 'var(--r-lg)', padding: '16px', ...getBoardBgStyle(board) }}>
        <LinksToolbar
          query={query} onQueryChange={setQuery}
          categories={categories} activeCategory={category} onCategoryChange={setCategory}
          viewMode={viewMode} onViewModeChange={setViewMode}
          totalCount={links.length}
        />

        {filtered.length === 0 ? (
          <EmptyState icon="🔗" title="링크가 없습니다"
            desc={query || category !== 'all' ? '검색 조건에 맞는 링크가 없습니다' : '첫 링크를 추가해보세요!'}
            actionLabel={!query && category === 'all' ? '링크 추가' : undefined}
            onAction={addModal.open}
          />
        ) : viewMode === 'grid' ? (
          <div className="links-grid">
            {filtered.map((link) => (
              <LinkCard key={link.id} boardId={board.id} link={link}
                viewMode="grid" onEdit={(l) => editModal.open(l)}
                reactionType={board.reaction_type ?? 'none'} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((link) => (
              <LinkCard key={link.id} boardId={board.id} link={link}
                viewMode="list" onEdit={(l) => editModal.open(l)}
                reactionType={board.reaction_type ?? 'none'} />
            ))}
          </div>
        )}
      </div>

      <AddLinkModal       isOpen={addModal.isOpen}      onClose={addModal.close}      boardId={board.id} />
      <EditLinkModal      isOpen={editModal.isOpen}     onClose={editModal.close}     boardId={board.id} link={editModal.data} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}
