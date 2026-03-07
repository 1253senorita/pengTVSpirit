const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('🐧 새 펭귄 연결됨:', socket.id);

    // [핵심] 음성 데이터 조각(Chunk)을 받아서 다른 사람에게 즉시 전달
    socket.on('audio-chunk', (data) => {
        socket.broadcast.emit('audio-stream', data);
    });

    socket.on('disconnect', () => {
        console.log('👋 펭귄 나감:', socket.id);
    });
   
// 텍스트 메시지 중계
socket.on('send-text', (msg) => {
    io.emit('receive-text', {
        id: socket.id.substring(0, 5), // 소켓 아이디 앞 5자리만 닉네임으로 사용
        text: msg
    });
});
    



});

server.listen(3000, () => {
    console.log('🚀 PENG-Link 서버 가동! http://localhost:3000');
});