import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // 메인 화면에 보여줄 메뉴 목록 데이터
  const menuItems = [
    { title: '내 정보', desc: '자기소개 관리', icon: '/images/icon_about.png', link: '/about' },
    { title: '이력서', desc: '경력 및 기술 기술', icon: '/images/icon_resume.png', link: '/resume' },
    { title: '프로젝트', desc: '포트폴리오 관리', icon: '/images/icon_project.png', link: '/project' },
    { title: '자료실', desc: '학습 내용 기록', icon: '/images/icon_library.png', link: '/library' },
    { title: '연락처', desc: '연락처 정보', icon: '/images/icon_contact.png', link: '/contact' },
    { title: '게시판', desc: '정보 공유 및 소통', icon: '/images/icon_board.png', link: '/board' },
  ];

  return (
    <>
      {/* 배너 영역 */}
      <div className="hero-section">
        <h2>MY PORTFOLIO</h2>
        <p>나만의 기록과 성장을 관리하는 공간입니다.</p>
      </div>

      {/* 메뉴 그리드 영역 */}
      <div className="container" style={{ paddingTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          {menuItems.map((item, idx) => (
            <Link to={item.link} key={idx} style={{ textDecoration: 'none' }}>
              <div className="upload-box" style={{ textAlign: 'center', cursor: 'pointer', margin: 0 }}>
                {/* 아이콘 이미지 표시 */}
                <img 
                  src={item.icon} 
                  alt={item.title} 
                  style={{ width: '50px', height: '50px', marginBottom: '15px', objectFit: 'contain' }} 
                />
                <h3>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;