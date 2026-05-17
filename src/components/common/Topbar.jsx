/**
 * components/common/Topbar.jsx
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../../store/useBoardStore';
import '../../styles/topbar.css';

export default function Topbar({ title = 'Boarda', onNewBoard }) {
  const toggleSidebar = useBoardStore((s) => s.toggleSidebar);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // 향후 전역 검색 페이지로 연결
      useBoardStore.getState().showToast(`"${search}" 검색 기능은 준비 중입니다`, 'info');
    }
  };

  return (
    <header className="topbar">
      {/* 사이드바 토글 */}
      <button
        className="btn-icon"
        onClick={toggleSidebar}
        aria-label="사이드바 토글"
        style={{ flexShrink: 0 }}
      >
        ☰
      </button>

      {/* 검색 */}
      <form className="topbar-search" onSubmit={handleSearch} role="search">
        <span aria-hidden="true">🔍</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="보드, 게시물 검색..."
          aria-label="전체 검색"
        />
      </form>

      {/* 우측 액션 */}
      <div className="topbar-actions">
        <button className="btn btn-primary btn-sm" onClick={onNewBoard}>
          ＋ 새 보드
        </button>
      </div>
    </header>
  );
}
