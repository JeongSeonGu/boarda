/**
 * components/modals/EditLinkModal.jsx
 * 링크 수정 모달 (링크 보드)
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import FileAttachment from '../common/FileAttachment'
import useBoardStore from '../../store/useBoardStore'
import { parseTags } from '../../utils/helpers'

const CATEGORIES  = ['개발','디자인','비즈니스','학습','도구','뉴스','기타']
const IMPORTANCES = [
  { value:'보통',   label:'보통' },
  { value:'중요',   label:'⭐ 중요' },
  { value:'매우중요', label:'🔥 매우 중요' },
  { value:'나중에', label:'🔖 나중에' },
]

export default function EditLinkModal({ isOpen, onClose, boardId, link }) {
  const updateLink = useBoardStore((s) => s.updateLink)
  const deleteLink = useBoardStore((s) => s.deleteLink)

  const [url,         setUrl]         = useState('')
  const [title,       setTitle]       = useState('')
  const [desc,        setDesc]        = useState('')
  const [category,    setCategory]    = useState('기타')
  const [importance,  setImportance]  = useState('보통')
  const [tags,        setTags]        = useState('')
  const [attachments, setAttachments] = useState([])
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (link) {
      setUrl(link.url ?? '')
      setTitle(link.title ?? '')
      setDesc(link.desc ?? link.description ?? '')
      setCategory(link.category ?? '기타')
      setImportance(link.importance ?? '보통')
      setTags((link.tags ?? []).join(', '))
      setAttachments(link.attachments ?? [])
      setError('')
    }
  }, [link])

  if (!link) return null

  const handleSave = async () => {
    if (!url.trim())   { setError('URL을 입력해주세요'); return }
    if (!title.trim()) { setError('이름을 입력해주세요'); return }
    await updateLink(boardId, link.id, {
      url: url.trim(), title: title.trim(),
      description: desc, category, importance,
      tags: parseTags(tags),
      attachments,
    })
    onClose()
  }

  const handleDelete = async () => {
    if (!window.confirm('이 링크를 삭제하시겠습니까?')) return
    await deleteLink(boardId, link.id)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ 링크 수정"
      size="lg"
      footer={
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ 삭제</button>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          </div>
        </div>
      }
    >
      <div className="form-group">
        <label className="form-label">URL *</label>
        <input className="form-input" value={url} type="url"
          onChange={(e) => { setUrl(e.target.value); setError('') }}
          placeholder="https://example.com" />
      </div>
      <div className="form-group">
        <label className="form-label">사이트 이름 *</label>
        <input className="form-input" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }} />
      </div>
      <div className="form-group">
        <label className="form-label">설명</label>
        <textarea className="form-textarea" value={desc}
          onChange={(e) => setDesc(e.target.value)} style={{ minHeight:70 }} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">분류</label>
          <select className="form-select" value={category}
            onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">중요도</label>
          <select className="form-select" value={importance}
            onChange={(e) => setImportance(e.target.value)}>
            {IMPORTANCES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">태그 (쉼표로 구분)</label>
        <input className="form-input" value={tags}
          onChange={(e) => setTags(e.target.value)} placeholder="예: React, 튜토리얼" />
      </div>
      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="form-label">첨부파일</label>
        <FileAttachment attachments={attachments} onChange={setAttachments} isOwner={true} />
      </div>
      {error && <p style={{ fontSize:12, color:'var(--c-danger)', marginTop:8 }}>{error}</p>}
    </Modal>
  )
}
