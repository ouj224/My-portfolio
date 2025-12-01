// 페이지가 로드되면 자동으로 실행
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

// 1. 로그인 상태 확인 함수
function checkLoginStatus() {
    fetch('/api/me')
        .then(res => {
            // 401(미인증)이면 로그인 페이지로 튕겨내기
            if (res.status === 401) {
                // 단, 현재 페이지가 로그인이나 회원가입 페이지라면 튕기지 않음
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
                    window.location.href = 'login.html';
                }
                return null;
            }
            return res.json();
        })
        .then(user => {
            // 로그인 된 상태라면 헤더에 이름 표시
            if (user) {
                updateUserHeader(user.name);
            }
        })
        .catch(err => console.error(err));
}

// 2. 헤더 오른쪽을 '이름 | 로그아웃'으로 변경하는 함수
function updateUserHeader(name) {
    const nav = document.querySelector('nav');
    
    // 혹시 이미 만들어진 정보가 있다면 삭제 (중복 방지)
    const oldInfo = document.querySelector('.user-info-area');
    if (oldInfo) oldInfo.remove();

    // 새로운 유저 정보 div 생성
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'user-info-area';
    userInfoDiv.innerHTML = `
        <span class="user-name"><i class="fas fa-user-circle"></i> ${name}님</span>
        <span class="divider">|</span>
        <button onclick="logout()" class="btn-logout">로그아웃 <i class="fas fa-sign-out-alt"></i></button>
    `;
    
    // 네비게이션바(nav) 안에 추가
    nav.appendChild(userInfoDiv);
}

// 3. 로그아웃 함수
function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            alert('로그아웃 되었습니다.');
            window.location.href = 'login.html';
        });
}