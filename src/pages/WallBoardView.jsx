/**
 * pages/WallBoardView.jsx
 * 수정:
 *  - 자유 배치 모드 (기존): 드래그로 자유롭게 위치 이동
 *  - 격자 정렬 모드 (신규): @hello-pangea/dnd 로 카드 순서 드래그
 *  - 모드 전환 토글 버튼 (헤더 우측)
 *  - 클릭 시 z_order 최상위 올리기
 */
import React, { useRef, useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
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
  const reorderWallPosts = useBoardStore((s) => s.reorderWallPosts)
  const postModal        = useModal()
  const settingsModal    = useModal()
  const canvasRef        = useRef(null)

  /* 격자 모드 상태 */
  const [gridMode, setGridMode] = useState(false)

  const wallPosts = board.wall_posts ?? []

  /* 격자 모드: z_order 순으로 정렬 */
  const sortedPosts = useMemo(() => {
    if (!gridMode) return wallPosts
    return [...wallPosts].sort((a, b) => (a.z_order ?? 0) - (b.z_order ?? 0))
  }, [wallPosts, gridMode])

  /* 자유 모드: 최대 z_order */
  const maxZOrder = useMemo(
    () => Math.max(0, ...wallPosts.map((p) => p.z_order ?? 0)),
    [wallPosts]
  )

  /* 자유 모드: 캔버스 더블클릭 → 새 메모 */
  const handleCanvasDoubleClick = (e) => {
    if (gridMode) return
    if (e.target !== canvasRef.current && !e.target.classList.contains('wall-canvas')) return
    postModal.open(null)
  }

  /* 격자 모드: DnD 완료 */
  const onDragEnd = (result) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return
    const newOrder = Array.from(sortedPosts.map((p) => p.id))
    const [moved]  = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, moved)
    reorderWallPosts(board.id, newOrder)
  }

  const reactionType = board.reaction_type ?? 'none'
  const bgStyle      = getBoardBgStyle(board)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BoardHeader
        board={board}
        badge={<span className="badge" style={{ background: '#FAEEDA', color: '#854F0B' }}>담벼락</span>}
        stats={[
          `📝 ${wallPosts.length}개 메모`,
          gridMode ? '격자 모드 — 드래그로 순서 변경' : '자유 모드 — 더블클릭으로 추가',
        ]}
        onShare={() => onShareBoard(board.id)}
        onSettings={settingsModal.open}
      >
        {/* 모드 전환 토글 */}
        <button
          className={`btn btn-sm ${gridMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setGridMode((v) => !v)}
          title={gridMode ? '자유 배치 모드로 전환' : '격자 정렬 모드로 전환'}
        >
          {gridMode ? '⊞ 격자 모드' : '⊡ 자유 모드'}
        </button>
        <Button variant="primary" size="sm" onClick={() => postModal.open(null)}>＋ 메모 추가</Button>
      </BoardHeader>

      {/* ── 자유 배치 모드 ── */}
      {!gridMode && (
        <div
          ref={canvasRef}
          className="wall-canvas"
          style={{ flex: 1, ...bgStyle }}
          onDoubleClick={handleCanvasDoubleClick}
        >
          {wallPosts.length === 0 && (
            <div className="wall-empty">
              <div className="wall-empty-icon">📝</div>
              <div className="wall-empty-text">담벼락이 비어있습니다</div>
              <div className="wall-empty-sub">
                빈 곳을 더블클릭하거나 ＋ 버튼으로 메모를 추가하세요
              </div>
            </div>
          )}
          {/* z_order 순서로 렌더 (낮은 게 먼저 → 높은 게 위에 표시) */}
          {[...wallPosts]
            .sort((a, b) => (a.z_order ?? 0) - (b.z_order ?? 0))
            .map((post) => (
              <WallPostCard
                key={post.id}
                boardId={board.id}
                post={post}
                onOpen={(p) => postModal.open(p)}
                reactionType={reactionType}
                gridMode={false}
                maxZOrder={maxZOrder}
              />
            ))}
        </div>
      )}

      {/* ── 격자 정렬 모드 ── */}
      {gridMode && (
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          borderRadius: 'var(--r-lg)', ...bgStyle,
        }}>
          {/* 안내 배너 */}
          <div style={{
            background: 'rgba(108,99,255,.08)',
            border: '1.5px dashed var(--c-primary)',
            borderRadius: 'var(--r-md)',
            padding: '10px 16px',
            marginBottom: 16,
            fontSize: 13, color: 'var(--c-primary)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⠿</span>
            <span>
              <strong>격자 모드</strong> — 카드를 드래그하여 순서를 변경하세요.
              자유 위치로 돌아가려면 <strong>자유 모드</strong>로 전환하세요.
            </span>
          </div>

          {wallPosts.length === 0 && (
            <div className="wall-empty" style={{ position: 'relative' }}>
              <div className="wall-empty-icon">📝</div>
              <div className="wall-empty-text">메모가 없습니다</div>
              <div className="wall-empty-sub">＋ 버튼으로 메모를 추가하세요</div>
            </div>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="wall-grid" direction="vertical">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 14,
                    minHeight: 60,
                    background: snapshot.isDraggingOver ? 'rgba(108,99,255,.04)' : 'transparent',
                    borderRadius: 'var(--r-md)',
                    transition: 'background .2s',
                  }}
                >
                  {sortedPosts.map((post, idx) => (
                    <Draggable key={post.id} draggableId={post.id} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{
                            ...dragProvided.draggableProps.style,
                            ...(dragSnapshot.isDragging ? {
                              boxShadow: '0 12px 40px rgba(108,99,255,.28)',
                              transform: (dragProvided.draggableProps.style?.transform ?? '') + ' rotate(1deg)',
                              opacity: .97,
                              zIndex: 999,
                            } : {}),
                          }}
                        >
                          {/* 드래그 핸들 */}
                          <div
                            {...dragProvided.dragHandleProps}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              height: 22, background: post.color ?? '#FFF9C4',
                              borderRadius: 'var(--r-md) var(--r-md) 0 0',
                              cursor: 'grab', color: 'rgba(0,0,0,.3)',
                              fontSize: 16, letterSpacing: 2,
                              filter: 'brightness(.88)',
                            }}
                            title="드래그하여 순서 변경"
                          >
                            ⠿⠿
                          </div>

                          <WallPostCard
                            boardId={board.id}
                            post={post}
                            onOpen={(p) => postModal.open(p)}
                            reactionType={reactionType}
                            gridMode={true}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* FAB — 자유 모드에서만 표시 */}
      {!gridMode && (
        <button className="wall-fab" onClick={() => postModal.open(null)} title="메모 추가">＋</button>
      )}

      <WallPostModal      isOpen={postModal.isOpen}     onClose={postModal.close}     boardId={board.id} post={postModal.data} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}