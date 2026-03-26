@echo off
REM 원격 저장소 주소 및 상태 확인

git remote -v
git fetch origin
git log origin/main --oneline -10
