const { Pool } = require('pg')

module.exports = new Pool({
  user: 'postgres',
  password: 'piracaia19',
  host: 'localhost',
  port: 5432,
  database: 'gymmanager'
})