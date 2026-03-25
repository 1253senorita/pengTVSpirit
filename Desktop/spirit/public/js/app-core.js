/* ==========================================================
   🚀 SPIRIT SYSTEM v5.2 CORE MANAGER
   ========================================================== */
const App = {
    // 1. 시스템 상태 관리 (내부에 격리)
    state: {
        isEngineActive: false,
        socket: null,
        peer: null,
        myPeerId: null,
        localStream: null,
        currentView: 'initial',
        room: 'DEFAULT_ROOM'
    },

    // 2. 엔진 초기화 (최초 실행)
    init: function() {
        console.log("💎 System Initializing...");
        this.state.socket = io();
        
        // PeerJS 설정
        this.state.peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: location.port || (location.protocol === 'https:' ? 443 : 80)
        });

        this.setupEventListeners();
    },

    // 3. 이벤트 리스너 통합 관리
    setupEventListeners: function() {
        const { peer, socket } = this.state;

        // Peer 연결 성공
        peer.on('open', id => {
            this.state.myPeerId = id;
            console.log('✅ 통신 ID 할당됨:', id);
        });

        // 상대방에게 전화가 왔을 때 (수신)
        peer.on('call', async (call) => {
            console.log("📞 Incoming Call...");
            if (!this.state.localStream) {
                this.state.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            call.answer(this.state.localStream);
            call.on('stream', stream => this.playRemoteAudio(stream));
        });

        // 채팅 수신
        socket.on('receive-msg', (data) => this.renderMessage(data));
    },

    // 4. 엔진 활성화 (버튼 클릭 시)
    activate: function() {
        if (this.state.isEngineActive) return;

        const statusText = document.getElementById('status');
        if (statusText) {
            statusText.innerText = "Engine Starting...";
            statusText.style.color = "#ffcc00";
        }

        setTimeout(() => {
            this.state.isEngineActive = true;
            if (statusText) {
                statusText.innerText = "System Online";
                statusText.style.color = "#00ff88";
            }
            this.state.socket.emit('join-room', this.state.room);
            this.switchView('phone'); // 첫 화면으로 이동
        }, 800);
    },

    // 5. 화면 전환 로직 (HTML 템플릿 엔진 역할)
    switchView: function(view) {
        if (!this.state.isEngineActive && view !== 'initial') return alert("엔진을 먼저 활성화하세요.");
        
        const viewport = document.getElementById('app-viewport');
        if (!viewport) return;

        this.state.currentView = view;
        this.updateNavUI(view);

        // 각 화면별 HTML 템플릿
        const templates = {
            phone: `
                <div class="view-fade">
                    <h2 class="auth-title">📞 DIALER</h2>
                    <div class="auth-box">
                        <input type="text" id="dial-number" placeholder="상대방 ID" readonly class="neo-input" style="text-align:center; margin-bottom:15px;">
                        <div class="button-group" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:15px;">
                            ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => `<button onclick="App.appendNum('${n}')" class="neo-btn">${n}</button>`).join('')}
                        </div>
                        <button onclick="App.makeCall()" class="neo-btn" style="width:100%; background:var(--accent-color); color:white;">통화 시작</button>
                    </div>
                </div>`,
            ptt: `
                <div class="view-fade">
                    <h2 class="auth-title">📻 Push-To-Talk</h2>
                    <div class="auth-box">
                        <div id="ptt-status" class="status-badge">READY</div>
                        <div class="ptt-container">
                             <button id="p-trig" class="neo-btn" 
                                onmousedown="App.startPTT()" onmouseup="App.stopPTT()" 
                                ontouchstart="App.startPTT()" ontouchend="App.stopPTT()"
                                style="width:120px; height:120px; border-radius:50%; font-size:2rem;">🎙️</button>
                        </div>
                    </div>
                </div>`,
            chat: `
                <div class="view-fade" style="height:100%; width:100%;">
                    <h2 class="auth-title">💬 CHAT</h2>
                    <div id="chat-logs" style="flex:1; width:100%; overflow-y:auto; padding:10px; background:rgba(0,0,0,0.02); border-radius:15px; margin-bottom:10px;"></div>
                    <div style="display:flex; width:100%; gap:10px;">
                        <input type="text" id="msg-input" class="neo-input" style="flex:1;" placeholder="메시지..." onkeypress="if(event.key==='Enter') App.sendMessage()">
                        <button onclick="App.sendMessage()" class="neo-btn">전송</button>
                    </div>
                </div>`
        };

        viewport.innerHTML = templates[view] || '';
    },

    // 6. 세부 기능 로직
    appendNum: function(n) {
        const input = document.getElementById('dial-number');
        if (input) input.value += n;
    },

    makeCall: async function() {
        const targetId = document.getElementById('dial-number').value;
        if (!targetId) return alert("ID를 입력하세요.");

        if (!this.state.localStream) {
            this.state.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        const call = this.state.peer.call(targetId, this.state.localStream);
        call.on('stream', stream => this.playRemoteAudio(stream));
    },

    playRemoteAudio: function(stream) {
        let audio = document.getElementById('remote-audio-el') || document.createElement('audio');
        audio.id = 'remote-audio-el';
        audio.srcObject = stream;
        document.body.appendChild(audio);
        audio.play();
    },

    startPTT: function() {
        document.getElementById('ptt-status').innerText = "TX TRANSMITTING...";
        this.state.socket.emit('ptt-start', { id: this.state.myPeerId });
    },

    stopPTT: function() {
        document.getElementById('ptt-status').innerText = "READY";
        this.state.socket.emit('ptt-stop');
    },

    sendMessage: function() {
        const input = document.getElementById('msg-input');
        if (!input.value.trim()) return;
        this.state.socket.emit('chat-msg', {
            user: this.state.myPeerId?.substring(0,4) || 'Anon',
            text: input.value.trim(),
            time: new Date().toLocaleTimeString()
        });
        input.value = '';
    },

    renderMessage: function(data) {
        const logs = document.getElementById('chat-logs');
        if (!logs) return;
        const div = document.createElement('div');
        div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
        logs.appendChild(div);
        logs.scrollTop = logs.scrollHeight;
    },

    updateNavUI: function(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.boxShadow = (btn.id === `btn-${view}`) ? 'var(--inner-shadow)' : 'var(--outer-shadow)';
        });
    }
};

// 페이지 로드 시 앱 초기화
window.onload = () => App.init();