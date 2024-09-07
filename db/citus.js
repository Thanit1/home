const { Pool } = require('pg');
const dbConnection = new Pool({
    user: 'postgres',
    host: '172.25.9.75',
    database: 'postgres',
    password: '123456',
    port: 5432
});


// const { Pool } = require('pg');

// const dbConnection = new Pool({
//     user: 'lcmpj',
//     host: '20.2.211.25',
//     database: 'LCM',
//     password: '0656076916lcm',
//     port: 5432,

// });

// ฟังก์ชันสำหรับตรวจสอบการเชื่อมต่อ
async function checkConnection() {
    try {
        const client = await dbConnection.connect();
        console.log('Connected to the database successfully!');
        client.release();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

checkConnection();

module.exports = dbConnection;
