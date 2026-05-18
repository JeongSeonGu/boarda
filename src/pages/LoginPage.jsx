/**
 * pages/LoginPage.jsx
 * 수정: 개발환경 안내 배너 추가
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import '../styles/auth.css'

const IS_DEV = import.meta.env.DEV

export default function LoginPage() {
  const navigate   = useNavigate()
  const login      = useAuthStore((s) => s.login)
  const loading    = useAuthStore((s) => s.loading)
  const error      = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    const ok = await login(username.trim(), password)
    if (ok) navigate('/', { replace: true })
  }

  /* 개발환경 빠른 로그인 */
  const quickLogin = async (id, pw) => {
    setUsername(id); setPassword(pw)
    const ok = await login(id, pw)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* 로고 */}
        <div className="auth-logo">
          <div className="auth-logo-icon">📌</div>
          <div className="auth-logo-title">Boarda</div>
          <div className="auth-logo-sub">클래스보드 — 선생님 전용</div>
        </div>

        {/* 개발환경 안내 배너 */}
        {IS_DEV && (
          <div style={{
            background: '#FFF9C4', border: '1.5px solid #FFD166',
            borderRadius: 'var(--r-sm)', padding: '10px 14px',
            marginBottom: 16, fontSize: 12, color: '#854F0B',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>🛠️ 개발 환경 — 테스트 계정</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: '관리자', id: 'admin',    pw: 'admin123' },
                { label: '교사1',  id: 'teacher',  pw: 'teacher123' },
                { label: '교사2',  id: 'teacher2', pw: 'teacher123' },
              ].map((a) => (
                <button key={a.id}
                  onClick={() => quickLogin(a.id, a.pw)}
                  style={{
                    padding: '4px 10px', background: '#fff',
                    border: '1px solid #FFD166', borderRadius: 20,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    color: '#854F0B',
                  }}>
                  {a.label} ({a.id})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={clearError}
              style={{ marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--c-danger)', fontSize: 14 }}>✕</button>
          </div>
        )}

        {/* 로그인 폼 */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">👤</span>
            <input
              className="auth-input" type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError() }}
              placeholder="아이디 (username)"
              autoComplete="username" autoFocus disabled={loading}
            />
          </div>

          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔒</span>
            <input
              className="auth-input"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              placeholder="비밀번호"
              autoComplete="current-password" disabled={loading}
              style={{ paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              style={{ position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 16,
                color: 'var(--c-muted)' }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className="auth-btn"
            disabled={loading || !username || !password}>
            {loading ? '⏳ 로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-notice">
          {IS_DEV
            ? '개발 환경입니다. 위 테스트 계정을 사용하세요.'
            : <>이 서비스는 클래스보드 사용 권한이 있는<br />선생님만 이용하실 수 있습니다.</>
          }
        </div>
      </div>
    </div>
  )
}
