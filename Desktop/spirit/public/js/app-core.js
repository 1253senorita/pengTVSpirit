// 1. 상태 관리 및 소켓 초기화
let isEngineActive = false;
const socket = io();

/**
 * 엔진 활성화: 서버 연결 + 화면 전환 시작
 */
function activateEngine() {
    if (isEngineActive) return;

    console.log("Engine activation sequence started...");

    // UI 피드백: 로딩 상태 표시
    const statusText = document.getElementById('status');
    if (statusText) {
        statusText.innerText = "System Loading...";
        statusText.style.color = "#ffcc00";
    }

    // 서버(Socket.io)에 엔진 가동 신호 전송
    socket.emit('engine-start', {
        timestamp: new Date().getTime(),
        status: 'active'
    });

    // 1초 뒤 엔진 가동 완료 처리
    setTimeout(() => {
        isEngineActive = true;
        
        if (statusText) {
            statusText.innerText = "Running...";
            statusText.style.color = "#00ff88";
        }

        console.log("Spirit System v5.2 Online.");
        
        // 가동 즉시 첫 화면('전화')으로 자동 전환
        switchView('phone');
    }, 1000);
}

/**
 * 화면 전환: 메인 블랭킷의 내용을 갈아끼움
 */
function switchView(view) {
    if (!isEngineActive) {
        alert("엔진을 먼저 활성화해주세요.");
        return;
    }

    const mainEl = document.getElementById('main-blanket');
    
    // 네비게이션 버튼 UI 활성화 표시
    updateNavUI(view);

    // 각 기능별 HTML 프래그먼트 주입
    switch(view) {
        case 'phone':
            mainEl.innerHTML = `
                <div id="phone-interface" class="view-fade">
                    <h3>📞 다이얼러</h3>
                    <input type="text" id="phone-number" placeholder="번호 입력...">
                    <button onclick="makeCall()">통화 시작</button>
                </div>`;
            break;
            
        case 'ptt':
            mainEl.innerHTML = `
                <div id="ptt-interface" class="view-fade">
                    <h3>📻 Push-To-Talk</h3>
                    <div id="ptt-status">대기 중...</div>
                    <button id="ptt-btn" onmousedown="startPTT()" onmouseup="stopPTT()">
                        누르고 말하기
                    </button>
                </div>`;
            break;

        case 'chat':
            mainEl.innerHTML = `
                <div id="chat-interface" class="view-fade">
                    <h3>💬 실시간 문자</h3>
                    <div id="chat-logs" style="height:150px; overflow-y:auto; background:rgba(0,0,0,0.05); border-radius:10px; padding:10px; margin-bottom:10px;"></div>
                    <input type="text" id="msg-input" placeholder="메시지 입력...">
                    <button onclick="sendMessage()">전송</button>
                </div>`;
            break;
    }
}






function activateEngine() {
    if (isEngineActive) return;

    // 1. 시동 중...
    const statusText = document.getElementById('status');
    if (statusText) statusText.innerText = "System Loading...";

    setTimeout(() => {
        // 2. 시동 완료!
        isEngineActive = true;
        if (statusText) {
            statusText.innerText = "Running...";
            statusText.style.color = "#00ff88";
        }

        // 3. [보완] 시동 버튼 숨기기 (공간 확보)
        const centralBtn = document.querySelector('.view-fade button'); 
        if(centralBtn) centralBtn.style.display = 'none';

        // 4. 바로 첫 화면으로 이동
        switchView('phone'); 
    }, 1000);
}







/**
 * 네비게이션 버튼 상태 업데이트
 */
function updateNavUI(view) {
    const btns = document.querySelectorAll('.nav-btn');
    const label = { 'phone': '전화', 'ptt': '무전', 'chat': '문자' };
    
    btns.forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.includes(label[view])) {
            btn.classList.add('active');
        }
    });
}

// [점검 1] 메시지 전송 함수 (클라이언트)
function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!input) return;

    const message = input.value.trim();
    if (message) {
        console.log("📤 메시지 전송 시도:", message); // 브라우저 콘솔에서 확인용
        
        // 서버로 'chat-msg' 이벤트 발신
        socket.emit('chat-msg', {
            user: "User_" + socket.id.substring(0, 4),
            text: message,
            time: new Date().toLocaleTimeString()
        });
        
        input.value = ''; // 전송 후 입력창 비우기
        input.focus();
    }
}

// [점검 2] 서버에서 온 메시지 수신 대기 (중요: 이 코드는 함수 밖, 파일 하단에 한 번만 선언)
socket.on('receive-msg', (data) => {
    console.log("📩 메시지 수신 완료:", data);
    const chatLogs = document.getElementById('chat-logs');
    if (chatLogs) {
        const msgDiv = document.createElement('div');
        msgDiv.style.padding = "5px";
        msgDiv.style.borderBottom = "1px solid #eee";
        msgDiv.innerHTML = `<strong>${data.user}:</strong> ${data.text} <small style="color:#888;">[${data.time}]</small>`;
        chatLogs.appendChild(msgDiv);
        
        // 새 메시지가 오면 자동으로 스크롤 하단 이동
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }
});

// 엔터 키로도 전송 가능하게 추가 (선택)
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'msg-input') {
        sendMessage();
    }
});

/**
 * 네비게이션 클릭 핸들러 (상태 체크 + 액티브 설정)
 */
function handleNavClick(view) {
    // 1. 엔진이 꺼져있으면 아예 실행 차단
    if (!isEngineActive) {
        alert("엔진을 먼저 활성화해주세요.");
        return;
    }

    // 2. 화면 전환 실행
    switchView(view);
}

/**
 * [수정] 네비게이션 버튼 UI 상태 업데이트 (Active 클래스 관리)
 */
function updateNavUI(view) {
    // 모든 버튼에서 active 클래스 제거
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(btn => btn.classList.remove('active'));

    // 현재 선택된 뷰에 해당하는 버튼에만 active 클래스 추가
    const activeBtn = document.getElementById(`btn-${view}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}




// 뷰 전환 시 부드러운 효과를 위한 최소한의 스타일
const style = document.createElement('style');
style.textContent = `
    .view-fade { animation: fadeIn 0.4s ease-out; width: 100%; text-align: center; }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);