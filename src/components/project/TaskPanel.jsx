/**
 * components/project/TaskPanel.jsx
 * 업무 작성/수정 슬라이드 패널
 */
import React, { useState, useRef, useEffect } from 'react'
import useBoardStore from '../../store/useBoardStore'

const PRIORITY_OPTIONS = ['', '높음', '보통', '낮음']

function StatusPopup({ statuses, current, onSelect, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="status-popup" style={{ position:'absolute', top:'100%', left:0, marginTop:4, zIndex:600 }}>
      {statuses.map(s => (
        <div key={s.id} className="status-popup-item"
          style={{ fontWeight: current === s.label ? 700 : 400 }}
          onClick={() => { onSelect(s.label); onClose() }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, display:'inline-block', flexShrink:0 }} />
          {s.label}
        </div>
      ))}
    </div>
  )
}

export default function TaskPanel({ board, task, statuses, badges, onClose }) {
  const isNew = !task.id
  const author = useBoardStore(s => s.author)
  const createTask = useBoardStore(s => s.createTask)
  const updateTask = useBoardStore(s => s.updateTask)
  const deleteTask = useBoardStore(s => s.deleteTask)

  const [title,     setTitle]     = useState(task.title || '')
  const [status,    setStatus]    = useState(task.status || statuses[0]?.label || '요청')
  const [assignee,  setAssignee]  = useState(task.assignee || '')
  const [startDate, setStartDate] = useState(task.start_date || '')
  const [dueDate,   setDueDate]   = useState(task.due_date || '')
  const [priority,  setPriority]  = useState(task.priority || '')
  const [progress,  setProgress]  = useState(task.progress ?? 0)
  const [content,   setContent]   = useState(task.content || '')
  const [badge,     setBadge]     = useState(task.badge || '')
  const [showExtra, setShowExtra] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const statusRef = useRef(null)
  const titleRef  = useRef(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  const currentStatus = statuses.find(s => s.label === status) || statuses[0]

  const handleSave = async () => {
    if (!title.trim()) { titleRef.current?.focus(); return }
    setSaving(true)
    const data = {
      board_id: board.id,
      title: title.trim(),
      status, assignee, priority,
      start_date: startDate || null,
      due_date: dueDate || null,
      progress: Number(progress),
      content, badge, author,
    }
    try {
      if (isNew) {
        await createTask(data)
      } else {
        await updateTask(task.id, data)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    setSaving(true)
    try {
      await deleteTask(task.id, board.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="task-panel-overlay" onClick={e => e.target === e.currentTarget && onClose()} onKeyDown={handleKeyDown}>
      <div className="task-panel">
        {/* 헤더 */}
        <div className="task-panel-header">
          <div className="task-panel-header-left">
            업무 작성
            {board.name && (
              <>
                <span>│</span>
                <strong>{board.name}</strong>
              </>
            )}
          </div>
          <button className="task-panel-close" onClick={onClose}>✕</button>
        </div>

        {/* 제목 */}
        <input
          ref={titleRef}
          className="task-panel-title-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />

        {/* 필드 영역 */}
        <div className="task-panel-body">
          {/* 상태 */}
          <div className="task-field-row">
            <span className="task-field-label">상태</span>
            <div className="task-field-value" style={{ position:'relative' }} ref={statusRef}>
              <button className="status-dropdown-btn"
                style={{
                  background: currentStatus?.color + '18',
                  borderColor: currentStatus?.color,
                  color: currentStatus?.color,
                }}
                onClick={() => setStatusOpen(p => !p)}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:currentStatus?.color, display:'inline-block' }} />
                {status}
                <span style={{ fontSize:10, opacity:0.7 }}>▾</span>
              </button>
              {statusOpen && (
                <StatusPopup statuses={statuses} current={status}
                  onSelect={setStatus} onClose={() => setStatusOpen(false)} />
              )}
            </div>
          </div>

          {/* 담당자 */}
          <div className="task-field-row">
            <span className="task-field-label">담당자</span>
            <input className="task-panel-input" placeholder="담당자 추가"
              value={assignee} onChange={e => setAssignee(e.target.value)} />
          </div>

          {/* 시작일 */}
          <div className="task-field-row">
            <span className="task-field-label">시작일</span>
            <input className="task-panel-input" type="date"
              value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          {/* 마감일 */}
          <div className="task-field-row">
            <span className="task-field-label">마감일</span>
            <input className="task-panel-input" type="date"
              value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* 추가 항목 펼치기 */}
          <button className="task-extra-toggle" onClick={() => setShowExtra(p => !p)}>
            {showExtra ? '▲ 추가 항목 접기' : '＋ 추가 항목 보기'}
          </button>

          {showExtra && (
            <>
              {/* 뱃지 */}
              <div className="task-field-row">
                <span className="task-field-label">뱃지</span>
                <select className="task-panel-input" value={badge}
                  onChange={e => setBadge(e.target.value)}>
                  <option value="">없음</option>
                  {badges.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* 우선순위 */}
              <div className="task-field-row">
                <span className="task-field-label">우선순위</span>
                <select className="task-panel-input" value={priority}
                  onChange={e => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p || '없음'}</option>
                  ))}
                </select>
              </div>

              {/* 진척도 */}
              <div className="task-field-row">
                <span className="task-field-label">진척도</span>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="range" min={0} max={100} step={5}
                    value={progress} onChange={e => setProgress(e.target.value)}
                    style={{ flex:1 }} />
                  <span style={{ fontSize:13, fontWeight:600, minWidth:36 }}>{progress}%</span>
                </div>
              </div>
            </>
          )}

          {/* 내용 */}
          <div className="task-panel-content-area">
            <div className="task-panel-section-title" style={{ marginTop:16 }}>내용</div>
            <textarea className="task-panel-textarea"
              placeholder="여기에 내용을 작성해 주세요"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="task-panel-footer">
          <div className="task-subtask-label">
            <span>↪</span> 하위업무
            <span style={{ fontSize:11, color:'var(--c-muted)', marginLeft:4 }}>(준비중)</span>
          </div>
          <div style={{ flex:1 }} />
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                padding:'7px 12px', border:'1.5px solid', borderRadius:8,
                fontSize:13, cursor:'pointer', transition:'all 0.15s',
                background: confirmDel ? '#EF4444' : 'transparent',
                borderColor: confirmDel ? '#EF4444' : 'var(--c-border)',
                color: confirmDel ? '#fff' : '#EF4444',
              }}>
              {confirmDel ? '정말 삭제' : '삭제'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="task-add-btn"
            style={{ minWidth:72 }}>
            {saving ? '저장중...' : isNew ? '업무 추가' : '수정 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}
