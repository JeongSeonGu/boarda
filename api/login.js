/**
 * api/login.js — Vercel Serverless Function
 * 수정: jsonwebtoken(CJS) → jose(ESM) 교체, 환경변수 누락 처리 강화
 */

import { SignJWT } from 'jose'

export default async function handler(req, res) {
  /* ── CORS ── */
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
      msg: '서버 설정 오류 — Vercel 환경변수를 확인하세요 (PHP_AUTH_URL, PHP_API_SECRET, JWT_SECRET)',
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

    /* PHP 서버가 HTML 오류 페이지를 반환하는 경우 처리 */
    try {
      phpResult = JSON.parse(rawText)
    } catch {
      console.error('[login] PHP 서버 응답이 JSON이 아님:', rawText.slice(0, 200))
      return res.status(502).json({
        ok: false,
        msg: 'PHP 인증 서버 응답 오류 — auth.php 파일과 URL을 확인하세요',
      })
    }

    if (!phpRes.ok || !phpResult.ok) {
      return res.status(401).json({
        ok: false,
        msg: phpResult?.msg || '아이디 또는 비밀번호가 올바르지 않습니다',
      })
    }

  } catch (err) {
    console.error('[login] PHP 서버 연결 오류:', err.message)
    return res.status(502).json({
      ok: false,
      msg: 'PHP 인증 서버에 연결할 수 없습니다 — URL을 확인하세요: ' + PHP_AUTH_URL,
    })
  }

  /* ── JWT 발급 (jose 라이브러리, ESM 완전 호환) ── */
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const payload   = {
      id:            phpResult.data.id,
      username:      phpResult.data.username,
      name:          phpResult.data.name,
      nickname:      phpResult.data.nickname || phpResult.data.name,
      role:          phpResult.data.role,
      is_classboard: phpResult.data.is_classboard,
      school_name:   phpResult.data.school_name,
      class_name:    phpResult.data.class_name,
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey)

    return res.status(200).json({ ok: true, token, user: payload })

  } catch (err) {
    console.error('[login] JWT 발급 오류:', err.message)
    return res.status(500).json({ ok: false, msg: 'JWT 발급 실패' })
  }
}
