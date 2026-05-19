/**
 * pages/ColumnsBoardView.jsx
 * 수정: @hello-pangea/dnd 로 컬럼 순서 변경 + 카드 이동(컬럼 간 포함)
 *
 * DnD 구조:
 *  DragDropContext (전체 보드)
 *    Droppable type="COLUMN" direction="horizontal"  → 컬럼 순서
 *      Draggable (각 컬럼)
 *        Droppable type="POST" direction="vertical"  → 카드 순서
 *          Draggable (각 카드)
 */
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import useBoardStore      from '../store/useBoardStore'
import BoardHeader        from '../components/board/BoardHeader'
import PostCard           from '../components/columns/PostCard'
import AddPostModal       from '../components/modals/AddPostModal'
import PostDetailModal    from '../components/modals/PostDetailModal'
import BoardSettingsModal from '../components/modals/BoardSettingsModal'
import Button             from '../components/common/Button'
import { useModal }       from '../hooks/useModal'
import { getBoardBgStyle } from '../utils/boardBackground'
import '../styles/board.css'
import '../styles/columns.css'

/* ── 드래그 중 카드 배경 ── */
const getDragStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  ...(isDragging ? {
    boxShadow: '0 8px 32px rgba(108,99,255,.28)',
    transform: (draggableStyle?.transform ?? '') + ' rotate(1.5deg)',
    opacity: .96,
  } : {}),
})

/* ── 드래그 중 컬럼 배경 ── */
const getColDragStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  ...(isDragging ? {
    boxShadow: '0 16px 48px rgba(108,99,255,.22)',
    opacity: .97,
  } : {}),
})

/* ── 드롭 영역 배경 ── */
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'rgba(108,99,255,.06)' : 'transparent',
  transition: 'background .2s',
  borderRadius: 'var(--r-md)',
  minHeight: 40,
})

