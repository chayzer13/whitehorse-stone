const https = require('https');

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const SITE_URL = process.env.SITE_URL || '';

/**
 * Отправляет уведомление IndexNow в Яндекс об изменении URL-ов.
 * @param {string|string[]} urls — URL или массив URL-ов (относительные пути, например '/')
 */
function notifyIndexNow(urls) {
    if (!INDEXNOW_KEY || !SITE_URL) {
        console.log('IndexNow: INDEXNOW_KEY или SITE_URL не заданы, пропускаем');
        return;
    }

    const host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const urlList = (Array.isArray(urls) ? urls : [urls])
        .map(u => `${SITE_URL.replace(/\/$/, '')}${u.startsWith('/') ? u : '/' + u}`);

    const body = JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL.replace(/\/$/, '')}/${INDEXNOW_KEY}.txt`,
        urlList
    });

    const req = https.request('https://yandex.com/indexnow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(body)
        }
    }, (res) => {
        console.log(`IndexNow Яндекс: ${res.statusCode} для ${urlList.join(', ')}`);
    });

    req.on('error', (err) => {
        console.error('IndexNow ошибка:', err.message);
    });

    req.write(body);
    req.end();
}

module.exports = { notifyIndexNow };
