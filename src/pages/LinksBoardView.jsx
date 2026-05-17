/**
 * pages/LinksBoardView.jsx — 수정: EditLinkModal 연결
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LinkCard from '../components/links/LinkCard'
import LinksToolbar from '../components/links/LinksToolbar'
import AddLinkModal from '../components/modals/AddLinkModal'
import EditLinkModal from '../components/modals/EditLinkModal'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import { useModal } from '../hooks/useModal'
import { useSearch } from '../hooks/useSearch'
import '../styles/board.css'
import '../styles/links.css'

export default function LinksBoardView({ board, onShareBoard }) {
  const navigate  = useNavigate()
  const addModal  = useModal()
  const editModal = useModal()   // data = link object
  const [viewMode, setViewMode] = useState('grid')

  const links = board.links ?? []
  const { query, setQuery, category, setCategory, filtered, categories } = useSearch(links)

  return (
    <div>
      {/* 헤더 */}
      <div className="board-detail-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>←</button>
        <div className="board-detail-info">
          <h1 className="board-detail-title">{board.name}</h1>
          <div className="board-detail-meta">
            <span className="badge badge-type-links">링크 보드</span>
            <span>🔗 {links.length}개 링크</span>
            <span>📂 {[...new Set(links.map((l) => l.category))].length}개 분류</span>
            {board.author && <span>👤 {board.author}</span>}
          </div>
        </div>
        <div className="board-detail-actions">
          <Button variant="outline" size="sm" onClick={() => onShareBoard(board.id)}>🔗 공유</Button>
          <Button variant="primary" size="sm" onClick={addModal.open}>＋ 링크 추가</Button>
        </div>
      </div>

      {/* 툴바 */}
      <LinksToolbar
        query={query} onQueryChange={setQuery}
        categories={categories} activeCategory={category} onCategoryChange={setCategory}
        viewMode={viewMode} onViewModeChange={setViewMode}
        totalCount={links.length}
      />

      {/* 링크 목록 */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔗" title="링크가 없습니다"
          desc={query || category !== 'all' ? '검색 조건에 맞는 링크가 없습니다' : '첫 링크를 추가해보세요!'}
          actionLabel={!query && category === 'all' ? '링크 추가' : undefined}
          onAction={addModal.open}
        />
      ) : viewMode === 'grid' ? (
        <div className="links-grid">
          {filtered.map((link) => (
            <LinkCard key={link.id} boardId={board.id} link={link}
              viewMode="grid" onEdit={(l) => editModal.open(l)} />
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((link) => (
            <LinkCard key={link.id} boardId={board.id} link={link}
              viewMode="list" onEdit={(l) => editModal.open(l)} />
          ))}
        </div>
      )}

      {/* 링크 추가 모달 */}
      <AddLinkModal isOpen={addModal.isOpen} onClose={addModal.close} boardId={board.id} />

      {/* 링크 수정 모달 */}
      <EditLinkModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        boardId={board.id}
        link={editModal.data}
      />
    </div>
  )
}
