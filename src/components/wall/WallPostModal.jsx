/**
 * components/wall/WallPostModal.jsx
 * 담벼락 메모 추가/수정 모달
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import FileAttachment from '../common/FileAttachment'
import useBoardStore from '../../store/useBoardStore'

/* 포스트잇 색상 팔레트 */
const COLORS = [
  { hex: '#FFF9C4', label: '노랑' },
  { hex: '#F8BBD9', label: '핑크' },
  { hex: '#C8E6C9', label: '초록' },
  { hex: '#BBDEFB', label: '파랑' },
  { hex: '#E1BEE7', label: '보라' },
  { hex: '#FFE0B2', label: '주황' },
  { hex: '#F5F5F5', label: '흰색' },
  { hex: '#CFD8DC', label: '회색' },
]

export default function WallPostModal({ isOpen, onClose, boardId, post = null }) {
  const addWallPost    = useBoardStore((s) => s.addWallPost)
  const updateWallPost = useBoardStore((s) => s.updateWallPost)
  const author         = useBoardStore((s) => s.author)

  const isEdit = !!post

  const [content,     setContent]     = useState('')
  const [color,       setColor]       = useState(COLORS[0].hex)
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    if (post) {
      setContent(post.content ?? '')
      setColor(post.color ?? COLORS[0].hex)
      setAttachments(post.attachments ?? [])
    } else {
      /* 새 메모: 랜덤 색상 */
      setContent('')
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)].hex)
      setAttachments([])
    }
  }, [post, isOpen])

  const handleSave = async () => {
    const trimmed = content.trim()
    if (!trimmed && attachments.length === 0) return

    if (isEdit) {
      await updateWallPost(boardId, post.id, { content: trimmed, color, attachments })
    } else {
      await addWallPost(boardId, { content: trimmed, color, attachments })
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '✏️ 메모 수정' : '📝 새 메모'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? '저장' : '붙이기'}
          </Button>
        </>
      }
    >
      {/* 작성자 */}
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--c-muted)' }}>
        ✍️ 작성자: <strong style={{ color: 'var(--c-text)' }}>{author}</strong>
      </div>

      {/* 색상 선택 */}
      <div className="form-group">
        <label className="form-label">메모 색상</label>
        <div className="wall-color-palette">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              className={`wall-color-dot ${color === c.hex ? 'selected' : ''}`}
              style={{ background: c.hex, border: `2.5px solid ${color === c.hex ? '#333' : 'rgba(0,0,0,.15)'}` }}
              title={c.label}
              onClick={() => setColor(c.hex)}
            />
          ))}
        </div>
      </div>

      {/* 미리보기 + 텍스트 입력 */}
      <div className="form-group">
        <label className="form-label">내용</label>
        <div style={{
          background: color, borderRadius: '4px 14px 14px 4px',
          boxShadow: '3px 4px 12px rgba(0,0,0,.12)',
          overflow: 'hidden',
        }}>
          {/* 탭 */}
          <div style={{
            height: 24, background: color,
            filter: 'brightness(.88)',
            display: 'flex', alignItems: 'center',
            padding: '0 10px', fontSize: 10,
            color: 'rgba(0,0,0,.5)', fontWeight: 700,
          }}>
            ✍️ {author}
          </div>
          <textarea
            className="wall-card-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모 내용을 입력하세요..."
            autoFocus
            style={{ width: '100%', minHeight: 120 }}
          />
        </div>
      </div>

      {/* 첨부파일 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">첨부파일</label>
        <FileAttachment attachments={attachments} onChange={setAttachments} isOwner={true} />
      </div>
    </Modal>
  )
}
