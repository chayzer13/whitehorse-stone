const mysql = require('mysql2/promise');

// Railway предоставляет MYSQL_URL автоматически; также поддерживаем отдельные переменные
const pool = process.env.MYSQL_URL
    ? mysql.createPool(process.env.MYSQL_URL + '?charset=utf8mb4')
    : mysql.createPool({
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
        user: process.env.DB_USER || process.env.MYSQLUSER,
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
        database: process.env.DB_NAME || process.env.MYSQLDATABASE,
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
            specs TEXT,
            price VARCHAR(100) NOT NULL,
            colors TEXT,
            description TEXT,
            bg VARCHAR(50) DEFAULT '#c4a882',
            photo TEXT,
            variations TEXT,
            badge VARCHAR(100) DEFAULT '',
            photos TEXT,
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
            photos TEXT,
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
