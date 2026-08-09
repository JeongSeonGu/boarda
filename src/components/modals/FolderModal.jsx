/**
 * components/modals/FolderModal.jsx
 * 폴더 생성 / 수정 모달
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useBoardStore from '../../store/useBoardStore'
import '../../styles/folder.css'

const FOLDER_COLORS = [
  '#6C63FF','#FF6584','#43BCCD','#F9A826',
  '#4CAF50','#E91E63','#2196F3','#FF5722',
  '#9C27B0','#00BCD4','#8BC34A','#607D8B',
]

const FOLDER_ICONS = [
  '📁','📂','🗂️','📚','📖','📝','💡','🎯',
  '🚀','🎨','💻','🔬','📊','🏫','🌟','🎓',
]

export default function FolderModal({ isOpen, onClose, folder = null }) {
  const createFolder = useBoardStore((s) => s.createFolder)
  const updateFolder = useBoardStore((s) => s.updateFolder)

  const [name,  setName]  = useState('')
  const [desc,  setDesc]  = useState('')
  const [color, setColor] = useState('#6C63FF')
  const [icon,  setIcon]  = useState('📁')

  const isEdit = !!folder

  useEffect(() => {
    if (isOpen) {
      if (folder) {
        setName(folder.name ?? '')
        setDesc(folder.description ?? folder.desc ?? '')
        setColor(folder.color ?? '#6C63FF')
        setIcon(folder.icon ?? '📁')
      } else {
        setName(''); setDesc(''); setColor('#6C63FF'); setIcon('📁')
      }
    }
  }, [isOpen, folder])

  const handleSave = async () => {
    if (!name.trim()) return
    if (isEdit) {
      await updateFolder(folder.id, { name: name.trim(), description: desc, color, icon })
    } else {
      await createFolder({ name: name.trim(), desc, color, icon })
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '✏️ 폴더 수정' : '📁 새 폴더 만들기'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
            {isEdit ? '수정' : '만들기'}
          </Button>
        </>
      }
    >
      {/* 미리보기 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', marginBottom: 20,
        background: 'var(--c-bg)', borderRadius: 'var(--r-md)',
        border: `2px solid ${color}22`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--r-md)',
          background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, border: `2px solid ${color}44`,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 16,
            color: 'var(--c-text)', marginBottom: 2 }}>
            {name || '폴더 이름'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
            {desc || '폴더 설명'}
          </div>
        </div>
      </div>

      {/* 이름 */}
      <div className="form-group">
        <label className="form-label">폴더 이름 *</label>
        <input className="form-input" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 2학기 수업자료"
          autoFocus maxLength={40} />
      </div>

      {/* 설명 */}
      <div className="form-group">
        <label className="form-label">설명 (선택)</label>
        <input className="form-input" value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="폴더에 대한 간단한 설명"
          maxLength={100} />
      </div>

      {/* 아이콘 선택 */}
      <div className="form-group">
        <label className="form-label">아이콘</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FOLDER_ICONS.map((ic) => (
            <button key={ic} type="button"
              onClick={() => setIcon(ic)}
              style={{
                width: 40, height: 40, fontSize: 20,
                borderRadius: 'var(--r-sm)',
                border: `2px solid ${icon === ic ? color : 'var(--c-border)'}`,
                background: icon === ic ? color + '22' : 'var(--c-bg)',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* 색상 선택 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">색상</label>
        <div className="folder-color-palette">
          {FOLDER_COLORS.map((c) => (
            <div key={c}
              className={`folder-color-swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}
