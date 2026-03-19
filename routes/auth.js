const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error('\n❌  ОШИБКА: переменная среды ADMIN_PASSWORD не задана!');
    console.error('Запустите сервер так: ADMIN_PASSWORD=вашпароль node server.js\n');
    process.exit(1);
}

// Активные токены сессий (в памяти)
const sessions = new Map();

// Время жизни сессии — 24 часа
const SESSION_TTL = 24 * 60 * 60 * 1000;

// Очистка просроченных сессий
setInterval(() => {
    const now = Date.now();
    for (const [token, expires] of sessions) {
        if (now > expires) sessions.delete(token);
    }
}, 60 * 60 * 1000);

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Неверный пароль' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_TTL);
    res.json({ token });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    sessions.delete(token);
    res.json({ ok: true });
});

// GET /api/auth/check — проверка токена
router.get('/check', (req, res) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const expires = sessions.get(token);
    if (expires && Date.now() < expires) {
        return res.json({ ok: true });
    }
    res.status(401).json({ error: 'Не авторизован' });
});

// Middleware для защиты маршрутов
function requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const expires = sessions.get(token);
    if (expires && Date.now() < expires) {
        return next();
    }
    res.status(401).json({ error: 'Требуется авторизация' });
}

// Проверка токена (экспортируется для использования в server.js при необходимости)
function isValidToken(token) {
    if (!token) return false;
    const expires = sessions.get(token);
    return !!(expires && Date.now() < expires);
}

module.exports = { router, requireAuth, isValidToken };
