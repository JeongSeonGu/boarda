/**
 * pages/SharedBoardPage.jsx
 * 수정:
 *  - 컬럼/링크/담벼락 카드 클릭 시 상세 모달 표시 (읽기 전용)
 *  - URL·첨부파일 텍스트 카드 범위 초과 방지
 *  - 상세 모달 공통 컴포넌트 (SharedDetailModal) 내장
 */
import React, { useEffect, useState } from 'react'
import { useParams }       from 'react-router-dom'
import { supabase }        from '../utils/supabase'
import { relativeDate, getHostname, tagBadgeClass } from '../utils/helpers'
import { getBoardBgStyle } from '../utils/boardBackground'
import ReactionBar         from '../components/common/ReactionBar'
import SharedEditNameGate  from '../components/common/SharedEditNameGate'
import WallPostCard        from '../components/wall/WallPostCard'
import WallPostModal       from '../components/wall/WallPostModal'
import AddPostModal        from '../components/modals/AddPostModal'
import AddLinkModal        from '../components/modals/AddLinkModal'
import LinkifiedText       from '../components/common/LinkifiedText'
import { useModal }        from '../hooks/useModal'
import '../styles/board.css'
import '../styles/columns.css'
import '../styles/links.css'
import '../styles/wall.css'
import '../styles/boardSettings.css'

