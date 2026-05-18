/**
 * api/login.js
 * Vercel Serverless Function — 로그인 엔드포인트
 *
 * 역할:
 *  1. React 앱에서 { username, password } 수신
 *  2. PHP API(future-class.kr)에 검증 요청 → MySQL school_users + school_teachers JOIN
 *  3. 검증 성공 시 JWT 발급 → 클라이언트에 반환
 *
 * 보안:
 *  - PHP_API_SECRET, JWT_SECRET 은 Vercel 환경변수에만 존재 (git에 없음)
 *  - DB 접근 정보는 PHP 서버에만 존재 (이 파일에는 없음)
 *  - bcrypt 검증은 PHP 서버에서 수행
 */

import jwt from 'jsonwebtoken'

const PHP_AUTH_URL = process.env.PHP_AUTH_URL   // 예: https://future-class.kr/boarda/auth.php
const PHP_API_SECRET = process.env.PHP_API_SECRET  // PHP ↔ Vercel 공유 시크릿
const JWT_SECRET = process.env.JWT_SECRET           // JWT 서명 키

export default async function handler(req, res) {
  /* CORS 헤더 */
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ ok: false, msg: '허용되지 않는 메서드' })

  const { username, password } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: '아이디와 비밀번호를 입력하세요' })
  }

  try {
    /* PHP API 서버에 인증 요청 */
    const phpRes = await fetch(PHP_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': PHP_API_SECRET,   // PHP 서버가 이 키로 요청 출처 검증
      },
      body: JSON.stringify({ username, password }),
    })

    if (!phpRes.ok) {
      return res.status(502).json({ ok: false, msg: '인증 서버 오류' })
    }

    const result = await phpRes.json()

    if (!result.ok) {
      return res.status(401).json({ ok: false, msg: result.msg || '아이디 또는 비밀번호가 올바르지 않습니다' })
    }

    /* JWT 발급 (24시간) */
    const payload = {
      id:       result.data.id,
      username: result.data.username,
      name:     result.data.name,
      role:     result.data.role,           // 'admin' | 'teacher'
      is_classboard: result.data.is_classboard,
      nickname: result.data.nickname || result.data.name,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

    return res.status(200).json({
      ok: true,
      token,
      user: payload,
    })

  } catch (err) {
    console.error('[login] 오류:', err)
    return res.status(500).json({ ok: false, msg: '서버 내부 오류' })
  }
}
