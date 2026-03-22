require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDb } = require('./db/database');
const { router: authRouter, requireAuth } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// IndexNow — отдаём файл верификации ключа
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
if (INDEXNOW_KEY) {
    app.get(`/${INDEXNOW_KEY}.txt`, (req, res) => {
        res.type('text/plain').send(INDEXNOW_KEY);
    });
}

// Auth
app.use('/api/auth', authRouter);

// admin.html физически не в public/ — отдаём по маршруту /admin
// Страница сама проверяет токен через JS + /api/auth/check
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Защита: PUT/DELETE всегда требуют авторизации,
// POST для products и services тоже (reviews и calculations — открыты для пользователей)
// GET calculations и reviews (pending/все) — только для авторизованных
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) return next();
    if (req.method === 'PUT' || req.method === 'DELETE') return requireAuth(req, res, next);
    if (req.method === 'POST' && (req.path.startsWith('/products') || req.path.startsWith('/services'))) {
        return requireAuth(req, res, next);
    }
    // GET calculations — только для админа
    if (req.method === 'GET' && req.path.startsWith('/calculations')) {
        return requireAuth(req, res, next);
    }
    // GET reviews без status=approved — только для админа
    if (req.method === 'GET' && req.path.startsWith('/reviews')) {
        if (req.query.status !== 'approved') return requireAuth(req, res, next);
    }
    next();
});

// API маршруты
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/calculations', require('./routes/calculations'));
app.use('/api/services', require('./routes/services'));

// Любой другой маршрут → index.html
// Исключение: запросы к /admin.html → 404 (файл скрыт, правильный путь /admin)
app.get('*', (req, res) => {
    if (req.path === '/admin.html') return res.status(404).send('Not Found');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Инициализация БД и запуск сервера
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`White Horse Stone сервер запущен: http://localhost:${PORT}`);
        console.log(`Админ-панель: http://localhost:${PORT}/admin`);
    });
}).catch(err => {
    console.error('Ошибка инициализации БД:', err);
    process.exit(1);
});
