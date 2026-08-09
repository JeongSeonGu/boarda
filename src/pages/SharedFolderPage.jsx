/**
 * pages/SharedFolderPage.jsx
 * 폴더 전체 공유 페이지 — 폴더 안 모든 보드를 읽기 전용으로 표시
 */
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { relativeDate } from '../utils/helpers'
import '../styles/board.css'
import '../styles/folder.css'

const TYPE_META = {
  columns: { label: '컬럼 보드', emoji: '📋' },
  links:   { label: '링크 보드', emoji: '🔗' },
  wall:    { label: '담벼락',     emoji: '📝' },
}

export default function SharedFolderPage() {
  const { folderId } = useParams()
  const navigate     = useNavigate()

  const [folder,  setFolder]  = useState(null)
  const [boards,  setBoards]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: f }, { data: bs }] = await Promise.all([
          supabase.from('folders').select('*').eq('id', folderId).single(),
          supabase.from('boards').select('*')
            .eq('folder_id', folderId)
            .order('created_at', { ascending: false }),
        ])
        if (!f) { setError(true); return }
        setFolder(f)
        setBoards(bs ?? [])
      } catch { setError(true) }
      finally { setLoading(false) }
    }
    load()
  }, [folderId])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: 12, color: 'var(--c-muted)' }}>
      <div style={{ fontSize: 48 }}>📁</div>
      <p>폴더를 불러오는 중...</p>
    </div>
  )
  if (error || !folder) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontFamily: 'var(--font-head)' }}>폴더를 찾을 수 없습니다</h2>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* 상단 배너 */}
      <div style={{
        background: folder.color ?? 'var(--c-primary)',
        color: '#fff', padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span>📌</span><strong>Boarda</strong>
        <span style={{ opacity: .7 }}>— 공유된 폴더 (읽기 전용)</span>
        <span style={{ marginLeft: 'auto', opacity: .8 }}>작성자: {folder.author || '익명'}</span>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* 폴더 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-md)',
            background: (folder.color ?? '#6C63FF') + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, border: `2px solid ${folder.color ?? '#6C63FF'}44`,
            flexShrink: 0,
          }}>
            {folder.icon ?? '📁'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 900,
              marginBottom: 4, color: 'var(--c-text)' }}>
              {folder.name}
            </h1>
            {(folder.description || folder.desc) && (
              <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>
                {folder.description || folder.desc}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 4 }}>
              📄 {boards.length}개 보드
            </p>
          </div>
        </div>

        {/* 보드 목록 */}
        {boards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p>이 폴더에는 보드가 없습니다</p>
          </div>
        ) : (
          <div className="board-grid">
            {boards.map((board) => {
              const meta = TYPE_META[board.type] ?? TYPE_META.columns
              return (
                <div
                  key={board.id}
                  className="card board-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/share/${board.id}`)}
                  title="클릭하여 보드 열기"
                >
                  <div className="board-card-thumb" style={{ background: (board.color ?? '#6C63FF') + '22' }}>
                    <span style={{ fontSize: 40 }}>{meta.emoji}</span>
                    <div className="board-card-type-badge">
                      <span className="badge">{meta.label}</span>
                    </div>
                  </div>
                  <div className="board-card-body">
                    <div className="board-card-title">{board.name}</div>
                    {board.desc && <div className="board-card-desc">{board.desc}</div>}
                    <div className="board-card-meta">
                      <span>👤 {board.author || '익명'}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        🕐 {relativeDate(board.created_at)}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 16px 12px', fontSize: 12,
                    color: 'var(--c-primary)', fontWeight: 600 }}>
                    클릭하여 열기 ↗
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
