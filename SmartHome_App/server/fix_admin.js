const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdmin() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_NAME || 'btliot'
    });

    const hash = await bcrypt.hash('admin', 10);
    console.log('New hash:', hash);
    
    await db.execute('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
    console.log('✅ Admin password updated successfully');
    
    await db.end();
}

updateAdmin().catch(console.error);
