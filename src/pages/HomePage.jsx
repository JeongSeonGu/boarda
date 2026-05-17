/**
 * pages/HomePage.jsx — 수정: 담벼락 보드 타입 추가
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useBoardStore from '../store/useBoardStore'
import BoardCard from '../components/board/BoardCard'
import EmptyState from '../components/common/EmptyState'
import '../styles/home.css'

const BOARD_TYPES = [
  { type:'columns', icon:'📋', name:'컬럼 보드',    desc:'섹션별로 정보를 정리하는 칸반 스타일 보드', color:'#EEF0FF' },
  { type:'links',   icon:'🔗', name:'링크 보드',    desc:'사이트와 링크를 태그로 체계적으로 관리',   color:'#E8F8F3' },
  { type:'wall',    icon:'📝', name:'담벼락',        desc:'자유롭게 포스트잇 메모를 붙이는 보드',     color:'#FAEEDA' },
  { type:null, icon:'🗺️', name:'마인드맵',       desc:'아이디어를 시각적으로 연결하고 구조화',    color:'#FBEAF0', soon:true },
]

export default function HomePage({ onNewBoard, onShareBoard }) {
  const navigate  = useNavigate()
  const showToast = useBoardStore((s) => s.showToast)
  const boards    = useBoardStore((s) => s.boards)
  const recent    = boards.slice(0, 6)

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
            <button className="hero-btn-ghost" onClick={() => navigate('/columns')}>📋 내 보드 보기</button>
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
              onClick={() => t.soon ? showToast('곧 출시 예정입니다! 🚀','info') : onNewBoard(t.type)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !t.soon && onNewBoard(t.type)}
              role="button">
              <div className="board-type-icon" style={{ background:t.color }}>{t.icon}</div>
              <div className="board-type-name">
                {t.name}
                {t.soon && <span className="coming-soon-badge">출시예정</span>}
              </div>
              <div className="board-type-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 보드 */}
      <section>
        <h2 className="section-title">🕐 최근 보드</h2>
        {boards.length === 0 ? (
          <EmptyState icon="📭" title="보드가 없습니다" desc="새 보드를 만들어 시작해보세요!"
            actionLabel="첫 보드 만들기" onAction={onNewBoard} />
        ) : (
          <div className="board-grid">
            {recent.map((b) => <BoardCard key={b.id} board={b} onShare={onShareBoard} />)}
          </div>
        )}
      </section>
    </div>
  )
}
