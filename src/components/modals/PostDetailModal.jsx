/**
 * components/modals/PostDetailModal.jsx
 * 게시물 상세 보기 + 수정 모달 (컬럼 보드)
 */
import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import FileAttachment from '../common/FileAttachment'
import useBoardStore from '../../store/useBoardStore'
import { tagBadgeClass, relativeDate, parseTags } from '../../utils/helpers'

export default function PostDetailModal({ isOpen, onClose, boardId, colId, post }) {
  const updatePost = useBoardStore((s) => s.updatePost)
  const deletePost = useBoardStore((s) => s.deletePost)
  const author     = useBoardStore((s) => s.author)

  const [editing,     setEditing]     = useState(false)
  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [tags,        setTags]        = useState('')
  const [attachments, setAttachments] = useState([])

  const isOwner = !post?.author || post.author === author || post.author === '익명'

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? '')
      setContent(post.content ?? '')
      setTags((post.tags ?? []).join(', '))
      setAttachments(post.attachments ?? [])
      setEditing(false)
    }
  }, [post])

  if (!post) return null

  const handleSave = async () => {
    if (!title.trim()) return
    await updatePost(boardId, colId, post.id, {
      title: title.trim(),
      content,
      tags: parseTags(tags),
      attachments,
    })
    setEditing(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return
    await deletePost(boardId, colId, post.id)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setEditing(false); onClose() }}
      title={editing ? '✏️ 게시물 수정' : '📝 게시물 상세'}
      size="lg"
      footer={
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          {isOwner && !editing && (
            <>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ 삭제</button>
              <button className="btn btn-outline btn-sm" style={{ marginLeft:'auto' }}
                onClick={() => setEditing(true)}>✏️ 수정</button>
            </>
          )}
          {editing && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>취소</button>
              <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }}
                onClick={handleSave}>저장</button>
            </>
          )}
          {!editing && !isOwner && (
            <button className="btn btn-secondary btn-sm" style={{ marginLeft:'auto' }}
              onClick={onClose}>닫기</button>
          )}
        </div>
      }
    >
      {editing ? (
        /* ── 수정 폼 ── */
        <div>
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input className="form-input" value={title}
              onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea className="form-textarea" value={content}
              onChange={(e) => setContent(e.target.value)} style={{ minHeight:120 }} />
          </div>
          <div className="form-group">
            <label className="form-label">태그 (쉼표로 구분)</label>
            <input className="form-input" value={tags}
              onChange={(e) => setTags(e.target.value)} placeholder="예: 아이디어, 중요" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">첨부파일</label>
            <FileAttachment attachments={attachments} onChange={setAttachments} isOwner={true} />
          </div>
        </div>
      ) : (
        /* ── 상세 보기 ── */
        <div>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:900,
            marginBottom:12, color:'var(--c-text)' }}>{post.title}</h2>

          <div style={{ display:'flex', gap:12, marginBottom:16, fontSize:12, color:'var(--c-muted)' }}>
            <span>👤 {post.author || '익명'}</span>
            <span>🕐 {relativeDate(post.created_at || post.createdAt)}</span>
          </div>

          {post.content && (
            <div style={{ fontSize:14, lineHeight:1.8, color:'var(--c-text-secondary)',
              marginBottom:16, whiteSpace:'pre-wrap' }}>
              {post.content}
            </div>
          )}

          {(post.tags ?? []).length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
              {post.tags.map((t, i) => (
                <span key={t} className={`badge ${tagBadgeClass(i)}`}>{t}</span>
              ))}
            </div>
          )}

          {(post.attachments ?? []).length > 0 && (
            <div>
              <div className="form-label" style={{ marginBottom:8 }}>📎 첨부파일</div>
              <FileAttachment
                attachments={post.attachments}
                isOwner={false}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
