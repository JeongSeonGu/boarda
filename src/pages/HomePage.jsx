/**
 * pages/HomePage.jsx
 * 수정: 폴더 섹션 추가 — 폴더 생성/수정/삭제, 보드 폴더별 그룹화
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore  from '../store/useBoardStore'
import BoardCard      from '../components/board/BoardCard'
import FolderModal    from '../components/modals/FolderModal'
import EmptyState     from '../components/common/EmptyState'
import { useModal }   from '../hooks/useModal'
import { relativeDate } from '../utils/helpers'
import '../styles/home.css'
import '../styles/folder.css'

const BOARD_TYPES = [
  { type:'columns', icon:'📋', name:'컬럼 보드',    desc:'섹션별로 정보를 정리하는 칸반 스타일 보드', color:'#EEF0FF' },
  { type:'links',   icon:'🔗', name:'링크 보드',    desc:'사이트와 링크를 태그로 체계적으로 관리',   color:'#E8F8F3' },
  { type:'wall',    icon:'📝', name:'담벼락',        desc:'자유롭게 포스트잇 메모를 붙이는 보드',     color:'#FAEEDA' },
  { type:null,      icon:'🗺️', name:'마인드맵',     desc:'아이디어를 시각적으로 연결하고 구조화',    color:'#FBEAF0', soon:true },
]

/* 폴더 카드 */
function FolderCard({ folder, boards, onEdit, onDelete }) {
  const navigate   = useNavigate()
  const previewBoards = boards.slice(0, 4)
  const rest       = boards.length - previewBoards.length

  const handleClick = () => navigate(`/folder/${folder.id}`)

  return (
    <div className="folder-card" onClick={handleClick}>
      <div className="folder-card-stripe" style={{ background: folder.color ?? '#6C63FF' }} />
      <div className="folder-card-body">
        <div className="folder-card-header">
          <div className="folder-icon">{folder.icon ?? '📁'}</div>
          <div className="folder-info">
            <div className="folder-name">{folder.name}</div>
            {(folder.description || folder.desc) && (
              <div className="folder-desc">{folder.description || folder.desc}</div>
            )}
          </div>
        </div>

        {/* 보드 미리보기 칩 */}
        <div className="folder-board-preview">
          {boards.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--c-muted)', fontStyle: 'italic' }}>
              보드가 없습니다
            </span>
          ) : (
            <>
              {previewBoards.map((b) => (
                <span key={b.id} className="folder-board-chip">
                  {b.type === 'columns' ? '📋' : b.type === 'links' ? '🔗' : '📝'} {b.name}
                </span>
              ))}
              {rest > 0 && (
                <span className="folder-board-chip folder-board-chip-more">+{rest}개</span>
              )}
            </>
          )}
        </div>

        <div className="folder-card-footer">
          <div className="folder-meta">
            <span>📄 {boards.length}개</span>
            <span>🕐 {relativeDate(folder.created_at)}</span>
          </div>
          <div className="folder-actions">
            <button className="action-icon"
              onClick={(e) => { e.stopPropagation(); onEdit(folder) }}
              title="폴더 수정">✏️</button>
            <button className="action-icon danger"
              onClick={(e) => { e.stopPropagation(); onDelete(folder) }}
              title="폴더 삭제">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ onNewBoard, onShareBoard }) {
  const navigate    = useNavigate()
  const showToast   = useBoardStore((s) => s.showToast)
  const boards      = useBoardStore((s) => s.boards)
  const folders     = useBoardStore((s) => s.folders)
  const deleteFolder = useBoardStore((s) => s.deleteFolder)

  const folderModal = useModal()   // data = folder(수정) | null(생성)

  /* 폴더별 보드 분류 */
  const folderBoards = (folderId) => boards.filter((b) => b.folder_id === folderId)
  const noFolderBoards = boards.filter((b) => !b.folder_id)
  const recent = boards.slice(0, 6)

  const handleDeleteFolder = (folder) => {
    if (window.confirm(`'${folder.name}' 폴더를 삭제하시겠습니까?\n폴더 안의 보드는 삭제되지 않습니다.`)) {
      deleteFolder(folder.id)
    }
  }

  return (
    <div className="home-page">
      {/* 히어로 */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">✨ 나만의 지식 보드</h1>
          <p className="hero-desc">
            아이디어를 정리하고, 유용한 링크를 모아보세요.<br />
            당신의 두 번째 두뇌, <strong>Boarda</strong>입니다.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-white" onClick={onNewBoard}>＋ 새 보드 만들기</button>
            <button className="hero-btn-ghost" onClick={() => folderModal.open(null)}>
              📁 새 폴더
            </button>
          </div>
        </div>
        <div className="hero-deco" aria-hidden="true" />
      </section>

      {/* 빠른 시작 */}
      <section>
        <h2 className="section-title">⚡ 빠른 시작</h2>
        <div className="board-type-grid">
          {BOARD_TYPES.map((t) => (
            <div key={t.name}
              className={`board-type-card ${t.soon ? 'soon' : ''}`}
              onClick={() => t.soon ? showToast('곧 출시 예정입니다! 🚀', 'info') : onNewBoard(t.type)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !t.soon && onNewBoard(t.type)}
              role="button">
              <div className="board-type-icon" style={{ background: t.color }}>{t.icon}</div>
              <div className="board-type-name">
                {t.name}
                {t.soon && <span className="coming-soon-badge">출시예정</span>}
              </div>
              <div className="board-type-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 폴더 섹션 */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>📁 내 폴더</h2>
          <button className="btn btn-secondary btn-sm"
            onClick={() => folderModal.open(null)}>
            ＋ 폴더 만들기
          </button>
        </div>

        {folders.length === 0 ? (
          <div style={{
            border: '2px dashed var(--c-border)', borderRadius: 'var(--r-lg)',
            padding: '32px', textAlign: 'center', color: 'var(--c-muted)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>폴더가 없습니다</div>
            <div style={{ fontSize: 12, marginBottom: 14 }}>
              관련 보드들을 폴더로 묶어 체계적으로 관리해보세요
            </div>
            <button className="btn btn-primary btn-sm"
              onClick={() => folderModal.open(null)}>
              📁 첫 폴더 만들기
            </button>
          </div>
        ) : (
          <div className="folder-grid">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                boards={folderBoards(folder.id)}
                onEdit={(f) => folderModal.open(f)}
                onDelete={handleDeleteFolder}
              />
            ))}
          </div>
        )}
      </section>

      {/* 폴더 없는 보드 */}
      {noFolderBoards.length > 0 && (
        <section className="no-folder-section">
          <div className="no-folder-title">
            <span>📋 폴더 없는 보드</span>
            <span style={{ fontSize: 11, fontWeight: 400 }}>
              — 보드 카드의 📂 버튼으로 폴더에 넣을 수 있습니다
            </span>
          </div>
          <div className="board-grid">
            {noFolderBoards.slice(0, 8).map((b) => (
              <BoardCard key={b.id} board={b} onShare={onShareBoard} showFolderMove={true} />
            ))}
          </div>
          {noFolderBoards.length > 8 && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm"
                onClick={() => navigate('/columns')}>
                전체 보기 ({noFolderBoards.length}개)
              </button>
            </div>
          )}
        </section>
      )}

      {/* 폴더도 보드도 없을 때 */}
      {folders.length === 0 && boards.length === 0 && (
        <section>
          <h2 className="section-title">🕐 최근 보드</h2>
          <EmptyState icon="📭" title="보드가 없습니다" desc="새 보드를 만들어 시작해보세요!"
            actionLabel="첫 보드 만들기" onAction={onNewBoard} />
        </section>
      )}

      {/* 폴더 생성/수정 모달 */}
      <FolderModal
        isOpen={folderModal.isOpen}
        onClose={folderModal.close}
        folder={folderModal.data}   /* null=생성, folder객체=수정 */
      />
    </div>
  )
}
