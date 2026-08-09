/**
 * utils/boardBackground.js
 * 수정: bg_opacity 지원 추가
 */
export function getBoardBgStyle(board) {
  if (!board) return {}
  const bgImage   = board.bg_image
  const bgColor   = board.bg_color || '#F7F8FC'
  const opacity   = board.bg_opacity ?? 1.0

  if (!bgImage || bgImage === 'none') {
    return { background: bgColor }
  }

  /* 패턴 */
  if (bgImage === 'dots') {
    return {
      backgroundColor: bgColor,
      backgroundImage: 'radial-gradient(circle, #c8c8e0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }
  }
  if (bgImage === 'grid') {
    return {
      backgroundColor: bgColor,
      backgroundImage: `linear-gradient(rgba(108,99,255,.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(108,99,255,.08) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
    }
  }
  if (bgImage === 'wave') {
    return {
      backgroundColor: bgColor,
      backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 10px,
                        rgba(108,99,255,.06) 10px,rgba(108,99,255,.06) 11px)`,
    }
  }

  /* URL 이미지 → pseudo overlay 로 투명도 적용 */
  return {
    position: 'relative',
    '--board-bg-url':     `url(${bgImage})`,
    '--board-bg-opacity': opacity,
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'local',
  }
}

/**
 * 이미지 배경에 투명도 오버레이 CSS (::before 대신 래퍼 div 사용)
 */
export function getBgOverlayStyle(board) {
  const bgImage = board?.bg_image
  if (!bgImage || ['none','dots','grid','wave'].includes(bgImage)) return null
  const opacity = board?.bg_opacity ?? 1.0
  return {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity,
    pointerEvents: 'none',
  }
}
