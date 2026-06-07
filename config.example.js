/**
 * 세도나 시니어타운 — API 설정 템플릿
 *
 * 사용법:
 *   1. 이 파일을 복사해 이름을 config.js 로 변경
 *   2. 아래 값들을 실제 키로 교체
 *   3. config.js 는 .gitignore에 등록되어 있으므로 GitHub에 업로드되지 않음
 *
 * ※ GitHub Pages 배포판은 config.js 없이 동작하며,
 *    앱 화면 우상단 "API 키 설정" 버튼으로 Gemini 키를 입력하세요.
 */
window.APP_CONFIG = {
  // Supabase 프로젝트 URL 및 anon 공개 키
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // Gemini API 기본 키 (선택) — https://aistudio.google.com/apikey 에서 발급
  GEMINI_DEFAULT_KEY: '',
};
