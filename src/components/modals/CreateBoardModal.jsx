/**
 * components/modals/CreateBoardModal.jsx
 * 수정: defaultFolderId 지원 — 폴더 내에서 보드 생성 시 자동 배정
 */
import React, { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useBoardStore from '../../store/useBoardStore'

const COLORS = ['#6C63FF','#FF6584','#43C59E','#FFD166','#118AB2','#EF476F','#06D6A0','#F77F00']

const BOARD_TYPES = [
  { value:'columns', icon:'📋', name:'컬럼 보드',  desc:'섹션별로 정보를 정리하는 칸반 스타일' },
  { value:'links',   icon:'🔗', name:'링크 보드',  desc:'사이트와 링크를 태그로 체계적으로 관리' },
  { value:'wall',    icon:'📝', name:'담벼락',      desc:'자유롭게 포스트잇 메모를 붙이는 보드' },
]

export default function CreateBoardModal({
  isOpen, onClose, defaultType = 'columns', defaultFolderId = null, onCreated,
}) {
  const createBoard = useBoardStore((s) => s.createBoard)
  const folders     = useBoardStore((s) => s.folders)

  const [type,     setType]     = useState(defaultType)
  const [name,     setName]     = useState('')
  const [desc,     setDesc]     = useState('')
  const [color,    setColor]    = useState(COLORS[0])
  const [folderId, setFolderId] = useState(defaultFolderId)
  const [error,    setError]    = useState('')

  React.useEffect(() => {
    if (isOpen) { setType(defaultType); setFolderId(defaultFolderId) }
  }, [defaultType, defaultFolderId, isOpen])

  const reset = () => { setName(''); setDesc(''); setColor(COLORS[0]); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('보드 이름을 입력해주세요'); return }
    const id = await createBoard({ type, name: name.trim(), desc, color, folderId })
    reset(); onClose()
    onCreated?.(id)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="✨ 새 보드 만들기"
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
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {BOARD_TYPES.map((t) => (
            <div key={t.value} onClick={() => setType(t.value)}
              style={{
                border:`2px solid ${type === t.value ? 'var(--c-primary)' : 'var(--c-border)'}`,
                background: type === t.value ? 'var(--c-primary-light)' : 'var(--c-surface)',
                borderRadius:'var(--r-md)', padding:'12px 8px',
                cursor:'pointer', textAlign:'center',
                transition:'all var(--transition)',
              }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--c-text)', marginBottom:4 }}>{t.name}</div>
              <div style={{ fontSize:10, color:'var(--c-muted)', lineHeight:1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 보드 이름 */}
      <div className="form-group">
        <label className="form-label" htmlFor="board-name">보드 이름 *</label>
        <input id="board-name" className="form-input" value={name} autoFocus
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="예: 우리팀 아이디어 담벼락"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        {error && <p style={{ fontSize:12, color:'var(--c-danger)', marginTop:4 }}>{error}</p>}
      </div>

      {/* 설명 */}
      <div className="form-group">
        <label className="form-label" htmlFor="board-desc">설명 (선택)</label>
        <textarea id="board-desc" className="form-textarea" value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="이 보드에 대한 간단한 설명..."
          style={{ minHeight:56 }} />
      </div>

      {/* 폴더 선택 */}
      {folders.length > 0 && (
        <div className="form-group">
          <label className="form-label">폴더에 추가 (선택)</label>
          <select className="form-input"
            value={folderId ?? ''}
            onChange={(e) => setFolderId(e.target.value || null)}>
            <option value="">📋 폴더 없음</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 색상 */}
      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="form-label">테마 색상</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={`색상 ${c}`}
              style={{
                width:28, height:28, borderRadius:'50%', background:c,
                border:`3px solid ${color === c ? 'var(--c-text)' : 'transparent'}`,
                cursor:'pointer',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
                transition:'all var(--transition)',
              }} />
          ))}
        </div>
      </div>
    </Modal>
  )
}
