/**
 * utils/linkify.js
 * 텍스트 내 URL을 감지해 클릭 가능한 링크로 변환
 */

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g

/**
 * 텍스트를 파싱해 [{type:'text'|'link', value}] 배열로 반환
 */
export function parseLinks(text = '') {
  const parts = []
  let last = 0
  let match

  URL_REGEX.lastIndex = 0
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', value: text.slice(last, match.index) })
    }
    parts.push({ type: 'link', value: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) })
  }
  return parts
}

/**
 * URL인지 확인
 */
export function isValidUrl(str = '') {
  try { return ['http:', 'https:'].includes(new URL(str).protocol) }
  catch { return false }
}
