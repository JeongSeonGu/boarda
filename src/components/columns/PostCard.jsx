/**
 * components/columns/PostCard.jsx
 * 수정: 클릭 시 PostDetailModal 열기, 작성자 표시, 첨부파일 수 표시
 */
import React from 'react'
import { tagBadgeClass, relativeDate } from '../../utils/helpers'

export default function PostCard({ boardId, colId, post, onOpen }) {
  const attachCount = (post.attachments ?? []).length

  return (
    <article className="post-card" onClick={() => onOpen?.(post)}
      style={{ cursor:'pointer' }}>
      <div className="post-card-title">{post.title}</div>
      {post.content && (
        <div className="post-card-content">{post.content}</div>
      )}
      {/* 첨부파일 수 표시 */}
      {attachCount > 0 && (
        <div style={{ fontSize:11, color:'var(--c-primary)', marginBottom:6 }}>
          📎 첨부파일 {attachCount}개
        </div>
      )}
      <div className="post-card-footer">
        <div className="post-card-tags">
          {(post.tags ?? []).map((t, i) => (
            <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
          <span className="post-card-date" style={{ fontWeight:600 }}>
            {post.author || '익명'}
          </span>
          <span className="post-card-date">
            {relativeDate(post.created_at || post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  )
}
