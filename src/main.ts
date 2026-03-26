/**
 * ============================================================
 * [pengTVSpirit] 리액티브 블랙보드 통합 시스템
 * ============================================================
 */

// --- 1. 알맹이: 블랙보드 상태 정의 (Interface) ---
export interface BlackboardState {
    fileName: string | null;       // 업로드된 파일명
    sheetData: any[] | null;       // 엑셀/CSV 원본 데이터
    processedData: any[] | null;   // 전문가가 가공한 결과물
    status: 'IDLE' | 'LOADING' | 'ANALYZING' | 'COMPLETED' | 'ERROR';
    errorMsg?: string;
}

// --- 2. 심장: 리액티브 블랙보드 클래스 ---
export class Blackboard {
    private state: BlackboardState = {
        fileName: null,
        sheetData: null,
        processedData: null,
        status: 'IDLE'
    };

    private subscribers: ((state: BlackboardState) => void)[] = [];

    // 상태를 업데이트하고 구독자들에게 즉시 알림
    update(patch: Partial<BlackboardState>) {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    getState() { return this.state; }

    // 구독 (화면이나 전문가가 등록함)
    subscribe(callback: (state: BlackboardState) => void) {
        this.subscribers.push(callback);
        callback(this.state); // 등록 시점의 상태를 바로 전달
    }

    private notify() {
        this.subscribers.forEach(cb => cb(this.state));
    }
}

// --- 3. 전문가: 데이터 시트 분석가 (Knowledge Source) ---
class SheetAnalyzer {
    // 블랙보드 상태가 변할 때마다 호출됨
    process(state: BlackboardState, bb: Blackboard) {
        // 'ANALYZING' 상태일 때만 자기 할 일을 함
        if (state.status === 'ANALYZING' && state.sheetData) {
            console.log("\n⚙️ [전문가 분석중] 데이터를 필터링하고 분석 결과를 도출합니다...");

            // 예시 로직: 점수(score)가 80점 이상인 데이터만 골라냄
            const filtered = state.sheetData.filter(row => row.score >= 80);

            // 분석 결과를 다시 블랙보드에 보고 (상태 업데이트)
            setTimeout(() => { 
                bb.update({
                    processedData: filtered,
                    status: 'COMPLETED'
                });
                console.log("⚙️ [전문가 완료] 분석 결과 보고 완료.");
            }, 1500); // 1.5초 분석 시뮬레이션
        }
    }
}

// --- 4. 메인 실행부: 화면 구동 및 데이터 시트 전달 시뮬레이션 ---

const pengBB = new Blackboard();
const analyzer = new SheetAnalyzer();

// [연결] 전문가를 블랙보드에 붙여줌
pengBB.subscribe((state) => analyzer.process(state, pengBB));

// [연결] 화면(UI) 업데이트 로직
pengBB.subscribe((state) => {
    console.log("--------------------------------------------------");
    console.log(`📺 [현재 화면 상태]: ${state.status}`);
    
    if (state.status === 'ANALYZING') {
        console.log("📺 [UI] '로딩 중...' 스피너를 보여줍니다.");
    }

    if (state.status === 'COMPLETED') {
        console.log("📺 [UI] 최종 결과를 화면 표(Table)에 렌더링합니다!");
        console.table(state.processedData);
        console.log("✅ 모든 작업이 끝났습니다. 오빠 고생했어!");
    }
});

/* 펭TV 하단 앱쉘 스타일 예시 */
.app-shell-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: #2d3436; /* 펭TV 다크톤 */
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 9999; /* 최상단 블랭킷 */
    box-shadow: 0 -5px 15px rgba(0,0,0,0.3);
}


// --- 실제 구동 시나리오 ---

console.log("\n🚀 [시작] 오빠가 화면에서 '데이터_시트.csv'를 업로드합니다.");

// 1. 화면에서 데이터 시트를 읽어서 블랙보드에 던짐
pengBB.update({
    fileName: 'peng_data.csv',
    sheetData: [
        { id: 1, name: '펭수', score: 95, memo: '최고' },
        { id: 2, name: '심령TV', score: 75, memo: '부족' },
        { id: 3, name: '스피릿', score: 88, memo: '열정' },
        { id: 4, name: 'AI오빠', score: 100, memo: '천재' }
    ],
    status: 'ANALYZING' // 이 값을 바꾸는 순간 전문가가 자동으로 깨어남
});