import React from 'react';

const Contact = () => {
  return (
    <>
      <div className="sub-banner"><h2>CONTACT</h2></div>
      <div className="container">
        <div className="content-header"><h3>연락처 정보</h3></div>
        
        <div className="contact-section">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', textAlign: 'center', padding: '40px 0' }}>
            <ContactItem icon="/images/icon_mail.png" title="Email" content="ouj224@naver.com" link="mailto:ouj224@naver.com" />
            <ContactItem icon="/images/icon_phone.png" title="Phone" content="010-5300-8018" />
            <ContactItem icon="/images/icon_github.png" title="GitHub" content="github.com/ouj224" link="https://github.com/ouj224" />
            <ContactItem icon="/images/icon_discord.png" title="Discord" content="user#1234" />
          </div>
        </div>
      </div>
    </>
  );
};

const ContactItem = ({ icon, title, content, link }) => (
  <div style={{ minWidth: '200px' }}>
    <img src={icon} alt={title} style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '20px' }} />
    <h3>{title}</h3>
    <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
      {link ? <a href={link} target="_blank" rel="noopener noreferrer">{content}</a> : content}
    </p>
  </div>
);

export default Contact;