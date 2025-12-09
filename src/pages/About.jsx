import React, { useEffect, useState } from 'react';

const About = () => {
  const [content, setContent] = useState('');
  const [profileImg, setProfileImg] = useState('/images/icon_porfile.png');

  useEffect(() => {
    const savedAbout = localStorage.getItem('myAbout');
    if (savedAbout) setContent(savedAbout);
    
    const savedProfile = localStorage.getItem('myProfileImg');
    if (savedProfile) setProfileImg(savedProfile);
  }, []);

  const handleSave = () => {
    localStorage.setItem('myAbout', content);
    alert('저장되었습니다.');
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImg(e.target.result);
        localStorage.setItem('myProfileImg', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="sub-banner"><h2>ABOUT ME</h2></div>
      <div className="container">
        <div className="content-header">
          <h3>자기소개서</h3>
          <p style={{color:'#666'}}>프로필 사진을 클릭하여 변경할 수 있습니다.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <label htmlFor="profileInput" style={{ cursor: 'pointer' }}>
            <img src={profileImg} alt="Profile" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #004098', backgroundColor: '#f0f0f0' }} />
          </label>
          <input type="file" id="profileInput" accept="image/*" style={{ display: 'none' }} onChange={handleProfileChange} />
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>* 클릭하여 사진 변경</p>
        </div>

        <textarea 
          className="resume-editor" 
          placeholder="여기에 자기소개를 작성하세요..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button className="btn" onClick={handleSave}>내용 저장하기</button>
        </div>
      </div>
    </>
  );
};

export default About;