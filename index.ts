/**
 * [Spirit v5.2] 리액티브 블랙보드 & 브릿지 통합 엔진
 */

// 1. 상태 정의 (데이터 규격화)
interface BlackboardState {
    fileName: string | null;
    sheetData: any[] | null;
    processedData: any[] | null;
    status: 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'ERROR';
    lastEventId: number | null; // 마지막으로 실행된 브릿지 ID
}

// 2. 심장: SpiritBridge (기존 Blackboard 확장)
class SpiritBridge {
    private state: BlackboardState = {
        fileName: null,
        sheetData: null,
        processedData: null,
        status: 'IDLE',
        lastEventId: null
    };
    private listeners: ((s: BlackboardState) => void)[] = [];

    subscribe(fn: (s: BlackboardState) => void) {
        this.listeners.push(fn);
        fn(this.state);
    }

    update(patch: Partial<BlackboardState>) {
        this.state = { ...this.state, ...patch };
        this.listeners.forEach(fn => fn(this.state));
    }

    /**
     * [핵심] 외부(앱쉘/버튼)에서 정수 ID를 받아 명령을 분기하는 '한 라인' 통로
     */
    dispatch(btnId: number, payload: any = null) {
        console.log(`[SpiritBridge] 🚀 Dispatch 수신: ${btnId}`);
        this.update({ lastEventId: btnId });

        // 정수 ID에 따른 전문가 호출 규칙 (if-else/switch)
        if (btnId === 301) { 
            // 301: 시트 분석 인텐트
            this.update({ 
                status: 'ANALYZING', 
                sheetData: payload?.data || [],
                fileName: payload?.name || 'unknown.csv'
            });
        } 
        else if (btnId === 101) {
            // 101: PTT 시작 (예시)
            console.log("🎙️ PTT 전문가를 깨웁니다...");
        }
    }
}

// 3. 전문가: SheetExpert (데이터 분석 전담)
class SheetExpert {
    static observe(bb: SpiritBridge) {
        bb.subscribe((state) => {
            // 상태가 ANALYZING일 때만 반응
            if (state.status === 'ANALYZING' && state.sheetData) {
                console.log(`\n🔍 [전문가] '${state.fileName}' 분석 중...`);
                
                // 비즈니스 로직: 80점 이상 필터링
                const result = state.sheetData.filter(row => row.점수 >= 80);
                
                setTimeout(() => {
                    bb.update({
                        processedData: result,
                        status: 'COMPLETED'
                    });
                }, 1200); // 분석 시뮬레이션
            }
        });
    }
}

// --- 실행 및 전역 등록 ---

const spirit = new SpiritBridge();
SheetExpert.observe(spirit);

// 전역 Bridge 객체로 등록 (HTML 버튼에서 접근 가능하도록)
(window as any).Bridge = spirit;

// 화면 업데이트 리스너 (UI View)
spirit.subscribe((state) => {
    if (state.status === 'COMPLETED') {
        console.log("-----------------------------------------");
        console.log("✅ [v5.2 UI] 분석 완료! 80점 이상 리스트입니다.");
        console.table(state.processedData);
        console.log("👉 오빠, 앱쉘 하단 바에 '완료' 표시 띄울게!");
    }
});