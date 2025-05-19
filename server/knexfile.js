require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
      database: process.env.PG_DATABASE
    },
    pool: {
      min: 0,
      max: 5
    },
    migrations: {
      directory: './migrations'
    }
  }
};
