require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// [통신 통합 로직]
io.on('connection', (socket) => {
    console.log('✅ 기기 연결됨:', socket.id);

    // 엔진 가동
    socket.on('engine-start', (data) => {
        console.log(`🚀 엔진 가동:`, data);
        socket.broadcast.emit('system-status-update', { status: "active" });
    });

    // 채팅 중계
    socket.on('chat-msg', (data) => {
        console.log(`💬 [채팅] ${data.user}: ${data.text}`);
        io.emit('receive-msg', data); 
    });

    // 🎙️ 음성 활성화(PTT) 신호 중계
    socket.on('ptt-start', () => {
        console.log(`🎙️ [PTT] 발신 시작: ${socket.id}`);
        socket.broadcast.emit('remote-ptt-start', { user: socket.id.substring(0, 4) });
    });

    socket.on('ptt-stop', () => {
        console.log(`🔇 [PTT] 발신 종료: ${socket.id}`);
        socket.broadcast.emit('remote-ptt-stop');
    });

    socket.on('disconnect', () => {
        console.log('❌ 연결 종료:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Spirit System v5.2 구동 중... http://localhost:${PORT}`);
});