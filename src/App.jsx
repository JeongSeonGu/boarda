/**
 * App.jsx
 * 앱 루트 — 라우팅, 레이아웃, 전역 모달 관리
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Sidebar          from './components/common/Sidebar';
import Topbar           from './components/common/Topbar';
import ToastContainer   from './components/common/ToastContainer';
import CreateBoardModal from './components/modals/CreateBoardModal';
import ShareModal       from './components/modals/ShareModal';

import HomePage        from './pages/HomePage';
import BoardListPage   from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';

import { useModal } from './hooks/useModal';
import useBoardStore from './store/useBoardStore';
import { useNavigate } from 'react-router-dom';

import './styles/globals.css';
import './styles/components.css';
import './index.css';

function AppShell() {
  const navigate = useNavigate();
  const sidebarCollapsed = useBoardStore((s) => s.sidebarCollapsed);

  // 보드 생성 모달
  const createModal = useModal();
  // 공유 모달
  const shareModal = useModal();

  const handleNewBoard = (defaultType = 'columns') => {
    createModal.open(defaultType);
  };

  const handleBoardCreated = (id) => {
    navigate(`/board/${id}`);
  };

  const handleShareBoard = (boardId) => {
    shareModal.open(boardId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 사이드바 */}
      <Sidebar onNewBoard={handleNewBoard} />

      {/* 메인 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onNewBoard={handleNewBoard} />

        <main
          id="main-content"
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}
          tabIndex={-1}
        >
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onNewBoard={handleNewBoard}
                  onShareBoard={handleShareBoard}
                />
              }
            />
            <Route
              path="/columns"
              element={
                <BoardListPage
                  type="columns"
                  onNewBoard={handleNewBoard}
                  onShareBoard={handleShareBoard}
                />
              }
            />
            <Route
              path="/links"
              element={
                <BoardListPage
                  type="links"
                  onNewBoard={handleNewBoard}
                  onShareBoard={handleShareBoard}
                />
              }
            />
            <Route
              path="/board/:boardId"
              element={<BoardDetailPage onShareBoard={handleShareBoard} />}
            />
            {/* 404 */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>페이지를 찾을 수 없습니다</h2>
                  <button className="btn btn-primary" onClick={() => navigate('/')}>홈으로</button>
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      {/* 전역 모달 */}
      <CreateBoardModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        defaultType={createModal.data ?? 'columns'}
        onCreated={handleBoardCreated}
      />
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={shareModal.close}
        boardId={shareModal.data}
      />

      {/* 토스트 */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
