const { PeerServer } = require('peer');

// 9000번 포트 관제 엔진
const peerServer = PeerServer({
    port: 9000,
    path: '/myapp',
    key: 'peerjs',
    allow_discovery: true,
    proxied: true
});

console.log(`
################################################
   WIKI-ROUTER v5.2 [CORE-ENGINE] ACTIVE
   - 관제 포트: 9000
   - 시스템 경로: /myapp
   - 가동 시각: ${new Date().toLocaleString()}
################################################
`);

// 1. [접속 관리]
peerServer.on('connection', (client) => {
    const id = client.getId();
    console.log(`\n✅ [IN] 유저 접속: ${id}`);
    if(id.includes('MASTER')) console.log(`   🌟 [SYSTEM] 대장 지휘소 통제권 획득.`);
});

// 2. [연결 관리] 누가 누구랑 무전기 연결을 시도하나?
peerServer.on('message', (client, message) => {
    if (message.type === 'OFFER' || message.type === 'CANDIDATE') {
        console.log(`📡 [SIGNAL] ${client.getId()} -> 상대방에게 통신 신호 송출 중...`);
    }
});

// 3. [에러 관리] webrtc 에러 등 상세 보고
peerServer.on('error', (err) => {
    console.log(`\n⚠️ [DEBUG-REPORT]`);
    console.log(`   └─ 발생지: SERVER_NODE`);
    console.log(`   └─ 내용: ${err.message}`);
});

// 4. [해제 관리]
peerServer.on('disconnect', (client) => {
    console.log(`\n❌ [OUT] 유저 이탈: ${client.getId()}`);
});