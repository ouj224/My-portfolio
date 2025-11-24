# 1. Node.js 18버전 이미지를 기반으로 생성
FROM node:18

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. 패키지 설정 파일 복사 및 라이브러리 설치
COPY package*.json ./
RUN npm install

# 4. 나머지 모든 소스 코드 복사
COPY . .

# 5. 서버가 사용하는 3000번 포트 개방 알림
EXPOSE 3000

# 6. 서버 실행 명령어
CMD [ "npm", "start" ]