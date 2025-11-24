const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/portfolioDB');
        console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB 연결 실패 (DB 없이 서버 실행): ${error.message}`);
            }
};

module.exports = connectDB;