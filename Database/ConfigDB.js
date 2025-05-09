const knex = require('knex')
require('dotenv').config()


const connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME


}

const database = knex({
    client: 'mysql',
    connection: connection
})

module.exports = database;