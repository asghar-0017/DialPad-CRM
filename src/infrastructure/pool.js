// src/database/pool.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host:'localhost',
  port: 5432,
  user: 'postgres',
  password:  'postgres',
  database:  'postgres',
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

module.exports = pool;
// const dataSource = new DataSource({
//   type: "postgres",
//   host: process.env.POSTGRES_HOST,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
//   username: process.env.POSTGRES_USER,
//   password: "SoftMark#2024$", // Use env variable
//   database: process.env.POSTGRES_DB,
//   synchronize: true,
//   logging: true,
//   logger: new PinoLogger(),
//   entities: [entityPath],
// });