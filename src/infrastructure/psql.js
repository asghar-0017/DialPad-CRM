const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { PinoLogger } = require('../../logger');

const entityPath = path.join(__dirname, "..", "entities", "*.js");

const dataSource = new DataSource({
  type: "postgres",
  host: '3.94.207.44',
  port:  5432,
  username: 'postgres',
  password: "7dvqh9cQlS6RhmEB4LBRo5FkEbS2u4wDs0b6rPtdhEoHBat1aoqpkYGRCzvfh4mP", 
  database: 'postgres',
  synchronize: true,  // Set this to false
  // logging: true,
  // logger: new PinoLogger(),
  entities: [entityPath],
});
// const dataSource = new DataSource({
//   type: "postgres",
//   host: process.env.POSTGRES_HOST,
//   port:  process.env.DB_PORT,
//   username: process.env.POSTGRES_USER,
//   password: 'SoftMark#2024$', 
//   database: process.env.POSTGRES_DB,
//   synchronize: true,  // Set this to false
//   logging: true,
//   logger: new PinoLogger(),
//   entities: [entityPath],
// });

module.exports = dataSource;
