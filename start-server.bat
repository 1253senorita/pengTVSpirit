@echo off
title 🚀 WIKI-ROUTER v5.2 CUSTOM SERVER
mode con: cols=80 lines=25
color 0B

echo =======================================================
echo   WIKI-ROUTER [💎Blueberry/🍇Grape] Engine Server
echo =======================================================
echo.
echo  [1] 서버 상태: 가동 준비 중...
echo  [2] 실행 파일: server.js (Node.js 기반)
echo  [3] 관리 모드: 로그인 및 에러 로그 기록 활성화
echo.
echo -------------------------------------------------------
echo  🚀 엔진을 시작합니다... (종료하려면 Ctrl+C)
echo -------------------------------------------------------
echo.

:: peerjs 명령어 대신 오빠가 만든 server.js를 실행!
node server.js

pause