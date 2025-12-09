import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', name: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', form);
      alert('가입 성공! 로그인해주세요.');
      navigate('/login'); // 로그인 페이지로 이동
    } catch (err) {
      alert('가입 실패: ' + (err.response?.data?.message || '오류가 발생했습니다.'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{ color: '#004098', marginBottom: '20px' }}>회원가입</h2>
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
          <input
            type="text"
            id="name"
            className="auth-input"
            placeholder="이름 (닉네임)"
            value={form.name}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-btn">가입하기</button>
        </form>
        <Link to="/login" className="auth-link">이미 계정이 있으신가요? 로그인</Link>
      </div>
    </div>
  );
};

export default Register;