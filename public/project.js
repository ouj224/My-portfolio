// project.js

/**
 * ProjectManager 클래스: 프로젝트 데이터를 서버에서 가져와 렌더링을 관리합니다.
 */
class ProjectManager {
    constructor(containerId, apiUrl) {
        this.container = document.getElementById(containerId);
        this.apiUrl = apiUrl; // Node.js 서버의 API 주소
        this.projects = [];
    }

    // 서버 API에서 데이터를 가져와 화면에 표시
    async fetchAndRenderProjects() {
        try {
            // 로딩 상태 표시
            this.container.innerHTML = '<h2>프로젝트 목록 로딩 중...</h2>'; 
            
            // Node.js 서버의 API 주소로 요청 (CORS 문제 방지를 위해 Node.js 서버에 CORS 설정 필요)
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.projects = data; // 서버에서 받은 JSON 데이터를 저장
            
            this.renderAllProjects();

        } catch (error) {
            console.error("데이터 로딩 실패:", error);
            this.container.innerHTML = `<h2>프로젝트</h2><p style="color: red;">데이터를 불러올 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요. (Error: ${error.message})</p>`;
        }
    }

    // 프로젝트 목록을 DOM에 동적으로 추가
    renderAllProjects() {
        // 기존 내용을 지우고 새로운 내용을 채웁니다.
        this.container.innerHTML = '<h2>프로젝트 목록</h2>'; 
        
        this.projects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project-card';
            projectDiv.innerHTML = `
                <h3>${project.title} (${project.id})</h3>
                <p class="project-period">기간: ${project.period}</p>
                <p>${project.description}</p>
                <p class="project-tech">사용 기술: ${project.technologies.join(', ')}</p>
            `;
            this.container.appendChild(projectDiv);
        });
    }
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
    // ✨ Node.js 서버의 API 주소. (2단계에서 이 서버를 구축해야 합니다)
    const API_URL = 'http://localhost:3000/api/projects'; 
    const manager = new ProjectManager('project-list', API_URL); 

    manager.fetchAndRenderProjects(); 
});