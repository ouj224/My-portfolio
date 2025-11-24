// chatbot.js

// [중요] 본인의 API 키를 입력하세요.
const GEMINI_API_KEY = "AIzaSyAlahFFEzyEMsD8VVBI4H9xEyjXb1SDPDUEY"; 

// 모델 설정: gemini-1.5-flash
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener('DOMContentLoaded', () => {
  // 1. 챗봇 HTML UI 생성 및 주입
  const chatbotHTML = `
    <div id="chatbot-btn" onclick="toggleChat()"><i class="fas fa-robot"></i></div>
    <div id="chat-container">
      <div id="chat-header">
        <span><i class="fas fa-robot"></i> AI Chatbot</span>
        <span style="cursor:pointer;" onclick="toggleChat()">&times;</span>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-input-area">
        <input type="text" id="chat-input" placeholder="질문을 입력하세요..." onkeypress="if(event.key==='Enter') sendMessage()">
        <button id="send-btn" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // 2. 저장된 대화 내용 불러오기
  loadChatHistory();
});

// 2. 챗봇 창 열기/닫기 토글
window.toggleChat = function() {
  const container = document.getElementById('chat-container');
  const isVisible = container.style.display === 'flex';
  container.style.display = isVisible ? 'none' : 'flex';
  
  if (!isVisible) {
    document.getElementById('chat-input').focus();
    scrollToBottom();
  }
};

// 3. 메시지 전송 함수
window.sendMessage = async function() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  // (1) 사용자 메시지 즉시 표시 및 저장
  addMessage(msg, 'user-msg');
  saveMessageToHistory(msg, 'user-msg');
  
  input.value = ''; // 입력창 초기화

  // (2) '생각 중...' 로딩 표시 (저장은 안 함)
  const loadingId = addMessage("생각 중...", 'bot-msg loading');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: msg }] }]
      })
    });

    const data = await response.json();

    // (3) 응답 오면 '생각 중...' 삭제
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.remove();
    }

    // (4) 봇 답변 표시 및 저장
    if (data.candidates && data.candidates.length > 0) {
      const botReply = data.candidates[0].content.parts[0].text;
      addMessage(botReply, 'bot-msg');
      saveMessageToHistory(botReply, 'bot-msg');
    } else {
      throw new Error("API 응답이 비어있습니다.");
    }

  } catch (error) {
    // 에러 발생 시 '생각 중'을 에러 메시지로 변경
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.innerText = "오류가 발생했습니다. 다시 시도해주세요.";
      loadingElement.classList.remove('loading');
      loadingElement.style.color = 'red';
    }
    console.error("API Error:", error);
  }
};

// 4. 메시지 추가 함수 (화면 표시용)
function addMessage(text, className) {
  const div = document.createElement('div');
  // 고유 ID 생성
  div.id = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 9);
  div.className = `message ${className}`;
  div.innerText = text;
  
  const container = document.getElementById('chat-messages');
  container.appendChild(div);
  scrollToBottom();
  
  return div.id; // 로딩 메시지 삭제를 위해 ID 반환
}

// 5. 스크롤 최하단 이동
function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

// 6. 로컬 스토리지에 대화 저장
function saveMessageToHistory(text, className) {
  // 기존 기록 가져오기
  let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  // 새 메시지 추가
  history.push({ text: text, className: className });
  // 저장
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

// 7. 로컬 스토리지에서 대화 불러오기
function loadChatHistory() {
  let history = JSON.parse(localStorage.getItem('chatHistory'));
  
  const container = document.getElementById('chat-messages');
  container.innerHTML = ''; // 초기화

  // 기록이 없으면 기본 인사말
  if (!history || history.length === 0) {
    const defaultMsg = "안녕하세요! 포트폴리오에 대해 궁금한 점이 있으신가요?";
    addMessage(defaultMsg, 'bot-msg');
    saveMessageToHistory(defaultMsg, 'bot-msg'); // 인사말도 저장
  } else {
    // 기록이 있으면 순서대로 화면에 그림
    history.forEach(item => {
      // 'loading' 클래스가 저장되어 있다면 제외 (혹시 모를 오류 방지)
      if (!item.className.includes('loading')) {
        addMessage(item.text, item.className);
      }
    });
  }
}