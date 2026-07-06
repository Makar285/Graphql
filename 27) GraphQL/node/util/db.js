const { Pool } = require('pg');

const pool = new Pool({
  user: "postgres",
  database: "practika3",
  password: "Vfrfh2010!",
  port: 5432,
  host: "localhost"
});

module.exports = pool;