const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 2e7, // 20MB 음성 데이터 허용
    cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

// [SIO_S(📡📡📡)] 소켓 서버 데이터 브로드캐스팅
io.on('connection', (socket) => {
    socket.on('PTT_SIGNAL', (data) => io.emit('EV_SIGNAL', data));
    socket.on('sync-audio-file', (payload) => socket.broadcast.emit('play-voice', payload));
    socket.on('CH_CHANGE', (data) => io.emit('CH_UPDATE', data));
});

// [PORT(🚪🚪🚪)] 3000번 포트 개방 및 로컬 주소 출력
const PORT = 3000;
const ADDR = '127.0.0.1';

server.listen(PORT, ADDR, () => {
    console.log(`
    ==================================================
    🚀 PENG-Link v3.5 SYSTEM READY
    --------------------------------------------------
    PORT(🚪🚪🚪) : ${PORT}
    LOCAL(🔗)    : http://${ADDR}:${PORT}
    ==================================================
    `);
});