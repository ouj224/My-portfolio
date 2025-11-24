// backend/models/projectModel.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    period: String,
    description: String,
    technologies: [String]
}, { versionKey: false });

module.exports = mongoose.model('Project', projectSchema);