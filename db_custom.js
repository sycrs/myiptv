const mysql = require('mysql');

// const { database } = require('./keys');

const { promisify } = require('util');

const conn_mysql=(params_db)=>{

const pool = mysql.createPool(params_db);

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code == 'PROTOCOL_CONECTION_LOST') {
            console.err('La conexion fue cerrada');
        }
        if (err.code == 'ER_CON_COUNT_ERROR') {
            console.err('Erro cantidad de conexiones');
        }
        if (err.code == 'ECONNREFUSED') {
            console.err('La conexion fue rechazada');
        }
        err.code=='ER_NOT_SUPPORTED_AUTH_MODE'? console.log(err):null;
    }
    if (connection) connection.release();
    console.log(`${params_db['database']} is connected!`);
    return;
});

pool.query = promisify(pool.query);
pool.queryFull = (query) => {
    //  console.log(query);
    return new Promise((resolve, reject) => {
        pool.query(query, (error, rows, fields) => {
            if (error) {
                return reject(error);
            }
            return resolve({ error, rows, fields });
        });
    });
};

pool.insert = (tabla, columnas_array, valores_array) => {
    return new Promise((resolve, reject) => {
        pool.query(mysql.format(`INSERT INTO ${tabla} (??) VALUES ?`, [columnas_array, [valores_array]]), (error, rows, fields) => {
            if (error) {
                return reject(error);
            }
            return resolve({ error, rows, fields });
        });
    });
}

return pool;

};

module.exports = conn_mysql;