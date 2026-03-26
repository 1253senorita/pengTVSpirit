// C:\Users\55341\Desktop\pengTVSpirit\src\SpiritBridge.ts

export class SpiritBridge extends Blackboard {
    // [추가] 모든 버튼/이벤트를 정수로 받는 중앙 통로
    dispatch(btnId: number, payload: any = null) {
        console.log(`[Bridge] Received ID: ${btnId}`);

        switch (btnId) {
            case 101: // PTT 시작 예시
                this.update({ status: 'LOADING' });
                // 여기에 Socket.io 로직 연결 가능
                break;

            case 301: // 데이터 분석 시작 (기존 triggerSensor 역할)
                this.update({
                    status: 'ANALYZING',
                    sheetData: payload || [
                        { id: 1, name: '펭수', score: 95 },
                        { id: 2, name: '스피릿', score: 88 }
                    ]
                });
                break;

            default:
                console.warn("Unknown ID:", btnId);
        }
    }
}

// 전역 등록 (어디서든 Bridge.dispatch로 호출 가능)
(window as any).Bridge = new SpiritBridge();