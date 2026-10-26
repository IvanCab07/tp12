import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crud_personas',
    connectionLimit: 5
});

pool.getConnection()
    .then(connection => {
        console.log('conectados');
        connection.release();
    })
    .catch(error => {
        console.error('error de conexion', error);
    });

export default pool;
