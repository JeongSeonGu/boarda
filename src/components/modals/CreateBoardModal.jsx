/**
 * components/modals/CreateBoardModal.jsx
 * 새 보드 생성 모달
 */
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import useBoardStore from '../../store/useBoardStore';

const COLORS = [
  '#6C63FF', '#FF6584', '#43C59E', '#FFD166',
  '#118AB2', '#EF476F', '#06D6A0', '#F77F00',
];

const BOARD_TYPES = [
  {
    value: 'columns',
    icon: '📋',
    name: '컬럼 보드',
    desc: '섹션별로 정보를 정리하는 칸반 스타일',
  },
  {
    value: 'links',
    icon: '🔗',
    name: '링크 보드',
    desc: '사이트와 링크를 태그로 체계적으로 관리',
  },
];

export default function CreateBoardModal({ isOpen, onClose, defaultType = 'columns', onCreated }) {
  const createBoard = useBoardStore((s) => s.createBoard);

  const [type,  setType]  = useState(defaultType);
  const [name,  setName]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  const reset = () => {
    setName(''); setDesc(''); setColor(COLORS[0]);
    setType(defaultType); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!name.trim()) { setError('보드 이름을 입력해주세요'); return; }
    const id = createBoard({ type, name: name.trim(), desc, color });
    reset();
    onClose();
    onCreated?.(id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="✨ 새 보드 만들기"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button variant="primary" onClick={handleSubmit}>보드 생성</Button>
        </>
      }
    >
      {/* 보드 종류 */}
      <div className="form-group">
        <label className="form-label">보드 종류</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {BOARD_TYPES.map((t) => (
            <div
              key={t.value}
              onClick={() => setType(t.value)}
              style={{
                border: `2px solid ${type === t.value ? 'var(--c-primary)' : 'var(--c-border)'}`,
                background: type === t.value ? 'var(--c-primary-light)' : 'var(--c-surface)',
                borderRadius: 'var(--r-md)',
                padding: '14px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition)',
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 이름 */}
      <div className="form-group">
        <label className="form-label" htmlFor="board-name">보드 이름 *</label>
        <input
          id="board-name"
          className="form-input"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="예: 프로젝트 아이디어, 참고 사이트..."
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p style={{ fontSize: 12, color: 'var(--c-danger)', marginTop: 4 }}>{error}</p>}
      </div>

      {/* 설명 */}
      <div className="form-group">
        <label className="form-label" htmlFor="board-desc">설명 (선택)</label>
        <textarea
          id="board-desc"
          className="form-textarea"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="이 보드에 대한 간단한 설명..."
          style={{ minHeight: 60 }}
        />
      </div>

      {/* 색상 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">테마 색상</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`색상 ${c}`}
              style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: c,
                border: `3px solid ${color === c ? 'var(--c-text)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'transform var(--transition)',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
