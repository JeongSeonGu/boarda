/**
 * components/columns/ColumnCard.jsx — 수정: onOpenPost 콜백 추가
 */
import React, { useRef, useEffect } from 'react'
import useBoardStore from '../../store/useBoardStore'
import PostCard from './PostCard'

export default function ColumnCard({ boardId, column, onAddPost, onOpenPost, isNew = false }) {
  const renameColumn = useBoardStore((s) => s.renameColumn)
  const deleteColumn = useBoardStore((s) => s.deleteColumn)
  const inputRef     = useRef(null)

  useEffect(() => {
    if (isNew && inputRef.current) {
      inputRef.current.focus(); inputRef.current.select()
    }
  }, [isNew])

  return (
    <section className="column-card" aria-label={`${column.name} 컬럼`}>
      <div className="column-header">
        <span className="column-color-dot" style={{ background: column.color }} />
        <input
          ref={inputRef}
          className="column-title-input"
          defaultValue={column.name}
          onBlur={(e) => renameColumn(boardId, column.id, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
        />
        <span className="column-count">{column.posts.length}</span>
        <button className="column-menu-btn"
          onClick={() => {
            if (window.confirm(`'${column.name}' 컬럼을 삭제하시겠습니까?`))
              deleteColumn(boardId, column.id)
          }}
          title="컬럼 삭제">🗑️</button>
      </div>

      <div className="column-posts">
        {column.posts.length === 0 && (
          <p className="column-empty">게시물이 없습니다</p>
        )}
        {column.posts.map((post) => (
          <PostCard
            key={post.id}
            boardId={boardId}
            colId={column.id}
            post={post}
            onOpen={(p) => onOpenPost?.(column.id, p)}
          />
        ))}
      </div>

      <button className="add-post-btn" onClick={() => onAddPost(column.id)}>
        ＋ 게시물 추가
      </button>
    </section>
  )
}
