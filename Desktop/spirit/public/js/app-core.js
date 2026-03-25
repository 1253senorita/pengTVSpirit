/* ==========================================
   1. 상태 관리 및 시스템 초기화
   ========================================== */
let isEngineActive = false;
const socket = io(); 
let myPeerId = null;
let localStream = null; // 내 마이크 스트림 저장용

// PeerJS 설정
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: location.port || (location.protocol === 'https:' ? 443 : 80)
});

peer.on('open', id => {
    myPeerId = id;
    console.log('💎 내 통신 ID:', id);
});

/* [핵심 추가] 상대방이 나에게 전화를 걸었을 때 받는 로직 */
peer.on('call', async (call) => {
    console.log("📞 누군가로부터 전화가 왔습니다!");
    
    // 마이크 권한 확인 및 스트림 획득
    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    
    // 전화 받기 (내 스트림 전송)
    call.answer(localStream);
    
    // 상대방 목소리 들리기 시작할 때
    call.on('stream', (remoteStream) => {
        playRemoteAudio(remoteStream);
    });
});

/* ==========================================
   2. 엔진 활성화 로직
   ========================================== */
function activateEngine() {
    if (isEngineActive) return;

    const statusText = document.getElementById('status');
    if (statusText) {
        statusText.innerText = "System Loading...";
        statusText.style.color = "#ffcc00";
    }

    socket.emit('engine-start', { timestamp: Date.now(), status: 'active' });

    setTimeout(() => {
        isEngineActive = true;
        if (statusText) {
            statusText.innerText = "Running...";
            statusText.style.color = "#00ff88";
        }
        const initialView = document.getElementById('initial-view');
        if (initialView) initialView.style.display = 'none';

        console.log("Spirit System v5.2 Online.");
        switchView('phone');
    }, 1000);
}

/* ==========================================
   3. 화면 전환 및 UI 제어
   ========================================== */
function handleNavClick(view) {
    if (!isEngineActive) return alert("엔진을 먼저 활성화해주세요.");
    switchView(view);
}

function switchView(view) {
    const mainEl = document.getElementById('main-blanket');
    if (!mainEl) return;

    updateNavUI(view);

    if (view === 'phone') {
        mainEl.innerHTML = `
            <div id="phone-interface" class="view-fade">
                <h2 class="auth-title">📞 DIALER</h2>
                <div class="auth-box" style="margin: 0 auto;">
                    <input type="text" id="dial-number" placeholder="ID 입력" readonly class="neo-input">
                    <div class="button-group">
                        <button onclick="appendNum('1')" class="neo-btn">1</button>
                        <button onclick="appendNum('2')" class="neo-btn">2</button>
                        <button onclick="appendNum('3')" class="neo-btn">3</button>
                    </div>
                    <button onclick="makeCall()" class="call-btn">통화 시작</button>
                </div>
            </div>`;
    } else if (view === 'ptt') {
        mainEl.innerHTML = `
            <div id="ptt-interface" class="view-fade">
                <h2 class="auth-title">📻 Push-To-Talk</h2>
                <div class="auth-box">
                    <div id="ptt-status">대기 중...</div>
                    <button id="ptt-btn" class="p-trig" onmousedown="startPTT()" onmouseup="stopPTT()" ontouchstart="startPTT()" ontouchend="stopPTT()">📻</button>
                    <p style="margin-top:10px; font-size:12px; color:#888;">버튼을 누르는 동안 송신합니다</p>
                </div>
            </div>`;
    } else if (view === 'chat') {
        mainEl.innerHTML = `
            <div id="chat-interface" class="view-fade">
                <h2 class="auth-title">💬 실시간 문자</h2>
                <div id="chat-logs" class="chat-display"></div>
                <div class="chat-input-row">
                    <input type="text" id="msg-input" placeholder="메시지 입력..." onkeypress="handleChatKey(event)">
                    <button onclick="sendMessage()" class="send-btn">전송</button>
                </div>
            </div>`;
    }
}

function updateNavUI(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${view}`);
    if (activeBtn) activeBtn.classList.add('active');
}

/* ==========================================
   4. 세부 기능 핸들러
   ========================================== */

// --- [전화 기능] ---
function appendNum(num) {
    const dialInput = document.getElementById('dial-number');
    if (dialInput) {
        dialInput.value += num;
        if (navigator.vibrate) navigator.vibrate(30); 
    }
}

async function makeCall() {
    const targetId = document.getElementById('dial-number').value;
    if (!targetId) return alert("ID를 입력하세요.");

    console.log(`📡 [RTC] ${targetId}에게 연결 시도...`);

    try {
        if (!localStream) {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        const call = peer.call(targetId, localStream);
        
        call.on('stream', (remoteStream) => {
            console.log("🔊 상대방 음성 수신 성공!");
            playRemoteAudio(remoteStream);
        });

        socket.emit('call-request', { from: myPeerId, to: targetId });
    } catch (err) {
        console.error("마이크 접근 실패:", err);
        alert("마이크 권한이 필요합니다.");
    }
}

function playRemoteAudio(stream) {
    let audio = document.getElementById('remote-audio-el');
    if(!audio) {
        audio = document.createElement('audio');
        audio.id = 'remote-audio-el';
        document.body.appendChild(audio);
    }
    audio.srcObject = stream;
    audio.play();
}

// --- [무전 기능] ---
function startPTT() {
    if (!isEngineActive) return;
    console.log("🎤 무전 송신 시작...");
    const status = document.getElementById('ptt-status');
    status.innerText = "송신 중!!";
    status.style.color = "#ff4444";
    socket.emit('ptt-start', { id: myPeerId, room: 'DEFAULT_ROOM' });
}

function stopPTT() {
    console.log("📴 무전 송신 종료");
    const status = document.getElementById('ptt-status');
    status.innerText = "대기 중...";
    status.style.color = "inherit";
    socket.emit('ptt-stop', { id: myPeerId, room: 'DEFAULT_ROOM' });
}

// --- [문자 기능] ---
function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!input || !input.value.trim()) return;

    socket.emit('chat-msg', {
        user: "User_" + (myPeerId ? myPeerId.substring(0,4) : "Anon"),
        text: input.value.trim(),
        time: new Date().toLocaleTimeString()
    });
    input.value = '';
}

function handleChatKey(e) { if (e.key === 'Enter') sendMessage(); }

socket.on('receive-msg', (data) => {
    const chatLogs = document.getElementById('chat-logs');
    if (chatLogs) {
        const msgDiv = document.createElement('div');
        msgDiv.className = "msg-item";
        msgDiv.innerHTML = `<strong>${data.user}:</strong> ${data.text} <span class="msg-time">${data.time}</span>`;
        chatLogs.appendChild(msgDiv);
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }
});