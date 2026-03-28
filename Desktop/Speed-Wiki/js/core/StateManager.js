const { BehaviorSubject } = rxjs;

export class StateManager {
    constructor() {
        this.state$ = new BehaviorSubject({
            status: 'OFFLINE',
            myID: null,
            logs: [],
            connections: {},
            activeService: null // 현재 점유 중인 서비스 (예: 'RADIO')
        });
    }

    // 상태 업데이트 (불변성 유지)
    update(patch) {
        const current = this.state$.getValue();
        this.state$.next({ ...current, ...patch });
    }

    // 로그 추가 (중앙 집중 관리)
    addLog(msg, type = 'SYSTEM') {
        const time = new Date().toLocaleTimeString();
        const logEntry = { time, msg, type };
        
        // HTML 렌더링용 문자열 생성 (기존 스타일 유지)
        const logHTML = `<div class="log-entry"><span>[${time}]</span> ${msg}</div>`;
        
        const currentLogs = this.state$.getValue().logs;
        this.update({ logs: [logHTML, ...currentLogs].slice(0, 50) });
    }

    getState() {
        return this.state$.getValue();
    }
}