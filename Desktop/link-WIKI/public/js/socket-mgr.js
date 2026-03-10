const socket = io();

// UI Elements
const led = document.getElementById('led');
const ptt = document.getElementById('ptt-trigger');
const bar = document.getElementById('v-meter-bar');
const statusText = document.getElementById('display-info');
const remoteAudio = document.getElementById('remote-audio');

let mediaRecorder = null;
let audioChunks = []; // [저장소] 음성 조각들을 모으는 배열
let vuInterval = null;

// [System] 마이크 및 녹음 엔진 초기화
async function initVoiceEngine() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        // 녹음 중 데이터가 발생할 때마다 배열에 추가 (압축 준비)
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        // 녹음 중단 시 (PTT Off) 모든 조각을 하나로 압축하여 전송
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            socket.emit('sync-audio-file', { 
                blob: audioBlob, 
                user: 'MASTER',
                timestamp: new Date().getTime() 
            });
            audioChunks = []; // 저장소 비우기 (다음 무전 준비)
        };
    } catch (err) {
        console.error("마이크 권한 오류:", err);
    }
}
initVoiceEngine();

// ---------------------------------------------------------
// [EV(📢📢📢)] PTT 제어 로직
// ---------------------------------------------------------
const startPTT = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        audioChunks = []; // 시작 전 초기화
        mediaRecorder.start();
        socket.emit('PTT_SIGNAL', { state: 'ON', user: 'MASTER' });
    }
};

const stopPTT = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop(); // 여기서 onstop 이벤트가 발생하며 전송됨
        socket.emit('PTT_SIGNAL', { state: 'OFF', user: 'MASTER' });
    }
};

// [이벤트] PC & 모바일 통합
ptt.onmousedown = startPTT;
ptt.onmouseup = stopPTT;
ptt.ontouchstart = (e) => { e.preventDefault(); startPTT(); };
ptt.ontouchend = (e) => { e.preventDefault(); stopPTT(); };

// ---------------------------------------------------------
// [SIO_C(💎🔗💎)] 수신 및 시각화
// ---------------------------------------------------------
socket.on('EV_SIGNAL', (data) => {
    if (data.state === 'ON') {
        led.style.background = '#f00';
        statusText.innerText = `TX: ${data.user}`;
        statusText.style.color = '#f00';
        // V-Meter 작동
        if (!vuInterval) {
            vuInterval = setInterval(() => {
                bar.style.width = `${Math.floor(Math.random() * 50) + 50}%`;
            }, 70);
        }
    } else {
        clearInterval(vuInterval);
        vuInterval = null;
        led.style.background = '#0f0';
        statusText.innerText = 'READY';
        statusText.style.color = '#0f0';
        bar.style.width = '0%';
    }
});

// [파일 수신] 압축된 음성 파일 재생
socket.on('play-voice', (payload) => {
    const blob = new Blob([payload.blob], { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    remoteAudio.src = url;
    remoteAudio.play();
});