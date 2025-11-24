// backend/controllers/projectController.js
const Project = require('../models/projectModel');

// @desc    모든 프로젝트 가져오기
// @route   GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ id: 1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "데이터 조회 실패", error: error.message });
    }
};

// @desc    새 프로젝트 추가하기 (테스트용)
// @route   POST /api/projects
const createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: "데이터 저장 실패", error: error.message });
    }
};

module.exports = {
    getProjects,
    createProject
};