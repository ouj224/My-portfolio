// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // [수정 1] 경로를 다루는 도구(path)를 가져옵니다.
const connectDB = require('./config/database');
const projectRoutes = require('./routes/projectRoutes');

const port = 3000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// [수정 2] 정적 파일(HTML) 위치를 다시 알려줍니다.
// __dirname은 현재 파일(server.js)의 위치(backend)를 말합니다.
// '../public'은 "한 단계 위로 올라가서 public 폴더를 찾아라"는 뜻입니다.
app.use(express.static(path.join(__dirname, '../public')));

// API 라우트
app.use('/api/projects', projectRoutes);

// (선택사항) 만약 주소창에 그냥 쳤을 때 index.html을 확실하게 보여주기 위한 코드
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});