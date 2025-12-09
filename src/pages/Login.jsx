import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지
    try {
      const res = await axios.post('/api/login', form);
      if (res.data.message === '성공') {
        // 로그인 성공 시 메인으로 이동 (세션 갱신을 위해 전체 로드 권장)
        window.location.href = '/'; 
      }
    } catch (err) {
      alert(err.response?.data?.message || '로그인 실패');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{ color: '#004098', marginBottom: '20px' }}>PORTFOLIO LOGIN</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            className="auth-input"
            placeholder="아이디"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            id="password"
            className="auth-input"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-btn">로그인</button>
        </form>
        <Link to="/register" className="auth-link">계정이 없으신가요? 회원가입</Link>
      </div>
    </div>
  );
};

export default Login;