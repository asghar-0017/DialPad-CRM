const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { PinoLogger } = require('../../logger');

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: "postgres",
  database: process.env.POSTGRES_DB || 'postgres',
  synchronize: true,
  logging: true,
  logger: new PinoLogger(),
  entities: [path.join(__dirname, "../entities/**/*.js")],
  trash: [path.join(__dirname, "../entities/trash/**/*.js")],
});

module.exports = dataSource;
