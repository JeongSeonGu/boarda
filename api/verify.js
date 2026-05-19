/**
 * api/verify.js — Vercel Serverless Function
 * 수정: jsonwebtoken → jose 교체
 */

import { jwtVerify } from 'jose'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    return res.status(500).json({ ok: false, msg: 'JWT_SECRET 환경변수 누락' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ ok: false, msg: '토큰 없음' })

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secretKey)
    return res.status(200).json({ ok: true, user: payload })
  } catch {
    return res.status(401).json({ ok: false, msg: '만료되었거나 유효하지 않은 토큰' })
  }
}
