# 세도나 시니어타운 회의록 피드백 관리 프로젝트 컨텍스트

## 핵심 정보

- 운영 URL: `https://kwonjunho69.github.io/sedona-meeting-feedback/`
- GitHub 저장소: `kwonjunho69/sedona-meeting-feedback`
- 배포: GitHub Pages, `main` 브랜치
- 프런트엔드: 단일 `index.html` 중심의 정적 웹 앱
- 데이터베이스: Supabase PostgreSQL REST API
- AI: Google Gemini API

## 기준 파일

- `index.html`: 현재 운영 코드. CSS와 JavaScript가 인라인으로 포함된다.
- `meeting_prompt.js`: 회의록 분석 프롬프트와 AI 응답 파싱.
- `manifest.json`, 아이콘 파일: PWA 메타데이터와 이미지.
- `회의록_피드백관리.html`: 과거 보관본이며 운영 기준이 아니다.
- `supabase_setup.sql`: 과거 초기 스키마 기록. 현재 공개 RLS 정책 때문에 운영에 다시 실행하면 안 된다.

## 주요 데이터

| 테이블 | 용도 |
|---|---|
| `meetings` | 회의 일자, 요약, 핵심 이슈, 원문 |
| `feedbacks` | 회의별 어르신/부서 피드백 |
| `processing_status` | 어르신·부서 단위 처리 상태 |
| `feedback_processing` | 피드백별 처리 여부와 로그 |
| `residents` | 어르신 이름과 호실 |
| `app_users` | 기존 자체 로그인 사용자. Supabase Auth로 교체 필요 |

브라우저에는 다음 캐시가 있다.

- `sd_meetings`: 회의와 피드백
- `sd_names`: 어르신 명단
- `sd_users`: 기존 자체 로그인 사용자
- `sd_api`, `sd_model`: Gemini 설정
- `sd_deleted_fb_ids`, `sd_individual_fb_ids`: 삭제/개별 피드백 보조 상태

## 핵심 실행 흐름

- `loadStorage()`: 브라우저 캐시를 읽는다.
- `loadFromDB()`: Supabase 데이터를 병렬 조회해 화면 상태를 재구성한다.
- `save()`: 브라우저 캐시를 갱신한 뒤 `saveToDB()`를 호출한다.
- `saveToDB()`: 첫 await 전에 저장할 데이터를 스냅샷하고 테이블별로 upsert한다.
- `syncResidentsToDB()`: 명단을 비파괴적으로 upsert한다.
- `doLogin()`, `loginSuccess()`, `doLogout()`: 현재 자체 로그인 UI 흐름이다.
- `runAI()`, `bulkReanalyze()`: Gemini 분석을 실행한다.

## 알려진 구조적 위험

- 현재 로그인은 서버 권한과 연결되지 않는다.
- `app_users`에 비밀번호가 평문 저장되고 기본 관리자 비밀번호가 코드에 있다.
- 초기 SQL의 RLS 정책이 모든 anon 접근을 허용한다.
- 여러 사용자 입력이 `innerHTML` 템플릿으로 렌더링된다.
- 개인정보와 API 키가 `localStorage`에 저장된다.

구체적인 대응은 `SECURITY_AUDIT.md`를 따른다.

## 개발 시 주의사항

- `index.html`만 운영 기준으로 수정하고 과거 보관본과 이중 관리하지 않는다.
- 저장/삭제 로직을 바꿀 때 다중 기기 경쟁 조건과 오래된 localStorage의 전체 덮어쓰기를 특히 경계한다.
- 회의/피드백/명단 삭제는 대상 행만 명시적으로 처리한다.
- 비밀값은 `config.js`에만 두고 Git에 커밋하지 않는다. `service_role` 키는 브라우저에 절대 넣지 않는다.
- 운영 DB 변경 전에 백업하고 테스트 프로젝트에서 먼저 검증한다.
