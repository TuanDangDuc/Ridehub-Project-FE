const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '103.47.225.125',
  database: 'ridehub_db',
  password: '1234',
  port: 9092,
});

module.exports = pool;