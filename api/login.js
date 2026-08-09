/**
 * api/login.js
 * 수정: 외부 패키지(jose, jsonwebtoken) 완전 제거
 *       Node.js 내장 crypto 만으로 JWT HS256 직접 구현
 *       → Vercel 서버리스 환경에서 패키지 의존성 오류 없음
 */

import crypto from 'crypto'

/* ── JWT HS256 직접 구현 (외부 패키지 없음) ── */
function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJWT(payload, secret, expiresInHours = 24) {
  const header  = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now     = Math.floor(Date.now() / 1000)
  const body    = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInHours * 3600,
  }))
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${header}.${body}.${sig}`
}

/* ── 핸들러 ── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, msg: '허용되지 않는 메서드' })
  }

  /* ── 환경변수 확인 ── */
  const PHP_AUTH_URL   = process.env.PHP_AUTH_URL
  const PHP_API_SECRET = process.env.PHP_API_SECRET
  const JWT_SECRET     = process.env.JWT_SECRET

  if (!PHP_AUTH_URL || !PHP_API_SECRET || !JWT_SECRET) {
    console.error('[login] 환경변수 누락:', {
      PHP_AUTH_URL:   !!PHP_AUTH_URL,
      PHP_API_SECRET: !!PHP_API_SECRET,
      JWT_SECRET:     !!JWT_SECRET,
    })
    return res.status(500).json({
      ok: false,
      msg: '서버 설정 오류 — Vercel 환경변수를 확인하세요',
    })
  }

  /* ── 요청 파싱 ── */
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: '아이디와 비밀번호를 입력하세요' })
  }

  /* ── PHP 인증 서버 호출 ── */
  let phpResult
  try {
    const phpRes = await fetch(PHP_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': PHP_API_SECRET,
      },
      body: JSON.stringify({ username, password }),
    })

    const rawText = await phpRes.text()
    console.log('[login] PHP 응답 상태:', phpRes.status)
    console.log('[login] PHP 응답 본문:', rawText.slice(0, 300))

    try {
      phpResult = JSON.parse(rawText)
    } catch {
      return res.status(502).json({
        ok: false,
        msg: 'PHP 인증 서버 응답이 올바르지 않습니다. auth.php URL을 확인하세요.',
      })
    }

    if (!phpResult.ok) {
      return res.status(401).json({
        ok: false,
        msg: phpResult.msg || '아이디 또는 비밀번호가 올바르지 않습니다',
      })
    }

  } catch (err) {
    console.error('[login] PHP 연결 오류:', err.message)
    return res.status(502).json({
      ok: false,
      msg: 'PHP 인증 서버에 연결할 수 없습니다: ' + PHP_AUTH_URL,
    })
  }

  /* ── JWT 발급 ── */
  try {
    const payload = {
      id:            phpResult.data.id,
      username:      phpResult.data.username,
      name:          phpResult.data.name,
      nickname:      phpResult.data.nickname || phpResult.data.name,
      role:          phpResult.data.role,
      is_classboard: phpResult.data.is_classboard,
      school_name:   phpResult.data.school_name,
      class_name:    phpResult.data.class_name,
    }

    const token = signJWT(payload, JWT_SECRET, 24)
    return res.status(200).json({ ok: true, token, user: payload })

  } catch (err) {
    console.error('[login] JWT 오류:', err.message)
    return res.status(500).json({ ok: false, msg: 'JWT 생성 실패' })
  }
}
