const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Функция для получения случайного ключа из списка
function getRandomKey() {
    // Получаем ключи из переменных окружения
    const keysString = process.env.OPENROUTER_API_KEYS;
    
    if (!keysString) {
        console.error("Нет API ключей!");
        return null;
    }

    // Разбиваем строку по запятым или пробелам, чтобы получить массив
    const keys = keysString.split(/[\s,]+/).filter(k => k.trim().length > 0);
    
    if (keys.length === 0) return null;

    // Возвращаем случайный ключ
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
}

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = getRandomKey();

        if (!apiKey) {
            return res.status(500).json({ error: "API ключи не настроены на сервере." });
        }

        // ВАЖНО: Ты просил модель 'x-ai/grok-4.1-fast:free'.
        // Если она не сработает (так как такой может не быть), 
        // попробуй заменить на 'google/gemini-2.0-flash-lite-preview-02-05:free' 
        // или 'deepseek/deepseek-r1:free'
        const MODEL_NAME = "x-ai/grok-4.1-fast:free"; 

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://ai-engineering.onrender.com", // Ссылка на твой сайт
                "X-Title": "AI Engineering Site"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                stream: true, // Включаем стриминг
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ошибка OpenRouter:", errorText);
            return res.status(response.status).send(`Ошибка API: ${errorText}`);
        }

        // Пересылаем ответ чата пользователю
        response.body.pipe(res);

    } catch (error) {
        console.error("Ошибка сервера:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});