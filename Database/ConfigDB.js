const knex = require('knex')


const connection = {
    host: 'localhost',
    user: 'u1583982_sas',
    password: 'O))_F^ML]2D%',
    database: 'u1583982_sas'

    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'absensisiswa'
}

const database = knex({
    client: 'mysql',
    connection: connection
})

module.exports = database;