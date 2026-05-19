/**
 * App.jsx — 수정: /shared 라우트 추가
 */
import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'

import Sidebar          from './components/common/Sidebar'
import Topbar           from './components/common/Topbar'
import ToastContainer   from './components/common/ToastContainer'
import CreateBoardModal from './components/modals/CreateBoardModal'
import ShareModal       from './components/modals/ShareModal'

import LoginPage       from './pages/LoginPage'
import HomePage        from './pages/HomePage'
import BoardListPage   from './pages/BoardListPage'
import BoardDetailPage from './pages/BoardDetailPage'
import SharedBoardPage from './pages/SharedBoardPage'
import SharedListPage  from './pages/SharedListPage'

import { useModal }    from './hooks/useModal'
import useBoardStore   from './store/useBoardStore'
import useAuthStore    from './store/useAuthStore'

import './styles/globals.css'
import './styles/components.css'
import './styles/auth.css'
import './styles/wall.css'
import './styles/boardSettings.css'
import './index.css'

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AuthorSetup({ onDone }) {
  const setAuthor = useBoardStore((s) => s.setAuthor)
  const [name, setName] = React.useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,27,46,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--c-surface)', borderRadius: 'var(--r-xl)',
        padding: 32, maxWidth: 360, width: '100%',
        boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
          이름을 알려주세요
        </h2>
        <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 20 }}>
          게시물과 메모에 작성자로 표시됩니다.
        </p>
        <input className="form-input" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 또는 닉네임" autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') { setAuthor(name || '익명'); onDone() } }}
          style={{ marginBottom: 12, textAlign: 'center' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setAuthor('익명'); onDone() }}>익명으로 시작</button>
          <button className="btn btn-primary" onClick={() => { setAuthor(name || '익명'); onDone() }}>시작하기</button>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const navigate      = useNavigate()
  const fetchBoards   = useBoardStore((s) => s.fetchBoards)
  const loading       = useBoardStore((s) => s.loading)
  const user          = useAuthStore((s) => s.user)
  const verify        = useAuthStore((s) => s.verify)
  const setAuthor     = useBoardStore((s) => s.setAuthor)
  const createModal   = useModal()
  const shareModal    = useModal()
  const [authorReady, setAuthorReady] = React.useState(false)

  useEffect(() => {
    verify()
    fetchBoards()
    const stored = (() => { try { return localStorage.getItem('boarda_author') } catch { return null } })()
    if (stored) setAuthorReady(true)
  }, [])

  useEffect(() => {
    if (user) setAuthor(user.nickname || user.name || user.username)
  }, [user])

  const handleNewBoard     = (defaultType = 'columns') => createModal.open(defaultType)
  const handleBoardCreated = (id) => navigate(`/board/${id}`)
  const handleShareBoard   = (boardId) => shareModal.open(boardId)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 16,
      fontFamily: 'var(--font-head)', color: 'var(--c-muted)' }}>
      <div style={{ fontSize: 52 }}>📌</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)' }}>Boarda</div>
      <div style={{ fontSize: 14 }}>데이터를 불러오는 중...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!authorReady && !user && <AuthorSetup onDone={() => setAuthorReady(true)} />}
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onNewBoard={handleNewBoard} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Routes>
            <Route path="/"        element={<HomePage       onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/columns" element={<BoardListPage  type="columns" onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/links"   element={<BoardListPage  type="links"   onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/wall"    element={<BoardListPage  type="wall"    onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/shared"  element={<SharedListPage />} />
            <Route path="/board/:boardId" element={<BoardDetailPage onShareBoard={handleShareBoard} />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 16 }}>페이지를 찾을 수 없습니다</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')}>홈으로</button>
              </div>
            } />
          </Routes>
        </main>
      </div>
      <CreateBoardModal isOpen={createModal.isOpen} onClose={createModal.close}
        defaultType={createModal.data ?? 'columns'} onCreated={handleBoardCreated} />
      <ShareModal isOpen={shareModal.isOpen} onClose={shareModal.close} boardId={shareModal.data} />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/share/:boardId" element={<SharedBoardPage />} />
      <Route path="/*" element={
        <RequireAuth><AppShell /></RequireAuth>
      } />
    </Routes>
  )
}
