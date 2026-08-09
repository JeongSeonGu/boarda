# Boarda — 프로젝트 인수인계 문서

> **목적**: 이 문서는 AI 서비스를 활용한 지속적 개발을 위해 작성된 프로젝트 전체 현황 문서입니다.  
> 새로운 AI 대화 세션에서 이 문서를 먼저 제공하면 기존 개발 맥락을 이어받아 개발을 계속할 수 있습니다.  
> **최종 업데이트**: 2026년 5월 기준

---

## 1. 프로젝트 개요

### 서비스명
**Boarda** — Padlet 스타일의 지식 정리 & 링크 관리 & 협업 보드 서비스

### 서비스 목적
- 선생님(교사)이 보드를 생성하여 정보를 정리하고 공유하는 플랫폼
- 컬럼 보드(칸반), 링크 보드(북마크), 담벼락(포스트잇) 세 가지 보드 타입 제공
- 공유 링크를 통해 학생 또는 외부인이 읽기 전용 또는 편집 참여 가능

### 서비스 대상
- **작성자**: `school_users` + `school_teachers` DB에 등록된 교사 (is_classboard=1 권한 필요)
- **공유 접근자**: 공유 링크를 받은 누구나 (비밀번호, 권한 설정에 따라 다름)

### 배포 환경
| 항목 | 내용 |
|------|------|
| 프론트엔드 배포 | Vercel (자동 배포, GitHub 연동) |
| 도메인 | `https://board.future-class.kr` |
| DB | Supabase (PostgreSQL) |
| 파일 스토리지 | Supabase Storage (`boarda-files` 버킷, Public) |
| 인증 PHP 서버 | `https://future-class.kr/boarda/auth.php` |
| GitHub 저장소 | `https://github.com/JeongSeonGu/boarda` |

---

## 2. 기술 스택

### 프론트엔드
```
React 19 + Vite
react-router-dom v7       — SPA 라우팅
zustand v5               — 전역 상태 관리
@hello-pangea/dnd v18    — 드래그앤드롭 (컬럼/카드/링크/담벼락)
@supabase/supabase-js    — DB & Storage
```

### 백엔드 (서버리스)
```
Vercel Serverless Functions (api/ 폴더)
  api/login.js   — JWT 발급 (PHP 서버 중계)
  api/verify.js  — JWT 검증
Node.js 내장 crypto 로 JWT HS256 직접 구현 (외부 패키지 불필요)
```

### 인증 서버 (PHP)
```
future-class.kr 서버에 직접 배포 (git 제외)
php-server/auth.php  — bcrypt 검증, school_users + school_teachers JOIN
```

---

## 3. 환경 변수

### Vercel 환경변수 (Settings → Environment Variables)
```
VITE_SUPABASE_URL       = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY  = eyJ...
PHP_AUTH_URL            = https://future-class.kr/boarda/auth.php
PHP_API_SECRET          = ca65e1b3c2c434aba28d438531bbfb23a6eb3f4ca981f93c0ad2b60a6855c009
JWT_SECRET              = 6IVhCd24IyKFoF3064r3Nc8OxZGEmlzkX7Yxjawc56VfIKfw4dMZtFmF3FTIbe_I
```

### 로컬 개발 (.env 파일 — git 제외)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> 로컬에서는 `import.meta.env.DEV === true` 이므로 목업 로그인이 자동 활성화됨.  
> 목업 계정: `admin/admin123`, `teacher/teacher123`, `teacher2/teacher123`

---

## 4. 프로젝트 폴더 구조

