/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║ [LSA] LAYER: NETWORK / INFRASTRUCTURE                  ║
 * ║ [LMT] FLOW: Client (Full File) -> Server -> Broadcast   ║
 * ║ [PATH] C:\Users\55341\Desktop\PENG-Link\index.js          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

/* ┌────────────────────────────────────────────────────────┐
   │ [CORE] SOCKET.IO & SERVER CONFIGURATION                │
   └────────────────────────────────────────────────────────┘ */
const io = new Server(server, {
    maxHttpBufferSize: 2e7, // 20MB로 상향 (파일 통째 전송 대응)
    cors: { origin: "*" }
});

app.use(express.static('public'));

// [CHECK] 기록 폴더 생성
const uploadsDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📂 [System] recordings 폴더가 준비되었습니다.');
}

io.on('connection', (socket) => {
    const penguinId = socket.id.substring(0, 5);
    console.log(`🐧 [접속] 펭귄-${penguinId} 입장`);

    /* ┌────────────────────────────────────────────────────────┐
       │ [SYNC] File-Based Audio Synchronization (PTT Final)    │
       └────────────────────────────────────────────────────────┘ */
    // 클라이언트가 녹음을 마치고 완성된 Blob을 보냈을 때 처리
    socket.on('sync-audio-file', (data) => {
        console.log(`📡 [Sync] 펭귄-${penguinId}의 무전 데이터 수신 (크기: ${data.blob.length} bytes)`);

        // 1. 발신자를 제외한 모든 펭귄에게 완성된 파일 전파
        socket.broadcast.emit('receive-sync-audio', {
            blob: data.blob,
            id: penguinId
        });

        // 2. 서버 로컬 스토리지에 아카이브 저장
        const fileName = `sync_${penguinId}_${Date.now()}.webm`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFile(filePath, Buffer.from(data.blob), (err) => {
            if (err) {
                console.error('❌ [Error] 파일 동기화 저장 실패:', err);
            } else {
                console.log(`💾 [Archive] 동기화 완료 및 저장: ${fileName}`);
            }
        });
    });

    /* [KEEP] PTT Stop Signal (UI 상태 동기화용) */
    socket.on('ptt-stop-signal', () => {
        socket.broadcast.emit('user-stopped'); 
        console.log(`💤 [Signal] 펭귄-${penguinId} 무전 세션 종료`);
    });

    /* ┌────────────────────────────────────────────────────────┐
       │ [KEEP] Text Message Relay                              │
       └────────────────────────────────────────────────────────┘ */
    socket.on('send-text', (msg) => {
        io.emit('receive-text', {
            id: penguinId,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log(`👋 [퇴장] 펭귄-${penguinId} 나감`);
    });
});

/* ┌────────────────────────────────────────────────────────┐
   │ [RUN] SERVER EXECUTION                                 │
   └────────────────────────────────────────────────────────┘ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 PENG-Link 파일 동기화 서버 가동!`);
    console.log(`🔗 접속 주소: http://localhost:${PORT}`);
    console.log(`📂 무전 저장: ${uploadsDir}`);
    console.log(`🛠  모드: [FILE-SYNC] 안정성 우선 모드`);
    console.log('='.repeat(50) + '\n');
});