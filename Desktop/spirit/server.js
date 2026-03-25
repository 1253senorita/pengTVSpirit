/* ==========================================================
   🍎 SYSTEM CORE & MIDDLEWARE
   ========================================================== */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    maxHttpBufferSize: 1e7 // 10MB까지 허용 (음성 파일 대응)
});

// 녹음 디렉토리 초기화
const recDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(recDir)) fs.mkdirSync(recDir);

// RTC 및 정적 파일 서버 설정
const peerServer = ExpressPeerServer(server, { debug: false, path: '/' });
app.use('/peerjs', peerServer);
app.use(express.static(path.join(__dirname, 'public')));

/* ==========================================================
   🍇 SOCKET.IO HUB (이벤트 통합 관리)
   ========================================================== */
io.on('connection', (socket) => {
    const userId = socket.id.substring(0, 5);
    console.log(`📡 [CONN] User Connected: ${userId}`);

    // [1] 방 입장 로직
    socket.on('join-room', (roomId) => {
        if(!roomId) roomId = 'DEFAULT_ROOM';
        socket.join(roomId);
        socket.myRoom = roomId;
        console.log(`🏠 [ROOM] ${userId} -> ${roomId}`);
    });

    // [2] PTT / 실시간 음성 통제
    socket.on('ptt-start', (data) => {
        console.log(`🎤 [TX] Start: ${userId}`);
        socket.to(socket.myRoom).emit('ptt-receiving', { id: data.id });
    });

    socket.on('ptt-stop', () => {
        console.log(`🔇 [TX] Stop: ${userId}`);
        socket.to(socket.myRoom).emit('ptt-stopped');
    });

    // [3] 오디오 동기화 및 서버 저장 (안정성 강화 버전)
    socket.on('sync-audio-file', (data) => {
        try {
            if (!data.blob || !socket.myRoom) return;

            // 클라이언트로 즉시 중계
            socket.to(socket.myRoom).emit('receive-sync-audio', {
                blob: data.blob,
                id: userId
            });

            // 바이너리 데이터 변환 처리
            const audioBuffer = Buffer.isBuffer(data.blob) ? data.blob : Buffer.from(data.blob);

            // 파일명에 시간/사용자 정보 포함
            const fileName = `rec_${socket.myRoom}_${userId}_${Date.now()}.webm`;
            const filePath = path.join(recDir, fileName);
            
            fs.writeFile(filePath, audioBuffer, (err) => {
                if (err) {
                    console.error(`❌ [SAVE_ERR] ${fileName}:`, err);
                } else {
                    console.log(`💾 [SAVE] ${fileName} (${(audioBuffer.length/1024).toFixed(1)}KB)`);
                }
            });
        } catch (error) {
            console.error("⚠️ [SYNC_ERR] Audio Processing Failed:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 [DISCONN] ${userId}`);
    });
});

/* ==========================================================
   🍓 NETWORK BOOTSTRAP
   ========================================================== */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`\n` + "=".repeat(50));
    console.log(`🚀 SPIRIT v5.2 ENGINE ONLINE`);
    console.log(`🔗 Local:   http://localhost:${PORT}`);
    console.log(`📱 Mobile:  http://${ip}:${PORT}`);
    console.log("=".repeat(50) + `\n`);
});