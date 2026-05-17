/**
 * components/common/Sidebar.jsx — 수정: 담벼락 메뉴 추가
 */
import React from 'react'
import { NavLink } from 'react-router-dom'
import useBoardStore from '../../store/useBoardStore'
import '../../styles/sidebar.css'

const NAV_ITEMS = [
  { to:'/',        icon:'🏠', label:'홈',         end:true },
  { to:'/columns', icon:'📋', label:'컬럼 보드',   boardType:'columns' },
  { to:'/links',   icon:'🔗', label:'링크 보드',   boardType:'links' },
  { to:'/wall',    icon:'📝', label:'담벼락',       boardType:'wall' },
  { divider:true },
  { icon:'🤝', label:'공유됨',   soon:true },
  { icon:'⭐', label:'즐겨찾기', soon:true },
  { divider:true },
  { icon:'⚙️', label:'설정',     soon:true },
]

export default function Sidebar({ onNewBoard }) {
  const collapsed     = useBoardStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useBoardStore((s) => s.toggleSidebar)
  const showToast     = useBoardStore((s) => s.showToast)
  const boards        = useBoardStore((s) => s.boards)

  const countOf = (type) => boards.filter((b) => b.type === type).length

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon" aria-hidden="true">📌</div>
        {!collapsed && <span className="logo-text">Boarda</span>}
      </div>

      <nav className="sidebar-nav" aria-label="메인 메뉴">
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) return <div key={i} className="divider" style={{ margin:'8px 12px' }} />

          if (item.soon) {
            return (
              <button key={item.label} className="nav-item"
                onClick={() => showToast('곧 출시 예정입니다! 🚀','info')}
                title={collapsed ? item.label : undefined}>
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && <span className="nav-badge soon">준비중</span>}
              </button>
            )
          }

          const count = item.boardType ? countOf(item.boardType) : null

          return (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && count !== null && <span className="nav-badge">{count}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="user-pill">
            <div className="user-avatar" aria-hidden="true">나</div>
            <div className="user-info">
              <div className="user-name">나의 워크스페이스</div>
              <div className="user-role">무료 플랜</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
