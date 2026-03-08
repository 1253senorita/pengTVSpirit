/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║ [LSA] LAYER: NETWORK / INFRASTRUCTURE                  ║
 * ║ [LMT] FLOW: Client -> Server(Relay) -> Others          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

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

    /* ┌────────────────────────────────────────────────────────┐
       │ [CORE] Audio Broadcasting Logic                        │
       │ 설명: 음성 청크를 수신 즉시 브로드캐스팅하여 지연 최소화   │
       └────────────────────────────────────────────────────────┘ */
    socket.on('audio-chunk', (data) => {
        socket.broadcast.emit('audio-stream', data);
    });

    socket.on('disconnect', () => {
        console.log('👋 펭귄 나감:', socket.id);
    });
   
    /* ┌────────────────────────────────────────────────────────┐
       │ [KEEP] Text Message Relay                              │
       │ 설명: 채팅 메시지 중계 및 간단한 닉네임 처리              │
       └────────────────────────────────────────────────────────┘ */
    socket.on('send-text', (msg) => {
        io.emit('receive-text', {
            id: socket.id.substring(0, 5),
            text: msg
        });
    });
});

server.listen(3000, () => {
    console.log('🚀 PENG-Link 서버 가동! http://localhost:3000');
});