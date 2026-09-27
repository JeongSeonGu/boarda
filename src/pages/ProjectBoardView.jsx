/**
 * pages/ProjectBoardView.jsx
 * 프로젝트 보드 — 업무목록 / 설명 / 첨부파일 / 인사이트 / 설정 탭
 */
import React, { useState, useMemo, useRef, useEffect } from 'react'
import useBoardStore from '../store/useBoardStore'
import BoardHeader from '../components/board/BoardHeader'
import TaskPanel from '../components/project/TaskPanel'
import FileAttachment from '../components/common/FileAttachment'
import '../styles/project.css'

const DEFAULT_STATUSES = [
  { id: 's1', label: '요청',  color: '#3B82F6' },
  { id: 's2', label: '진행중', color: '#F59E0B' },
  { id: 's3', label: '검토',  color: '#8B5CF6' },
  { id: 's4', label: '완료',  color: '#10B981' },
  { id: 's5', label: '보류',  color: '#6B7280' },
]
const DEFAULT_BADGES = ['버그수정', '기능개선', '아이디어', '문서']
const PRIORITY_OPTIONS = [
  { value: '',     label: '없음' },
  { value: '높음', label: '🔴 높음' },
  { value: '보통', label: '🟡 보통' },
  { value: '낮음', label: '🟢 낮음' },
]
const STATUS_COLORS = [
  '#3B82F6','#F59E0B','#8B5CF6','#10B981','#6B7280',
  '#EF4444','#EC4899','#06B6D4','#F97316','#84CC16',
]

// ── 유틸 ──────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}
function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

// ── 상태 배지 ──────────────────────────────────────────
function StatusBadge({ status, statuses }) {
  const st = statuses.find(s => s.label === status) || statuses[0]
  return (
    <span className="task-status-badge" style={{
      background: st?.color + '18',
      color: st?.color,
    }}>
      <span className="task-status-dot" style={{ background: st?.color }} />
      {st?.label ?? status}
    </span>
  )
}

// ── 우선순위 배지 ──────────────────────────────────────
function PriorityBadge({ value }) {
  if (!value) return <span style={{ color: 'var(--c-muted)', fontSize: 12 }}>-</span>
  const colors = { '높음': '#EF4444', '보통': '#F59E0B', '낮음': '#10B981' }
  return (
    <span className="priority-badge" style={{
      background: (colors[value] || '#6B7280') + '18',
      color: colors[value] || '#6B7280'
    }}>
      {value}
    </span>
  )
}

