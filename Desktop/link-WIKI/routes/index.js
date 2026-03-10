const express = require('express');
const router = express.Router();
const path = require('path');

// ---------------------------------------------------------
// [RUT(🛣️🛣️🛣️)] 경로 탐색 및 목적지 배정
// ---------------------------------------------------------

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;