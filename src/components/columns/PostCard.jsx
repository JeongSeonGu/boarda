/**
 * components/columns/PostCard.jsx
 */
import React from 'react';
import useBoardStore from '../../store/useBoardStore';
import { tagBadgeClass, relativeDate } from '../../utils/helpers';

export default function PostCard({ boardId, colId, post }) {
  const deletePost = useBoardStore((s) => s.deletePost);

  return (
    <article className="post-card">
      <div className="post-card-title">{post.title}</div>
      {post.content && (
        <div className="post-card-content">{post.content}</div>
      )}
      <div className="post-card-footer">
        <div className="post-card-tags">
          {post.tags.map((t, i) => (
            <span key={t} className={`badge ${tagBadgeClass(i)}`}>
              {t}
            </span>
          ))}
        </div>
        <span className="post-card-date">{relativeDate(post.createdAt)}</span>
      </div>

      {/* 호버 액션 */}
      <div className="post-card-actions">
        <button
          className="action-icon danger"
          onClick={() => deletePost(boardId, colId, post.id)}
          aria-label="게시물 삭제"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </article>
  );
}
