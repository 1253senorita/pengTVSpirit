# 1. 사용할 Node 버전 (로그에 있던 클라우드타입 환경에 맞춤)
FROM cloudtype/node:16

# 2. 앱 폴더 생성
WORKDIR /app

# 3. 패키지 파일만 먼저 복사 (에러 방지용)
COPY package.json ./
COPY package-lock.json ./

# 4. 의존성 설치
RUN npm install

# 5. 나머지 소스 코드 전체 복사
COPY . .

# 6. 서버 실행 (package.json의 "main"이 server.js이므로)
CMD ["node", "server.js"]