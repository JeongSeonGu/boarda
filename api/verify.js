/**
 * api/verify.js
 * 수정: 외부 패키지 제거, Node.js 내장 crypto 로 JWT 검증
 */

import crypto from 'crypto'

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function verifyJWT(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('토큰 형식 오류')

  const [header, body, sig] = parts
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (sig !== expected) throw new Error('서명 불일치')

  const payload = JSON.parse(Buffer.from(body, 'base64').toString())
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('토큰 만료')

  return payload
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) return res.status(500).json({ ok: false, msg: 'JWT_SECRET 누락' })

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ ok: false, msg: '토큰 없음' })

  try {
    const payload = verifyJWT(token, JWT_SECRET)
    return res.status(200).json({ ok: true, user: payload })
  } catch (err) {
    return res.status(401).json({ ok: false, msg: err.message })
  }
}
