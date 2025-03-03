// DeepSeek API 配置
const API_KEY = 'sk-758cf12c7869493db4ecaa1196da50da'; // 請替換為你的 DeepSeek API 金鑰
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
let conversationHistory = [];

document.getElementById('start-button').addEventListener('click', async () => {
    const disease = document.getElementById('disease-select').value;
    const stage = document.getElementById('stage-select').value;
    const systemInstruction = {
        role: 'system',
        content: `You are a health educator specializing in ${disease} at ${stage}. Please search for articles related to this disease first and give the user as concise a reply as possible. Don't reply to lengthy messages unless the user wants you to say more. In addition, if the user asks a question about disease, health, or non-medical issues, please tell him that "I can't answer".`
    };
    
    // 初始化對話歷史
    conversationHistory = [systemInstruction];
    
    // 切換界面
    document.getElementById('selection-section').style.display = 'none';
    document.getElementById('chatbot-section').style.display = 'block';
});

document.getElementById('send-button').addEventListener('click', async () => {
    const userQuestion = document.getElementById('user-input').value;
    if (!userQuestion) return; // 如果輸入為空則不處理
    
    document.getElementById('user-input').value = ''; // 清空輸入欄
    addMessage(userQuestion, true); // 顯示用戶訊息
    
    try {
        // 將用戶問題加入對話歷史
        conversationHistory.push({ role: 'user', content: userQuestion });
        
        // 發送 API 請求
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: conversationHistory,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // 將 AI 回應加入對話歷史
        conversationHistory.push({ role: 'assistant', content: aiResponse });
        
        // 顯示 AI 回應
        addMessage(aiResponse, false);
    } catch (error) {
        console.error('Error:', error);
        addMessage('發生錯誤，請重試。', false);
    }
});

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    messageDiv.textContent = message;
    document.getElementById('conversation').appendChild(messageDiv);
    // 自動滾動到最新訊息
    document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
}
