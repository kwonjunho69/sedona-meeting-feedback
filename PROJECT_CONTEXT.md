# 세도나 시니어타운 회의록 피드백 관리 — 프로젝트 컨텍스트

## 핵심 정보
- **앱 URL**: https://kwonjunho69.github.io/sedona-meeting-feedback/
- **로컬 파일**: `C:\Users\WD\Documents\Claude\Projects\회의록정리\index.html` (1878줄, 단일 파일 앱)
- **배포**: GitHub Pages (`kwonjunho69/sedona-meeting-feedback` 레포)
- **GitHub Desktop 로컬 경로**: `C:\Users\WD\Documents\Claude\Projects\회의록정리`
- **DB**: Supabase PostgreSQL (REST API)

## Supabase 설정
```javascript
const SB_URL = 'https://alovgxybtgtlxlfomgub.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb3ZneHlidGd0bHhsZm9tZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODkzMzQsImV4cCI6MjA5NjI2NTMzNH0.tmccVeAn1OOBBgI7T7jcy3qa8aXKm3XkkjBd_rx6HIk';
const SB_REST = SB_URL + '/rest/v1';
const SB_HDR = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
```

## Supabase 테이블
| 테이블 | 주요 컬럼 | 비고 |
|--------|-----------|------|
| `meetings` | id, date, summary, key_issues, raw_text, updated_at | upsert by id |
| `feedbacks` | id, meeting_id, resident, dept, text, priority, corrected, original_name | upsert by id |
| `processing_status` | meeting_id, resident, dept, done, note, resolved_by, resolved_at | upsert |
| `residents` | id (SERIAL), name, room | 전체삭제 후 재삽입 방식 |

## 데이터 구조 (localStorage)
```javascript
let meetings = [];       // localStorage: 'sd_meetings'
let residentNames = [];  // localStorage: 'sd_names'  [{name, room}]
let users = [];          // localStorage: 'sd_users'
let currentUser = null;  // {id, name, role}
// DEFAULT_USERS: [{id:'admin', name:'관리자', password:'1234', role:'admin'}]
```

## 핵심 함수 위치 (index.html 줄 번호)
| 함수 | 줄 | 설명 |
|------|----|------|
| `resName(r)` | 580 | string 또는 {name,room} 객체 처리 |
| `resRoom(r)` | 581 | room 추출 |
| `save()` | 615 | localStorage 저장 후 saveToDB() 호출 |
| `sbFetch()` | 659 | Supabase REST 헬퍼 (빈 응답 처리 포함) |
| `saveToDB()` | 675 | DB 전체 동기화 |
| `loadFromDB()` | ~750 | DB에서 로컬로 불러오기 |
| `delName(i)` | 1613 | 어르신 삭제 (splice + save) |
| `doLogin()` | 1655 | 로그인 처리 |

## 아키텍처
- **단일 HTML 파일** (CSS + JS 인라인, 프레임워크 없음)
- **오프라인 퍼스트**: localStorage 캐시 → saveToDB()로 Supabase 동기화
- **AI**: Google Gemini API (회의록 분석)
- **Supabase 동기화 패턴**:
  - meetings/feedbacks/status: `POST` + `Prefer: resolution=merge-duplicates` (upsert)
  - residents: `DELETE /residents?id=gt.0` 후 `POST` 재삽입 (항상 일치 보장)

## 주요 수정 이력 (해결된 버그)
1. Supabase URL/KEY 오타 → `alovgxybtgtlxlfomgub` 프로젝트로 수정
2. `save()`에서 `dbKey is not defined` → JSONBin 잔재 제거, `saveToDB()` 직접 호출
3. `doLogin is not defined` → `</script` 태그 미완성으로 파싱 오류 → `</script>\n</body>\n</html>` 수정
4. `sbFetch` JSON parse error → 빈 응답 body 처리 (text 먼저 읽기)
5. residents 삭제 미동기화 → 전체삭제+재삽입 방식으로 변경

## 배포 절차
GitHub Desktop → Summary 입력 → **Commit to main** → **Push origin** → 1~2분 후 반영

## 개발 환경
- 준호오빠 (50대, 세도나 시니어타운 대표/시설장, 입소정원 84명, 경력 3년)
- Windows PC, GitHub Desktop 사용
- Claude Cowork 모드로 파일 직접 수정
