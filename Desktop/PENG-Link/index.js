/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║ [LSA] LAYER: NETWORK / INFRASTRUCTURE (REFINED)          ║
 * ║ [LMT] FLOW: Client -> Server -> Multi-Broadcast          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e7, // 10MB (음성 데이터 용량 대응)
    cors: { origin: "*" }
});

app.use(express.static('public'));

// [CHECK] 기록 폴더 생성 및 경로 설정
const uploadsDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📂 [System] recordings 폴더가 생성되었습니다.');
}

io.on('connection', (socket) => {
    const penguinId = socket.id.substring(0, 5);
    console.log(`🐧 [접속] 펭귄-${penguinId} 입장`);

    /* ┌────────────────────────────────────────────────────────┐
       │ [CORE] Audio Broadcasting (Real-time)                  │
       └────────────────────────────────────────────────────────┘ */
    socket.on('audio-chunk', (data) => {
        socket.broadcast.emit('audio-stream', data);
    });

    /* ┌────────────────────────────────────────────────────────┐
       │ [SYNC] Audio Archive (Save to Server)                  │
       └────────────────────────────────────────────────────────┘ */
    socket.on('save-audio', (blobData) => {
        const fileName = `voice_${penguinId}_${Date.now()}.webm`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFile(filePath, blobData, (err) => {
            if (err) console.error('❌ [Error] 파일 저장 실패:', err);
            else console.log(`💾 [Archive] 저장 완료: ${fileName}`);
        });
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

// [RUN] 서버 실행 및 접속 정보 출력
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 PENG-Link 서버 가동 성공!`);
    console.log(`🔗 접속 주소: http://localhost:${PORT}`);
    console.log(`📂 무전 저장: ${uploadsDir}`);
    console.log('='.repeat(50) + '\n');
});