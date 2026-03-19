const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

async function allRows(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function oneRow(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
}

async function runSql(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return result;
}

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        if (status && ['pending', 'approved'].includes(status)) {
            res.json(await allRows('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC', [status]));
        } else {
            res.json(await allRows('SELECT * FROM reviews ORDER BY created_at DESC'));
        }
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { name, text, rating, city, photos } = req.body;
        if (!name || !text || !rating) return res.status(400).json({ error: 'Заполните имя, текст и оценку' });

        const ratingNum = parseInt(rating);
        if (ratingNum < 1 || ratingNum > 5) return res.status(400).json({ error: 'Оценка от 1 до 5' });

        const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

        const result = await runSql(
            `INSERT INTO reviews (name, text, rating, status, date, city, photos) VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
            [name, text, ratingNum, date, city || '', photos || '[]']
        );

        res.status(201).json(await oneRow('SELECT * FROM reviews WHERE id = ?', [result.insertId]));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/reviews/:id/approve
router.put('/:id/approve', async (req, res) => {
    try {
        const review = await oneRow('SELECT * FROM reviews WHERE id = ?', [Number(req.params.id)]);
        if (!review) return res.status(404).json({ error: 'Отзыв не найден' });

        await runSql("UPDATE reviews SET status = 'approved' WHERE id = ?", [Number(req.params.id)]);
        res.json(await oneRow('SELECT * FROM reviews WHERE id = ?', [Number(req.params.id)]));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/reviews/:id/reject
router.put('/:id/reject', async (req, res) => {
    try {
        const review = await oneRow('SELECT * FROM reviews WHERE id = ?', [Number(req.params.id)]);
        if (!review) return res.status(404).json({ error: 'Отзыв не найден' });

        await runSql("UPDATE reviews SET status = 'rejected' WHERE id = ?", [Number(req.params.id)]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
    try {
        const review = await oneRow('SELECT * FROM reviews WHERE id = ?', [Number(req.params.id)]);
        if (!review) return res.status(404).json({ error: 'Отзыв не найден' });

        await runSql('DELETE FROM reviews WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

module.exports = router;
