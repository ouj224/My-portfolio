# 1. Node.js 20 버전 이미지 사용 (Vite 최신 버전 호환)
FROM node:20

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# --- Backend 의존성 설치 ---
COPY package*.json ./
RUN npm install

# --- Frontend (React) 빌드 ---
# client 폴더 복사
COPY client ./client
# 작업 위치를 client로 변경하여 빌드 진행
WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build

# --- 다시 루트(서버) 위치로 복귀 ---
WORKDIR /usr/src/app

# 3. 소스 코드 복사
COPY backend ./backend
COPY docs ./docs

# 4. 포트 및 실행
EXPOSE 3000
CMD [ "node", "backend/server.js" ]