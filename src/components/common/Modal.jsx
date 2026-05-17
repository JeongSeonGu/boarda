/**
 * components/common/Modal.jsx
 * 재사용 모달 래퍼
 */
import React, { useEffect, useCallback } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // 'md' | 'lg'
}) {
  /* ESC 키 닫기 */
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose?.(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <span className="modal-title" id="modal-title">{title}</span>
          <button
            className="btn-icon sm"
            onClick={onClose}
            aria-label="닫기"
            style={{ border: 'none', background: 'var(--c-bg)' }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
