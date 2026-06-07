-- =============================================
-- 세도나 시니어타운 회의록 관리 시스템
-- Supabase PostgreSQL 테이블 생성 스크립트
-- =============================================

-- 1. 회의록 테이블
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  summary TEXT DEFAULT '',
  key_issues JSONB DEFAULT '[]',
  raw_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 피드백 테이블
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
  resident TEXT NOT NULL,
  dept TEXT CHECK (dept IN ('nursing','welfare','both')) DEFAULT 'nursing',
  text TEXT DEFAULT '',
  priority TEXT CHECK (priority IN ('normal','high')) DEFAULT 'normal',
  corrected BOOLEAN DEFAULT FALSE,
  original_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 처리 상태 테이블 (레거시 — 하위호환 유지)
CREATE TABLE IF NOT EXISTS processing_status (
  id SERIAL PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
  resident TEXT NOT NULL,
  dept TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  note TEXT DEFAULT '',
  resolved_by TEXT DEFAULT '',
  resolved_at TEXT DEFAULT '',
  UNIQUE(meeting_id, resident, dept)
);

-- 3-2. 피드백 처리이력 테이블 (신규 — 항목별 다중 이력 지원)
-- logs: [{user, note, at, type}] type = 'done' | 'add'
CREATE TABLE IF NOT EXISTS feedback_processing (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL UNIQUE,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
  resident TEXT NOT NULL,
  dept TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  logs JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 어르신 명단 테이블
CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  room TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 사용자 테이블
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 관리자 계정
INSERT INTO app_users (id, name, password, role)
VALUES ('admin', '관리자', '1234', 'admin')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RLS (Row Level Security) 설정 - 내부 전용
-- =============================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- 모든 접근 허용 (앱 자체 로그인으로 보안 관리)
CREATE POLICY "allow_all_meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_status" ON processing_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fp" ON feedback_processing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_residents" ON residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_users" ON app_users FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 인덱스 (조회 성능 향상)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_feedbacks_meeting ON feedbacks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_status_meeting ON processing_status(meeting_id);
CREATE INDEX IF NOT EXISTS idx_fp_meeting ON feedback_processing(meeting_id);
CREATE INDEX IF NOT EXISTS idx_fp_feedback ON feedback_processing(feedback_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date DESC);
