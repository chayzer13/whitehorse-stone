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

// GET /api/calculations
router.get('/', async (req, res) => {
    try {
        res.json(await allRows('SELECT * FROM calculations ORDER BY created_at DESC'));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// POST /api/calculations
router.post('/', async (req, res) => {
    try {
        const { type, product, quantity, unit, total, client_name, client_phone } = req.body;
        if (!type || !product || !quantity || !total) {
            return res.status(400).json({ error: 'Заполните обязательные поля' });
        }

        const now = new Date();
        const date = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        const result = await runSql(
            `INSERT INTO calculations (type, product, quantity, unit, total, client_name, client_phone, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [type, product, quantity, unit || 'м²', total, client_name || '', client_phone || '', date, time]
        );

        res.status(201).json(await oneRow('SELECT * FROM calculations WHERE id = ?', [result.insertId]));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// DELETE /api/calculations/:id
router.delete('/:id', async (req, res) => {
    try {
        const calc = await oneRow('SELECT * FROM calculations WHERE id = ?', [Number(req.params.id)]);
        if (!calc) return res.status(404).json({ error: 'Расчёт не найден' });

        await runSql('DELETE FROM calculations WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

module.exports = router;