// ── 진척도 바 ──────────────────────────────────────────
function ProgressBar({ value }) {
  return (
    <div className="progress-wrap">
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${value || 0}%` }} />
      </div>
      <span className="progress-pct">{value || 0}%</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 업무 목록 탭
// ══════════════════════════════════════════════════════
function TaskListTab({ board, statuses, badges, onAddTask, onEditTask }) {
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('')
  const [filterBadge, setBadge]   = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [showSearch, setShowSearch] = useState(false)

  const tasks = board.project_tasks || []

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus && t.status !== filterStatus) return false
      if (filterBadge  && t.badge  !== filterBadge)  return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) &&
            !t.content?.toLowerCase().includes(q) &&
            !t.assignee?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [tasks, filterStatus, filterBadge, search])

  // 상태별 그룹화
  const grouped = useMemo(() => {
    const groups = {}
    // 지정된 상태 순서대로
    statuses.forEach(s => { groups[s.label] = [] })
    groups['그룹 미지정'] = []
    filtered.forEach(t => {
      if (groups[t.status] !== undefined) groups[t.status].push(t)
      else groups['그룹 미지정'].push(t)
    })
    return groups
  }, [filtered, statuses])

  const toggleGroup = (key) =>
    setCollapsed(p => ({ ...p, [key]: !p[key] }))

  const hasFilter = filterStatus || filterBadge || search

  return (
    <div>
      {/* 툴바 */}
      <div className="task-toolbar">
        <div className="task-toolbar-left">
          <select className="task-filter-select" value={filterStatus}
            onChange={e => setFilter(e.target.value)}>
            <option value="">전체 업무</option>
            {statuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
          </select>

          {hasFilter && (
            <button className="task-chip-btn active" onClick={() => {
              setFilter(''); setBadge(''); setSearch('')
            }}>
              ↩ 초기화
            </button>
          )}
          {filterStatus && (
            <span className="task-chip-btn active">
              상태: {filterStatus}
              <span className="chip-x" onClick={() => setFilter('')}>✕</span>
            </span>
          )}
          {filterBadge && (
            <span className="task-chip-btn active">
              뱃지: {filterBadge}
              <span className="chip-x" onClick={() => setBadge('')}>✕</span>
            </span>
          )}
        </div>

        <div className="task-toolbar-right">
          {showSearch && (
            <div className="task-search-wrap">
              <span className="task-search-icon">🔍</span>
              <input autoFocus placeholder="검색..."
                value={search} onChange={e => setSearch(e.target.value)}
                onBlur={() => { if (!search) setShowSearch(false) }}
              />
            </div>
          )}
          {!showSearch && (
            <button className="task-chip-btn" onClick={() => setShowSearch(true)}>🔍</button>
          )}

          {badges.length > 0 && (
            <select className="task-filter-select" value={filterBadge}
              onChange={e => setBadge(e.target.value)}>
              <option value="">뱃지 전체</option>
              {badges.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <button className="task-add-btn" onClick={() => onAddTask()}>
            ＋ 업무 추가
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="task-table-wrap">
        <table className="task-table">
          <thead>
            <tr>
              <th>업무명</th>
              <th>상태</th>
              <th>담당자</th>
              <th>시작일</th>
              <th>마감일</th>
              <th>우선순위</th>
              <th>진척도</th>
              <th>작성자</th>
              <th>등록일</th>
              <th>업무번호</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([groupName, groupTasks]) => {
              if (groupTasks.length === 0) return null
              const isCollapsed = collapsed[groupName]
              return (
                <React.Fragment key={groupName}>
                  <tr className="task-group-row">
                    <td colSpan={10}>
                      <button className="task-group-toggle"
                        onClick={() => toggleGroup(groupName)}>
                        {isCollapsed ? '▶' : '▼'}
                      </button>
                      {groupName} ({groupTasks.length})
                    </td>
                  </tr>
                  {!isCollapsed && groupTasks.map(task => (
                    <tr key={task.id} onClick={() => onEditTask(task)}>
                      <td>
                        <div className="task-name-cell">
                          {task.badge && (
                            <span className="task-badge">{task.badge}</span>
                          )}
                          <span className="task-title">{task.title || '(제목 없음)'}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={task.status} statuses={statuses} /></td>
                      <td style={{ color: 'var(--c-text)', fontSize: 13 }}>
                        {task.assignee || <span style={{ color: 'var(--c-muted)' }}>-</span>}
                      </td>
                      <td>
                        <span className="task-date">{fmtDate(task.start_date) || '-'}</span>
                      </td>
                      <td>
                        <span className={`task-date${isOverdue(task.due_date) && task.status !== '완료' ? ' overdue' : ''}`}>
                          {fmtDate(task.due_date) || '-'}
                        </span>
                      </td>
                      <td><PriorityBadge value={task.priority} /></td>
                      <td><ProgressBar value={task.progress} /></td>
                      <td style={{ color: 'var(--c-muted)', fontSize: 12 }}>{task.author}</td>
                      <td style={{ color: 'var(--c-muted)', fontSize: 12 }}>
                        {task.created_at ? fmtDate(task.created_at.slice(0,10)) : ''}
                      </td>
                      <td style={{ color: 'var(--c-muted)', fontSize: 12, textAlign: 'right' }}>
                        #{task.task_number || ''}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="task-empty">
            <div className="task-empty-icon">📋</div>
            <div className="task-empty-text">
              {hasFilter ? '검색 결과가 없습니다.' : '아직 업무가 없습니다. 업무를 추가해 보세요!'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 설명 탭
// ══════════════════════════════════════════════════════
function DescriptionTab({ board }) {
  const updateBoard = useBoardStore(s => s.updateBoard)
  const [desc, setDesc] = useState(board.description || '')
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  const handleChange = (v) => {
    setDesc(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      await updateBoard(board.id, { description: v })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 800)
  }

  return (
    <div className="proj-desc-wrap">
      <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 10 }}>
        이 프로젝트에 대한 설명, 목표, 배경을 자유롭게 작성하세요.
        {saved && <span style={{ marginLeft: 8, color: '#10B981', fontSize: 12 }}>✓ 저장됨</span>}
      </p>
      <textarea className="proj-desc-textarea"
        value={desc}
        onChange={e => handleChange(e.target.value)}
        placeholder="프로젝트 설명을 입력하세요..."
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 첨부파일 탭
// ══════════════════════════════════════════════════════
function AttachTab({ board }) {
  const updateBoard = useBoardStore(s => s.updateBoard)
  const attachments = board.project_attachments || []

  const handleAdd = (newFiles) => {
    const next = [...attachments, ...newFiles]
    updateBoard(board.id, { project_attachments: next })
  }
  const handleRemove = (idx) => {
    const next = attachments.filter((_, i) => i !== idx)
    updateBoard(board.id, { project_attachments: next })
  }

  return (
    <div className="proj-attach-wrap">
      <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 16 }}>
        프로젝트 관련 자료 및 파일을 저장합니다.
      </p>
      <FileAttachment
        attachments={attachments}
        onChange={handleAdd}
        onRemove={handleRemove}
        boardId={board.id}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 인사이트 탭
// ══════════════════════════════════════════════════════
function InsightTab({ board, statuses }) {
  const tasks = board.project_tasks || []
  const total = tasks.length
  const done  = tasks.filter(t => t.status === (statuses.find(s => s.label === '완료')?.label || '완료')).length
  const avgProgress = total
    ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / total)
    : 0
  const overdue = tasks.filter(t =>
    isOverdue(t.due_date) &&
    t.status !== (statuses.find(s => s.label === '완료')?.label || '완료')
  ).length

  const byStatus = statuses.map(s => ({
    ...s,
    count: tasks.filter(t => t.status === s.label).length
  }))

  return (
    <div>
      <div className="insight-grid">
        <div className="insight-card">
          <div className="insight-number" style={{ color: 'var(--c-primary)' }}>{total}</div>
          <div className="insight-label">전체 업무</div>
        </div>
        <div className="insight-card">
          <div className="insight-number" style={{ color: '#10B981' }}>{done}</div>
          <div className="insight-label">완료</div>
        </div>
        <div className="insight-card">
          <div className="insight-number" style={{ color: '#F59E0B' }}>{avgProgress}%</div>
          <div className="insight-label">평균 진척도</div>
        </div>
        <div className="insight-card">
          <div className="insight-number" style={{ color: overdue ? '#EF4444' : 'var(--c-muted)' }}>
            {overdue}
          </div>
          <div className="insight-label">기한 초과</div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: 'var(--c-surface)', border: '1.5px solid var(--c-border)',
        borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>상태별 현황</div>
        <div className="insight-status-bars">
          {byStatus.map(s => (
            <div key={s.id} className="insight-status-row">
              <div className="insight-status-name">{s.label}</div>
              <div className="insight-status-bar-bg">
                <div className="insight-status-bar-fill"
                  style={{ width: total ? `${(s.count/total)*100}%` : '0%', background: s.color }} />
              </div>
              <div className="insight-status-count">{s.count}개</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 설정 탭
// ══════════════════════════════════════════════════════
function SettingsTab({ board, statuses, setStatuses, badges, setBadges }) {
  const updateBoard = useBoardStore(s => s.updateBoard)
  const [colorPickerIdx, setColorPickerIdx] = useState(null)
  const [newBadge, setNewBadge] = useState('')

  const saveStatuses = async (next) => {
    setStatuses(next)
    await updateBoard(board.id, { project_statuses: next })
  }
  const saveBadges = async (next) => {
    setBadges(next)
    await updateBoard(board.id, { project_badges: next })
  }

  const addStatus = () => {
    const colors = STATUS_COLORS
    const next = [...statuses, {
      id: `s${Date.now()}`,
      label: '새 상태',
      color: colors[statuses.length % colors.length]
    }]
    saveStatuses(next)
  }
  const updateStatusLabel = (idx, label) => {
    const next = statuses.map((s, i) => i === idx ? { ...s, label } : s)
    saveStatuses(next)
  }
  const updateStatusColor = (idx, color) => {
    const next = statuses.map((s, i) => i === idx ? { ...s, color } : s)
    saveStatuses(next)
    setColorPickerIdx(null)
  }
  const removeStatus = (idx) => {
    if (statuses.length <= 1) return
    saveStatuses(statuses.filter((_, i) => i !== idx))
  }
  const addBadge = () => {
    const v = newBadge.trim()
    if (!v || badges.includes(v)) return
    saveBadges([...badges, v])
    setNewBadge('')
  }
  const removeBadge = (b) => saveBadges(badges.filter(x => x !== b))

  return (
    <div className="proj-settings-wrap">
      {/* 상태 명칭 */}
      <div className="proj-settings-section">
        <div className="proj-settings-section-title">상태 명칭 설정</div>
        <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 8 }}>
          이 프로젝트에서 사용할 업무 상태 명칭과 색상을 지정합니다.
        </p>
        <div className="proj-status-list">
          {statuses.map((s, idx) => (
            <div key={s.id} className="proj-status-item" style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <button className="proj-status-color-btn"
                  style={{ background: s.color }}
                  onClick={() => setColorPickerIdx(colorPickerIdx === idx ? null : idx)}
                />
                {colorPickerIdx === idx && (
                  <div className="status-color-picker" style={{ position: 'absolute', top: 28, left: 0 }}>
                    {STATUS_COLORS.map(c => (
                      <div key={c} className={`status-color-swatch${s.color === c ? ' selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => updateStatusColor(idx, c)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <input className="proj-status-input"
                value={s.label}
                onChange={e => updateStatusLabel(idx, e.target.value)}
              />
              <button className="proj-status-del" onClick={() => removeStatus(idx)}>✕</button>
            </div>
          ))}
        </div>
        <button className="proj-add-btn" style={{ marginTop: 6 }} onClick={addStatus}>
          + 상태 추가
        </button>
      </div>

      {/* 머릿글 뱃지 */}
      <div className="proj-settings-section">
        <div className="proj-settings-section-title">머릿글 뱃지 설정</div>
        <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 8 }}>
          업무명 앞에 표시되는 뱃지로 업무 유형을 빠르게 구분합니다.
        </p>
        <div className="proj-badge-list">
          {badges.map(b => (
            <div key={b} className="proj-badge-item">
              {b}
              <button className="proj-badge-del" onClick={() => removeBadge(b)}>✕</button>
            </div>
          ))}
        </div>
        <div className="proj-badge-input-row">
          <input className="proj-badge-input" placeholder="새 뱃지 입력..."
            value={newBadge} onChange={e => setNewBadge(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addBadge()}
          />
          <button className="task-add-btn" style={{ padding: '0 14px' }} onClick={addBadge}>추가</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// 메인 뷰
// ══════════════════════════════════════════════════════
export default function ProjectBoardView({ board, onShareBoard }) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [panelTask, setPanelTask] = useState(null)   // null=닫힘, {}=새 업무, task=수정
  const [panelOpen, setPanelOpen]  = useState(false)

  const rawStatuses = board.project_statuses
  const rawBadges   = board.project_badges
  const [statuses, setStatuses] = useState(
    Array.isArray(rawStatuses) && rawStatuses.length ? rawStatuses : DEFAULT_STATUSES
  )
  const [badges, setBadges] = useState(
    Array.isArray(rawBadges) && rawBadges.length ? rawBadges : DEFAULT_BADGES
  )

  // board 변경 시 동기화
  useEffect(() => {
    if (Array.isArray(board.project_statuses) && board.project_statuses.length)
      setStatuses(board.project_statuses)
    if (Array.isArray(board.project_badges) && board.project_badges.length)
      setBadges(board.project_badges)
  }, [board.project_statuses, board.project_badges])

  const openAdd  = () => { setPanelTask({}); setPanelOpen(true) }
  const openEdit = (task) => { setPanelTask(task); setPanelOpen(true) }
  const closePanel = () => { setPanelOpen(false); setTimeout(() => setPanelTask(null), 250) }

  const TABS = [
    { id: 'tasks',   label: '업무목록' },
    { id: 'desc',    label: '설명' },
    { id: 'attach',  label: '첨부파일/자료' },
    { id: 'insight', label: '인사이트' },
    { id: 'settings',label: '설정' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <BoardHeader board={board} onShareBoard={onShareBoard} />

      {/* 탭 */}
      <div className="proj-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`proj-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 2px' }}>
        {activeTab === 'tasks' && (
          <TaskListTab board={board} statuses={statuses} badges={badges}
            onAddTask={openAdd} onEditTask={openEdit} />
        )}
        {activeTab === 'desc' && <DescriptionTab board={board} />}
        {activeTab === 'attach' && <AttachTab board={board} />}
        {activeTab === 'insight' && <InsightTab board={board} statuses={statuses} />}
        {activeTab === 'settings' && (
          <SettingsTab board={board}
            statuses={statuses} setStatuses={setStatuses}
            badges={badges} setBadges={setBadges} />
        )}
      </div>

      {/* 업무 패널 */}
      {panelOpen && panelTask !== null && (
        <TaskPanel
          board={board}
          task={panelTask}
          statuses={statuses}
          badges={badges}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
