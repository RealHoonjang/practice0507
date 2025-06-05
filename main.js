// PAPS 관련 데이터
const PAPS_DATA = {
  안내: {
    메시지: "PAPS 등급에 관한 자세한 정보는 다음 URL에서 확인하실 수 있습니다:\nhttps://github.com/RealHoonjang/PAPS_calculator"
  }
};

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 시스템 프롬프트 설정
const systemPrompt = `
당신은 PAPS(학생건강체력평가) 전문가입니다.
운동과 건강체력평가에 관련된 질문에만 답변해주세요.
운동과 관련되지 않은 질문이 들어오면 "운동과 관련된 질문에만 답변해드릴 수 있어요"라고 답변해주세요.

PAPS 등급이나 기준에 관한 질문이 들어오면, 다음 URL을 안내해주세요:
https://github.com/RealHoonjang/PAPS_calculator

답변은 항상 한국어로 해주세요.
`;

// 대화 맥락을 저장하는 배열
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

async function fetchGPTResponse() {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: conversationHistory,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 입력 UI에 출력
  addMessage(prompt, true);

  // 사용자 메시지를 대화 이력에 추가
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드 초기화
  userInput.value = '';

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse();
    
    // GPT 응답 UI에 출력
    addMessage(reply, false);

    // GPT 응답도 대화 이력에 추가
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    console.error('Error:', error);
    addMessage('죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', false);
  }
}

// 메시지 추가 함수
function addMessage(message, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `p-2 mb-2 rounded ${isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`;
  messageDiv.textContent = message;
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
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

// 초기 메시지
addMessage('안녕하세요! PAPS 건강체력평가 도우미입니다. 어떤 도움이 필요하신가요?');
