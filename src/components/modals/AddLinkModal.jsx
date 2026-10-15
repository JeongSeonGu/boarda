/**
 * components/modals/AddLinkModal.jsx — 수정: 파일첨부, 작성자 표시 추가
 */
import React, { useState } from 'react'
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

export default function AddLinkModal({ isOpen, onClose, boardId, onSuccess }) {
  const addLink = useBoardStore((s) => s.addLink)
  const author  = useBoardStore((s) => s.author)

  const [url,         setUrl]         = useState('')
  const [title,       setTitle]       = useState('')
  const [desc,        setDesc]        = useState('')
  const [category,    setCategory]    = useState('개발')
  const [importance,  setImportance]  = useState('보통')
  const [tags,        setTags]        = useState('')
  const [attachments, setAttachments] = useState([])
  const [error,       setError]       = useState('')

  const reset = () => {
    setUrl(''); setTitle(''); setDesc('')
    setCategory('개발'); setImportance('보통')
    setTags(''); setAttachments([]); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (!url.trim())   { setError('URL을 입력해주세요'); return }
    if (!title.trim()) { setError('사이트 이름을 입력해주세요'); return }
    await addLink(boardId, {
      url: url.trim(), title: title.trim(), desc,
      category, importance,
      tags: parseTags(tags),
      attachments,
    })
    reset(); onClose(); onSuccess?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🔗 링크 추가" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button variant="primary" onClick={handleSubmit}>저장</Button>
        </>
      }
    >
      {/* 작성자 표시 */}
      <div style={{ marginBottom:14, fontSize:13, color:'var(--c-muted)' }}>
        ✍️ 작성자: <strong style={{ color:'var(--c-text)' }}>{author}</strong>
      </div>

      <div className="form-group">
        <label className="form-label">URL *</label>
        <input className="form-input" value={url} type="url" autoFocus
          onChange={(e) => { setUrl(e.target.value); setError('') }}
          placeholder="https://example.com" />
      </div>
      <div className="form-group">
        <label className="form-label">사이트 이름 *</label>
        <input className="form-input" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          placeholder="예: MDN Web Docs" />
      </div>
      <div className="form-group">
        <label className="form-label">설명</label>
        <textarea className="form-textarea" value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="이 사이트에 대한 간단한 설명..." style={{ minHeight:70 }} />
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
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: React, 튜토리얼, 무료" />
      </div>
      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="form-label">첨부파일</label>
        <FileAttachment attachments={attachments} onChange={setAttachments} isOwner={true} />
      </div>
      {error && <p style={{ fontSize:12, color:'var(--c-danger)', marginTop:8 }}>{error}</p>}
    </Modal>
  )
}
