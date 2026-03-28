import { DATA_TYPES } from '../constants/SignalMap.js';

export class ChatService {
    constructor(stateManager, transport) {
        this.state = stateManager;
        this.transport = transport;
    }

    /**
     * [메시지 전송]
     * 입력된 텍스트를 CHAT 타입 패킷으로 포장해 브로드캐스트합니다.
     */
    sendMessage(text) {
        if (!text || text.trim() === "") return;

        const payload = this.transport.createPayload(DATA_TYPES.CHAT, text);
        this.transport.broadcast(payload);
        
        // 내가 보낸 메시지도 로그에 기록
        this.state.addLog(`나: ${text}`, 'CHAT');
    }

    /**
     * [메시지 수신 처리]
     * 엔진(SpiritEngine)에서 CHAT 타입 패킷을 받으면 이 메서드를 호출합니다.
     */
    receiveMessage(senderID, text) {
        this.state.addLog(`[${senderID}]: ${text}`, 'CHAT');
    }
}