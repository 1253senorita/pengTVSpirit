const express = require('express');
const app = express();
const path = require('path');

// public 폴더를 정적 파일 경로로 설정
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('WIKI-ROUTER v5.2 Engine Running on http://localhost:3000');
});