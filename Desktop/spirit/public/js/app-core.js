/* ==========================================================
   🚀 SPIRIT SYSTEM v5.2 CORE MANAGER (Hybrid Edition)
   ========================================================== */
const App = {
    // 1. 시스템 상태 관리
    state: {
        isEngineActive: false,
        socket: null,
        peer: null,
        myPeerId: null,
        localStream: null,
        currentView: 'initial',
        room: 'DEFAULT_ROOM'
    },

    // 2. 엔진 초기화
    init: function() {
        console.log("💎 System Initializing...");
        this.state.socket = io();
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

        peer.on('open', id => {
            this.state.myPeerId = id;
            console.log('✅ 통신 ID 할당됨:', id);
        });

        peer.on('call', async (call) => {
            console.log("📞 Incoming Call...");
            if (!this.state.localStream) {
                this.state.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            call.answer(this.state.localStream);
            call.on('stream', stream => this.playRemoteAudio(stream));
        });

        socket.on('receive-msg', (data) => this.renderMessage(data));
    },

    // 4. 엔진 활성화
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
            this.switchView('phone'); // 첫 화면이 전화 화면으로 자동 전환
        }, 800);
    },

    // 5. 화면 전환 로직
    switchView: function(view) {
        // 엔진 활성화 전에는 initial 뷰 외에 접근 불가
        if (!this.state.isEngineActive && view !== 'initial') {
            return alert("엔진을 먼저 활성화하세요.");
        }

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
            classic_v06: `
                <div class="view-fade" style="width:100%; height:100%; display:flex; flex-direction:column; padding:0;">
                    <div style="padding:10px; text-align:center; font-size:0.8rem; color:#888;">🍎 CLASSIC MODE v06</div>
                    <iframe src="/v06/index.html" 
                            style="flex:1; width:100%; border:none; border-radius:15px; background:#fff; box-shadow:var(--inner-shadow);">
                    </iframe>
                </div>`,
            chat: `
                <div class="view-fade" style="height:100%; width:100%; display:flex; flex-direction:column;">
                    <h2 class="auth-title">💬 CHAT</h2>
                    <div id="chat-logs" style="flex:1; width:100%; overflow-y:auto; padding:10px; background:rgba(0,0,0,0.02); border-radius:15px; margin-bottom:10px; min-height:200px;"></div>
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
        audio.play().catch(e => console.error("오디오 재생 실패:", e));
    },

    startPTT: function() {
        const el = document.getElementById('ptt-status');
        if (el) el.innerText = "TX TRANSMITTING...";
        this.state.socket.emit('ptt-start', { id: this.state.myPeerId });
    },

    stopPTT: function() {
        const el = document.getElementById('ptt-status');
        if (el) el.innerText = "READY";
        this.state.socket.emit('ptt-stop');
    },

    sendMessage: function() {
        const input = document.getElementById('msg-input');
        if (!input || !input.value.trim()) return;
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
        div.style.marginBottom = "5px";
        div.innerHTML = `<small style="color:#888;">[${data.time}]</small> <strong>${data.user}:</strong> ${data.text}`;
        logs.appendChild(div);
        logs.scrollTop = logs.scrollHeight;
    },

    updateNavUI: function(view) {
        // 모든 네비게이션 버튼을 돌면서 활성화된 것만 안쪽 그림자(눌린 효과)를 줍니다.
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isTarget = btn.getAttribute('onclick').includes(`'${view}'`);
            btn.style.boxShadow = isTarget ? 'var(--inner-shadow)' : 'var(--outer-shadow)';
            btn.style.color = isTarget ? 'var(--accent-color)' : 'inherit';
        });
    }
};

window.onload = () => App.init();