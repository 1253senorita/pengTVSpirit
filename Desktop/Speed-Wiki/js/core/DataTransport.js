import { DATA_TYPES } from '../constants/SignalMap.js';

export class DataTransport {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * [패킷 생성기] 
     * 각 서비스(Chat, Radio 등)가 사용할 표준 규격을 만듭니다.
     */
    createPayload(type, val, extra = {}) {
        const myID = this.stateManager.getState().myID;
        
        // 정의되지 않은 타입 차단 (실수 방지)
        if (!DATA_TYPES[type]) {
            console.error(`❌ [ERROR] 미정의 데이터 타입: ${type}`);
            return null;
        }

        return {
            type,       // CHAT, RADIO, CALL 등
            val,        // 실제 내용물 (텍스트 또는 정수 코드)
            sender: myID,
            timestamp: Date.now(),
            ...extra    // 추가 정보 (음성 스트림 ID 등)
        };
    }

    /**
     * [브로드캐스트]
     * 연결된 모든 피어에게 패킷을 전송합니다.
     */
    broadcast(payload) {
        if (!payload) return;
        
        const { connections } = this.stateManager.getState();
        const activeConns = Object.values(connections);

        if (activeConns.length === 0) {
            this.stateManager.addLog("⚠️ 전송 대상이 없습니다.");
            return;
        }

        activeConns.forEach(conn => {
            if (conn.instance && conn.instance.open) {
                // JSON 문자열로 직렬화하여 전송
                conn.instance.send(JSON.stringify(payload));
            }
        });

        // 로그 기록 (타입에 따라 아이콘 변경)
        const icon = payload.type === 'RADIO' ? '🍇' : '📤';
        this.stateManager.addLog(`${icon} [${payload.type}] 전송됨`);
    }

    /**
     * [개별 전송]
     * 특정 대상에게만 패킷을 보낼 때 사용합니다.
     */
    sendTo(targetID, payload) {
        const { connections } = this.stateManager.getState();
        const conn = connections[targetID];

        if (conn && conn.instance.open) {
            conn.instance.send(JSON.stringify(payload));
        }
    }
}