const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { PinoLogger } = require('../../logger');

// Log the environment variables to ensure they are loaded

// Logging the entity path for debugging purposes
const entityPath = path.join(__dirname, "..", "entities", "*.js");
// console.log("Loading entities from:", entityPath);
//deployment

// const dataSource = new DataSource({
//   type: "postgres",
//   host: 'localhost',
//   port:  5432,
//   username: 'postgres',
//   password: "postgres", 
//   database: 'postgres',
//   synchronize: true,  // Set this to false
//   logging: true,
//   logger: new PinoLogger(),
//   entities: [entityPath],
// });
const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port:  process.env.DB_PORT,
  username: process.env.POSTGRES_USER,
  password: 'SoftMark#2024$', 
  database: process.env.POSTGRES_DB,
  synchronize: true,  // Set this to false
  logging: true,
  logger: new PinoLogger(),
  entities: [entityPath],
});

module.exports = dataSource;
