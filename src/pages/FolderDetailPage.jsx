/**
 * pages/FolderDetailPage.jsx
 * 폴더 상세 페이지 — 폴더 내 보드 목록 + 폴더 전체 공유
 */
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import useAuthStore  from '../store/useAuthStore'
import BoardCard     from '../components/board/BoardCard'
import EmptyState    from '../components/common/EmptyState'
import FolderModal   from '../components/modals/FolderModal'
import CreateBoardModal from '../components/modals/CreateBoardModal'
import ShareModal    from '../components/modals/ShareModal'
import Button        from '../components/common/Button'
import { useModal }  from '../hooks/useModal'
import '../styles/board.css'
import '../styles/folder.css'

export default function FolderDetailPage() {
  const { folderId }   = useParams()
  const navigate       = useNavigate()
  const folders        = useBoardStore((s) => s.folders)
  const boards         = useBoardStore((s) => s.boards)
  const deleteFolder   = useBoardStore((s) => s.deleteFolder)
  const showToast      = useBoardStore((s) => s.showToast)
  const isOwnerOf      = useAuthStore((s) => s.isOwnerOf)

  const editModal   = useModal()
  const createModal = useModal()
  const shareModal  = useModal()

  const folder = folders.find((f) => f.id === folderId)
  const folderBoards = boards.filter((b) => b.folder_id === folderId)

  /* 폴더 전체 공유 링크 */
  const folderShareUrl = `${window.location.origin}/share/folder/${folderId}`

  if (!folder) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 16 }}>폴더를 찾을 수 없습니다</h2>
        <Button variant="primary" onClick={() => navigate('/')}>홈으로</Button>
      </div>
    )
  }

  const canModify = isOwnerOf(folder.author)

  const handleDelete = () => {
    if (window.confirm(`'${folder.name}' 폴더를 삭제하시겠습니까?\n폴더 안의 보드는 삭제되지 않습니다.`)) {
      deleteFolder(folder.id)
      navigate('/')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(folderShareUrl).catch(() => {})
    showToast('폴더 공유 링크가 복사되었습니다! 📋', 'success')
  }

  return (
    <div>
      {/* 폴더 헤더 */}
      <div className="folder-detail-header">
        <button className="btn-icon" onClick={() => navigate('/')} title="뒤로">←</button>

        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-md)',
          background: (folder.color ?? '#6C63FF') + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, border: `2px solid ${folder.color ?? '#6C63FF'}44`,
          flexShrink: 0,
        }}>
          {folder.icon ?? '📁'}
        </div>

        <div className="folder-detail-info">
          <h1 className="folder-detail-name">{folder.name}</h1>
          {(folder.description || folder.desc) && (
            <p className="folder-detail-desc">{folder.description || folder.desc}</p>
          )}
          <div style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 4 }}>
            📄 {folderBoards.length}개 보드 · 👤 {folder.author || '익명'}
          </div>
        </div>

        <div className="folder-detail-actions">
          {/* 폴더 전체 공유 링크 복사 */}
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            🔗 폴더 링크 복사
          </Button>
          <Button variant="primary" size="sm" onClick={() => createModal.open(null)}>
            ＋ 보드 추가
          </Button>
          {canModify && (
            <>
              <Button variant="secondary" size="sm" onClick={() => editModal.open(folder)}>
                ✏️ 수정
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                🗑️
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 보드 목록 */}
      {folderBoards.length === 0 ? (
        <EmptyState icon="📋" title="보드가 없습니다"
          desc="이 폴더에 보드를 추가해보세요"
          actionLabel="보드 추가" onAction={() => createModal.open(null)} />
      ) : (
        <div className="board-grid">
          {folderBoards.map((b) => (
            <BoardCard key={b.id} board={b} showFolderMove={true}
              onShare={(id) => shareModal.open(id)} />
          ))}
        </div>
      )}

      <FolderModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        folder={editModal.data}
      />
      <CreateBoardModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        defaultType="columns"
        defaultFolderId={folderId}
        onCreated={(id) => navigate(`/board/${id}`)}
      />
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={shareModal.close}
        boardId={shareModal.data}
      />
    </div>
  )
}
