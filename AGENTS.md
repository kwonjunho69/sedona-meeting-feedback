# Codex 작업 지침

## 프로젝트 개요

- 세도나 시니어타운 회의록/피드백 관리용 정적 웹 앱이다.
- 운영 주소: `https://kwonjunho69.github.io/sedona-meeting-feedback/`
- 배포 저장소: `kwonjunho69/sedona-meeting-feedback`
- 프런트엔드의 기준 파일은 `index.html`이다. CSS와 JavaScript가 이 파일에 인라인으로 들어 있다.
- `회의록_피드백관리.html`은 과거 버전 보관본이다. 사용자가 명시하지 않는 한 수정하거나 운영 코드로 간주하지 않는다.
- `meeting_prompt.js`는 Gemini 분석 프롬프트와 JSON 파싱 보조 코드를 담는다.
- `supabase_setup.sql`은 초기 스키마 기록이다. 현재 보안 기준을 충족하지 않으므로 운영 DB에 다시 실행하지 않는다.

## 작업 전 필수 확인

1. `git status --short --branch`와 최근 커밋을 확인한다.
2. `index.html`, `meeting_prompt.js`, `manifest.json`에서 변경 대상 흐름을 찾는다.
3. 데이터 동기화 코드를 바꾸기 전에 `save()`, `saveToDB()`, `loadFromDB()`, 삭제 관련 함수를 함께 읽는다.
4. 실제 운영 데이터가 있는 Supabase 작업은 백업 없이 실행하지 않는다.
5. 사용자가 채팅에 제공한 비밀번호나 토큰을 사용하거나 저장소에 기록하지 않는다.

## 중요한 데이터 불변식

- `meetings`가 화면 상태의 루트이며 각 회의의 `feedbacks`, `status`, `feedbackStatus`가 함께 동작한다.
- `saveToDB()`에서는 피드백/명단의 전체 삭제 후 재삽입 방식을 사용하지 않는다.
- 명단 추가는 upsert, 삭제는 사용자가 명시적으로 수행한 항목만 DELETE 한다.
- 삭제 직후 `deletedFbIds`가 삭제 항목을 재-upsert하지 않도록 막는다. DB를 새로 읽은 뒤에는 DB 상태를 기준으로 정리한다.
- 비동기 저장 중 전역 `meetings`가 바뀔 수 있으므로 첫 `await` 전에 저장 데이터를 스냅샷한다.
- 다중 기기에서 같은 데이터를 편집할 수 있다. 단일 브라우저의 오래된 `localStorage`로 DB 전체를 덮어쓰지 않는다.

## 보안 원칙

- 현재의 자체 로그인(`app_users`, 평문 비밀번호, 기본 `admin/1234`)은 보안 경계가 아니다.
- 현재 RLS의 `USING (true) WITH CHECK (true)` 정책은 운영에 부적합하다.
- 기능 추가보다 `SECURITY_AUDIT.md`의 Supabase Auth/RLS 전환을 우선한다.
- Supabase `anon` 키는 브라우저 공개용 키지만, 안전성은 반드시 RLS가 보장해야 한다. `service_role` 키는 프런트엔드와 Git 기록에 절대 넣지 않는다.
- Gemini 키를 코드, URL, 로그, Git에 넣지 않는다. 현재 브라우저 저장 방식은 임시 구조로 취급한다.
- 사용자/회의록/어르신 이름을 `innerHTML`에 넣을 때는 반드시 이스케이프하거나 DOM `textContent`를 사용한다.
- 외부 입력을 PostgREST 필터 문자열에 직접 연결하지 말고 `encodeURIComponent` 등으로 인코딩한다.

## 변경 및 검증 규칙

- 한글 파일은 UTF-8로 유지한다.
- 대형 `index.html` 변경은 관련 함수만 작게 수정하고 불필요한 전체 포맷을 하지 않는다.
- 최소 검증:
  - HTML의 인라인 JavaScript 문법 검사
  - `meeting_prompt.js` 문법 검사
  - 하드코딩된 Gemini/service-role/비밀번호 패턴 검색
  - 주요 흐름 수동 확인: 로그인, DB 로드, 회의 추가, 피드백 수정/삭제, 상태 저장, 재로그인
- 운영 배포는 별도 브랜치에서 검증한 뒤 PR로 진행한다. 요청 없이 `main`에 직접 push하지 않는다.

## 비밀정보 대응

- 채팅이나 파일에서 실제 계정 비밀번호를 발견하면 출력에 재인용하지 않는다.
- 노출된 계정 비밀번호는 즉시 변경하도록 알린다.
- 과거 Git 기록에 민감한 키가 있으면 키를 먼저 폐기/재발급하고, 필요할 때 별도 승인 후 기록 정리를 진행한다.
