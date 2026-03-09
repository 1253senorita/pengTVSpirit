const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// [ 핵심 ] 서버 객체를 명확히 생성합니다.
const server = http.createServer(app); 
const io = new Server(server);

const PORT = 3000;
const HOST = '0.0.0.0';

// 소켓 연결 테스트
io.on('connection', (socket) => {
    console.log('--- 신규 사용자 연결됨 ---');
    console.log('ID:', socket.id);
});

// 서버 시작
server.listen(PORT, HOST, () => {
    console.log('====================================');
    console.log(`  PENG-Link-v3 서버가 시작되었습니다!`);
    console.log(`  접속 주소: http://localhost:${PORT}`);
    console.log('====================================');
});