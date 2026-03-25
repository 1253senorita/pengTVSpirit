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
const io = new Server(server, { cors: { origin: "*" } });

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

    // [3] 오디오 동기화 및 서버 저장 (Observer 패턴)
    socket.on('sync-audio-file', (data) => {
        if (!data.blob || !socket.myRoom) return;

        // 클라이언트로 즉시 중계 (Low Latency)
        socket.to(socket.myRoom).emit('receive-sync-audio', {
            blob: data.blob,
            id: userId
        });

        // 서버 파일 저장 (아카이빙)
        const fileName = `voice_${socket.myRoom}_${Date.now()}.webm`;
        const filePath = path.join(recDir, fileName);
        
        fs.writeFile(filePath, Buffer.from(data.blob), (err) => {
            if (!err) console.log(`💾 [SAVE] ${fileName} (${(data.blob.length/1024).toFixed(1)}KB)`);
        });
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
    console.log(`🔗 Local:  http://localhost:${PORT}`);
    console.log(`📱 Mobile: http://${ip}:${PORT}`);
    console.log("=".repeat(50) + `\n`);
});