```
boarda/
├── api/                          # Vercel 서버리스 함수
│   ├── login.js                  # 로그인 JWT 발급
│   └── verify.js                 # JWT 재검증
│
├── php-server/                   # PHP 인증 서버 (git 제외, FTP 직접 배포)
│   ├── auth.php                  # 실제 인증 처리
│   └── auth_test.php             # 서버 환경 진단용 (배포 후 삭제)
│
├── src/
│   ├── main.jsx                  # 앱 진입점
│   ├── App.jsx                   # 라우팅 + 인증 가드 + 전역 모달
│   ├── index.css                 # 전역 기본 CSS
│   │
│   ├── styles/                   # CSS — 역할별 분리
│   │   ├── globals.css           # CSS 변수, 리셋, 폰트
│   │   ├── components.css        # 버튼, 폼, 뱃지, 모달, 토스트
│   │   ├── sidebar.css           # 사이드바
│   │   ├── topbar.css            # 상단바
│   │   ├── board.css             # 보드 카드, 상세 헤더 공통
│   │   ├── home.css              # 홈페이지
│   │   ├── columns.css           # 컬럼 보드
│   │   ├── links.css             # 링크 보드
│   │   ├── wall.css              # 담벼락
│   │   ├── auth.css              # 로그인 페이지
│   │   └── boardSettings.css     # 보드 설정, 공유, 반응 UI
│   │
│   ├── types/
│   │   └── index.js              # JSDoc 타입 정의
│   │
│   ├── utils/
│   │   ├── helpers.js            # 순수 함수 유틸 (ID 생성, 날짜, 태그, 색상)
│   │   ├── supabase.js           # Supabase 클라이언트 초기화
│   │   ├── seedData.js           # 초기 샘플 데이터 (현재 미사용, DB 연동 후)
│   │   ├── boardBackground.js    # 보드 배경 스타일 계산 (색상/이미지/투명도)
│   │   ├── imageUtils.js         # 이미지 리사이즈 (1024×768, canvas 기반)
│   │   └── linkify.js            # 텍스트 내 URL 자동 감지
│   │
│   ├── store/
│   │   ├── useBoardStore.js      # 보드/컬럼/게시물/링크/담벼락 전체 CRUD + 정렬
│   │   └── useAuthStore.js       # 인증 상태 (JWT, 로그인/로그아웃, 권한 헬퍼)
│   │
│   ├── hooks/
│   │   ├── useModal.js           # 모달 open/close/data 상태 훅
│   │   └── useSearch.js          # 링크 보드 검색 + 카테고리 필터 훅
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx        # 재사용 버튼
│   │   │   ├── Badge.jsx         # 뱃지
│   │   │   ├── Modal.jsx         # 모달 래퍼 (ESC, 외부클릭 닫기)
│   │   │   ├── EmptyState.jsx    # 빈 상태 표시
│   │   │   ├── Sidebar.jsx       # 사이드바 (접기/펼치기, 공유 뱃지)
│   │   │   ├── Topbar.jsx        # 상단바 (검색, 사용자 배지, 로그아웃)
│   │   │   ├── ToastContainer.jsx # 토스트 알림
│   │   │   ├── FileAttachment.jsx # 파일 업로드(진행률) + 링크 첨부 + 다운로드
│   │   │   ├── LinkifiedText.jsx  # 텍스트 내 URL 자동 링크 변환
│   │   │   ├── ReactionBar.jsx    # 좋아요/별점 반응 바
│   │   │   └── SharedEditNameGate.jsx # 편집 공유 시 실명 입력 오버레이
│   │   │
│   │   ├── board/
│   │   │   ├── BoardCard.jsx     # 보드 목록 카드 (모든 타입 지원)
│   │   │   └── BoardHeader.jsx   # 보드 상세 공통 헤더 (공유·설정 버튼 포함)
│   │   │
│   │   ├── columns/
│   │   │   ├── ColumnCard.jsx    # 컬럼 카드 (DnD 지원)
│   │   │   └── PostCard.jsx      # 게시물 카드 (링크 자동 감지, 반응 바)
│   │   │
│   │   ├── links/
│   │   │   ├── LinkCard.jsx      # 링크 카드 (grid/list 모드, 이동 버튼, 반응 바)
│   │   │   └── LinksToolbar.jsx  # 링크 보드 검색 + 필터 + 뷰 토글
│   │   │
│   │   ├── wall/
│   │   │   ├── WallPostCard.jsx  # 담벼락 포스트잇 (자유 드래그, 격자 모드, z_order)
│   │   │   └── WallPostModal.jsx # 담벼락 메모 추가/수정 모달
│   │   │
│   │   └── modals/
│   │       ├── CreateBoardModal.jsx  # 보드 생성 (컬럼/링크/담벼락 선택)
│   │       ├── AddPostModal.jsx      # 게시물 추가 (파일 첨부, 작성자 표시)
│   │       ├── PostDetailModal.jsx   # 게시물 상세보기 + 수정 (권한 체크)
│   │       ├── AddLinkModal.jsx      # 링크 추가 (파일 첨부, 작성자 표시)
│   │       ├── EditLinkModal.jsx     # 링크 수정 (권한 체크)
│   │       ├── ShareModal.jsx        # 공유 설정 (공개모드, QR, 비밀번호, 편집공유)
│   │       └── BoardSettingsModal.jsx # 보드 설정 (제목, 배경, 투명도, 반응 타입)
│   │
│   └── pages/
│       ├── LoginPage.jsx         # 로그인 페이지 (개발모드 빠른 로그인 포함)
│       ├── HomePage.jsx          # 홈 (히어로, 빠른 시작, 최근 보드)
│       ├── BoardListPage.jsx     # 보드 목록 (타입별: columns/links/wall)
│       ├── BoardDetailPage.jsx   # 보드 상세 라우터 (타입 분기)
│       ├── ColumnsBoardView.jsx  # 컬럼 보드 뷰 (DnD 컬럼/카드 이동)
│       ├── LinksBoardView.jsx    # 링크 보드 뷰 (DnD 순서 변경)
│       ├── WallBoardView.jsx     # 담벼락 뷰 (자유 모드 / 격자 모드 토글)
│       ├── SharedBoardPage.jsx   # 공유 페이지 (비밀번호, 읽기/편집, 상세 모달)
│       └── SharedListPage.jsx    # 공유 중인 보드 목록 + 공유 해제
│
├── vercel.json                   # SPA 라우팅 rewrite 설정
├── vite.config.js
├── package.json
└── .gitignore                    # php-server/, .env 제외
```

