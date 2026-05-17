/**
 * components/common/Sidebar.jsx
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import useBoardStore from '../../store/useBoardStore';
import '../../styles/sidebar.css';

const NAV_ITEMS = [
  { to: '/',          icon: '🏠', label: '홈',       end: true },
  { to: '/columns',   icon: '📋', label: '컬럼 보드', boardType: 'columns' },
  { to: '/links',     icon: '🔗', label: '링크 보드', boardType: 'links' },
  { divider: true },
  { to: '/shared',    icon: '🤝', label: '공유됨',    soon: true },
  { to: '/favorites', icon: '⭐', label: '즐겨찾기',  soon: true },
  { divider: true },
  { to: '/settings',  icon: '⚙️', label: '설정',      soon: true },
];

export default function Sidebar({ onNewBoard }) {
  const collapsed    = useBoardStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useBoardStore((s) => s.toggleSidebar);
  const boards       = useBoardStore((s) => s.boards);

  const columnCount = boards.filter((b) => b.type === 'columns').length;
  const linkCount   = boards.filter((b) => b.type === 'links').length;

  const badge = (type) =>
    type === 'columns' ? columnCount : type === 'links' ? linkCount : null;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* 로고 */}
      <div className="sidebar-logo">
        <div className="logo-icon" aria-hidden="true">📌</div>
        {!collapsed && <span className="logo-text">학습보드</span>}
      </div>

      {/* 네비게이션 */}
      <nav className="sidebar-nav" aria-label="메인 메뉴">
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) return <div key={i} className="divider" style={{ margin: '8px 12px' }} />;

          const count = badge(item.boardType);

          if (item.soon) {
            return (
              <button
                key={item.to}
                className="nav-item"
                onClick={() => {
                  useBoardStore.getState().showToast('곧 출시 예정입니다! 🚀', 'info');
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && <span className="nav-badge soon">준비중</span>}
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && count !== null && (
                <span className="nav-badge">{count}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 하단 사용자 */}
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
  );
}
