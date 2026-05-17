/**
 * utils/seedData.js
 * 초기 샘플 데이터. 실제 서비스에서는 API 응답으로 교체합니다.
 */

/** @returns {import('../types').Board[]} */
export function getSeedBoards() {
  return [
    {
      id: 'b1',
      type: 'columns',
      name: '📌 프로젝트 관리',
      desc: '개발 프로젝트 진행 현황 칸반 보드',
      color: '#6C63FF',
      createdAt: '2025-05-01',
      columns: [
        {
          id: 'c1',
          name: '아이디어',
          color: '#6C63FF',
          posts: [
            {
              id: 'p1',
              title: 'AI 기반 스마트 검색',
              content: '자연어로 보드/게시물을 검색할 수 있는 시스템. OpenAI Embeddings 활용 예정.',
              tags: ['AI', '검색', '기획'],
              createdAt: '2025-05-02',
            },
            {
              id: 'p2',
              title: '다크모드 지원',
              content: '시스템 설정에 따라 자동 전환되는 다크모드. CSS 변수 기반으로 구현.',
              tags: ['UI', '접근성'],
              createdAt: '2025-05-03',
            },
          ],
        },
        {
          id: 'c2',
          name: '진행 중',
          color: '#FFD166',
          posts: [
            {
              id: 'p3',
              title: '사용자 인증 시스템',
              content: 'OAuth 2.0 기반 소셜 로그인. Google·Kakao 지원 예정. JWT 토큰 방식.',
              tags: ['인증', '백엔드'],
              createdAt: '2025-05-04',
            },
          ],
        },
        {
          id: 'c3',
          name: '완료',
          color: '#43C59E',
          posts: [
            {
              id: 'p4',
              title: '메인 페이지 UI 시안',
              content: 'Figma 기반 UI 시안 완성 및 개발팀 전달 완료.',
              tags: ['디자인'],
              createdAt: '2025-04-28',
            },
          ],
        },
        {
          id: 'c4',
          name: '보류',
          color: '#FF6584',
          posts: [],
        },
      ],
    },
    {
      id: 'b2',
      type: 'columns',
      name: '📚 학습 노트',
      desc: '공부한 내용 정리 보드',
      color: '#43C59E',
      createdAt: '2025-04-20',
      columns: [
        {
          id: 'c5',
          name: '오늘 배운 것',
          color: '#43C59E',
          posts: [
            {
              id: 'p5',
              title: 'React 18 Concurrent Mode',
              content: 'useTransition, Suspense를 활용한 성능 최적화 패턴 학습 완료.',
              tags: ['React', '성능'],
              createdAt: '2025-05-15',
            },
          ],
        },
        {
          id: 'c6',
          name: '복습 필요',
          color: '#FFD166',
          posts: [],
        },
        {
          id: 'c7',
          name: '완전 이해',
          color: '#6C63FF',
          posts: [
            {
              id: 'p6',
              title: 'CSS Grid 완전 정복',
              content: 'grid-template-areas, auto-fill vs auto-fit 차이점 정리.',
              tags: ['CSS'],
              createdAt: '2025-05-10',
            },
          ],
        },
      ],
    },
    {
      id: 'b3',
      type: 'columns',
      name: '🎯 팀 회의록',
      desc: '주간 회의 내용 기록',
      color: '#FF6584',
      createdAt: '2025-05-10',
      columns: [
        { id: 'c8', name: '5월 1주', color: '#6C63FF', posts: [] },
        { id: 'c9', name: '5월 2주', color: '#43C59E', posts: [] },
      ],
    },
    {
      id: 'b4',
      type: 'links',
      name: '🌐 개발 리소스',
      desc: '유용한 개발 사이트 모음',
      color: '#118AB2',
      createdAt: '2025-04-15',
      links: [
        {
          id: 'l1',
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          desc: '웹 표준 기술 공식 문서. HTML, CSS, JavaScript 레퍼런스의 가장 신뢰할 수 있는 소스.',
          category: '개발',
          importance: '매우중요',
          tags: ['HTML', 'CSS', 'JavaScript', '공식문서'],
          emoji: '📖',
          createdAt: '2025-04-16',
        },
        {
          id: 'l2',
          title: 'GitHub',
          url: 'https://github.com',
          desc: '세계 최대 코드 호스팅 플랫폼. 오픈소스 탐색 및 팀 협업.',
          category: '개발',
          importance: '중요',
          tags: ['Git', '협업', '오픈소스'],
          emoji: '🐙',
          createdAt: '2025-04-16',
        },
        {
          id: 'l3',
          title: 'CSS-Tricks',
          url: 'https://css-tricks.com',
          desc: 'CSS 관련 팁, 트릭, 튜토리얼이 가득한 웹 디자인 커뮤니티.',
          category: '개발',
          importance: '보통',
          tags: ['CSS', '튜토리얼'],
          emoji: '🎨',
          createdAt: '2025-04-17',
        },
        {
          id: 'l4',
          title: 'Figma',
          url: 'https://figma.com',
          desc: '협업 기반 UI/UX 디자인 도구. 실시간 공동 편집 지원.',
          category: '디자인',
          importance: '중요',
          tags: ['디자인', 'UI', '협업'],
          emoji: '✏️',
          createdAt: '2025-04-18',
        },
        {
          id: 'l5',
          title: 'Can I Use',
          url: 'https://caniuse.com',
          desc: '브라우저 호환성 확인 도구. CSS/JS 기능의 지원 현황을 한눈에.',
          category: '개발',
          importance: '보통',
          tags: ['호환성', '브라우저'],
          emoji: '🔍',
          createdAt: '2025-04-19',
        },
      ],
    },
    {
      id: 'b5',
      type: 'links',
      name: '📰 테크 뉴스',
      desc: 'IT·테크 뉴스 모음',
      color: '#F77F00',
      createdAt: '2025-05-05',
      links: [
        {
          id: 'l6',
          title: 'Hacker News',
          url: 'https://news.ycombinator.com',
          desc: '스타트업, 개발, 과학 관련 최신 뉴스와 토론의 장.',
          category: '뉴스',
          importance: '중요',
          tags: ['테크', '스타트업', '커뮤니티'],
          emoji: '📡',
          createdAt: '2025-05-05',
        },
        {
          id: 'l7',
          title: 'The Verge',
          url: 'https://theverge.com',
          desc: '기술, 과학, 문화를 다루는 멀티미디어 테크 미디어.',
          category: '뉴스',
          importance: '보통',
          tags: ['테크뉴스', '미디어'],
          emoji: '⚡',
          createdAt: '2025-05-06',
        },
      ],
    },
  ];
}
