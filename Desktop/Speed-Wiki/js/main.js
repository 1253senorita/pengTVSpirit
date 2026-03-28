import { StateManager } from './core/StateManager.js';
import { DataTransport } from './core/DataTransport.js';
import { SpiritEngine } from './core/SpiritEngine.js';

// 컴포넌트 및 서비스 임포트
import { Dashboard } from './components/Dashboard.js';
import { EventBinder } from './components/EventBinder.js';
import { ChatService } from './services/ChatService.js';

/**
 * [STEP 1] 핵심 인프라 생성
 */
const state = new StateManager();
const transport = new DataTransport(state);
const engine = new SpiritEngine(state, transport);

/**
 * [STEP 2] 초기화 및 서비스 등록
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log("🍎 [SYSTEM] Blackboard Spirit Engine 조립 시작...");

    // 1. 서비스 인스턴스 생성 (라디오 제외)
    const chatService = new ChatService(state, transport);

    // 2. 엔진에 서비스 등록
    engine.registerService('CHAT', chatService);

    // 3. UI 컴포넌트 연결 (라디오 제외)
    const dashboard = new Dashboard(state);
    const eventBinder = new EventBinder(engine, chatService);

    // 4. 엔진 부팅
    const myCustomID = `OPPA_${Math.floor(Math.random() * 9000) + 1000}`;
    engine.boot(myCustomID);

    // 5. 상태 구독
    state.state$.subscribe(s => {
        console.log("📊 [STATE_CHANGE]", s.status, s.myID);
    });

    state.addLog(`🚀 시스템 가동 준비 완료 (ID: ${myCustomID})`);
});

// 전역 노출 (디버깅용)
window.Spirit = engine;
window.State = state;