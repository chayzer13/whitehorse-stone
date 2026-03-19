const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

async function initDb() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL DEFAULT 'Брусчатка',
            specs TEXT DEFAULT '',
            price VARCHAR(100) NOT NULL,
            colors TEXT DEFAULT '',
            description TEXT DEFAULT '',
            bg VARCHAR(50) DEFAULT '#c4a882',
            photo TEXT DEFAULT NULL,
            variations TEXT DEFAULT '[]',
            badge VARCHAR(100) DEFAULT '',
            photos TEXT DEFAULT '[]',
            price_unit VARCHAR(50) DEFAULT '₽/м²',
            is_popular TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            rating INT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            date VARCHAR(100) DEFAULT '',
            city VARCHAR(100) DEFAULT '',
            photos TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS calculations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(100) NOT NULL,
            product VARCHAR(255) NOT NULL,
            quantity DECIMAL(10,2) NOT NULL,
            unit VARCHAR(20) DEFAULT 'м²',
            total VARCHAR(100) NOT NULL,
            client_name VARCHAR(255) DEFAULT '',
            client_phone VARCHAR(50) DEFAULT '',
            date VARCHAR(100) DEFAULT '',
            time VARCHAR(20) DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price VARCHAR(100) NOT NULL,
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
}

module.exports = { pool, initDb };
