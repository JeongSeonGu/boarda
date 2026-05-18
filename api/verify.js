/**
 * api/verify.js
 * Vercel Serverless Function — JWT 토큰 검증
 * 앱 새로고침 시 토큰 유효성 재확인용
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ ok: false })

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) return res.status(401).json({ ok: false, msg: '토큰 없음' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return res.status(200).json({ ok: true, user: decoded })
  } catch {
    return res.status(401).json({ ok: false, msg: '만료되었거나 유효하지 않은 토큰' })
  }
}