---

## 5. Supabase 데이터베이스 스키마

### 5-1. boards
```sql
CREATE TABLE boards (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL CHECK (type IN ('columns','links','wall')),
  name           TEXT NOT NULL,
  description    TEXT DEFAULT '',
  color          TEXT DEFAULT '#6C63FF',
  author         TEXT DEFAULT '익명',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 공유 설정
  is_public      BOOLEAN DEFAULT FALSE,
  share_mode     TEXT DEFAULT 'private',  -- 'private' | 'login_only' | 'public'
  share_password TEXT DEFAULT NULL,
  share_edit     BOOLEAN DEFAULT FALSE,

  -- 배경 설정
  bg_color       TEXT DEFAULT '#F7F8FC',
  bg_image       TEXT DEFAULT NULL,
  bg_image_key   TEXT DEFAULT NULL,       -- Storage 경로 (삭제 시 활용)
  bg_opacity     FLOAT DEFAULT 1.0,

  -- 반응 설정
  reaction_type  TEXT DEFAULT 'none'      -- 'none' | 'like' | 'star'
);
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON boards FOR ALL USING (true);
```

### 5-2. columns
```sql
CREATE TABLE columns (
  id         TEXT PRIMARY KEY,
  board_id   TEXT REFERENCES boards(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6C63FF',
  position   INTEGER DEFAULT 0,
  author     TEXT DEFAULT '익명',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON columns FOR ALL USING (true);
```

### 5-3. posts
```sql
CREATE TABLE posts (
  id          TEXT PRIMARY KEY,
  board_id    TEXT REFERENCES boards(id) ON DELETE CASCADE,
  column_id   TEXT REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  author      TEXT DEFAULT '익명',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON posts FOR ALL USING (true);
```

### 5-4. links
```sql
CREATE TABLE links (
  id          TEXT PRIMARY KEY,
  board_id    TEXT REFERENCES boards(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT DEFAULT '',
  category    TEXT DEFAULT '기타',
  importance  TEXT DEFAULT '보통',       -- '보통' | '중요' | '매우중요' | '나중에'
  tags        TEXT[] DEFAULT '{}',
  emoji       TEXT DEFAULT '🔗',
  attachments JSONB DEFAULT '[]',
  author      TEXT DEFAULT '익명',
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON links FOR ALL USING (true);
```

