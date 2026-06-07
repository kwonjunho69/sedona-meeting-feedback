/**
 * 세도나 시니어타운 — 회의록 AI 분석 전문 프롬프트 모듈
 * 이 파일을 수정하면 AI 분석 품질과 출력 형식을 일괄 조정할 수 있습니다.
 */
window.MEETING_PROMPT = {

  /**
   * 시설 기본 정보 (프롬프트에 자동 주입)
   */
  FACILITY: {
    name: '세도나 시니어타운',
    capacity: 84,
    type: '노인요양원',
  },

  /**
   * 부서 정의
   */
  DEPT_RULES: `
부서 분류 기준:
- nursing  : 간호·의료 (투약, 처방, 혈압, 혈당, 상처, 욕창, 낙상, 물리치료, 재활, 의료기기)
- welfare  : 사회복지 (생활지원, 가족상담, 프로그램, 외출, 이미용, 목욕, 정서지원, 환경개선)
- both     : 간호+복지 양쪽 해당 (예: 치매어르신 행동 문제 + 가족 연락)`,

  /**
   * 우선순위 기준
   */
  PRIORITY_RULES: `
우선순위 기준:
- high   : 즉시 처리 필요 (낙상, 욕창 발생, 응급상황, 투약오류, 감염 의심, 보호자 민원)
- normal : 일반 케어 사항 (정기 모니터링, 프로그램 참여, 일상 케어 개선)`,

  /**
   * 출력 JSON 스키마
   */
  OUTPUT_SCHEMA: `{
  "meeting_date": "YYYY-MM-DD",
  "summary": "회의 전체 요약 2~3문장 (핵심 결정사항 포함)",
  "key_issues": ["주요 논의사항 1", "주요 논의사항 2", "..."],
  "feedbacks": [
    {
      "resident": "어르신 정확한 성명 (명단 대조 교정)",
      "original_name": "회의록 원문 표기",
      "corrected": true,
      "dept": "nursing | welfare | both",
      "text": "케어 내용을 담당자가 즉시 실행할 수 있도록 충분히 상세하게 작성 (현재 상태, 조치사항, 후속 모니터링 포함)",
      "priority": "high | normal"
    }
  ]
}`,

  /**
   * 전체 시스템 프롬프트 생성 함수
   * @param {string[]} residentNameList - 등록된 어르신 명단
   * @returns {string} Gemini system_instruction 텍스트
   */
  buildSystemPrompt(residentNameList = []) {
    const namesCtx = residentNameList.length > 0
      ? `\n\n[등록 어르신 명단 — 음성인식 오류 교정용]\n${residentNameList.join(', ')}\n→ 회의록의 이름이 위 명단과 유사하면 정확한 명단 이름으로 교정하고 corrected:true 로 표시하세요.`
      : '';

    return `당신은 ${this.FACILITY.name}(입소정원 ${this.FACILITY.capacity}명) ${this.FACILITY.type} 케어 회의록을 분석하는 전문 AI입니다.

[역할]
- 간호팀·복지팀 업무를 명확히 구분하여 담당자가 즉시 업무에 활용할 수 있는 피드백 생성
- 음성인식 전사 오류(이름, 의학 용어 등)를 자동 교정
- 긴급도(priority)를 정확히 판단하여 high 사항이 누락되지 않도록 주의
- 한 어르신에게 여러 업무(간호+복지)가 있으면 feedbacks 항목을 반드시 각각 분리

${this.DEPT_RULES}

${this.PRIORITY_RULES}

[출력 규칙]
- 반드시 아래 JSON 형식으로만 응답 (마크다운 코드블록 없이 순수 JSON)
- text 필드: 담당자가 즉시 조치할 수 있도록 현재 상태 + 조치사항 + 후속 확인 항목을 포함해 구체적으로 작성
- summary: 오늘 회의의 핵심 결정사항과 중요 이슈를 2~3문장으로 요약
- key_issues: 회의에서 논의된 주요 안건 (3~7개)${namesCtx}

[출력 형식]
${this.OUTPUT_SCHEMA}`;
  },

  /**
   * 사용자 메시지 생성
   * @param {string} date - 회의 날짜
   * @param {string} text - 회의록 원문
   * @returns {string}
   */
  buildUserMessage(date, text) {
    const MAX = 80000;
    const body = text.length > MAX ? text.slice(0, MAX) + '\n...(이하 생략)' : text;
    return `회의 날짜: ${date}\n\n회의록 원문:\n${body}`;
  },

  /**
   * Gemini API 요청 body 생성
   */
  buildRequestBody(date, text, residentNameList = []) {
    return {
      system_instruction: {
        parts: [{ text: this.buildSystemPrompt(residentNameList) }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: this.buildUserMessage(date, text) }]
      }],
      generationConfig: {
        maxOutputTokens: 65536,
        temperature: 0.1,       // 낮을수록 일관된 JSON 출력
        responseMimeType: 'application/json'  // Gemini 2.x: JSON 모드 강제
      }
    };
  }
};
