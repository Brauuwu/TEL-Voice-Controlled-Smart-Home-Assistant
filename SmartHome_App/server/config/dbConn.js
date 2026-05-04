const mysql = require('mysql2'); // thư viện mysql
// load .env if present
try {
    require('dotenv').config();
} catch (e) {}

const dbConfig = {
    // prefer IPv4 to avoid ::1/IPv6 issues with some MySQL setups
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    // XAMPP default has empty root password; allow empty string
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'btliot',
};

let dbConn;

function connectWithRetry() {
    dbConn = mysql.createConnection(dbConfig);
    dbConn.connect(function (err) {
        if (err) {
            console.error('MySQL connection error:', err.message || err);
            // retry after delay
            setTimeout(connectWithRetry, 3000);
        } else {
            console.log('MySQL connected');
        }
    });

    dbConn.on('error', function (err) {
        console.error('MySQL error', err && err.code ? err.code : err);
        if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnecting to MySQL...');
            connectWithRetry();
        }
    });
}

connectWithRetry();

module.exports = dbConn;