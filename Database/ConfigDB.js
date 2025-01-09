const knex = require('knex')


const connection = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'absensisiswa'
}

const database = knex({
    client: 'mysql',
    connection: connection
})

module.exports = database;