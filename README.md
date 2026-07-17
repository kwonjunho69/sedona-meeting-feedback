# 세도나 회의 피드백 관리

세도나 시니어타운의 회의록을 Gemini로 분석하고, 부서별 피드백과 처리 상태를 Supabase에 동기화하는 정적 웹 앱입니다.

## 현재 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 운영 앱의 HTML, CSS, JavaScript 전체 |
| `meeting_prompt.js` | Gemini 분석 프롬프트와 응답 파싱 |
| `manifest.json` | PWA 메타데이터 |
| `config.example.js` | 로컬 설정 예시. 실제 `config.js`는 Git 제외 |
| `supabase_setup.sql` | 과거 초기 스키마 기록. 보안 전환 전 재실행 금지 |
| `회의록_피드백관리.html` | 과거 보관본. 운영 기준 파일 아님 |
| `AGENTS.md` | Codex가 따라야 할 작업 규칙 |
| `SECURITY_AUDIT.md` | 현재 위험과 보안 개선 순서 |

운영 페이지는 GitHub Pages에서 `main` 브랜치의 `index.html`을 제공합니다.

## 로컬 확인

정적 파일이므로 간단한 HTTP 서버로 실행합니다.

```powershell
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. `file://`로 직접 열면 브라우저 보안 정책 때문에 동작이 다를 수 있습니다.

실제 키가 필요한 로컬 테스트는 `config.example.js`를 `config.js`로 복사한 뒤 값을 입력합니다. `config.js`는 `.gitignore`에 포함되어 있습니다. 단, Supabase `service_role` 키는 어떤 경우에도 브라우저 설정에 넣으면 안 됩니다.

## 변경 절차

1. 새 브랜치에서 작업합니다.
2. `AGENTS.md`의 동기화 불변식과 보안 원칙을 확인합니다.
3. 로컬에서 핵심 흐름을 검증합니다.
4. 변경 내용을 커밋하고 PR에서 검토합니다.
5. `main` 병합 후 GitHub Pages 반영을 확인합니다.

현재 앱은 인증과 RLS를 보강하기 전까지 민감한 운영 데이터를 안전하게 보호하는 구조가 아닙니다. 우선순위와 전환 절차는 `SECURITY_AUDIT.md`를 참고하세요.