### 5-5. wall_posts
```sql
CREATE TABLE wall_posts (
  id          TEXT PRIMARY KEY,
  board_id    TEXT REFERENCES boards(id) ON DELETE CASCADE,
  content     TEXT DEFAULT '',
  color       TEXT DEFAULT '#FFF9C4',
  pos_x       FLOAT DEFAULT 0,
  pos_y       FLOAT DEFAULT 0,
  width       INTEGER DEFAULT 200,
  z_order     INTEGER DEFAULT 0,        -- 자유 모드 앞뒤 순서 / 격자 모드 정렬 순서
  attachments JSONB DEFAULT '[]',
  author      TEXT DEFAULT '익명',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON wall_posts FOR ALL USING (true);
```

### 5-6. board_reactions
```sql
CREATE TABLE board_reactions (
  id         TEXT PRIMARY KEY,
  board_id   TEXT REFERENCES boards(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,
  item_type  TEXT NOT NULL,             -- 'post' | 'link' | 'wall'
  user_ident TEXT NOT NULL,             -- localStorage 기반 익명 식별자
  reaction   TEXT NOT NULL,             -- 'like' | 'star'
  value      INTEGER DEFAULT 1,         -- 별점: 1~5, 좋아요: 1
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, item_id, user_ident)
);
ALTER TABLE board_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON board_reactions FOR ALL USING (true);
```

### 5-7. 연동 외부 DB (MySQL — school_users, school_teachers)
```
MySQL DB (future-class.kr 서버)
  school_users    — id, username, password_hash(bcrypt), name, role, teacher_id, is_active
  school_teachers — id, nickname, is_classboard, school_name, grade, class_num, class_name
  두 테이블을 JOIN하여 is_classboard=1 인 사용자만 로그인 허용
```

---

## 6. 인증 흐름

```
[브라우저 React]
  → POST /api/login { username, password }
  
[Vercel api/login.js]
  → POST https://future-class.kr/boarda/auth.php
    헤더: X-API-Secret: {PHP_API_SECRET}
    
[PHP auth.php]
  → MySQL JOIN 조회
  → password_verify(password, password_hash)
  → is_classboard 확인
  → { ok: true, data: { id, username, name, nickname, role, is_classboard, ... } }
  
[Vercel api/login.js]
  → JWT 생성 (Node.js crypto, HS256, 24h 만료)
  → { ok: true, token, user }
  
[브라우저]
  → sessionStorage에 token + user 저장
  → 탭 닫으면 자동 로그아웃
```

### 권한 체계
| 권한 | 조건 |
|------|------|
| 보드 생성/삭제 | 로그인한 사용자 |
| 게시물 수정/삭제 | 작성자 본인 또는 admin 역할 |
| 보드 설정 변경 | 보드 생성자 |
| 공유 페이지 접근 | share_mode에 따라 (private/login_only/public) |
| 공유 페이지 편집 | share_edit=true + 실명 입력 후 |

---

## 7. 라우팅 구조

```
/login                → LoginPage (공개)
/share/:boardId       → SharedBoardPage (공개, 비밀번호 설정 시 게이트)

/* 이하 로그인 필요 (RequireAuth) */
/                     → HomePage
/columns              → BoardListPage (type=columns)
/links                → BoardListPage (type=links)
/wall                 → BoardListPage (type=wall)
/shared               → SharedListPage (공유 중인 보드 목록)
/board/:boardId       → BoardDetailPage → ColumnsBoardView | LinksBoardView | WallBoardView
```

---

## 8. 주요 기능 현황

### 8-1. 보드 타입
| 타입 | 설명 | DnD |
|------|------|-----|
| 컬럼 보드 | 칸반 스타일, 컬럼별 게시물 | 컬럼 좌우 이동 + 카드 컬럼 간 이동 |
| 링크 보드 | 북마크 관리, 그리드/목록 뷰 | 카드 순서 변경 |
| 담벼락 | 포스트잇 자유 배치 | 자유 드래그(위치) + 격자 모드(순서) |

