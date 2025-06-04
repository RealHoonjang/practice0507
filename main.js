const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const preview = document.getElementById('preview');

let currentImageBase64 = null;

// 🟢 시스템 프롬프트 설정 (이 부분을 자유롭게 수정하여 보시면 됩니다)
const systemPrompt = `
당신은 학습 자료 분석 전문가입니다.
제공된 이미지에서 다음과 같은 작업을 수행해주세요:
1. 핵심 개념과 중요 내용 추출
2. 이해도를 확인할 수 있는 문제 생성
3. 암기용 플래시카드 형식의 요약 제공

답변은 다음 형식으로 제공해주세요:
📚 핵심 개념:
- (추출된 핵심 개념들)

❓ 학습 문제:
1. (생성된 문제)
2. (생성된 문제)

📝 암기 카드:
- (암기 카드 형식의 요약)
`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

// 이미지 업로드 처리
imageUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result.split(',')[1];
      preview.src = e.target.result;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
});

async function fetchGPTResponse(imageBase64 = null) {
  const messages = [...conversationHistory];
  
  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: "이 이미지를 분석해주세요." },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt && !currentImageBase64) return;

  // 사용자 입력 UI에 출력
  if (prompt) {
    chatbox.innerHTML += `<div class="text-right mb-2 text-blue-600">나: ${prompt}</div>`;
    conversationHistory.push({ role: "user", content: prompt });
  }

  chatbox.scrollTop = chatbox.scrollHeight;
  userInput.value = '';

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse(currentImageBase64);
    
    // GPT 응답 UI에 출력
    chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800">GPT: ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

    // GPT 응답도 대화 이력에 추가
    conversationHistory.push({ role: "assistant", content: reply });
    
    // 이미지 분석 후 이미지 초기화
    if (currentImageBase64) {
      currentImageBase64 = null;
      imagePreview.classList.add('hidden');
      imageUpload.value = '';
    }
  } catch (error) {
    console.error('Error:', error);
    chatbox.innerHTML += `<div class="text-left mb-2 text-red-600">오류가 발생했습니다. 다시 시도해주세요.</div>`;
  }
}

// 버튼 클릭 시 작동
sendBtn.addEventListener('click', handleSend);

// 엔터키 입력 시 작동
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

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
