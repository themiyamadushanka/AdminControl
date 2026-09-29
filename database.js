const mysql = require('mysql2');
require('dotenv').config();

function createPool() {
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,  
        connectTimeout: 20000
    });
}

let pool = createPool();


pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Database connected successfully!');
    connection.release();
});


function query(sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }
    pool.query(sql, params, (err, results) => {
        if (err && (
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNRESET' ||
            err.code === 'PROTOCOL_CONNECTION_LOST' ||
            err.code === 'ECONNREFUSED'
        )) {
            console.log('Connection lost — reconnecting to Azure MySQL...');
            pool = createPool();         
            pool.query(sql, params, callback); 
        } else {
            callback(err, results);
        }
    });
}

module.exports = { query };
