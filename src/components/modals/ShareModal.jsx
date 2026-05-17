/**
 * components/modals/ShareModal.jsx
 */
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import useBoardStore from '../../store/useBoardStore';

export default function ShareModal({ isOpen, onClose, boardId }) {
  const showToast = useBoardStore((s) => s.showToast);
  const [viewEnabled, setViewEnabled] = useState(true);
  const shareUrl = `https://boarda.app/b/${boardId}`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    showToast('링크가 복사되었습니다! 📋', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔗 보드 공유"
      footer={<Button variant="primary" onClick={onClose}>완료</Button>}
    >
      {/* URL 박스 */}
      <div className="form-group">
        <label className="form-label">공유 링크</label>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'var(--c-bg)', border: '1.5px solid var(--c-border)',
          borderRadius: 'var(--r-sm)', padding: '10px 14px',
        }}>
          <span style={{ color: 'var(--c-accent)' }}>🔗</span>
          <input
            readOnly
            value={shareUrl}
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13, color: 'var(--c-text)' }}
          />
          <Button variant="outline" size="sm" onClick={copyUrl}>복사</Button>
        </div>
      </div>

      {/* 권한 설정 */}
      <div>
        {/* 보기 권한 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--c-border)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
              👁️ 보기 권한
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
              링크를 가진 누구나 이 보드를 볼 수 있습니다
            </div>
          </div>
          <button
            className={`toggle ${viewEnabled ? 'on' : ''}`}
            onClick={() => setViewEnabled((v) => !v)}
            aria-label="보기 권한 토글"
          />
        </div>

        {/* 편집 권한 (비활성) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', opacity: .5 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
              ✏️ 편집 권한
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
              다른 사람도 이 보드를 편집할 수 있습니다 (곧 출시)
            </div>
          </div>
          <button className="toggle" disabled aria-label="편집 권한 — 준비중" />
        </div>
      </div>
    </Modal>
  );
}