export default function ColumnsBoardView({ board, onShareBoard }) {
  const addColumn     = useBoardStore((s) => s.addColumn)
  const reorderColumns = useBoardStore((s) => s.reorderColumns)
  const reorderPosts   = useBoardStore((s) => s.reorderPosts)
  const renameColumn  = useBoardStore((s) => s.renameColumn)
  const deleteColumn  = useBoardStore((s) => s.deleteColumn)

  const [newColId, setNewColId] = useState(null)
  const postModal     = useModal()
  const detailModal   = useModal()
  const settingsModal = useModal()

  const columns      = board.columns ?? []
  const totalPosts   = columns.reduce((s, c) => s + c.posts.length, 0)
  const reactionType = board.reaction_type ?? 'none'

  const handleAddColumn = async () => {
    const id = await addColumn(board.id)
    setNewColId(id)
  }

  /* ── DnD 완료 핸들러 ── */
  const onDragEnd = (result) => {
    const { type, source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'COLUMN') {
      /* 컬럼 순서 변경 */
      const newOrder = Array.from(columns.map((c) => c.id))
      const [moved] = newOrder.splice(source.index, 1)
      newOrder.splice(destination.index, 0, moved)
      reorderColumns(board.id, newOrder)
      return
    }

    if (type === 'POST') {
      /* 카드 이동 (같은 컬럼 또는 다른 컬럼) */
      const srcColId = source.droppableId
      const dstColId = destination.droppableId
      const srcCol   = columns.find((c) => c.id === srcColId)
      if (!srcCol) return
      const postId   = srcCol.posts[source.index]?.id
      if (!postId) return
      reorderPosts(board.id, srcColId, dstColId, postId, destination.index)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BoardHeader
        board={board}
        badge={<span className="badge badge-type-columns">컬럼 보드</span>}
        stats={[`📂 ${columns.length}개 컬럼`, `📄 ${totalPosts}개 게시물`]}
        onShare={() => onShareBoard(board.id)}
        onSettings={settingsModal.open}
      >
        <Button variant="primary" size="sm" onClick={handleAddColumn}>＋ 컬럼 추가</Button>
      </BoardHeader>

      {/* DnD 컨텍스트 */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ flex: 1, borderRadius: 'var(--r-lg)', overflow: 'auto',
          padding: '16px', ...getBoardBgStyle(board) }}>

          {/* 컬럼 드롭 영역 (가로) */}
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="columns-board"
                style={{ alignItems: 'flex-start' }}
              >
                {columns.map((col, colIdx) => (
                  <Draggable key={col.id} draggableId={col.id} index={colIdx}>
                    {(colProvided, colSnapshot) => (
                      <div
                        ref={colProvided.innerRef}
                        {...colProvided.draggableProps}
                        style={getColDragStyle(colSnapshot.isDragging, colProvided.draggableProps.style)}
                        className="column-card"
                      >
                        {/* 컬럼 헤더 — 드래그 핸들 */}
                        <div
                          className="column-header"
                          {...colProvided.dragHandleProps}
                          style={{ cursor: 'grab' }}
                          title="드래그하여 컬럼 이동"
                        >
                          <span className="column-color-dot" style={{ background: col.color }} />
                          {/* 드래그 핸들 아이콘 */}
                          <span style={{ fontSize: 14, color: 'var(--c-muted)', marginRight: 2,
                            cursor: 'grab', flexShrink: 0 }}>⠿</span>
                          <input
                            className="column-title-input"
                            defaultValue={col.name}
                            onBlur={(e) => renameColumn(board.id, col.id, e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus={col.id === newColId}
                          />
                          <span className="column-count">{col.posts.length}</span>
                          <button className="column-menu-btn"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => {
                              if (window.confirm(`'${col.name}' 컬럼을 삭제하시겠습니까?`))
                                deleteColumn(board.id, col.id)
                            }}
                            title="컬럼 삭제">🗑️</button>
                        </div>

                        {/* 카드 드롭 영역 (세로) */}
                        <Droppable droppableId={col.id} type="POST">
                          {(postProvided, postSnapshot) => (
                            <div
                              ref={postProvided.innerRef}
                              {...postProvided.droppableProps}
                              className="column-posts"
                              style={getListStyle(postSnapshot.isDraggingOver)}
                            >
                              {col.posts.length === 0 && !postSnapshot.isDraggingOver && (
                                <p className="column-empty">게시물이 없습니다</p>
                              )}

                              {col.posts.map((post, postIdx) => (
                                <Draggable
                                  key={post.id}
                                  draggableId={post.id}
                                  index={postIdx}
                                >
                                  {(postProvided2, postSnapshot2) => (
                                    <div
                                      ref={postProvided2.innerRef}
                                      {...postProvided2.draggableProps}
                                      style={getDragStyle(
                                        postSnapshot2.isDragging,
                                        postProvided2.draggableProps.style
                                      )}
                                    >
                                      {/* 드래그 핸들 영역 */}
                                      <div
                                        {...postProvided2.dragHandleProps}
                                        style={{ cursor: 'grab' }}
                                        title="드래그하여 카드 이동"
                                      >
                                        <PostCard
                                          boardId={board.id}
                                          colId={col.id}
                                          post={post}
                                          onOpen={(p) => detailModal.open({ colId: col.id, post: p })}
                                          reactionType={reactionType}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {postProvided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <button className="add-post-btn"
                          onClick={() => postModal.open(col.id)}>
                          ＋ 게시물 추가
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
                <button className="add-column-btn" onClick={handleAddColumn}>
                  ＋ 컬럼 추가
                </button>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <AddPostModal      isOpen={postModal.isOpen}     onClose={postModal.close}     boardId={board.id} colId={postModal.data} />
      <PostDetailModal   isOpen={detailModal.isOpen}   onClose={detailModal.close}   boardId={board.id} colId={detailModal.data?.colId} post={detailModal.data?.post} />
      <BoardSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} board={board} />
    </div>
  )
}
