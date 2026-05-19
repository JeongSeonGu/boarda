/**
 * components/modals/ShareModal.jsx
 * 재작성: 공개/비공개 모드 우선 선택 → 세부 설정
 *
 * share_mode: 'private' | 'login_only' | 'public'
 *  - private    : 비공개 (공유 없음)
 *  - login_only : 로그인한 사람만
 *  - public     : 누구나
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useBoardStore from '../../store/useBoardStore'
import '../../styles/boardSettings.css'

function QRImage({ url, size = 160 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1A1B2E&margin=10`
  return (
    <img src={src} alt="QR코드" width={size} height={size}
      style={{ borderRadius: 8, border: '1px solid var(--c-border)' }} />
  )
}

const MODE_OPTIONS = [
  {
    value: 'private',
    icon: '🔒',
    label: '비공개',
    desc: '나만 볼 수 있습니다. 공유 링크가 없습니다.',
    color: 'var(--c-muted)',
  },
  {
    value: 'login_only',
    icon: '👤',
    label: '로그인 사용자만',
    desc: '로그인한 사람에게만 링크를 공유할 수 있습니다.',
    color: 'var(--c-blue)',
  },
  {
    value: 'public',
    icon: '🌐',
    label: '누구나',
    desc: '링크가 있는 누구나 접근할 수 있습니다.',
    color: 'var(--c-accent)',
  },
]

export default function ShareModal({ isOpen, onClose, boardId }) {
  const showToast   = useBoardStore((s) => s.showToast)
  const boards      = useBoardStore((s) => s.boards)
  const updateBoard = useBoardStore((s) => s.updateBoard)
  const board = boards.find((b) => b.id === boardId)

  const [shareMode,  setShareMode]  = useState('private')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [editShare,  setEditShare]  = useState(false)
  const [showQR,     setShowQR]     = useState(false)
  const [saving,     setSaving]     = useState(false)

  const shareUrl = boardId ? `${window.location.origin}/share/${boardId}` : ''
  const isPublic = shareMode !== 'private'

  useEffect(() => {
    if (board && isOpen) {
      setShareMode(board.share_mode ?? 'private')
      setPassword(board.share_password ?? '')
      setEditShare(board.share_edit ?? false)
      setShowQR(false)
    }
  }, [board, isOpen])

  const handleSave = async () => {
    setSaving(true)
    await updateBoard(boardId, {
      share_mode:     shareMode,
      is_public:      isPublic,
      share_password: isPublic ? (password.trim() || null) : null,
      share_edit:     isPublic ? editShare : false,
    })
    setSaving(false)
  }

  const copyUrl = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    showToast('링크가 복사되었습니다! 📋', 'success')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔗 보드 공유 설정" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>닫기</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </>
      }
    >
      {/* ── Step 1: 공개 모드 선택 ── */}
      <div className="settings-section">
        <div className="settings-section-title">공개 범위</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODE_OPTIONS.map((m) => (
            <div key={m.value}
              onClick={() => setShareMode(m.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                border: `2px solid ${shareMode === m.value ? m.color : 'var(--c-border)'}`,
                borderRadius: 'var(--r-md)',
                background: shareMode === m.value ? `${m.color}12` : 'var(--c-surface)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-text)', marginBottom: 2 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{m.desc}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${shareMode === m.value ? m.color : 'var(--c-border)'}`,
                background: shareMode === m.value ? m.color : 'transparent',
                flexShrink: 0,
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 2: 공개일 때만 표시 ── */}
      {isPublic && (
        <>
          {/* 공유 링크 */}
          <div className="settings-section">
            <div className="settings-section-title">공유 링크</div>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: 'var(--c-bg)', border: '1.5px solid var(--c-border)',
              borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 8,
            }}>
              <span style={{ color: 'var(--c-accent)', flexShrink: 0 }}>🔗</span>
              <input readOnly value={shareUrl} style={{
                border: 'none', background: 'none', outline: 'none',
                flex: 1, fontSize: 12, color: 'var(--c-text)',
              }} />
              <Button variant="outline" size="sm" onClick={copyUrl}>복사</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowQR((v) => !v)}>
                {showQR ? 'QR닫기' : '📱QR'}
              </Button>
            </div>

            {showQR && (
              <div className="share-qr-box">
                <QRImage url={shareUrl} size={160} />
                <p style={{ fontSize: 12, color: 'var(--c-muted)' }}>모바일로 스캔하여 접속하세요</p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}&margin=10`}
                  download="boarda-qr.png" target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  ⬇️ QR 이미지 저장
                </a>
              </div>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="settings-section">
            <div className="settings-section-title">접속 비밀번호 (선택)</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input className="form-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 없음 (공개)"
                  style={{ paddingRight: 36 }}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 15 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <Button variant="secondary" size="sm" onClick={() => setPassword('')}>초기화</Button>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 6 }}>
              {password ? '🔒 비밀번호를 알아야 접근 가능합니다' : '🔓 비밀번호 없이 접근 가능합니다'}
            </p>
          </div>

          {/* 편집 공유 */}
          <div className="settings-section" style={{ paddingBottom: 0 }}>
            <div className="settings-section-title">편집 공유</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>✏️ 편집 허용</div>
                <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                  공유 접속자도 실명 입력 후 게시물 작성 가능<br/>
                  본인이 작성한 글만 수정·삭제 가능
                </div>
              </div>
              <button className={`toggle ${editShare ? 'on' : ''}`}
                onClick={() => setEditShare((v) => !v)} />
            </div>
            {editShare && (
              <div style={{ background: 'var(--c-primary-light)', borderRadius: 'var(--r-sm)',
                padding: '10px 14px', fontSize: 12, color: 'var(--c-primary)', lineHeight: 1.6 }}>
                💡 편집 공유 활성 시 접속자가 실명을 입력한 뒤 글을 작성할 수 있으며,
                자신이 작성한 글만 수정·삭제할 수 있습니다.
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
