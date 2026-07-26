-- 어르신 퇴소 상태 관리
-- Supabase Dashboard > SQL Editor에서 한 번 실행한다.

ALTER TABLE public.residents
  ADD COLUMN IF NOT EXISTS is_discharged BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.residents
  ADD COLUMN IF NOT EXISTS discharged_at DATE;

CREATE INDEX IF NOT EXISTS idx_residents_is_discharged
  ON public.residents (is_discharged);

COMMENT ON COLUMN public.residents.is_discharged
  IS '현재 퇴소 상태인지 여부';

COMMENT ON COLUMN public.residents.discharged_at
  IS '마지막 퇴소 처리 일자';
