const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 📡 [SYS] PeerJS 서버 통합 (전체 모듈 공용 음성 터널)
const peerServer = ExpressPeerServer(server, { debug: true, path: '/' });
app.use('/peerjs', peerServer);

// 📂 [SYS] 정적 파일 경로 개방 (public 폴더 전체)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------
// 🏗️ 모듈 엔진 분리 칸 (여기서 모듈을 하나씩 추가해)
// ---------------------------------------------------------

// 🐻 1호기: BEAR-Talkie (곰 무전기)
const bearLogic = require('./public/modules/bear-talkie/modules/bear-logic');
bearLogic(io); 

// 🐧 2호기: PENG-PTT (펭귄 PTT)
const pengLogic = require('./public/modules/peng-ptt/modules/peng-logic');
pengLogic(io); 

// ---------------------------------------------------------

// 🏁 [PORT] 시스템 서비스 시작
const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`
    ###########################################
    #       🚀 WIKI-ROUTER DUAL ENGINE        #
    #    ---------------------------------    #
    #    [1] BEAR-Talkie : LOADED             #
    #    [2] PENG-PTT    : LOADED             #
    #                                         #
    #    ADDR: http://127.0.0.1:3000          #
    ###########################################
    `);
});