/**
 * components/common/SharedEditNameGate.jsx
 * 편집 공유 모드에서 실명 입력을 요청하는 오버레이
 */
import React, { useState } from 'react'
import '../../styles/boardSettings.css'

export default function SharedEditNameGate({ onConfirm }) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <div className="edit-share-name-overlay">
      <div className="edit-share-name-card">
        <div style={{ fontSize: 44, marginBottom: 12 }}>✍️</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 900,
          marginBottom: 8, color: 'var(--c-text)' }}>
          이름을 입력해주세요
        </h2>
        <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          작성한 글에 이름이 표시되며<br />
          본인이 작성한 글만 수정·삭제할 수 있습니다
        </p>
        <input
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="실명 또는 닉네임"
          autoFocus
          style={{ marginBottom: 12, textAlign: 'center' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          편집 시작
        </button>
      </div>
    </div>
  )
}
