const express = require('express');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./config/database');
const projectRoutes = require('./routes/projectRoutes');

const port = 3000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});