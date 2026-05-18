/**
 * App.jsx — 수정: 로그인 라우트 + 인증 가드 추가
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

import { useModal }    from './hooks/useModal'
import useBoardStore   from './store/useBoardStore'
import useAuthStore    from './store/useAuthStore'

import './styles/globals.css'
import './styles/components.css'
import './styles/auth.css'
import './styles/wall.css'
import './index.css'

/* 인증 가드 — 로그인 안 했으면 /login으로 */
function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
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

  useEffect(() => {
    verify()        // 토큰 유효성 재확인
    fetchBoards()
  }, [])

  /* 로그인 사용자 이름을 게시물 author 로 자동 설정 */
  useEffect(() => {
    if (user) setAuthor(user.nickname || user.name || user.username)
  }, [user])

  const handleNewBoard     = (defaultType = 'columns') => createModal.open(defaultType)
  const handleBoardCreated = (id) => navigate(`/board/${id}`)
  const handleShareBoard   = (boardId) => shareModal.open(boardId)

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', gap:16,
      fontFamily:'var(--font-head)', color:'var(--c-muted)' }}>
      <div style={{ fontSize:52 }}>📌</div>
      <div style={{ fontSize:20, fontWeight:700, color:'var(--c-text)' }}>Boarda</div>
      <div style={{ fontSize:14 }}>데이터를 불러오는 중...</div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar onNewBoard={handleNewBoard} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar onNewBoard={handleNewBoard} />
        <main style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
          <Routes>
            <Route path="/"        element={<HomePage       onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/columns" element={<BoardListPage  type="columns" onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/links"   element={<BoardListPage  type="links"   onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/wall"    element={<BoardListPage  type="wall"    onNewBoard={handleNewBoard} onShareBoard={handleShareBoard} />} />
            <Route path="/board/:boardId" element={<BoardDetailPage onShareBoard={handleShareBoard} />} />
            <Route path="*" element={
              <div style={{ textAlign:'center', padding:'80px 20px' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                <h2 style={{ fontFamily:'var(--font-head)', marginBottom:16 }}>페이지를 찾을 수 없습니다</h2>
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
      {/* 공개 라우트 */}
      <Route path="/login"              element={<LoginPage />} />
      <Route path="/share/:boardId"     element={<SharedBoardPage />} />

      {/* 인증 필요 라우트 */}
      <Route path="/*" element={
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      } />
    </Routes>
  )
}
