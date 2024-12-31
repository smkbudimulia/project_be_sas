const knex = require('knex')


const connection = {
    //local
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'absensisiswa'

    //server online
    host: 'localhost',
    user: 'u1583982_sas',
    password: 'v56tuHC4etcvhb66&',
    database: 'u1583982_sas'
}

const database = knex({
    client: 'mysql',
    connection: connection
})

module.exports = database;