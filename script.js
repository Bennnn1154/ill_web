// DeepSeek API 配置
const API_KEY = 'sk-758cf12c7869493db4ecaa1196da50da'; // 請替換為你的 DeepSeek API 金鑰
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
let conversationHistory = [];
let isProcessing = false;

document.getElementById('start-button').addEventListener('click', async () => {
    const disease = document.getElementById('disease-select').value;
    const stage = document.getElementById('stage-select').value;
    const systemInstruction = {
        role: 'system',
        content: `You are a health educator specializing in ${disease} at ${stage}. Provide accurate and helpful information to patients about their condition, including dietary recommendations, dietary taboos, lifestyle recommendations, medication rules, and any other relevant health education knowledge.`
    };

    // 初始化對話歷史
    conversationHistory = [systemInstruction];

    // 切換到聊天區塊
    document.getElementById('selection-section').style.display = 'none';
    document.getElementById('chatbot-section').style.display = 'block';
});

document.getElementById('send-button').addEventListener('click', async () => {
    if (isProcessing) {
        return; // 系統忙碌中
    }
    isProcessing = true;

    const userQuestion = document.getElementById('user-input').value;
    if (!userQuestion) {
        isProcessing = false;
        return; // 如果輸入為空，不做任何事
    }

    document.getElementById('user-input').value = ''; // 清空輸入欄
    document.getElementById('send-button').disabled = true; // 禁用發送按鈕

    // 添加使用者問題
    addMessage(userQuestion, true);

    // 添加佔位符訊息
    const placeholderDiv = addMessage("Thinking, please wait.", false);

    try {
        // 添加使用者問題到對話歷史
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

        // 更新佔位符訊息為實際回覆
        placeholderDiv.textContent = aiResponse;

        // 添加 AI 回覆到對話歷史
        conversationHistory.push({ role: 'assistant', content: aiResponse });

        // 滾動到底部
        document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        // 更新佔位符訊息為錯誤訊息
        placeholderDiv.textContent = '發生錯誤，請重試。';

        // 滾動到底部
        document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
    } finally {
        isProcessing = false;
        document.getElementById('send-button').disabled = false; // 啟用發送按鈕
    }
});

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    messageDiv.textContent = message;
    document.getElementById('conversation').appendChild(messageDiv);
    document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
    return messageDiv;
}
