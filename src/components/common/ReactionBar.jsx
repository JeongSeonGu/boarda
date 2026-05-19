/**
 * components/common/ReactionBar.jsx
 * 게시물별 반응 바 (좋아요 / 별점)
 * - reactionType: 'like' | 'star' | 'none'
 * - itemId: 게시물/링크 id
 * - boardId: 보드 id
 * - readOnly: 공유 보기 모드
 */
import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { genId } from '../../utils/helpers'
import '../../styles/boardSettings.css'

/* 이 기기/세션의 식별자 (로그인 없는 공유 사용자용) */
function getIdent() {
  try {
    let id = localStorage.getItem('boarda_ident')
    if (!id) { id = genId('u'); localStorage.setItem('boarda_ident', id) }
    return id
  } catch { return 'anon' }
}

export default function ReactionBar({ boardId, itemId, itemType = 'post', reactionType }) {
  const [myReaction,  setMyReaction]  = useState(null)   // like: bool, star: 1~5
  const [likeCount,   setLikeCount]   = useState(0)
  const [starAvg,     setStarAvg]     = useState(0)
  const [starCount,   setStarCount]   = useState(0)
  const [loading,     setLoading]     = useState(false)
  const ident = getIdent()

  /* 반응 데이터 로드 */
  useEffect(() => {
    if (!boardId || !itemId || reactionType === 'none') return
    loadReactions()
  }, [boardId, itemId, reactionType])

  async function loadReactions() {
    const { data } = await supabase
      .from('board_reactions')
      .select('*')
      .eq('board_id', boardId)
      .eq('item_id', itemId)

    if (!data) return

    if (reactionType === 'like') {
      setLikeCount(data.filter((r) => r.reaction === 'like').length)
      setMyReaction(data.some((r) => r.user_ident === ident && r.reaction === 'like'))
    } else if (reactionType === 'star') {
      const stars = data.filter((r) => r.reaction === 'star')
      setStarCount(stars.length)
      setStarAvg(stars.length ? stars.reduce((s, r) => s + r.value, 0) / stars.length : 0)
      const mine = data.find((r) => r.user_ident === ident && r.reaction === 'star')
      setMyReaction(mine ? mine.value : 0)
    }
  }

  /* 좋아요 토글 */
  async function toggleLike() {
    if (loading) return
    setLoading(true)
    if (myReaction) {
      await supabase.from('board_reactions').delete()
        .eq('board_id', boardId).eq('item_id', itemId).eq('user_ident', ident)
      setLikeCount((c) => Math.max(0, c - 1))
      setMyReaction(false)
    } else {
      await supabase.from('board_reactions').upsert({
        id: genId('r'), board_id: boardId, item_id: itemId,
        item_type: itemType, user_ident: ident, reaction: 'like', value: 1,
      }, { onConflict: 'board_id,item_id,user_ident' })
      setLikeCount((c) => c + 1)
      setMyReaction(true)
    }
    setLoading(false)
  }

  /* 별점 등록 */
  async function rateStar(value) {
    if (loading) return
    setLoading(true)
    const isRemove = myReaction === value
    if (isRemove) {
      await supabase.from('board_reactions').delete()
        .eq('board_id', boardId).eq('item_id', itemId).eq('user_ident', ident)
      setMyReaction(0)
    } else {
      await supabase.from('board_reactions').upsert({
        id: genId('r'), board_id: boardId, item_id: itemId,
        item_type: itemType, user_ident: ident, reaction: 'star', value,
      }, { onConflict: 'board_id,item_id,user_ident' })
      setMyReaction(value)
    }
    setLoading(false)
    await loadReactions()
  }

  if (reactionType === 'none') return null

  /* 좋아요 */
  if (reactionType === 'like') {
    return (
      <div className="reaction-bar">
        <button
          className={`reaction-btn ${myReaction ? 'active' : ''}`}
          onClick={toggleLike}
          disabled={loading}
        >
          👍 <span className="reaction-count">{likeCount}</span>
        </button>
      </div>
    )
  }

  /* 별점 */
  if (reactionType === 'star') {
    return (
      <div className="reaction-bar">
        <div className="star-row">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              className={`star-btn ${n <= (myReaction || 0) ? 'filled' : ''}`}
              onClick={() => rateStar(n)}
              disabled={loading}
              title={`${n}점`}
            >★</button>
          ))}
        </div>
        {starCount > 0 && (
          <span style={{ fontSize: 12, color: 'var(--c-muted)', marginLeft: 4 }}>
            {starAvg.toFixed(1)}점 ({starCount}명)
          </span>
        )}
      </div>
    )
  }

  return null
}
