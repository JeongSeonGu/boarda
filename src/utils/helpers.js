/** utils/helpers.js — 수정: today() export 추가 */

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
export function today() {
  return new Date().toISOString().slice(0, 10)
}
export function parseTags(raw = '') {
  return raw.split(',').map((t) => t.trim()).filter(Boolean)
}
export function getHostname(url = '') {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0] }
}
const CATEGORY_EMOJI = { 개발:'💻', 디자인:'🎨', 비즈니스:'💼', 학습:'📚', 도구:'🔧', 뉴스:'📰', 기타:'🔗' }
export function categoryEmoji(cat) { return CATEGORY_EMOJI[cat] ?? '🔗' }
export function importanceBadgeClass(importance) {
  return { 매우중요:'badge-pink', 중요:'badge-amber', 보통:'badge-gray', 나중에:'badge-blue' }[importance] ?? 'badge-gray'
}
const COLUMN_COLORS = ['#6C63FF','#FFD166','#43C59E','#FF6584','#118AB2','#F77F00']
export function nextColumnColor(index) { return COLUMN_COLORS[index % COLUMN_COLORS.length] }
const TAG_CLASSES = ['badge-purple','badge-green','badge-blue','badge-amber','badge-pink']
export function tagBadgeClass(index) { return TAG_CLASSES[index % TAG_CLASSES.length] }
export function matchSearch(text = '', query = '') {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}
export function filterLinks(links = [], query = '', category = 'all') {
  return links.filter((link) => {
    const inCategory = category === 'all' || link.category === category
    if (!inCategory) return false
    if (!query) return true
    return matchSearch(link.title, query) || matchSearch(link.desc, query) ||
      link.tags.some((t) => matchSearch(t, query))
  })
}
export function relativeDate(dateStr = '') {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return dateStr
}
/** 파일 크기 표시 */
export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
