// DeepSeek API 配置
const API_KEY = 'sk-758cf12c7869493db4ecaa1196da50da'; // 請替換為你的 DeepSeek API 金鑰
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
let conversationHistory = [];

document.getElementById('start-button').addEventListener('click', async () => {
    const disease = document.getElementById('disease-select').value;
    const stage = document.getElementById('stage-select').value;
    const systemInstruction = {
        role: 'system',
        content: `You are a health educator specializing in ${disease} at ${stage}. Provide accurate and helpful information to patients about their condition, including dietary recommendations, dietary taboos, lifestyle recommendations, medication rules, and any other relevant health education knowledge.`
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
    
    // 添加「思考中，請稍後。」訊息，並保留引用
    const thinkingMessageBubble = addMessage('思考中，請稍後。', false);
    
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
        
        // 替換「思考中，請稍後。」為 AI 回應
        thinkingMessageBubble.textContent = aiResponse;
    } catch (error) {
        console.error('Error:', error);
        // 如果出錯，替換為錯誤訊息
        thinkingMessageBubble.textContent = '發生錯誤，請重試。';
    }
});

function addMessage(message, isUser) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add(isUser ? 'user-message' : 'ai-message');
    
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    if (isUser) {
        bubble.classList.add('user-bubble');
    } else {
        bubble.classList.add('ai-bubble');
    }
    
    bubble.textContent = message;
    messageContainer.appendChild(bubble);
    
    document.getElementById('conversation').appendChild(messageContainer);
    
    // 自動滾動到最新訊息
    document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
    
    return bubble; // 返回氣泡 div 以便後續替換
}
