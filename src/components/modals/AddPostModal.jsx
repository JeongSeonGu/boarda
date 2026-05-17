/**
 * components/modals/AddPostModal.jsx
 */
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import useBoardStore from '../../store/useBoardStore';
import { parseTags } from '../../utils/helpers';

export default function AddPostModal({ isOpen, onClose, boardId, colId }) {
  const addPost = useBoardStore((s) => s.addPost);
  const boards  = useBoardStore((s) => s.boards);

  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [tags,    setTags]    = useState('');
  const [colSel,  setColSel]  = useState(colId ?? '');
  const [error,   setError]   = useState('');

  const board   = boards.find((b) => b.id === boardId);
  const columns = board?.columns ?? [];

  useEffect(() => { setColSel(colId ?? columns[0]?.id ?? ''); }, [colId, isOpen]);

  const reset = () => { setTitle(''); setContent(''); setTags(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!title.trim()) { setError('제목을 입력해주세요'); return; }
    if (!colSel)       { setError('컬럼을 선택해주세요'); return; }
    addPost(boardId, colSel, { title: title.trim(), content, tags: parseTags(tags) });
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📝 새 게시물"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button variant="primary" onClick={handleSubmit}>저장</Button>
        </>
      }
    >
      {/* 컬럼 선택 */}
      {columns.length > 1 && (
        <div className="form-group">
          <label className="form-label" htmlFor="post-col">컬럼</label>
          <select
            id="post-col"
            className="form-select"
            value={colSel}
            onChange={(e) => setColSel(e.target.value)}
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 제목 */}
      <div className="form-group">
        <label className="form-label" htmlFor="post-title">제목 *</label>
        <input
          id="post-title"
          className="form-input"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          placeholder="게시물 제목"
          autoFocus
        />
      </div>

      {/* 내용 */}
      <div className="form-group">
        <label className="form-label" htmlFor="post-content">내용</label>
        <textarea
          id="post-content"
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요..."
          style={{ minHeight: 100 }}
        />
      </div>

      {/* 태그 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="post-tags">태그 (쉼표로 구분)</label>
        <input
          id="post-tags"
          className="form-input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 아이디어, 중요, 참고"
        />
      </div>

      {error && <p style={{ fontSize: 12, color: 'var(--c-danger)', marginTop: 8 }}>{error}</p>}
    </Modal>
  );
}
