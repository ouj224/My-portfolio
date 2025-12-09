import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Board from './pages/Board';
import Login from './pages/Login'; // (Login, Register 컴포넌트는 간단하므로 생략하거나 직접 작성)
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/me').then(res => setUser(res.data)).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/logout');
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resume" element={<Board title="RESUME" endpoint="/api/resumes" />} />
        <Route path="/project" element={<Board title="PROJECT" endpoint="/api/projects" />} />
        <Route path="/library" element={<Board title="LIBRARY" endpoint="/api/libraries" />} />
        <Route path="/board" element={<Board title="BOARD" endpoint="/api/posts" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;