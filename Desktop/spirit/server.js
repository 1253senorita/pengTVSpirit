/* [SRV] Spirit v5.2 + Wiki-Router Hybrid Engine */
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

// 1. 저장소 설정
const recDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(recDir)) {
    fs.mkdirSync(recDir);
}

// 2. PeerJS 서버 활성화
const peerServer = ExpressPeerServer(server, { debug: false, path: '/' });
app.use('/peerjs', peerServer);
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------------
// 3. 실시간 통신 (Socket.io) 핵심 로직
// ----------------------------------------------------------
io.on('connection', (socket) => {
    const penguinId = socket.id.substring(0, 5);
    console.log(`📡 [CONN] 새 연결 발생: ${penguinId}`);

    // --- [전화 기능: Signaling] ---
    socket.on('call-request', (data) => {
        console.log(`\n[SRV-RTC] 📞 통화 시도: [${data.from}] -> [${data.to}]`);
        // 특정 대상에게 전달하거나 테스트용 브로드캐스트
        socket.broadcast.emit('incoming-call', data); 
    });

    // --- [무전 기능: PTT] ---
    socket.on('ptt-start', (data) => {
        console.log(`[SRV-PTT] 📻 송신 중: ${data.id}`);
        socket.broadcast.emit('ptt-receiving', { id: data.id });
    });

    socket.on('ptt-stop', (data) => {
        console.log(`[SRV-PTT] 📴 송신 종료: ${data.id}`);
        socket.broadcast.emit('ptt-stopped');
    });

    // --- [채팅 기능] ---
    socket.on('chat-msg', (data) => {
        console.log(`[CHAT] ${data.user}: ${data.text}`);
        io.emit('receive-msg', data); // 모두에게 전달
    });

    // --- [방 입장 및 오디오 저장 로직] ---
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.myRoom = roomId;
        console.log(`🏠 [ROOM] ${penguinId} -> ${roomId} 입장`);
    });

    socket.on('sync-audio-file', (data) => {
        if (!data.blob || !socket.myRoom) return;
        socket.to(socket.myRoom).emit('receive-sync-audio', {
            blob: data.blob,
            id: penguinId
        });

        const fName = `voice_${socket.myRoom}_${Date.now()}.webm`;
        fs.writeFile(path.join(recDir, fName), Buffer.from(data.blob), (err) => {
            if (err) console.error("파일 저장 실패:", err);
        });
    });

    // --- [상태 체크] ---
    socket.on('ping-check', () => {
        socket.emit('pong-response', { status: true, time: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log(`🔌 [DISCONN] 연결 종료: ${penguinId}`);
    });
});

// ----------------------------------------------------------
// 4. 네트워크 및 서버 시작 설정
// ----------------------------------------------------------
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

const PORT = process.env.PORT || 3000;
const LOCAL_IP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==========================================================`);
    console.log(`🚀 Spirit v5.2 Hybrid Engine Online`);
    console.log(`----------------------------------------------------------`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    console.log(`📱 Mobile:  http://${LOCAL_IP}:${PORT}`);
    console.log(`==========================================================\n`);
});