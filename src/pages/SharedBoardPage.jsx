/**
 * pages/SharedBoardPage.jsx
 * 수정: 비밀번호 게이트, 편집 공유(실명 입력), 반응 바, 배경 적용
 */
import React, { useEffect, useState } from 'react'
import { useParams }        from 'react-router-dom'
import { supabase }         from '../utils/supabase'
import { relativeDate, getHostname, tagBadgeClass } from '../utils/helpers'
import { getBoardBgStyle }  from '../utils/boardBackground'
import ReactionBar          from '../components/common/ReactionBar'
import SharedEditNameGate   from '../components/common/SharedEditNameGate'
import WallPostCard         from '../components/wall/WallPostCard'
import WallPostModal        from '../components/wall/WallPostModal'
import AddPostModal         from '../components/modals/AddPostModal'
import AddLinkModal         from '../components/modals/AddLinkModal'
import { useModal }         from '../hooks/useModal'
import '../styles/board.css'
import '../styles/columns.css'
import '../styles/links.css'
import '../styles/wall.css'
import '../styles/boardSettings.css'

/* ── 비밀번호 게이트 ── */
function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('')
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
        <input
          className="form-input"
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false) }}
          placeholder="비밀번호 입력"
          style={{ marginBottom: 12, textAlign: 'center' }}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onUnlock(pw, setErr)}
        />
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => onUnlock(pw, setErr)}>
          확인
        </button>
      </div>
    </div>
  )
}

