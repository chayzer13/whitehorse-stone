const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const { notifyIndexNow } = require('../utils/indexnow');

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

// GET /api/portfolio — public: returns items + visibility
router.get('/', async (req, res) => {
    try {
        const items = await allRows('SELECT * FROM portfolio ORDER BY sort_order ASC, id DESC');
        const setting = await oneRow("SELECT value FROM settings WHERE `key` = 'portfolio_visible'");
        const visible = setting ? setting.value === '1' : true;
        res.json({ visible, items });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/portfolio/visibility (BEFORE /:id to avoid conflict)
router.put('/visibility', async (req, res) => {
    try {
        const { visible } = req.body;
        await runSql("INSERT INTO settings (`key`, value) VALUES ('portfolio_visible', ?) ON DUPLICATE KEY UPDATE value = ?",
            [visible ? '1' : '0', visible ? '1' : '0']);
        res.json({ ok: true, visible: !!visible });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// POST /api/portfolio
router.post('/', async (req, res) => {
    try {
        const { title, description, photos, sort_order } = req.body;
        if (!title) return res.status(400).json({ error: 'Название обязательно' });

        const result = await runSql(
            'INSERT INTO portfolio (title, description, photos, sort_order) VALUES (?, ?, ?, ?)',
            [title, description || '', photos || '[]', sort_order || 0]
        );

        const item = await oneRow('SELECT * FROM portfolio WHERE id = ?', [result.insertId]);
        notifyIndexNow('/');
        res.status(201).json(item);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/portfolio/:id
router.put('/:id', async (req, res) => {
    try {
        const existing = await oneRow('SELECT * FROM portfolio WHERE id = ?', [Number(req.params.id)]);
        if (!existing) return res.status(404).json({ error: 'Работа не найдена' });

        const { title, description, photos, sort_order } = req.body;
        await runSql(
            'UPDATE portfolio SET title=?, description=?, photos=?, sort_order=? WHERE id=?',
            [
                title || existing.title,
                description !== undefined ? description : existing.description,
                photos || existing.photos,
                sort_order !== undefined ? sort_order : existing.sort_order,
                existing.id
            ]
        );

        const updated = await oneRow('SELECT * FROM portfolio WHERE id = ?', [existing.id]);
        notifyIndexNow('/');
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// DELETE /api/portfolio/:id
router.delete('/:id', async (req, res) => {
    try {
        await runSql('DELETE FROM portfolio WHERE id = ?', [Number(req.params.id)]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

module.exports = router;
