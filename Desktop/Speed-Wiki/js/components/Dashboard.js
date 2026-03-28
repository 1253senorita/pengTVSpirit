/**
 * [Dashboard Component]
 * StateManager를 구독하여 화면의 상태(로그, 배지, 연결 리스트)를 실시간 업데이트합니다.
 */
export class Dashboard {
    constructor(stateManager) {
        this.state = stateManager;
        
        // UI 요소 캐싱 (자주 쓰는 요소들을 미리 찾아둠)
        this.nodes = {
            statusBadge: document.getElementById('Status_Badge'),
            idDisplay: document.getElementById('My_ID_Display'),
            consoleLog: document.getElementById('Console_Log'),
            connPool: document.getElementById('Conn_Pool_List')
        };

        this.init();
    }

    init() {
        // 상태 변화 감시 시작
        this.state.state$.subscribe(state => {
            this.renderStatus(state.status, state.myID);
            this.renderLogs(state.logs);
            this.renderConnections(state.connections);
        });
    }

    // 상단 상태 배지 및 ID 업데이트
    renderStatus(status, myID) {
        if (!this.nodes.statusBadge || !this.nodes.idDisplay) return;

        this.nodes.statusBadge.innerText = status;
        this.nodes.statusBadge.style.backgroundColor = 
            status === 'ONLINE' ? 'var(--green)' : 'var(--red)';
        
        this.nodes.idDisplay.innerText = myID ? `ID: ${myID}` : 'CONNECTING...';
    }

    // 왼쪽 로그 박스 업데이트
    renderLogs(logs) {
        if (!this.nodes.consoleLog) return;
        // 로그 배열을 합쳐서 한 번에 HTML로 주입 (성능 최적화)
        this.nodes.consoleLog.innerHTML = logs.join('');
    }

    // 오른쪽 연결 피어 목록 업데이트
    renderConnections(connections) {
        if (!this.nodes.connPool) return;

        const ids = Object.keys(connections);
        if (ids.length === 0) {
            this.nodes.connPool.innerHTML = '<p style="color:gray; font-size:0.8rem; padding:10px;">연결된 대상 없음</p>';
            return;
        }

        this.nodes.connPool.innerHTML = ids.map(id => `
            <div class="peer-item" style="padding:10px; border-bottom:1px solid rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.85rem; font-weight:500;">👤 ${id}</span>
                <span style="color:var(--green); font-size:0.7rem;">● ONLINE</span>
            </div>
        `).join('');
    }
}