/* ══════════════════════════════════════════
   공유 페이지 전용 읽기 전용 상세 모달
   (PostDetailModal, EditLinkModal 대신 사용 — 로그인 불필요)
══════════════════════════════════════════ */
function SharedDetailModal({ item, type, onClose, boardId, reactionType }) {
  if (!item) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,27,46,.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-xl)',
        width: '100%', maxWidth: 560,
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 16px 48px rgba(0,0,0,.22)',
        animation: 'modalSlide .25s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'var(--c-muted)',
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            {type === 'post' ? '📝 게시물' : type === 'link' ? '🔗 링크' : '📌 메모'}
            &nbsp;— 읽기 전용
          </span>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: 'none', background: 'var(--c-bg)',
              cursor: 'pointer', fontSize: 14, color: 'var(--c-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>

          {/* ── 게시물 상세 ── */}
          {type === 'post' && (
            <>
              <h2 style={{
                fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 900,
                color: 'var(--c-text)', marginBottom: 10, lineHeight: 1.3,
              }}>
                {item.title}
              </h2>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: 'var(--c-muted)' }}>
                <span>👤 {item.author || '익명'}</span>
                <span>🕐 {relativeDate(item.created_at)}</span>
              </div>
              {item.content && (
                <div style={{
                  fontSize: 14, lineHeight: 1.8,
                  color: 'var(--c-text-secondary)',
                  marginBottom: 16, whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  <LinkifiedText text={item.content} />
                </div>
              )}
              {(item.tags ?? []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {item.tags.map((t, i) => (
                    <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
                  ))}
                </div>
              )}
              {(item.attachments ?? []).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--c-muted)' }}>
                    📎 첨부파일
                  </div>
                  {item.attachments.map((f, i) => (
                    <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', marginBottom: 6,
                        background: 'var(--c-bg)', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--c-border)',
                        color: 'var(--c-primary)', fontSize: 13,
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                      }}>
                      {f.type === 'link' ? '🔗' : '📎'} {f.name} &nbsp;⬇️
                    </a>
                  ))}
                </div>
              )}
              <ReactionBar boardId={boardId} itemId={item.id} itemType="post" reactionType={reactionType} />
            </>
          )}

          {/* ── 링크 상세 ── */}
          {type === 'link' && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--c-bg)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  {item.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 900,
                    color: 'var(--c-text)', marginBottom: 4, lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}>
                    {item.title}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                    👤 {item.author || '익명'} · {relativeDate(item.created_at)}
                  </div>
                </div>
              </div>

              {/* URL — 카드 범위 초과 방지 */}
              <div style={{
                background: 'var(--c-bg)', borderRadius: 'var(--r-sm)',
                padding: '10px 14px', marginBottom: 12,
                border: '1px solid var(--c-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--c-muted)', marginBottom: 4 }}>🔗 주소</div>
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: 'var(--c-primary)',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    display: 'block',
                    textDecoration: 'underline',
                  }}>
                  {item.url}
                </a>
              </div>

              {(item.desc || item.description) && (
                <div style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--c-text-secondary)',
                  marginBottom: 14, wordBreak: 'break-word',
                }}>
                  <LinkifiedText text={item.desc || item.description} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {(item.tags ?? []).map((t, i) => (
                  <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
                ))}
                <span className="badge badge-gray">{item.category}</span>
              </div>

              {(item.attachments ?? []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--c-muted)' }}>
                    📎 첨부파일
                  </div>
                  {item.attachments.map((f, i) => (
                    <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', marginBottom: 6,
                        background: 'var(--c-bg)', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--c-border)',
                        color: 'var(--c-primary)', fontSize: 13,
                        textDecoration: 'none', wordBreak: 'break-all',
                      }}>
                      {f.type === 'link' ? '🔗' : '📎'} {f.name} &nbsp;⬇️
                    </a>
                  ))}
                </div>
              )}

              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', width: '100%',
                  justifyContent: 'center', marginTop: 4 }}>
                이동 ↗
              </a>
              <ReactionBar boardId={boardId} itemId={item.id} itemType="link" reactionType={reactionType} />
            </>
          )}

          {/* ── 담벼락 메모 상세 ── */}
          {type === 'wall' && (
            <>
              <div style={{
                background: item.color ?? '#FFF9C4',
                borderRadius: 'var(--r-md)',
                padding: '16px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,.45)', marginBottom: 8 }}>
                  ✍️ {item.author || '익명'} · {relativeDate(item.created_at)}
                </div>
                <div style={{
                  fontSize: 15, lineHeight: 1.7,
                  color: 'rgba(0,0,0,.75)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  <LinkifiedText text={item.content} />
                </div>
              </div>
              {(item.attachments ?? []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {item.attachments.map((f, i) => (
                    <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', marginBottom: 6,
                        background: 'var(--c-bg)', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--c-border)',
                        color: 'var(--c-primary)', fontSize: 13,
                        textDecoration: 'none', wordBreak: 'break-all',
                      }}>
                      {f.type === 'link' ? '🔗' : '📎'} {f.name} &nbsp;⬇️
                    </a>
                  ))}
                </div>
              )}
              <ReactionBar boardId={boardId} itemId={item.id} itemType="wall" reactionType={reactionType} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   비밀번호 게이트
══════════════════════════════════════════ */
function PasswordGate({ onUnlock }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)
  return (
    <div className="password-gate">
      <div className="password-gate-card">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
          비밀번호가 필요합니다
        </h2>
        <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 20 }}>
          이 보드는 비밀번호로 보호되어 있습니다
        </p>
        {err && (
          <div style={{ color: 'var(--c-danger)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
            ⚠️ 비밀번호가 올바르지 않습니다
          </div>
        )}
        <input className="form-input" type="password" value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false) }}
          placeholder="비밀번호 입력"
          style={{ marginBottom: 12, textAlign: 'center' }} autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onUnlock(pw, setErr)} />
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => onUnlock(pw, setErr)}>확인</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   메인 공유 페이지
══════════════════════════════════════════ */
export default function SharedBoardPage() {
  const { boardId } = useParams()
  const [board,     setBoard]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [unlocked,  setUnlocked]  = useState(false)
  const [editName,  setEditName]  = useState(null)
  const [showNameGate, setShowNameGate] = useState(false)

  /* 상세 모달 상태 */
  const [detailItem, setDetailItem] = useState(null)  // { item, type }

  const postModal = useModal()
  const linkModal = useModal()
  const wallModal = useModal()

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: b },
          { data: columns },
          { data: posts },
          { data: links },
          { data: wallPosts },
        ] = await Promise.all([
          supabase.from('boards').select('*').eq('id', boardId).single(),
          supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
          supabase.from('posts').select('*').eq('board_id', boardId).order('created_at'),
          supabase.from('links').select('*').eq('board_id', boardId).order('created_at'),
          supabase.from('wall_posts').select('*').eq('board_id', boardId).order('z_order').order('created_at'),
        ])
        if (!b) { setError(true); return }
        setBoard({
          ...b, desc: b.description ?? '',
          columns: b.type === 'columns'
            ? (columns ?? []).map((c) => ({
                ...c, posts: (posts ?? []).filter((p) => p.column_id === c.id),
              }))
            : undefined,
          links:      b.type === 'links' ? (links ?? []) : undefined,
          wall_posts: b.type === 'wall'  ? (wallPosts ?? []) : undefined,
        })
        if (!b.share_password) setUnlocked(true)
      } catch { setError(true) }
      finally { setLoading(false) }
    }
    load()
  }, [boardId])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', flexDirection:'column', gap:12, color:'var(--c-muted)' }}>
      <div style={{ fontSize:48 }}>📌</div><p>보드를 불러오는 중...</p>
    </div>
  )
  if (error || !board) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
      <h2 style={{ fontFamily:'var(--font-head)', marginBottom:8 }}>보드를 찾을 수 없습니다</h2>
    </div>
  )
  if (!unlocked) {
    return (
      <PasswordGate onUnlock={(pw, setErr) => {
        if (pw === board.share_password) setUnlocked(true)
        else setErr(true)
      }} />
    )
  }

  const reactionType = board.reaction_type ?? 'none'
  const canEditShare = board.share_edit
  const bgStyle      = getBoardBgStyle(board)

  /* 카드 클릭 핸들러 */
  const openDetail = (item, type) => setDetailItem({ item, type })
  const closeDetail = () => setDetailItem(null)

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>
      {/* 실명 입력 오버레이 */}
      {showNameGate && (
        <SharedEditNameGate onConfirm={(name) => { setEditName(name); setShowNameGate(false) }} />
      )}

      {/* 카드 상세 모달 */}
      {detailItem && (
        <SharedDetailModal
          item={detailItem.item}
          type={detailItem.type}
          onClose={closeDetail}
          boardId={boardId}
          reactionType={reactionType}
        />
      )}

      {/* 상단 배너 */}
      <div style={{ background:'var(--c-primary)', color:'#fff',
        padding:'10px 24px', display:'flex', alignItems:'center', gap:10, fontSize:13,
        position:'sticky', top:0, zIndex:100 }}>
        <span>📌</span><strong>Boarda</strong>
        <span style={{ opacity:.7 }}>— 공유된 보드 (읽기 전용)</span>
        {canEditShare && (
          <span style={{ marginLeft:8, background:'rgba(255,255,255,.2)',
            padding:'2px 10px', borderRadius:20, fontSize:11 }}>✏️ 편집 공유</span>
        )}
        <span style={{ marginLeft:'auto', opacity:.8 }}>작성자: {board.author || '익명'}</span>
        {canEditShare && !editName && (
          <button onClick={() => setShowNameGate(true)}
            style={{ background:'#fff', color:'var(--c-primary)', border:'none',
              borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ✏️ 편집 참여
          </button>
        )}
        {canEditShare && editName && (
          <span style={{ background:'rgba(255,255,255,.25)', padding:'3px 12px', borderRadius:20, fontSize:12 }}>
            ✍️ {editName} 으로 편집 중
          </span>
        )}
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>
        {/* 보드 헤더 */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:24, fontWeight:900, marginBottom:6 }}>
            {board.name}
          </h1>
          {board.desc && <p style={{ color:'var(--c-muted)', fontSize:14 }}>{board.desc}</p>}
          {canEditShare && editName && (
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              {board.type === 'columns' && (
                <button className="btn btn-primary btn-sm" onClick={postModal.open}>＋ 게시물 추가</button>
              )}
              {board.type === 'links' && (
                <button className="btn btn-primary btn-sm" onClick={linkModal.open}>＋ 링크 추가</button>
              )}
              {board.type === 'wall' && (
                <button className="btn btn-primary btn-sm" onClick={() => wallModal.open(null)}>＋ 메모 추가</button>
              )}
            </div>
          )}
        </div>

        {/* ══ 컬럼 보드 ══ */}
        {board.type === 'columns' && (
          <div className="columns-board" style={bgStyle}>
            {(board.columns ?? []).map((col) => (
              <div key={col.id} className="column-card">
                <div className="column-header">
                  <span className="column-color-dot" style={{ background:col.color }} />
                  <span style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:14, flex:1 }}>
                    {col.name}
                  </span>
                  <span className="column-count">{col.posts.length}</span>
                </div>
                <div className="column-posts">
                  {col.posts.map((post) => (
                    <div
                      key={post.id}
                      className="post-card"
                      style={{ cursor:'pointer' }}
                      onClick={() => openDetail(post, 'post')}
                      title="클릭하여 상세 보기"
                    >
                      <div className="post-card-title">{post.title}</div>
                      {post.content && (
                        <div className="post-card-content" style={{ wordBreak:'break-word' }}>
                          {post.content}
                        </div>
                      )}
                      {/* 첨부파일 — 클릭 방해 방지 */}
                      {(post.attachments ?? []).length > 0 && (
                        <div style={{ fontSize:11, color:'var(--c-primary)', marginTop:4 }}
                          onClick={(e) => e.stopPropagation()}>
                          {post.attachments.map((f, i) => (
                            <a key={i} href={f.url} download={f.name}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                display:'block', color:'var(--c-primary)',
                                textDecoration:'none', marginBottom:2,
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                              }}>
                              📎 {f.name}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="post-card-footer" style={{ marginTop:6 }}>
                        <div className="post-card-tags">
                          {(post.tags ?? []).map((t, i) => (
                            <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
                          ))}
                        </div>
                        <span className="post-card-date">
                          {post.author || '익명'} · {relativeDate(post.created_at)}
                        </span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ReactionBar boardId={boardId} itemId={post.id}
                          itemType="post" reactionType={reactionType} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ 링크 보드 ══ */}
        {board.type === 'links' && (
          <div className="links-grid">
            {(board.links ?? []).map((link) => (
              <div
                key={link.id}
                className="link-card grid"
                style={{ cursor:'pointer' }}
                onClick={() => openDetail(link, 'link')}
                title="클릭하여 상세 보기"
              >
                <div className="link-card-header">
                  <div className="link-card-emoji">{link.emoji}</div>
                  <div className="link-title" style={{ wordBreak:'break-word' }}>{link.title}</div>
                </div>
                <div className="link-card-body">
                  {(link.desc || link.description) && (
                    <div className="link-desc">{link.desc || link.description}</div>
                  )}
                  {/* URL — 카드 넘침 방지 핵심 수정 */}
                  <div style={{
                    fontSize:11, color:'var(--c-accent)',
                    marginBottom:8,
                    overflow:'hidden',
                    textOverflow:'ellipsis',
                    whiteSpace:'nowrap',
                    maxWidth:'100%',
                  }}>
                    ↗ {getHostname(link.url)}
                  </div>
                  {(link.attachments ?? []).length > 0 && (
                    <div style={{ fontSize:11, color:'var(--c-primary)', marginBottom:6 }}
                      onClick={(e) => e.stopPropagation()}>
                      {link.attachments.map((f, i) => (
                        <a key={i} href={f.url} download={f.name}
                          target="_blank" rel="noopener noreferrer"
                          style={{
                            display:'block', color:'var(--c-primary)',
                            textDecoration:'none', marginBottom:2,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                          }}>
                          📎 {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="link-card-footer">
                    <div className="link-tags-row">
                      {(link.tags ?? []).slice(0,3).map((t, i) => (
                        <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
                      ))}
                    </div>
                    <span className="badge badge-gray">{link.category}</span>
                  </div>
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    marginTop:10, paddingTop:8, borderTop:'1px solid var(--c-border)',
                  }}>
                    <span style={{ fontSize:11, color:'var(--c-muted)' }}>
                      {link.author || '익명'} · {relativeDate(link.created_at)}
                    </span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration:'none', flexShrink:0 }}
                      onClick={(e) => e.stopPropagation()}>
                      이동 ↗
                    </a>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ReactionBar boardId={boardId} itemId={link.id}
                      itemType="link" reactionType={reactionType} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ 담벼락 ══ */}
        {board.type === 'wall' && (
          <div className="wall-canvas" style={{ minHeight:500, ...bgStyle }}>
            {(board.wall_posts ?? []).length === 0 && (
              <div className="wall-empty">
                <div className="wall-empty-icon">📝</div>
                <div className="wall-empty-text">메모가 없습니다</div>
              </div>
            )}
            {(board.wall_posts ?? [])
              .slice()
              .sort((a, b) => (a.z_order ?? 0) - (b.z_order ?? 0))
              .map((post) => {
                const canEdit = canEditShare && editName &&
                  (editName === post.author || board.author === editName)
                return (
                  <WallPostCard
                    key={post.id}
                    boardId={boardId}
                    post={post}
                    readOnly={!canEdit}
                    /* 읽기 전용이어도 클릭 시 상세 모달 열기 */
                    onOpen={(p) => {
                      if (canEdit) wallModal.open(p)
                      else openDetail(p, 'wall')
                    }}
                    reactionType={reactionType}
                  />
                )
              })}
          </div>
        )}
      </div>

      {/* 편집 공유 모달 */}
      {canEditShare && editName && board.type === 'columns' && (
        <AddPostModal isOpen={postModal.isOpen} onClose={postModal.close} boardId={boardId} />
      )}
      {canEditShare && editName && board.type === 'links' && (
        <AddLinkModal isOpen={linkModal.isOpen} onClose={linkModal.close} boardId={boardId} />
      )}
      {canEditShare && editName && board.type === 'wall' && (
        <WallPostModal isOpen={wallModal.isOpen} onClose={wallModal.close}
          boardId={boardId} post={wallModal.data} />
      )}
    </div>
  )
}