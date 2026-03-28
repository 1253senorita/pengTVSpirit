import { SIGNALS } from '../constants/SignalMap.js';

export class EventBinder {
    constructor(engine, chatService) {
        this.engine = engine;
        this.chatService = chatService;
        
        this.init();
    }

    init() {
        // 1. 메시지 전송 버튼 (SEND)
        const sendBtn = document.getElementById('Send_Btn');
        const msgInput = document.getElementById('Msg_Input');

        if (sendBtn && msgInput) {
            sendBtn.onclick = () => {
                this.chatService.sendMessage(msgInput.value);
                msgInput.value = ""; 
            };

            msgInput.onkeypress = (e) => {
                if (e.key === 'Enter') sendBtn.click();
            };
        }

        // 2. A-Sheet 동적 버튼 (INIT, VOICE, DATA, ALERT 모두 처리)
        const sheet = document.getElementById('SSF_Dynamic_Sheet');
        if (sheet) {
            sheet.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const signalCode = SIGNALS[btn.id];
                if (signalCode) {
                    // 이제 VOICE 버튼도 여기서 일반 클릭 신호로 나갑니다.
                    this.engine.executeSignal(signalCode, btn.innerText);
                }
            });
        }
    }
}