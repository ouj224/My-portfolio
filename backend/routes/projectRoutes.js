// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getProjects, createProject } = require('../controllers/projectController');

// http://localhost:3000/api/projects 주소로 들어오는 요청 처리
router.route('/')
    .get(getProjects)   // 조회
    .post(createProject); // 추가 (추후 확장용)

module.exports = router;