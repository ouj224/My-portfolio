/* backend/server.js */
const express = require('express');
const mongoose = require('mongoose');
const { Sequelize, DataTypes } = require('sequelize');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 환경 변수
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';

// --- 1. 파일 업로드 설정 ---
const uploadDir = path.join(__dirname, '../docs/uploads');
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- 2. DB 연결 ---
const sequelize = new Sequelize('portfolioDB', 'root', '1234', {
    host: MYSQL_HOST, dialect: 'mysql', logging: false
});
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

mongoose.connect(`mongodb://${MONGO_HOST}:27017/portfolioDB`)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

// --- 3. 스키마 정의 ---
const createBoardSchema = () => new mongoose.Schema({
    userId: { type: Number, required: true },
    authorName: String,
    title: String,
    content: String,
    fileName: String,
    originalName: String,
    createdAt: { type: Date, default: Date.now },
    likes: [Number],
    dislikes: [Number],
    comments: [{
        userId: Number,
        authorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }]
});

const Post = mongoose.model('Post', createBoardSchema());
const Resume = mongoose.model('Resume', createBoardSchema());
const Project = mongoose.model('Project', createBoardSchema());
const Library = mongoose.model('Library', createBoardSchema());

// --- 4. 미들웨어 설정 ---
sequelize.sync();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/uploads', express.static(path.join(__dirname, '../docs/uploads')));

app.use(session({
    secret: 'myHybridSecret', resave: false, saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: `mongodb://${MONGO_HOST}:27017/portfolioDB` }), 
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) next(); else res.status(401).json({ message: '로그인 필요' });
};

// --- 5. API 라우트 ---
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({ ...req.body, password: hashedPassword });
        res.status(201).json({ message: '가입 성공' });
    } catch (err) { res.status(400).json({ message: '가입 실패' }); }
});
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.userId = user.id; req.session.userName = user.name;
        res.json({ message: '성공', redirect: '/' });
    } else { res.status(400).json({ message: '실패' }); }
});
app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ message: '로그아웃' })); });
app.get('/api/me', isAuthenticated, (req, res) => { res.json({ userId: req.session.userId, name: req.session.userName }); });

// CRUD Handler
const createCrudHandlers = (Model, routeName) => {
    app.get(`/api/${routeName}`, async (req, res) => {
        const items = await Model.find().sort({ createdAt: -1 });
        res.json(items);
    });
    app.post(`/api/${routeName}`, isAuthenticated, upload.single('file'), async (req, res) => {
        const fileData = req.file ? { fileName: req.file.filename, originalName: req.file.originalname } : {};
        await Model.create({ ...req.body, ...fileData, userId: req.session.userId, authorName: req.session.userName, likes: [], dislikes: [] });
        res.json({ message: '작성됨' });
    });
    app.put(`/api/${routeName}/:id`, isAuthenticated, upload.single('file'), async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '없음' });
        if (item.userId !== req.session.userId) return res.status(403).json({ message: '권한 없음' });
        const updateData = { ...req.body };
        if (req.file) { updateData.fileName = req.file.filename; updateData.originalName = req.file.originalname; }
        await Model.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: '수정됨' });
    });
    app.delete(`/api/${routeName}/:id`, isAuthenticated, async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '없음' });
        if (item.userId !== req.session.userId) return res.status(403).json({ message: '권한 없음' });
        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: '삭제됨' });
    });
    app.post(`/api/${routeName}/:id/like`, isAuthenticated, async (req, res) => {
        const item = await Model.findById(req.params.id); const uid = req.session.userId;
        if (item.dislikes.includes(uid)) item.dislikes.pull(uid);
        if (item.likes.includes(uid)) item.likes.pull(uid); else item.likes.push(uid);
        await item.save(); res.json({ message: '처리됨' });
    });
    app.post(`/api/${routeName}/:id/dislike`, isAuthenticated, async (req, res) => {
        const item = await Model.findById(req.params.id); const uid = req.session.userId;
        if (item.likes.includes(uid)) item.likes.pull(uid);
        if (item.dislikes.includes(uid)) item.dislikes.pull(uid); else item.dislikes.push(uid);
        await item.save(); res.json({ message: '처리됨' });
    });
    app.post(`/api/${routeName}/:id/comments`, isAuthenticated, async (req, res) => {
        await Model.findByIdAndUpdate(req.params.id, { $push: { comments: { userId: req.session.userId, authorName: req.session.userName, content: req.body.content, createdAt: new Date() } } });
        res.json({ message: '댓글 작성됨' });
    });
    app.delete(`/api/${routeName}/:id/comments/:commentId`, isAuthenticated, async (req, res) => {
        const item = await Model.findById(req.params.id); const comment = item.comments.id(req.params.commentId);
        if (!comment || comment.userId !== req.session.userId) return res.status(403).json({ message: '권한 없음' });
        comment.deleteOne(); await item.save(); res.json({ message: '삭제됨' });
    });
    app.put(`/api/${routeName}/:id/comments/:commentId`, isAuthenticated, async (req, res) => {
        const item = await Model.findById(req.params.id); const comment = item.comments.id(req.params.commentId);
        if (!comment || comment.userId !== req.session.userId) return res.status(403).json({ message: '권한 없음' });
        comment.content = req.body.content; await item.save(); res.json({ message: '수정됨' });
    });
};

createCrudHandlers(Post, 'posts');
createCrudHandlers(Resume, 'resumes');
createCrudHandlers(Project, 'projects');
createCrudHandlers(Library, 'libraries');

// [핵심 변경] Express 5 호환을 위해 정규표현식(Regex) 사용
// 모든 요청(.*)을 React index.html로 보냅니다.
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) { return res.status(404).send('Not Found'); }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));