/**
 * pages/LinksBoardView.jsx
 * 수정: @hello-pangea/dnd 로 링크 카드 순서 변경
 *
 * DnD 구조:
 *  DragDropContext
 *    Droppable (grid / list 방향 동적 결정)
 *      Draggable (각 링크 카드)
 *
 * ⚠️ 검색·필터 중에는 DnD 비활성화
 *    (필터 결과만 보여주면 index가 달라져 잘못된 순서가 저장됨)
 */
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
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
  const reorderLinks  = useBoardStore((s) => s.reorderLinks)
  const addModal      = useModal()
  const editModal     = useModal()
  const settingsModal = useModal()
  const [viewMode, setViewMode] = useState('grid')

  const links = board.links ?? []
  const { query, setQuery, category, setCategory, filtered, categories } = useSearch(links)

  /* 검색/필터 중이면 DnD 비활성화 */
  const dndEnabled = !query && category === 'all'

  const onDragEnd = (result) => {
    if (!result.destination || !dndEnabled) return
    if (result.source.index === result.destination.index) return

    const newOrder = Array.from(links.map((l) => l.id))
    const [moved]  = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, moved)
    reorderLinks(board.id, newOrder)
  }

  const reactionType = board.reaction_type ?? 'none'

  /* 드래그 스타일 */
  const getDragStyle = (isDragging, style) => ({
    ...style,
    ...(isDragging ? {
      boxShadow: '0 8px 32px rgba(108,99,255,.22)',
      opacity: .96,
      zIndex: 100,
    } : {}),
  })

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

        {/* 검색 중 안내 */}
        {!dndEnabled && filtered.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔍</span>
            <span>검색/필터 중에는 드래그 순서 변경이 비활성화됩니다</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon="🔗" title="링크가 없습니다"
            desc={query || category !== 'all' ? '검색 조건에 맞는 링크가 없습니다' : '첫 링크를 추가해보세요!'}
            actionLabel={!query && category === 'all' ? '링크 추가' : undefined}
            onAction={addModal.open}
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="links"
              direction={viewMode === 'grid' ? 'horizontal' : 'vertical'}
              isDropDisabled={!dndEnabled}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={viewMode === 'grid' ? 'links-grid' : ''}
                  style={{
                    ...(viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: 10 } : {}),
                    background: snapshot.isDraggingOver ? 'rgba(108,99,255,.04)' : 'transparent',
                    borderRadius: 'var(--r-md)',
                    transition: 'background .2s',
                    minHeight: 60,
                  }}
                >
                  {filtered.map((link, idx) => {
                    /* 필터 중이면 Draggable 비활성 */
                    const draggableIdx = dndEnabled
                      ? links.findIndex((l) => l.id === link.id)
                      : idx

                    return (
                      <Draggable
                        key={link.id}
                        draggableId={link.id}
                        index={draggableIdx}
                        isDragDisabled={!dndEnabled}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={getDragStyle(dragSnapshot.isDragging, dragProvided.draggableProps.style)}
                          >
                            {/* 드래그 핸들 — 카드 상단 핸들 영역 */}
                            {dndEnabled && (
                              <div
                                {...dragProvided.dragHandleProps}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: 18,
                                  background: 'transparent',
                                  cursor: 'grab',
                                  borderRadius: 'var(--r-md) var(--r-md) 0 0',
                                  color: 'var(--c-muted)',
                                  fontSize: 13,
                                  opacity: dragSnapshot.isDragging ? 1 : 0,
                                  transition: 'opacity .15s',
                                }}
                                title="드래그하여 순서 변경"
                                className="link-drag-handle"
                              >
                                ⠿⠿
                              </div>
                            )}
                            {!dndEnabled && <div {...dragProvided.dragHandleProps} />}

                            <LinkCard
                              boardId={board.id}
                              link={link}
                              viewMode={viewMode}
                              onEdit={(l) => editModal.open(l)}
                              reactionType={reactionType}
                            />
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <AddLinkModal       isOpen={addModal.isOpen}      onClose={addModal.close}      boardId={board.id} />
      <EditLinkModal      isOpen={editModal.isOpen}     onClose={editModal.close}     boardId={board.id} link={editModal.data} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}
