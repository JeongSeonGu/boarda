/**
 * components/common/Topbar.jsx — 수정: 로그인 사용자 배지, 로그아웃 추가
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../../store/useBoardStore'
import useAuthStore  from '../../store/useAuthStore'
import '../../styles/topbar.css'
import '../../styles/auth.css'

export default function Topbar({ onNewBoard }) {
  const toggleSidebar = useBoardStore((s) => s.toggleSidebar)
  const showToast     = useBoardStore((s) => s.showToast)
  const user          = useAuthStore((s) => s.user)
  const logout        = useAuthStore((s) => s.logout)
  const [search, setSearch]   = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) showToast(`"${search}" 검색 기능은 준비 중입니다`, 'info')
  }

  const handleLogout = () => {
    logout()
    setShowMenu(false)
    navigate('/login', { replace: true })
    showToast('로그아웃 되었습니다', 'info')
  }

  const displayName = user?.nickname || user?.name || user?.username || '?'
  const initials    = displayName.slice(0, 1).toUpperCase()

  return (
    <header className="topbar">
      <button className="btn-icon" onClick={toggleSidebar} aria-label="사이드바 토글">☰</button>

      <form className="topbar-search" onSubmit={handleSearch} role="search">
        <span aria-hidden="true">🔍</span>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="보드, 게시물 검색..." aria-label="전체 검색" />
      </form>

      <div className="topbar-actions">
        <button className="btn btn-primary btn-sm" onClick={onNewBoard}>＋ 새 보드</button>

        {/* 사용자 배지 */}
        {user && (
          <div style={{ position:'relative' }}>
            <div className="user-badge" onClick={() => setShowMenu((v) => !v)}>
              <div className="user-badge-avatar">{initials}</div>
              <span className="user-badge-name">{displayName}</span>
              <span style={{ fontSize:10, color:'var(--c-muted)' }}>▼</span>
            </div>

            {showMenu && (
              <>
                {/* 배경 클릭 닫기 */}
                <div style={{ position:'fixed', inset:0, zIndex:199 }}
                  onClick={() => setShowMenu(false)} />
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'var(--c-surface)', border:'1.5px solid var(--c-border)',
                  borderRadius:'var(--r-md)', boxShadow:'var(--shadow-md)',
                  minWidth:200, zIndex:200, overflow:'hidden',
                }}>
                  {/* 사용자 정보 */}
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--c-border)',
                    background:'var(--c-primary-light)' }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--c-text)' }}>{displayName}</div>
                    <div style={{ fontSize:11, color:'var(--c-muted)' }}>
                      {user.username} · {user.role === 'admin' ? '관리자' : '교사'}
                    </div>
                    {user.school_name && (
                      <div style={{ fontSize:11, color:'var(--c-muted)', marginTop:2 }}>
                        🏫 {user.school_name}
                        {user.class_name ? ` · ${user.class_name}` : ''}
                      </div>
                    )}
                  </div>
                  {/* 로그아웃 */}
                  <button onClick={handleLogout}
                    style={{ width:'100%', padding:'11px 16px', background:'none',
                      border:'none', cursor:'pointer', textAlign:'left',
                      fontSize:14, color:'var(--c-danger)', fontWeight:600,
                      display:'flex', alignItems:'center', gap:8 }}>
                    🚪 로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
