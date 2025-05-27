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
