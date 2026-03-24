let isAuthenticated = false; // 초기 상태 (Boolean-Gated)

function login() {
    // 실제로는 서버 인증 로직이 들어갑니다.
    isAuthenticated = true; 
    
    if (isAuthenticated) {
        document.getElementById('auth-status').innerText = "Activated";
        document.getElementById('auth-status').style.color = "#4CAF50";
        console.log("Audio Engine Triggered.");
        // 여기에 Audio Engine 시작 로직 추가
    }
}