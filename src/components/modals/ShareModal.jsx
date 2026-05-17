/**
 * components/modals/ShareModal.jsx
 * 수정: 실제 배포 URL 기반 공유 링크 생성
 */
import React, { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useBoardStore from '../../store/useBoardStore'

export default function ShareModal({ isOpen, onClose, boardId }) {
  const showToast = useBoardStore((s) => s.showToast)
  const [viewEnabled, setViewEnabled] = useState(true)

  // 현재 실제 호스트 기반으로 공유 URL 생성
  const shareUrl = boardId
    ? `${window.location.origin}/share/${boardId}`
    : ''

  const copyUrl = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    showToast('링크가 복사되었습니다! 📋', 'success')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔗 보드 공유"
      footer={<Button variant="primary" onClick={onClose}>완료</Button>}
    >
      <div className="form-group">
        <label className="form-label">공유 링크 (읽기 전용)</label>
        <div style={{
          display:'flex', gap:8, alignItems:'center',
          background:'var(--c-bg)', border:'1.5px solid var(--c-border)',
          borderRadius:'var(--r-sm)', padding:'10px 14px',
        }}>
          <span style={{ color:'var(--c-accent)', flexShrink:0 }}>🔗</span>
          <input readOnly value={shareUrl}
            style={{ border:'none', background:'none', outline:'none', flex:1, fontSize:12, color:'var(--c-text)' }} />
          <Button variant="outline" size="sm" onClick={copyUrl}>복사</Button>
        </div>
        <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:6 }}>
          이 링크로 접근하는 사람은 보기와 파일 다운로드만 가능합니다.
        </p>
      </div>

      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--c-border)' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>👁️ 보기 권한</div>
            <div style={{ fontSize:12, color:'var(--c-muted)' }}>링크를 가진 누구나 이 보드를 볼 수 있습니다</div>
          </div>
          <button className={`toggle ${viewEnabled ? 'on' : ''}`}
            onClick={() => setViewEnabled((v) => !v)} aria-label="보기 권한 토글" />
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', opacity:.5 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>✏️ 편집 권한</div>
            <div style={{ fontSize:12, color:'var(--c-muted)' }}>다른 사람도 편집 가능 (곧 출시)</div>
          </div>
          <button className="toggle" disabled aria-label="준비중" />
        </div>
      </div>
    </Modal>
  )
}
