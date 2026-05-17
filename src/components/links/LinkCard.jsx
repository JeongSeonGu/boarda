/**
 * components/links/LinkCard.jsx
 * 수정: 카드 클릭 → 수정 모달, "이동" 버튼 별도, 작성자 표시
 */
import React from 'react'
import { getHostname, tagBadgeClass, importanceBadgeClass, relativeDate } from '../../utils/helpers'

export default function LinkCard({ boardId, link, viewMode = 'grid', onEdit }) {
  const open = (e) => {
    e.stopPropagation()
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }
  const attachCount = (link.attachments ?? []).length

  if (viewMode === 'list') {
    return (
      <article className="link-card list" onClick={() => onEdit?.(link)}
        style={{ cursor:'pointer' }}>
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-list-body">
          <div className="link-title">{link.title}</div>
          <div className="link-desc">{link.desc || link.description}</div>
          <div className="link-url">↗ {getHostname(link.url)}</div>
          {attachCount > 0 && (
            <div style={{ fontSize:11, color:'var(--c-primary)' }}>📎 {attachCount}개</div>
          )}
        </div>
        <div className="link-list-meta">
          <span className={`badge ${importanceBadgeClass(link.importance)}`}>{link.importance}</span>
          <span className="badge badge-gray">{link.category}</span>
          <div className="link-tags-row">
            {(link.tags ?? []).slice(0, 2).map((t, i) => (
              <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
            ))}
          </div>
          <span style={{ fontSize:11, color:'var(--c-muted)' }}>{link.author || '익명'}</span>
          {/* 이동 버튼 */}
          <button className="btn btn-primary btn-sm" onClick={open}
            style={{ flexShrink:0 }}>이동 ↗</button>
        </div>
      </article>
    )
  }

  return (
    <article
      className="link-card grid"
      onClick={() => onEdit?.(link)}
      style={{ cursor:'pointer' }}
      aria-label={`${link.title} 수정`}
    >
      <div className="link-card-header">
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-title">{link.title}</div>
      </div>

      <div className="link-card-body">
        <div className="link-desc">{link.desc || link.description}</div>
        <div className="link-url">↗ {getHostname(link.url)}</div>
        {attachCount > 0 && (
          <div style={{ fontSize:11, color:'var(--c-primary)', marginBottom:6 }}>
            📎 첨부파일 {attachCount}개
          </div>
        )}
        <div className="link-card-footer">
          <div className="link-tags-row">
            {(link.tags ?? []).slice(0, 3).map((t, i) => (
              <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
            ))}
          </div>
          <span className="badge badge-gray">{link.category}</span>
        </div>
        {/* 하단: 작성자 + 이동 버튼 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop:10, paddingTop:8, borderTop:'1px solid var(--c-border)' }}>
          <span style={{ fontSize:11, color:'var(--c-muted)' }}>
            👤 {link.author || '익명'} · {relativeDate(link.created_at || link.createdAt)}
          </span>
          <button className="btn btn-primary btn-sm" onClick={open}>이동 ↗</button>
        </div>
      </div>
    </article>
  )
}
