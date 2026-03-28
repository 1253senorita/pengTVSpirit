import { PEER_CONFIG } from '../constants/Config.js';
import { DATA_TYPES, SIGNALS } from '../constants/SignalMap.js';

export class SpiritEngine {
    constructor(stateManager, transport) {
        this.state = stateManager;      // StateManager 인스턴스
        this.transport = transport;      // DataTransport 인스턴스
        this.peer = null;               // PeerJS 객체
        this.services = {};             // 등록된 서비스들 (Chat, Radio 등)
    }

    /**
     * [엔진 가동]
     */
    boot(customID = null) {
        const id = customID || `USER_${Math.floor(Math.random() * 10000)}`;
        this.peer = new Peer(id, PEER_CONFIG);

        this.peer.on('open', (id) => {
            this.state.update({ status: 'ONLINE', myID: id });
            this.state.addLog(`✅ 엔진 온라인: ${id}`, 'SYSTEM');
        });

        // [추가] 음성 무전(Call) 수신 대기 로직
        this.peer.on('call', (call) => {
            // 메타데이터를 확인해서 RADIO 타입일 때만 수신
            if (call.metadata && call.metadata.type === DATA_TYPES.RADIO) {
                call.answer(); // 보이스 연결 승인
                call.on('stream', (remoteStream) => {
                    // RadioService가 등록되어 있다면 스트림 전달
                    if (this.services['RADIO']) {
                        this.services['RADIO'].handleIncomingStream(remoteStream);
                    }
                });
            }
        });

        this.peer.on('connection', (conn) => {
            this.registerConnection(conn);
        });

        this.peer.on('error', (err) => {
            this.state.addLog(`❌ 엔진 에러: ${err.type}`, 'SYSTEM');
            console.error('PeerJS Error:', err);
        });
    }

    /**
     * [커넥션 관리]
     */
    registerConnection(conn) {
        conn.on('open', () => {
            const currentConns = { ...this.state.getState().connections };
            currentConns[conn.peer] = { instance: conn, status: 'ACTIVE' };
            
            this.state.update({ connections: currentConns });
            this.state.addLog(`📡 [JOIN] ${conn.peer} 피어 연결됨`);

            conn.on('data', (raw) => this.routeIncomingData(conn.peer, raw));
            conn.on('close', () => this.removeConnection(conn.peer));
        });
    }

    /**
     * [데이터 라우팅]
     */
    routeIncomingData(senderID, raw) {
        try {
            const packet = typeof raw === 'string' ? JSON.parse(raw) : raw;
            
            // 1. 로그 기록
            if (packet.type === DATA_TYPES.SIGNAL) {
                this.state.addLog(`🎯 [SIGNAL] 코드: ${packet.val} (From: ${senderID})`);
            } else {
                this.state.addLog(`📩 [${packet.type}] ${senderID}: ${packet.val}`);
            }

            // 2. [추가] 등록된 서비스로 패킷 전달 (ChatService 등)
            if (this.services[packet.type]) {
                if (packet.type === DATA_TYPES.CHAT) {
                    this.services[packet.type].receiveMessage(senderID, packet.val);
                }
                // 다른 서비스 확장 가능
            }

        } catch (e) {
            console.error("데이터 파싱 에러:", e);
        }
    }

    /**
     * [공통 신호 실행 메서드] - EventBinder에서 사용
     */
    executeSignal(code, label) {
        this.state.addLog(`🎯 [SEND SIGNAL] ${label} (${code})`, 'SYSTEM');
        const payload = this.transport.createPayload(DATA_TYPES.SIGNAL, code);
        this.transport.broadcast(payload);
    }

    removeConnection(peerID) {
        const currentState = this.state.getState();
        const currentConns = { ...currentState.connections };
        delete currentConns[peerID];
        this.state.update({ connections: currentConns });
        this.state.addLog(`🗑️ [LEAVE] ${peerID} 연결 종료`);
    }

    registerService(type, serviceInstance) {
        this.services[type] = serviceInstance;
    }
}