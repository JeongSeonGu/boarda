/**
 * components/common/ToastContainer.jsx
 * 전역 토스트 알림 렌더러
 */
import React from 'react';
import useBoardStore from '../../store/useBoardStore';

const ICONS = {
  success: '✅',
  error: '❌',
  info: '💡',
  warning: '⚠️',
};

export default function ToastContainer() {
  const toasts = useBoardStore((s) => s.toasts);
  const removeToast = useBoardStore((s) => s.removeToast);

  return (
    <div className="toast-container" role="region" aria-label="알림">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role="alert"
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
