import { DATA_TYPES, SIGNALS } from '../constants/SignalMap.js';

export class RadioService {
    constructor(stateManager, transport, engine) {
        this.state = stateManager;
        this.transport = transport;
        this.engine = engine;
        
        this.localStream = null;    // 내 마이크 스트림
        this.activeCalls = {};      // 현재 음성 송출 중인 피어 목록
    }

    /**
     * [마이크 초기화]
     * 브라우저 마이크 권한을 요청하고 스트림을 준비합니다.
     */
    async initMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.state.addLog("🎙️ 마이크 준비 완료", 'SYSTEM');
            return true;
        } catch (err) {
            this.state.addLog("❌ 마이크 권한 거부됨", 'SYSTEM');
            console.error("Media Error:", err);
            return false;
        }
    }

    /**
     * [PTT 시작 - 발신]
     * 버튼을 누르고 있는 동안 상대방들에게 내 목소리를 보냅니다.
     */
    async startTalking() {
        if (!this.localStream) await this.initMedia();
        
        const { connections } = this.state.getState();
        const peerIds = Object.keys(connections);

        if (peerIds.length === 0) {
            this.state.addLog("⚠️ 연결된 피어가 없어 무전이 불가능합니다.");
            return;
        }

        this.state.update({ activeService: 'RADIO' });
        this.state.addLog("🎤 무전 송신 중... (🍇 GRAPE)", 'RADIO');

        // 모든 연결된 피어에게 음성 스트림 전송 (Call 방식 활용)
        peerIds.forEach(id => {
            const call = this.engine.peer.call(id, this.localStream, {
                metadata: { type: DATA_TYPES.RADIO }
            });
            this.activeCalls[id] = call;
        });
    }

    /**
     * [PTT 종료 - 정지]
     * 버튼을 떼면 모든 음성 송출을 중단합니다.
     */
    stopTalking() {
        Object.values(this.activeCalls).forEach(call => call.close());
        this.activeCalls = {};
        
        this.state.update({ activeService: null });
        this.state.addLog("📴 무전 종료", 'RADIO');
        
        // 상대방에게 무전 종료 신호 브로드캐스트
        const payload = this.transport.createPayload(DATA_TYPES.SIGNAL, SIGNALS.SIG_VOICE, { status: 'END' });
        this.transport.broadcast(payload);
    }

    /**
     * [수신 처리]
     * 상대방이 보낸 음성 스트림을 스피커로 출력합니다.
     */
    handleIncomingStream(stream) {
        this.state.addLog("🔊 무전 수신 중...", 'RADIO');
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play();
    }
}