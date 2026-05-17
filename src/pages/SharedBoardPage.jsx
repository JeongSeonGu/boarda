/**
 * pages/SharedBoardPage.jsx — 수정: wall 타입 읽기 전용 추가
 */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { relativeDate, getHostname, tagBadgeClass } from '../utils/helpers'
import '../styles/board.css'
import '../styles/columns.css'
import '../styles/links.css'
import '../styles/wall.css'

export default function SharedBoardPage() {
  const { boardId } = useParams()
  const [board, setBoard]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

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
          links: b.type === 'links' ? (links ?? []) : undefined,
          wall_posts: b.type === 'wall' ? (wallPosts ?? []) : undefined,
        })
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
      <p style={{ color:'var(--c-muted)' }}>삭제되었거나 공유가 해제된 보드입니다.</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>
      <div style={{ background:'var(--c-primary)', color:'#fff', padding:'10px 24px',
        display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
        <span>📌</span><strong>Boarda</strong>
        <span style={{ opacity:.7 }}>— 공유된 보드 (읽기 전용)</span>
        <span style={{ marginLeft:'auto', opacity:.8 }}>작성자: {board.author || '익명'}</span>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:24, fontWeight:900, marginBottom:6 }}>{board.name}</h1>
          {board.desc && <p style={{ color:'var(--c-muted)', fontSize:14 }}>{board.desc}</p>}
        </div>

        {/* 컬럼 보드 */}
        {board.type === 'columns' && (
          <div className="columns-board">
            {(board.columns ?? []).map((col) => (
              <div key={col.id} className="column-card">
                <div className="column-header">
                  <span className="column-color-dot" style={{ background:col.color }} />
                  <span style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:14, flex:1 }}>{col.name}</span>
                  <span className="column-count">{col.posts.length}</span>
                </div>
                <div className="column-posts">
                  {col.posts.map((post) => (
                    <div key={post.id} className="post-card" style={{ cursor:'default' }}>
                      <div className="post-card-title">{post.title}</div>
                      {post.content && <div className="post-card-content">{post.content}</div>}
                      {(post.attachments ?? []).length > 0 && (
                        <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:4 }}>
                          {post.attachments.map((f, i) => (
                            <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:11, color:'var(--c-primary)' }}>📎 {f.name} ⬇️</a>
                          ))}
                        </div>
                      )}
                      <div className="post-card-footer">
                        <div className="post-card-tags">
                          {(post.tags ?? []).map((t, i) => <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>)}
                        </div>
                        <span className="post-card-date">{post.author || '익명'} · {relativeDate(post.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 링크 보드 */}
        {board.type === 'links' && (
          <div className="links-grid">
            {(board.links ?? []).map((link) => (
              <div key={link.id} className="link-card grid" style={{ cursor:'default' }}>
                <div className="link-card-header">
                  <div className="link-card-emoji">{link.emoji}</div>
                  <div className="link-title">{link.title}</div>
                </div>
                <div className="link-card-body">
                  <div className="link-desc">{link.desc || link.description}</div>
                  <div className="link-url">↗ {getHostname(link.url)}</div>
                  {(link.attachments ?? []).length > 0 && (
                    <div style={{ marginBottom:8 }}>
                      {link.attachments.map((f, i) => (
                        <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:11, color:'var(--c-primary)', display:'block' }}>📎 {f.name} ⬇️</a>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:8, borderTop:'1px solid var(--c-border)' }}>
                    <span style={{ fontSize:11, color:'var(--c-muted)' }}>{link.author || '익명'} · {relativeDate(link.created_at)}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary btn-sm" style={{ textDecoration:'none' }}>이동 ↗</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 담벼락 (읽기 전용 — 위치 그대로, 드래그 없음) */}
        {board.type === 'wall' && (
          <div className="wall-canvas" style={{ minHeight:500 }}>
            {(board.wall_posts ?? []).length === 0 && (
              <div className="wall-empty">
                <div className="wall-empty-icon">📝</div>
                <div className="wall-empty-text">메모가 없습니다</div>
              </div>
            )}
            {(board.wall_posts ?? []).map((post) => (
              <div key={post.id} className="wall-card"
                style={{ left:post.pos_x, top:post.pos_y, width:post.width ?? 200,
                  background:post.color ?? '#FFF9C4', cursor:'default' }}>
                <div className="wall-card-tab" style={{ background:post.color ?? '#FFF9C4', filter:'brightness(.88)' }}>
                  <span className="wall-card-author">✍️ {post.author || '익명'}</span>
                </div>
                <div className="wall-card-body" style={{ cursor:'default' }}>{post.content}</div>
                {(post.attachments ?? []).length > 0 && (
                  <div style={{ padding:'0 12px 8px', display:'flex', flexDirection:'column', gap:3 }}>
                    {post.attachments.map((f, i) => (
                      <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:10, color:'rgba(0,0,0,.55)' }}>📎 {f.name} ⬇️</a>
                    ))}
                  </div>
                )}
                <div className="wall-card-footer">
                  <span className="wall-card-date">{relativeDate(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
