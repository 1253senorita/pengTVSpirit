// [🍎 CORE-V2.5] 네트워크 및 엔진 전역 설정
export const PEER_CONFIG = {
    host: 'localhost',   // 로컬 테스트용 (서버 배포 시 도메인으로 변경)
    port: 9000,          // PeerJS 서버 포트
    path: '/myapp',      // 서버 경로 설정
    debug: 3             // 3: 모든 로그 출력 (연결 디버깅용), 1: 에러만 출력
};

export const ENGINE_SETTINGS = {
    VERSION: 'V2.5-SPIRIT-APP-SHELL',
    LOG_LIMIT: 50,       // 대시보드에 표시될 최대 로그 수
    AUTO_RECONNECT: true // 연결 끊김 시 자동 재접속 시도
};