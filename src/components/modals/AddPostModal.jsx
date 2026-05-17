/**
 * components/modals/AddPostModal.jsx — 수정: 파일첨부, 작성자 표시 추가
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import FileAttachment from '../common/FileAttachment'
import useBoardStore from '../../store/useBoardStore'
import { parseTags } from '../../utils/helpers'

export default function AddPostModal({ isOpen, onClose, boardId, colId }) {
  const addPost = useBoardStore((s) => s.addPost)
  const boards  = useBoardStore((s) => s.boards)
  const author  = useBoardStore((s) => s.author)

  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [tags,        setTags]        = useState('')
  const [colSel,      setColSel]      = useState(colId ?? '')
  const [attachments, setAttachments] = useState([])
  const [error,       setError]       = useState('')

  const board   = boards.find((b) => b.id === boardId)
  const columns = board?.columns ?? []

  useEffect(() => { setColSel(colId ?? columns[0]?.id ?? '') }, [colId, isOpen])

  const reset = () => {
    setTitle(''); setContent(''); setTags('')
    setAttachments([]); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요'); return }
    if (!colSel)       { setError('컬럼을 선택해주세요'); return }
    await addPost(boardId, colSel, {
      title: title.trim(), content,
      tags: parseTags(tags), attachments,
    })
    reset(); onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📝 새 게시물"
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

      {columns.length > 1 && (
        <div className="form-group">
          <label className="form-label">컬럼</label>
          <select className="form-select" value={colSel}
            onChange={(e) => setColSel(e.target.value)}>
            {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">제목 *</label>
        <input className="form-input" value={title} autoFocus
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          placeholder="게시물 제목" />
      </div>

      <div className="form-group">
        <label className="form-label">내용</label>
        <textarea className="form-textarea" value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요..." style={{ minHeight:100 }} />
      </div>

      <div className="form-group">
        <label className="form-label">태그 (쉼표로 구분)</label>
        <input className="form-input" value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 아이디어, 중요, 참고" />
      </div>

      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="form-label">첨부파일</label>
        <FileAttachment attachments={attachments} onChange={setAttachments} isOwner={true} />
      </div>

      {error && <p style={{ fontSize:12, color:'var(--c-danger)', marginTop:8 }}>{error}</p>}
    </Modal>
  )
}
