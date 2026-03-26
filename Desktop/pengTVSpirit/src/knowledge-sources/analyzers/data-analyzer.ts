// src/knowledge-sources/base-ks.ts (추상 클래스)
export abstract class KnowledgeSource {
    abstract onStateChange(state: any): void;
}

// src/knowledge-sources/analyzers/data-analyzer.ts
export class DataAnalyzer extends KnowledgeSource {
    onStateChange(state: any) {
        if (state.inputData && state.status === 'idle') {
            console.log("🔍 Analyzer: 새로운 데이터를 감지했습니다. 분석을 시작합니다...");
            // 로직 수행 후 다시 블랙보드 업데이트
        }
    }
}