/**
 * components/common/EmptyState.jsx
 */
import React from 'react';
import Button from './Button';

export default function EmptyState({ icon = '📭', title, desc, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      {title && <h3>{title}</h3>}
      {desc && <p>{desc}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
