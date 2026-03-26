@echo off
REM Git 자주 쓰는 명령어 모음

echo === Git 상태 확인 ===
git status

echo === 최신 로그 확인 ===
git log --oneline -5

echo === 원격 저장소 갱신 ===
git fetch origin

echo === 변경사항 추가 ===
git add .

echo === 커밋 ===
git commit -m "자동 커밋 메시지"

echo === 원격 저장소로 푸시 ===
git push origin main