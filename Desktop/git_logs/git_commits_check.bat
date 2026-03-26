@echo off
REM 기존 커밋 버전 확인용 스크립트

echo === 로컬 커밋 로그 (최근 20개) ===
git log --oneline -20

echo === 원격 저장소 커밋 로그 (최근 20개) ===
git log origin/main --oneline -20

echo === HEAD 이동 기록 (reflog) ===
git reflog

pause