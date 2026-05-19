/**
 * pages/SharedListPage.jsx
 * 공유 중인 보드 목록 페이지
 * - 공유 중인 보드만 표시 (is_public: true)
 * - 공유 해제 버튼 제공
 * - 공유 링크 복사, QR 표시
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import useAuthStore  from '../store/useAuthStore'
import EmptyState    from '../components/common/EmptyState'
import '../styles/board.css'
import '../styles/boardSettings.css'

const MODE_BADGE = {
  login_only: { label: '👤 로그인 사용자만', color: '#E6F1FB', textColor: '#0C447C' },
  public:     { label: '🌐 누구나',           color: '#E8F8F3', textColor: '#0B7A5E' },
}

function QRImage({ url }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1A1B2E&margin=8`
  return <img src={src} alt="QR" width={120} height={120} style={{ borderRadius: 6 }} />
}

export default function SharedListPage() {
  const navigate      = useNavigate()
  const boards        = useBoardStore((s) => s.boards)
  const unshareBoard  = useBoardStore((s) => s.unshareBoard)
  const showToast     = useBoardStore((s) => s.showToast)
  const isOwnerOf     = useAuthStore((s) => s.isOwnerOf)

  const [showQRId, setShowQRId] = useState(null)

  /* 공유 중인 보드만 필터 */
  const sharedBoards = boards.filter((b) => b.is_public)

  const copyUrl = (boardId) => {
    const url = `${window.location.origin}/share/${boardId}`
    navigator.clipboard?.writeText(url).catch(() => {})
    showToast('링크가 복사되었습니다! 📋', 'success')
  }

  const handleUnshare = async (board) => {
    if (!window.confirm(`'${board.name}' 보드의 공유를 해제하시겠습니까?`)) return
    await unshareBoard(board.id)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          🤝 공유 중인 보드
        </h1>
        <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>
          현재 공유 중인 보드 목록입니다. 여기서 공유를 빠르게 해제할 수 있습니다.
        </p>
      </div>

      {sharedBoards.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="공유 중인 보드가 없습니다"
          desc="보드를 열고 우상단 '공유' 버튼으로 공유를 시작하세요"
          actionLabel="홈으로"
          onAction={() => navigate('/')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sharedBoards.map((board) => {
            const shareUrl  = `${window.location.origin}/share/${board.id}`
            const modeBadge = MODE_BADGE[board.share_mode] ?? MODE_BADGE.public
            const isOwner   = isOwnerOf(board.author)
            const showQR    = showQRId === board.id

            return (
              <div key={board.id} style={{
                background: 'var(--c-surface)',
                border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-lg)',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  {/* 보드 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 800,
                        color: 'var(--c-text)', cursor: 'pointer' }}
                        onClick={() => navigate(`/board/${board.id}`)}>
                        {board.name}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 20, background: modeBadge.color, color: modeBadge.textColor,
                      }}>
                        {modeBadge.label}
                      </span>
                      {board.share_password && (
                        <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>🔒 비밀번호 설정됨</span>
                      )}
                      {board.share_edit && (
                        <span style={{ fontSize: 11, color: 'var(--c-primary)' }}>✏️ 편집 허용</span>
                      )}
                    </div>
                    {board.desc && (
                      <div style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 8 }}>{board.desc}</div>
                    )}
                    {/* 공유 URL */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--c-bg)', borderRadius: 'var(--r-sm)',
                      padding: '7px 12px', fontSize: 12, color: 'var(--c-muted)',
                    }}>
                      <span style={{ color: 'var(--c-accent)' }}>🔗</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shareUrl}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start', flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => copyUrl(board.id)}>
                      📋 복사
                    </button>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => setShowQRId(showQR ? null : board.id)}>
                      📱 QR
                    </button>
                    <button className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/board/${board.id}`)}>
                      열기
                    </button>
                    {isOwner && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleUnshare(board)}>
                        🔒 공유 해제
                      </button>
                    )}
                  </div>
                </div>

                {/* QR 코드 펼침 */}
                {showQR && (
                  <div style={{
                    marginTop: 12, paddingTop: 12,
                    borderTop: '1px solid var(--c-border)',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}>
                    <QRImage url={shareUrl} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                        모바일로 스캔하세요
                      </div>
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}&margin=10`}
                        download="boarda-qr.png" target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        ⬇️ QR 이미지 저장
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
