// [🍎 CORE-V2.5] 전역 신호 및 데이터 타입 정의
export const SIGNALS = {
    SIG_INIT: 100,      // 시스템 초기화
    SIG_VOICE: 200,     // 음성 동기화 (GRAPE 로직)
    SIG_DATA: 300,      // 데이터 처리
    SIG_ALERT: 999      // 긴급 경보
};

export const DATA_TYPES = {
    CHAT: 'CHAT',       // ChatService 담당
    RADIO: 'RADIO',     // RadioService 담당 (PTT)
    CALL: 'CALL',       // CallService 담당 (Full-Duplex)
    SIGNAL: 'SIGNAL',   // SignalService 담당 (시스템 제어)
    SYSTEM: 'SYSTEM'    // 엔진 내부 상태 알림용
};