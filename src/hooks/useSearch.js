/**
 * hooks/useSearch.js
 * 링크 보드용 검색 + 카테고리 필터 상태 훅
 */
import { useState, useMemo } from 'react';
import { filterLinks } from '../utils/helpers';

/**
 * @param {import('../types').LinkItem[]} links
 */
export function useSearch(links = []) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(
    () => filterLinks(links, query, category),
    [links, query, category]
  );

  const categories = useMemo(() => {
    return ['all', ...new Set(links.map((l) => l.category))];
  }, [links]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    filtered,
    categories,
  };
}
