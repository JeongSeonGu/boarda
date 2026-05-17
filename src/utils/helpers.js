/**
 * utils/helpers.js
 * 순수 함수 유틸리티 모음 — 사이드이펙트 없음
 */

/** 고유 ID 생성 */
export function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** 쉼표로 구분된 문자열 → 태그 배열 */
export function parseTags(raw = '') {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** URL에서 호스트명만 추출 */
export function getHostname(url = '') {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  }
}

/** 분류 → 이모지 매핑 */
const CATEGORY_EMOJI = {
  개발: '💻',
  디자인: '🎨',
  비즈니스: '💼',
  학습: '📚',
  도구: '🔧',
  뉴스: '📰',
  기타: '🔗',
};
export function categoryEmoji(cat) {
  return CATEGORY_EMOJI[cat] ?? '🔗';
}

/** 중요도 → 뱃지 클래스 */
export function importanceBadgeClass(importance) {
  const map = {
    매우중요: 'badge-pink',
    중요: 'badge-amber',
    보통: 'badge-gray',
    나중에: 'badge-blue',
  };
  return map[importance] ?? 'badge-gray';
}

/** 순환 색상 팔레트 (컬럼용) */
const COLUMN_COLORS = ['#6C63FF', '#FFD166', '#43C59E', '#FF6584', '#118AB2', '#F77F00'];
export function nextColumnColor(index) {
  return COLUMN_COLORS[index % COLUMN_COLORS.length];
}

/** 태그 인덱스 → 뱃지 클래스 */
const TAG_CLASSES = ['badge-purple', 'badge-green', 'badge-blue', 'badge-amber', 'badge-pink'];
export function tagBadgeClass(index) {
  return TAG_CLASSES[index % TAG_CLASSES.length];
}

/** 문자열 검색 (대소문자 무시) */
export function matchSearch(text = '', query = '') {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

/** 링크 목록 검색 필터 */
export function filterLinks(links = [], query = '', category = 'all') {
  return links.filter((link) => {
    const inCategory = category === 'all' || link.category === category;
    if (!inCategory) return false;
    if (!query) return true;
    return (
      matchSearch(link.title, query) ||
      matchSearch(link.desc, query) ||
      link.tags.some((t) => matchSearch(t, query))
    );
  });
}

/** 날짜 포맷 (상대) */
export function relativeDate(dateStr = '') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7) return `${diff}일 전`;
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`;
  return dateStr;
}
