# 🗂️ Boarda — 지식 정리 & 링크 관리 서비스

## 📁 프로젝트 구조

```
boarda/
├── public/
├── src/
│   ├── main.jsx                # 앱 진입점
│   ├── App.jsx                 # 루트 (라우팅 + 전역 모달)
│   ├── index.css
│   │
│   ├── styles/                 # CSS — 역할별 파일 분리
│   │   ├── globals.css         # CSS 변수, 리셋
│   │   ├── components.css      # 버튼, 폼, 뱃지, 모달, 토스트
│   │   ├── sidebar.css
│   │   ├── topbar.css
│   │   ├── board.css
│   │   ├── home.css
│   │   ├── columns.css
│   │   └── links.css
│   │
│   ├── types/index.js          # JSDoc 타입 정의
│   ├── utils/
│   │   ├── helpers.js          # 순수 함수 유틸
│   │   └── seedData.js         # 샘플 데이터
│   │
│   ├── store/
│   │   └── useBoardStore.js    # Zustand 전역 스토어 (모든 CRUD)
│   │
│   ├── hooks/
│   │   ├── useModal.js         # 모달 상태 훅
│   │   └── useSearch.js        # 검색 + 필터 훅
│   │
│   ├── components/
│   │   ├── common/             # Button, Badge, Modal, EmptyState,
│   │   │                       # Sidebar, Topbar, ToastContainer
│   │   ├── board/              # BoardCard
│   │   ├── columns/            # ColumnCard, PostCard
│   │   ├── links/              # LinkCard, LinksToolbar
│   │   └── modals/             # CreateBoardModal, AddPostModal,
│   │                           # AddLinkModal, ShareModal
│   │
│   └── pages/
│       ├── HomePage.jsx
│       ├── BoardListPage.jsx
│       ├── BoardDetailPage.jsx
│       ├── ColumnsBoardView.jsx
│       └── LinksBoardView.jsx
│
├── vite.config.js
└── README.md
```

## 🚀 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 미리보기
```

## 📦 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| UI | React 19 + Vite |
| 라우팅 | react-router-dom v7 |
| 상태 관리 | Zustand |
| 폰트 | Nunito + Noto Sans KR |
| DnD (준비됨) | @hello-pangea/dnd |

## 🔧 향후 확장 포인트

- **새 보드 타입**: `components/` 폴더 추가 → `BoardDetailPage.jsx` 분기 추가
- **백엔드 연동**: `useBoardStore.js` 각 액션에 API 호출 추가
- **드래그앤드롭**: `@hello-pangea/dnd` 이미 설치됨 — `ColumnsBoardView.jsx`에 적용
- **공유 편집**: `ShareModal.jsx` 편집 토글 활성화 + WebSocket/Supabase 연동
- **TypeScript**: `types/index.js` → `.ts`, `.jsx` → `.tsx` 교체
