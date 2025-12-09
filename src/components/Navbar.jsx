import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header>
      <div className="header-container">
        <div className="logo"><Link to="/">MY PORTFOLIO</Link></div>
        <nav>
          <ul>
            <li><Link to="/about" className={isActive('/about')}><img src="/images/icon_about.png" alt="about" className="menu-icon" /> ABOUT</Link></li>
            <li><Link to="/resume" className={isActive('/resume')}><img src="/images/icon_resume.png" alt="resume" className="menu-icon" /> RESUME</Link></li>
            <li><Link to="/project" className={isActive('/project')}><img src="/images/icon_project.png" alt="project" className="menu-icon" /> PROJECT</Link></li>
            <li><Link to="/library" className={isActive('/library')}><img src="/images/icon_library.png" alt="library" className="menu-icon" /> LIBRARY</Link></li>
            <li><Link to="/contact" className={isActive('/contact')}><img src="/images/icon_contact.png" alt="contact" className="menu-icon" /> CONTACT</Link></li>
            <li><Link to="/board" className={isActive('/board')}><img src="/images/icon_board.png" alt="board" className="menu-icon" /> BOARD</Link></li>
          </ul>
        </nav>
        <div className="user-info-area">
            {user ? (
                <>
                    <span className="user-name"><i className="fas fa-user-circle" style={{marginRight:'5px'}}></i> {user.name}님</span>
                    <span className="divider">|</span>
                    <button onClick={onLogout} className="btn-logout">로그아웃</button>
                </>
            ) : (
                <Link to="/login" style={{fontWeight:'bold'}}>로그인</Link>
            )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;