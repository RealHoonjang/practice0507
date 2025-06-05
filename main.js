// PAPS 관련 데이터
const PAPS_DATA = {
  왕복오래달리기: {
    기준: "20m 왕복을 1회로 하여 3분간 실시",
    등급: {
      "1등급": "남: 60회 이상, 여: 50회 이상",
      "2등급": "남: 50-59회, 여: 40-49회",
      "3등급": "남: 40-49회, 여: 30-39회",
      "4등급": "남: 30-39회, 여: 20-29회",
      "5등급": "남: 29회 이하, 여: 19회 이하"
    },
    운동법: [
      "인터벌 트레이닝: 30초 달리기, 30초 걷기 반복",
      "점진적 거리 증가: 매주 10%씩 거리 증가",
      "지속적 달리기: 20-30분간 일정한 속도로 달리기"
    ]
  },
  윗몸일으키기: {
    기준: "1분간 실시",
    등급: {
      "1등급": "남: 45회 이상, 여: 35회 이상",
      "2등급": "남: 35-44회, 여: 25-34회",
      "3등급": "남: 25-34회, 여: 15-24회",
      "4등급": "남: 15-24회, 여: 10-14회",
      "5등급": "남: 14회 이하, 여: 9회 이하"
    },
    운동법: [
      "플랭크: 30초씩 3세트",
      "크런치: 15회씩 3세트",
      "레그레이즈: 10회씩 3세트"
    ]
  },
  앉아윗몸앞으로굽히기: {
    기준: "양발을 모아 앉아서 실시",
    등급: {
      "1등급": "남: 20cm 이상, 여: 25cm 이상",
      "2등급": "남: 15-19cm, 여: 20-24cm",
      "3등급": "남: 10-14cm, 여: 15-19cm",
      "4등급": "남: 5-9cm, 여: 10-14cm",
      "5등급": "남: 4cm 이하, 여: 9cm 이하"
    },
    운동법: [
      "스트레칭: 하루 2회, 각 30초씩",
      "요가: 고양이 자세, 다리 스트레칭",
      "동적 스트레칭: 천천히 앞으로 굽히기 반복"
    ]
  },
  "50m달리기": {
    기준: "50m 직선 코스에서 실시",
    등급: {
      "1등급": "남: 7.5초 이하, 여: 8.5초 이하",
      "2등급": "남: 7.6-8.5초, 여: 8.6-9.5초",
      "3등급": "남: 8.6-9.5초, 여: 9.6-10.5초",
      "4등급": "남: 9.6-10.5초, 여: 10.6-11.5초",
      "5등급": "남: 10.6초 이상, 여: 11.6초 이상"
    },
    운동법: [
      "스프린트 훈련: 30m 전력 질주",
      "계단 오르기: 빠른 속도로 계단 오르기",
      "점프 운동: 제자리 뛰기, 스쿼트 점프"
    ]
  }
};

// DOM 요소
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 메시지 추가 함수
function addMessage(message, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `p-2 mb-2 rounded ${isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`;
  messageDiv.textContent = message;
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// 응답 생성 함수
function generateResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // 인사 처리
  if (lowerMessage.includes('안녕') || lowerMessage.includes('반가워')) {
    return '안녕하세요! PAPS 건강체력평가 도우미입니다. 어떤 도움이 필요하신가요?';
  }

  // 평가 기준 질문
  for (const [key, value] of Object.entries(PAPS_DATA)) {
    if (lowerMessage.includes(key.toLowerCase()) && lowerMessage.includes('기준')) {
      return `${key}의 평가 기준은 다음과 같습니다:\n${value.기준}\n\n등급별 기준:\n${Object.entries(value.등급).map(([grade, standard]) => `${grade}: ${standard}`).join('\n')}`;
    }
  }

  // 운동법 질문
  for (const [key, value] of Object.entries(PAPS_DATA)) {
    if (lowerMessage.includes(key.toLowerCase()) && (lowerMessage.includes('운동') || lowerMessage.includes('방법'))) {
      return `${key} 향상을 위한 운동법:\n${value.운동법.map((method, index) => `${index + 1}. ${method}`).join('\n')}`;
    }
  }

  // 기본 응답
  return '죄송합니다. 질문을 더 구체적으로 해주시면 답변 드리겠습니다. 예를 들어 "왕복오래달리기 기준이 어떻게 되나요?" 또는 "윗몸일으키기 운동법 알려줘"와 같이 질문해주세요.';
}

// 이벤트 리스너
sendBtn.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message) {
    addMessage(message, true);
    const response = generateResponse(message);
    setTimeout(() => addMessage(response), 500);
    userInput.value = '';
  }
});

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

// 초기 메시지
addMessage('안녕하세요! PAPS 건강체력평가 도우미입니다. 어떤 도움이 필요하신가요?');
