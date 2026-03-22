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

// GET /api/services
router.get('/', async (req, res) => {
    try {
        res.json(await allRows('SELECT * FROM services ORDER BY sort_order ASC, id ASC'));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// POST /api/services
router.post('/', async (req, res) => {
    try {
        const { name, price, sort_order } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Название и цена обязательны' });

        const result = await runSql(
            'INSERT INTO services (name, price, sort_order) VALUES (?, ?, ?)',
            [name, price, sort_order || 0]
        );

        const service = await oneRow('SELECT * FROM services WHERE id = ?', [result.insertId]);
        notifyIndexNow('/');
        res.status(201).json(service);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/services/:id
router.put('/:id', async (req, res) => {
    try {
        const existing = await oneRow('SELECT * FROM services WHERE id = ?', [Number(req.params.id)]);
        if (!existing) return res.status(404).json({ error: 'Услуга не найдена' });

        const { name, price, sort_order } = req.body;
        await runSql(
            'UPDATE services SET name=?, price=?, sort_order=? WHERE id=?',
            [
                name || existing.name,
                price || existing.price,
                sort_order !== undefined ? sort_order : existing.sort_order,
                Number(req.params.id)
            ]
        );
        const updated = await oneRow('SELECT * FROM services WHERE id = ?', [Number(req.params.id)]);
        notifyIndexNow('/');
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
    try {
        const existing = await oneRow('SELECT * FROM services WHERE id = ?', [Number(req.params.id)]);
        if (!existing) return res.status(404).json({ error: 'Услуга не найдена' });

        await runSql('DELETE FROM services WHERE id = ?', [Number(req.params.id)]);
        notifyIndexNow('/');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

module.exports = router;