export default function SharedBoardPage() {
  const { boardId }  = useParams()
  const [board, setBoard]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [unlocked, setUnlocked]   = useState(false)
  const [editName, setEditName]   = useState(null)   // 편집 공유 실명
  const [showNameGate, setShowNameGate] = useState(false)

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
          supabase.from('wall_posts').select('*').eq('board_id', boardId).order('created_at'),
        ])
        if (!b) { setError(true); return }
        setBoard({
          ...b, desc: b.description ?? '',
          columns: b.type === 'columns'
            ? (columns ?? []).map((c) => ({ ...c, posts: (posts ?? []).filter((p) => p.column_id === c.id) }))
            : undefined,
          links:      b.type === 'links' ? (links ?? []) : undefined,
          wall_posts: b.type === 'wall'  ? (wallPosts ?? []) : undefined,
        })
        /* 비밀번호 없으면 바로 열기 */
        if (!b.share_password) setUnlocked(true)
      } catch { setError(true) }
      finally { setLoading(false) }
    }
    load()
  }, [boardId])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: 12, color: 'var(--c-muted)' }}>
      <div style={{ fontSize: 48 }}>📌</div><p>보드를 불러오는 중...</p>
    </div>
  )
  if (error || !board) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>보드를 찾을 수 없습니다</h2>
    </div>
  )

  /* 비밀번호 검증 */
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

  /* 편집 공유 버튼 클릭 */
  const handleEditClick = () => {
    if (editName) return  // 이미 이름 입력됨
    setShowNameGate(true)
  }

  const bgStyle = getBoardBgStyle(board)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* 실명 입력 오버레이 */}
      {showNameGate && (
        <SharedEditNameGate onConfirm={(name) => {
          setEditName(name)
          setShowNameGate(false)
        }} />
      )}

      {/* 상단 배너 */}
      <div style={{ background: 'var(--c-primary)', color: '#fff',
        padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <span>📌</span><strong>Boarda</strong>
        <span style={{ opacity: .7 }}>— 공유된 보드</span>
        {canEditShare && (
          <span style={{ marginLeft: 8, background: 'rgba(255,255,255,.2)',
            padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>
            ✏️ 편집 공유
          </span>
        )}
        <span style={{ marginLeft: 'auto', opacity: .8 }}>작성자: {board.author || '익명'}</span>
        {canEditShare && !editName && (
          <button onClick={handleEditClick}
            style={{ background: '#fff', color: 'var(--c-primary)', border: 'none',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ✏️ 편집 참여
          </button>
        )}
        {canEditShare && editName && (
          <span style={{ background: 'rgba(255,255,255,.25)', padding: '3px 12px',
            borderRadius: 20, fontSize: 12 }}>
            ✍️ {editName} 으로 편집 중
          </span>
        )}
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* 보드 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
            {board.name}
          </h1>
          {board.desc && <p style={{ color: 'var(--c-muted)', fontSize: 14 }}>{board.desc}</p>}
          {canEditShare && editName && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {board.type === 'columns' && (
                <button className="btn btn-primary btn-sm" onClick={postModal.open}>
                  ＋ 게시물 추가
                </button>
              )}
              {board.type === 'links' && (
                <button className="btn btn-primary btn-sm" onClick={linkModal.open}>
                  ＋ 링크 추가
                </button>
              )}
              {board.type === 'wall' && (
                <button className="btn btn-primary btn-sm" onClick={() => wallModal.open(null)}>
                  ＋ 메모 추가
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 컬럼 보드 ── */}
        {board.type === 'columns' && (
          <div className="columns-board" style={bgStyle}>
            {(board.columns ?? []).map((col) => (
              <div key={col.id} className="column-card">
                <div className="column-header">
                  <span className="column-color-dot" style={{ background: col.color }} />
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 14, flex: 1 }}>
                    {col.name}
                  </span>
                  <span className="column-count">{col.posts.length}</span>
                </div>
                <div className="column-posts">
                  {col.posts.map((post) => (
                    <div key={post.id} className="post-card" style={{ cursor: 'default' }}>
                      <div className="post-card-title">{post.title}</div>
                      {post.content && <div className="post-card-content">{post.content}</div>}
                      {(post.attachments ?? []).length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {post.attachments.map((f, i) => (
                            <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: 'var(--c-primary)', display: 'block' }}>
                              📎 {f.name} ⬇️
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="post-card-footer">
                        <div className="post-card-tags">
                          {(post.tags ?? []).map((t, i) => (
                            <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
                          ))}
                        </div>
                        <span className="post-card-date">
                          {post.author || '익명'} · {relativeDate(post.created_at)}
                        </span>
                      </div>
                      <ReactionBar boardId={boardId} itemId={post.id}
                        itemType="post" reactionType={reactionType} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 링크 보드 ── */}
        {board.type === 'links' && (
          <div className="links-grid" style={bgStyle}>
            {(board.links ?? []).map((link) => (
              <div key={link.id} className="link-card grid" style={{ cursor: 'default' }}>
                <div className="link-card-header">
                  <div className="link-card-emoji">{link.emoji}</div>
                  <div className="link-title">{link.title}</div>
                </div>
                <div className="link-card-body">
                  <div className="link-desc">{link.desc || link.description}</div>
                  <div className="link-url">↗ {getHostname(link.url)}</div>
                  {(link.attachments ?? []).length > 0 && link.attachments.map((f, i) => (
                    <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--c-primary)', display: 'block' }}>
                      📎 {f.name} ⬇️
                    </a>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: 8, paddingTop: 8,
                    borderTop: '1px solid var(--c-border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>
                      {link.author || '익명'} · {relativeDate(link.created_at)}
                    </span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                      이동 ↗
                    </a>
                  </div>
                  <ReactionBar boardId={boardId} itemId={link.id}
                    itemType="link" reactionType={reactionType} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 담벼락 ── */}
        {board.type === 'wall' && (
          <div className="wall-canvas" style={{ minHeight: 500, ...bgStyle }}>
            {(board.wall_posts ?? []).length === 0 && (
              <div className="wall-empty">
                <div className="wall-empty-icon">📝</div>
                <div className="wall-empty-text">메모가 없습니다</div>
              </div>
            )}
            {(board.wall_posts ?? []).map((post) => (
              <WallPostCard
                key={post.id}
                boardId={boardId}
                post={post}
                readOnly={!(canEditShare && editName && (editName === post.author || board.author === editName))}
                onOpen={canEditShare && editName ? (p) => wallModal.open(p) : undefined}
                reactionType={reactionType}
              />
            ))}
          </div>
        )}
      </div>

      {/* 편집 공유 모달들 (editName 있을 때만) */}
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
