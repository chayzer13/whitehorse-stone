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

// GET /api/products
router.get('/', async (req, res) => {
    try {
        res.json(await allRows('SELECT * FROM products ORDER BY created_at DESC'));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await oneRow('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
        if (!product) return res.status(404).json({ error: 'Товар не найден' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { name, type, specs, price, colors, description, bg, photo, variations, badge, photos, price_unit, is_popular } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Название и цена обязательны' });

        const result = await runSql(
            `INSERT INTO products (name, type, specs, price, colors, description, bg, photo, variations, badge, photos, price_unit, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, type || 'Брусчатка', specs || '', price, colors || '', description || '', bg || '#c4a882', photo || null, variations || '[]', badge || '', photos || '[]', price_unit || '₽/м²', is_popular ? 1 : 0]
        );

        res.status(201).json(await oneRow('SELECT * FROM products WHERE id = ?', [result.insertId]));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
    try {
        const existing = await oneRow('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
        if (!existing) return res.status(404).json({ error: 'Товар не найден' });

        const { name, type, specs, price, colors, description, bg, photo, variations, badge, photos, price_unit, is_popular } = req.body;
        await runSql(
            `UPDATE products SET name=?, type=?, specs=?, price=?, colors=?, description=?, bg=?, photo=?, variations=?, badge=?, photos=?, price_unit=?, is_popular=? WHERE id=?`,
            [
                name || existing.name, type || existing.type,
                specs !== undefined ? specs : existing.specs,
                price || existing.price,
                colors !== undefined ? colors : existing.colors,
                description !== undefined ? description : existing.description,
                bg || existing.bg,
                photo !== undefined ? photo : existing.photo,
                variations !== undefined ? variations : (existing.variations || '[]'),
                badge !== undefined ? badge : (existing.badge || ''),
                photos !== undefined ? photos : (existing.photos || '[]'),
                price_unit !== undefined ? price_unit : (existing.price_unit || '₽/м²'),
                is_popular !== undefined ? (is_popular ? 1 : 0) : (existing.is_popular || 0),
                Number(req.params.id)
            ]
        );

        res.json(await oneRow('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]));
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    try {
        const existing = await oneRow('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
        if (!existing) return res.status(404).json({ error: 'Товар не найден' });

        await runSql('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

module.exports = router;
