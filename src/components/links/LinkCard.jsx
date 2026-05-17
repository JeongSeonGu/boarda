/**
 * components/links/LinkCard.jsx
 */
import React from 'react';
import useBoardStore from '../../store/useBoardStore';
import { getHostname, tagBadgeClass, importanceBadgeClass } from '../../utils/helpers';

export default function LinkCard({ boardId, link, viewMode = 'grid' }) {
  const deleteLink = useBoardStore((s) => s.deleteLink);

  const open = () => window.open(link.url, '_blank', 'noopener,noreferrer');

  if (viewMode === 'list') {
    return (
      <article className="link-card list" onClick={open} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()}>
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-list-body">
          <div className="link-title">{link.title}</div>
          <div className="link-desc">{link.desc}</div>
          <div className="link-url">↗ {getHostname(link.url)}</div>
        </div>
        <div className="link-list-meta">
          <span className={`badge ${importanceBadgeClass(link.importance)}`}>{link.importance}</span>
          <span className="badge badge-gray">{link.category}</span>
          <div className="link-tags-row">
            {link.tags.slice(0, 3).map((t, i) => (
              <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
            ))}
          </div>
          <button
            className="action-icon danger"
            onClick={(e) => { e.stopPropagation(); deleteLink(boardId, link.id); }}
            title="삭제"
            aria-label="링크 삭제"
          >
            🗑️
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="link-card grid"
      onClick={open}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      aria-label={`${link.title} 열기`}
    >
      {/* 헤더 */}
      <div className="link-card-header">
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-title">{link.title}</div>
      </div>

      {/* 본문 */}
      <div className="link-card-body">
        <div className="link-desc">{link.desc}</div>
        <div className="link-url">↗ {getHostname(link.url)}</div>
        <div className="link-card-footer">
          <div className="link-tags-row">
            {link.tags.slice(0, 3).map((t, i) => (
              <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
            ))}
          </div>
          <span className="badge badge-gray">{link.category}</span>
        </div>
      </div>

      {/* 호버 액션 */}
      <div className="link-card-actions">
        <button
          className="action-icon danger"
          onClick={(e) => { e.stopPropagation(); deleteLink(boardId, link.id); }}
          title="삭제"
          aria-label="링크 삭제"
        >
          🗑️
        </button>
      </div>
    </article>
  );
}
