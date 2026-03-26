// src/blackboard/store.ts
export interface BlackboardState {
    inputData: string | null;
    analysisResult: any;
    status: 'idle' | 'processing' | 'completed';
}

export class Blackboard {
    private state: BlackboardState = {
        inputData: null,
        analysisResult: null,
        status: 'idle'
    };

    private subscribers: ((state: BlackboardState) => void) [] = [];

    // 상태 업데이트 및 알림 (Reactive 핵심)
    update(patch: Partial<BlackboardState>) {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    getState() { return this.state; }

    subscribe(callback: (state: BlackboardState) => void) {
        this.subscribers.push(callback);
    }

    private notify() {
        this.subscribers.forEach(cb => cb(this.state));
    }
}