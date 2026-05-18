/**
 * components/links/LinkCard.jsx
 * 수정: 인증 기반 수정 권한 체크, LinkifiedText 적용
 */
import React from 'react'
import { getHostname, tagBadgeClass, importanceBadgeClass, relativeDate } from '../../utils/helpers'
import useAuthStore from '../../store/useAuthStore'
import LinkifiedText from '../common/LinkifiedText'

export default function LinkCard({ boardId, link, viewMode = 'grid', onEdit }) {
  const isOwnerOf = useAuthStore((s) => s.isOwnerOf)
  const canEdit   = useAuthStore((s) => s.canEdit)
  const canModify = canEdit() && isOwnerOf(link.author)

  const open = (e) => {
    e.stopPropagation()
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }
  const handleClick = () => { if (canModify) onEdit?.(link) }
  const attachCount = (link.attachments ?? []).length
  const desc = link.desc || link.description || ''

  if (viewMode === 'list') {
    return (
      <article className="link-card list"
        onClick={handleClick}
        style={{ cursor: canModify ? 'pointer' : 'default' }}>
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-list-body">
          <div className="link-title">{link.title}</div>
          {desc && <div className="link-desc"><LinkifiedText text={desc} /></div>}
          <div className="link-url">↗ {getHostname(link.url)}</div>
          {attachCount > 0 && <div style={{ fontSize:11, color:'var(--c-primary)' }}>📎 {attachCount}개</div>}
        </div>
        <div className="link-list-meta">
          <span className={`badge ${importanceBadgeClass(link.importance)}`}>{link.importance}</span>
          <span className="badge badge-gray">{link.category}</span>
          <div className="link-tags-row">
            {(link.tags ?? []).slice(0,2).map((t,i) => <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>)}
          </div>
          <span style={{ fontSize:11, color:'var(--c-muted)' }}>{link.author || '익명'}</span>
          <button className="btn btn-primary btn-sm" onClick={open}>이동 ↗</button>
          {!canModify && <span style={{ fontSize:10, color:'var(--c-muted)' }}>🔒</span>}
        </div>
      </article>
    )
  }

  return (
    <article className="link-card grid"
      onClick={handleClick}
      style={{ cursor: canModify ? 'pointer' : 'default' }}
      aria-label={`${link.title}${canModify ? ' — 클릭하여 수정' : ''}`}
    >
      <div className="link-card-header">
        <div className="link-card-emoji">{link.emoji}</div>
        <div className="link-title">{link.title}</div>
        {!canModify && (
          <span title="작성자만 수정 가능" style={{ fontSize:12, color:'var(--c-muted)', flexShrink:0 }}>🔒</span>
        )}
      </div>
      <div className="link-card-body">
        {desc && <div className="link-desc"><LinkifiedText text={desc} /></div>}
        <div className="link-url">↗ {getHostname(link.url)}</div>
        {attachCount > 0 && (
          <div style={{ fontSize:11, color:'var(--c-primary)', marginBottom:6 }}>📎 첨부 {attachCount}개</div>
        )}
        <div className="link-card-footer">
          <div className="link-tags-row">
            {(link.tags ?? []).slice(0,3).map((t,i) => <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>)}
          </div>
          <span className="badge badge-gray">{link.category}</span>
        </div>
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