### 8-2. 게시물 공통 기능
- 작성자 이름 표시 (로그인 사용자명 자동 설정)
- 태그 (#태그 형식)
- 파일 첨부 (이미지/동영상/문서, 최대 50MB, 진행률 표시)
- 링크 URL 첨부 (파일 외 URL 직접 추가)
- 텍스트 내 URL 자동 링크 변환 (LinkifiedText)
- 수정/삭제: 작성자 본인 또는 admin만 가능

### 8-3. 보드 설정 (BoardSettingsModal)
- 보드 제목·설명 변경
- 배경색: 프리셋 12종 + 🎨 컬러피커 직접 선택
- 배경이미지: 프리셋 8종 + 직접 업로드 (1024×768 자동 리사이즈)
- 배경 투명도: 슬라이더 (10%~100%)
- 반응 타입: 없음 / 👍좋아요 / ⭐별점(1~5점)

### 8-4. 공유 기능 (ShareModal)
| 설정 | 값 |
|------|-----|
| 공개 범위 | 🔒 비공개 / 👤 로그인 사용자만 / 🌐 누구나 |
| 비밀번호 | 선택적 설정, 공유 접속 시 입력 게이트 |
| QR 코드 | 📱 QR 이미지 표시 및 저장 |
| 편집 공유 | ON 시 실명 입력 후 게시물 추가 가능 |

### 8-5. 공유 페이지 (SharedBoardPage)
- 카드 클릭 시 상세 모달 (읽기 전용) — 컬럼/링크/담벼락 모두
- 첨부파일 다운로드 가능
- 반응(좋아요/별점) 참여 가능
- 편집 공유 활성화 시 실명 입력 후 게시물 추가 가능
- URL·첨부파일명 카드 범위 초과 방지 처리

### 8-6. 사이드바 공유됨 메뉴
- 공유 중인 보드 수 뱃지 표시
- 공유 목록 페이지에서 링크 복사, QR, 공유 해제 가능

---

## 9. Store 함수 목록 (useBoardStore)

### 보드
| 함수 | 설명 |
|------|------|
| `fetchBoards()` | 전체 데이터 로드 (앱 시작 시 호출) |
| `createBoard({type, name, desc, color})` | 보드 생성, ID 반환 |
| `updateBoard(boardId, patch)` | 보드 설정 저장 (배경, 공유설정 등) |
| `deleteBoard(boardId)` | 보드 + Storage 파일 일괄 삭제 |
| `unshareBoard(boardId)` | 공유 해제 (is_public=false) |

### 컬럼
| 함수 | 설명 |
|------|------|
| `addColumn(boardId)` | 컬럼 추가 |
| `renameColumn(boardId, colId, name)` | 이름 변경 |
| `deleteColumn(boardId, colId)` | 컬럼 삭제 |
| `reorderColumns(boardId, orderedColIds)` | DnD 순서 저장 |

### 게시물
| 함수 | 설명 |
|------|------|
| `addPost(boardId, colId, {title, content, tags, attachments})` | 추가 |
| `updatePost(boardId, colId, postId, patch)` | 수정 |
| `deletePost(boardId, colId, postId)` | 삭제 |
| `reorderPosts(boardId, srcColId, dstColId, postId, dstIndex)` | DnD 이동 |

### 링크
| 함수 | 설명 |
|------|------|
| `addLink(boardId, {...})` | 추가 |
| `updateLink(boardId, linkId, patch)` | 수정 |
| `deleteLink(boardId, linkId)` | 삭제 |
| `reorderLinks(boardId, orderedLinkIds)` | DnD 순서 저장 |

### 담벼락
| 함수 | 설명 |
|------|------|
| `addWallPost(boardId, {content, color, attachments})` | 추가 |
| `updateWallPost(boardId, postId, patch)` | 수정 |
| `moveWallPost(boardId, postId, pos_x, pos_y)` | 자유 드래그 위치 저장 |
| `deleteWallPost(boardId, postId)` | 삭제 |
| `reorderWallPosts(boardId, orderedPostIds)` | 격자 모드 DnD 순서 저장 |
| `bringWallPostToFront(boardId, postId, newZOrder)` | z_order 최상위로 올리기 |

### Auth Store (useAuthStore)
| 함수/상태 | 설명 |
|----------|------|
| `user` | 현재 로그인 사용자 정보 |
| `login(username, password)` | 로그인 (개발환경: 목업, 프로덕션: /api/login) |
| `logout()` | 로그아웃 (sessionStorage 제거) |
| `verify()` | 토큰 재검증 (앱 시작 시 호출) |
| `isOwnerOf(authorName)` | 해당 작성자와 동일 사용자인지 확인 |
| `canEdit()` | 로그인 여부 확인 |

---

## 10. 미구현 / 향후 개발 예정 기능

### 준비 중 (사이드바 "준비중" 표시)
- [ ] 즐겨찾기 기능
- [ ] 전역 검색 (보드, 게시물 통합 검색)
- [ ] 이미지 갤러리 보드 타입
- [ ] 마인드맵 보드 타입
- [ ] 설정 페이지 (사용자 프로필, 닉네임 변경)

### 기술적 개선 예정
- [ ] 드래그앤드롭 후 posts/links position DB 영구 저장 개선
  - 현재: `links.position` 컬럼 있으면 저장, 없으면 로컬만 반영
  - 개선: `posts` 테이블에도 `position` 컬럼 추가 권장
- [ ] TypeScript 전환 (.jsx → .tsx)
- [ ] 코드 스플리팅 (번들 500KB 초과 경고 해소)
- [ ] 실시간 동기화 (Supabase Realtime 연동)
- [ ] 보드 검색 기능 구현
- [ ] 편집 공유 시 실시간 공동 편집

### 보안 개선 예정
- [ ] 공유 링크 만료 기능 (유효 기간 설정)
- [ ] 로그인 사용자 전용 공유(login_only)의 실제 토큰 검증
  - 현재: share_mode='login_only'는 링크 접속 시 안내만, 실제 검증 없음
  - 개선: 공유 접속 시 로그인 여부 확인 로직 추가 필요

---

## 11. 로컬 개발 환경 설정 방법

```bash
# 1. 저장소 클론
git clone https://github.com/JeongSeonGu/boarda.git
cd boarda

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성 (Supabase 정보 입력)
# .env 파일 생성:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 4. 개발 서버 시작
npm run dev
# → http://localhost:3000

# 5. 로그인 (개발 목업 계정)
# admin / admin123
# teacher / teacher123
# teacher2 / teacher123
```

### PowerShell 실행 정책 오류 시 (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 12. 배포 방법 (Vercel)

```bash
# 코드 수정 후
git add .
git commit -m "변경 내용 설명"
git push
# → Vercel 자동 감지 → 빌드 → 배포 (약 1~2분)
```

### Vercel 빌드 설정
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 13. 알려진 이슈 및 주의사항

| 이슈 | 원인 | 상태 |
|------|------|------|
| 번들 크기 경고 (500KB+) | DnD 라이브러리 포함 | 무시 가능, 동작에 영향 없음 |
| Storage 업로드 RLS 오류 | 버킷 정책 미설정 | Supabase → Storage → boarda-files → Public 설정으로 해결 |
| 공유 login_only 미검증 | 프론트만 처리 | 추후 서버사이드 검증 필요 |
| 게시물 position 컬럼 없음 | posts 테이블 미추가 | DnD 순서가 새로고침 후 초기화됨, position 컬럼 추가 권장 |

---

## 14. 주요 설계 원칙

1. **상태 관리**: Zustand 단일 스토어 → `useBoardStore` (데이터), `useAuthStore` (인증)
2. **CSS 분리**: 역할별 CSS 파일 분리 → 유지보수 용이
3. **컴포넌트 재사용**: `BoardHeader`, `FileAttachment`, `ReactionBar` 등 공통 컴포넌트화
4. **권한 체크**: `isOwnerOf()` 헬퍼로 일관된 권한 판단
5. **로컬 즉시 반영**: DB 저장과 별도로 store 즉시 업데이트 → 빠른 UX
6. **보안**: DB 접근 정보는 PHP 서버에만, JWT는 Vercel 환경변수에만 존재
7. **파일 정리**: 보드 삭제 시 Storage 파일 일괄 삭제 (deleteBoard)

---

---

# 📌 AI를 활용한 지속 개발을 위한 프롬프트 작성 가이드

## 이 문서를 활용하는 방법

새로운 AI 대화 세션을 시작할 때 아래 예시 프롬프트를 참고하여 문서를 제공하세요.

---

## 예시 프롬프트 1 — 새 기능 추가

```
아래는 현재 개발 중인 'Boarda' 프로젝트의 전체 현황 문서입니다.
이 문서를 충분히 이해한 후 새로운 기능을 추가해주세요.

[BOARDA_PROJECT_DOC.md 내용 전체 붙여넣기]

---

위 문서를 바탕으로 다음 기능을 추가해주세요:

## 요청 기능: [기능명]

**배경**: [왜 이 기능이 필요한지]

**상세 요구사항**:
1. [구체적인 요구사항 1]
2. [구체적인 요구사항 2]

**제약 조건**:
- 기존 코드 구조와 스타일을 최대한 유지할 것
- 수정이 필요한 파일만 새로 작성할 것 (전체 파일 재작성 금지)
- CSS 변수(var(--c-primary) 등)를 활용할 것
- 새 컴포넌트는 기존 components/ 폴더 구조에 맞게 배치할 것
```

---

## 예시 프롬프트 2 — 버그 수정

```
Boarda 프로젝트 현황 문서입니다:
[BOARDA_PROJECT_DOC.md 내용 전체 붙여넣기]

---

아래 오류가 발생하고 있습니다. 원인을 분석하고 수정해주세요.

**오류 내용**:
[오류 메시지 전체 붙여넣기]

**오류 발생 조건**:
- 어떤 화면에서: [페이지/기능명]
- 어떤 동작을 했을 때: [클릭/입력/이동 등]
- 오류 발생 파일: [파일 경로 (알고 있다면)]

**현재 해당 파일 내용**:
[오류 관련 파일 코드 붙여넣기]

수정이 필요한 파일만 작성해주세요.
```

---

## 예시 프롬프트 3 — 디자인/UX 개선

```
Boarda 프로젝트 현황 문서입니다:
[BOARDA_PROJECT_DOC.md 내용 전체 붙여넣기]

---

다음 UI/UX를 개선해주세요.

**개선 대상**: [컴포넌트명 또는 페이지명]
**현재 문제점**: [구체적으로 무엇이 불편한지]
**원하는 결과**: [어떻게 보이길 원하는지]
**참고 이미지**: [첨부 이미지가 있다면 함께 제공]

조건:
- 기존 CSS 변수 시스템(globals.css)을 활용할 것
- 모바일 반응형 고려할 것
- 수정 파일만 작성할 것
```

---

## 예시 프롬프트 4 — DB 스키마 변경 포함 기능

```
Boarda 프로젝트 현황 문서입니다:
[BOARDA_PROJECT_DOC.md 내용 전체 붙여넣기]

---

DB 변경이 필요한 기능을 추가해주세요.

**기능명**: [기능명]
**필요한 DB 변경**: [대략적으로 어떤 컬럼/테이블이 필요할지]
**프론트엔드 변경**: [어떤 화면에서 동작해야 하는지]

요청 형식:
1. Supabase SQL 쿼리 먼저 제공
2. 수정/추가가 필요한 파일 목록 명시
3. 파일별 코드 작성 (수정 파일만)
```

---

## 좋은 프롬프트 작성 원칙

### ✅ 해야 할 것
- **현황 문서를 항상 먼저 제공** — AI가 프로젝트 맥락을 파악하는 데 필수
- **"수정 파일만 작성"을 명시** — 불필요한 전체 재작성 방지
- **오류 메시지 전체를 붙여넣기** — 원인 파악에 중요
- **스크린샷 첨부** — UI 관련 문제는 이미지가 설명보다 정확
- **제약 조건 명시** — 기존 구조 유지, 특정 라이브러리 사용 등
- **단계별로 나눠 요청** — 기능이 크면 한 번에 요청하지 말고 분리

### ❌ 피해야 할 것
- 문서 없이 "기능 추가해줘"만 요청 — 맥락 없이 엉뚱한 코드 생성
- 여러 기능을 한 번에 요청 — 오류 발생 시 디버깅 어려움
- "전체 다시 만들어줘" — 기존 작업 내용 유실

### 📋 이 문서 업데이트 방법
기능 추가/변경 후 AI에게 아래와 같이 요청하세요:

```
위에서 추가한 [기능명] 내용을 포함하여
BOARDA_PROJECT_DOC.md 의 해당 섹션들을 업데이트해주세요.
변경된 섹션만 출력해주세요.
```