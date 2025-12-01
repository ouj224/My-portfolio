/* backend/server.js */
const express = require('express');
const mongoose = require('mongoose');
const { Sequelize, DataTypes } = require('sequelize');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// ==========================================
// 환경 변수 설정 (쿠버네티스/도커 대응)
// ==========================================
// K8s나 Docker에서 MYSQL_HOST, MONGO_HOST를 주입해주면 그걸 쓰고,
// 없으면 로컬 개발 환경('localhost')을 사용합니다.
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';


// ==========================================
// 1. MySQL 연결 (회원 정보)
// ==========================================
const sequelize = new Sequelize('portfolioDB', 'root', '1234', {
    host: MYSQL_HOST, // 환경변수 사용
    dialect: 'mysql',
    logging: false
});

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });


// ==========================================
// 2. MongoDB 연결 (콘텐츠)
// ==========================================
mongoose.connect(`mongodb://${MONGO_HOST}:27017/portfolioDB`) // 환경변수 사용
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

// 게시글 스키마
const PostSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    authorName: String,
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    likes: [Number],
    dislikes: [Number],
    comments: [{
        authorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }]
});
const Post = mongoose.model('Post', PostSchema);

// 이력서 스키마
const ResumeSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    content: String,
    updatedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', ResumeSchema);


// ==========================================
// 3. 서버 설정 및 미들웨어
// ==========================================
sequelize.sync();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../docs')));

// 세션 스토어도 MongoDB 주소 변경 적용
app.use(session({
    secret: 'myHybridSecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: `mongodb://${MONGO_HOST}:27017/portfolioDB` }), 
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) next();
    else res.status(401).json({ message: '로그인이 필요합니다.' });
};


// ==========================================
// 4. API 라우트
// ==========================================

// 회원가입
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword, name });
        res.status(201).json({ message: '가입 성공' });
    } catch (err) { res.status(400).json({ message: '가입 실패' }); }
});

// 로그인
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        req.session.userName = user.name;
        res.json({ message: '성공', redirect: '/index.html' });
    } else { res.status(400).json({ message: '실패' }); }
});

// 로그아웃
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ message: '로그아웃' }));
});

// 내 정보
app.get('/api/me', isAuthenticated, (req, res) => {
    res.json({ userId: req.session.userId, name: req.session.userName });
});

// [게시판] 조회
app.get('/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

// [게시판] 글쓰기
app.post('/api/posts', isAuthenticated, async (req, res) => {
    await Post.create({
        ...req.body,
        userId: req.session.userId,
        authorName: req.session.userName,
        likes: [],
        dislikes: []
    });
    res.json({ message: '작성됨' });
});

// [게시판] 삭제
app.delete('/api/posts/:id', isAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '없음' });
    if (post.userId !== req.session.userId) return res.status(403).json({ message: '권한 없음' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제됨' });
});

// [게시판] 추천
app.post('/api/posts/:id/like', isAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id);
    const uid = req.session.userId;

    if (post.dislikes.includes(uid)) post.dislikes.pull(uid);
    if (post.likes.includes(uid)) post.likes.pull(uid);
    else post.likes.push(uid);
    
    await post.save();
    res.json({ message: '처리됨' });
});

// [게시판] 비추천
app.post('/api/posts/:id/dislike', isAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id);
    const uid = req.session.userId;

    if (post.likes.includes(uid)) post.likes.pull(uid);
    if (post.dislikes.includes(uid)) post.dislikes.pull(uid);
    else post.dislikes.push(uid);

    await post.save();
    res.json({ message: '처리됨' });
});

// [게시판] 댓글
app.post('/api/posts/:id/comments', isAuthenticated, async (req, res) => {
    const { content } = req.body;
    await Post.findByIdAndUpdate(req.params.id, {
        $push: { comments: { authorName: req.session.userName, content, createdAt: new Date() } }
    });
    res.json({ message: '댓글 작성됨' });
});

// [이력서]
app.get('/api/resume', isAuthenticated, async (req, res) => {
    const resume = await Resume.findOne({ userId: req.session.userId });
    res.json(resume || { content: '' });
});
app.post('/api/resume', isAuthenticated, async (req, res) => {
    await Resume.findOneAndUpdate(
        { userId: req.session.userId },
        { content: req.body.content, updatedAt: Date.now() },
        { upsert: true, new: true }
    );
    res.json({ message: '저장됨' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));