const mysql = require("mysql");
const util = require('util');
const { promisify } = require("util");

//*

let pool = mysql.createPool({
    connectionLimit : 2,
    queueLimit : 0,
    host: 'localhost',
    user: 'alahee_ecommerce',
    password: '%6bm-4UtpGKd',
    database: 'alahee_ecommerce'
});

pool.getConnection( (err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Database connection was closed.')
        else if (err.code === 'ER_CON_COUNT_ERROR') console.error('Database has too many connections.')
        else if (err.code === 'ECONNREFUSED') console.error('Database connection was refused.')
        else throw err
    }
    
    console.log("!! Alahee connected to alahee_ecommerce from db_config !! ")
    
    if (connection) { 
        connection.release()
        console.log("!! connection released !!")
    }
    
    return
});

const query = promisify(pool.query).bind(pool)

// comment if error 
// const releaseConnection = promisify(pool.end).bind(pool)
// releaseConnection()

//*/

/*

const dbConnection = mysql.createConnection ({
    host: 'localhost',
    user: 'alahee_ecommerce',
    password: '%6bm-4UtpGKd',
    database: 'alahee_ecommerce'
});

dbConnection.connect((err) => {
    if (err) throw err;
    console.log('Alahee front connected to alahee_ecommerce from adminServer dot js file ');
});

const query = promisify(dbConnection.query).bind(dbConnection);

//*/


module.exports = { query };
