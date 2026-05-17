/**
 * components/links/LinksToolbar.jsx
 */
import React from 'react';

export default function LinksToolbar({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) {
  return (
    <div className="links-toolbar">
      {/* 검색 */}
      <div className="links-search">
        <span aria-hidden="true">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="링크 검색..."
          aria-label="링크 검색"
        />
      </div>

      {/* 카테고리 필터 칩 */}
      <div className="filter-chips" role="group" aria-label="카테고리 필터">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
          >
            {cat === 'all' ? `전체 (${totalCount})` : cat}
          </button>
        ))}
      </div>

      {/* 뷰 토글 */}
      <div className="view-toggle" role="group" aria-label="보기 방식">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          aria-label="그리드 보기"
          title="그리드"
        >
          ⊞
        </button>
        <button
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
          aria-label="목록 보기"
          title="목록"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
