const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { PinoLogger } = require('../../logger');

const entityPath = path.join(__dirname, "..", "entities", "*.js");

const dataSource = new DataSource({
  type: "postgres",
  host: 'localhost',
  port:  5432,
  username: 'postgres',
  password: "postgres", 
  database: 'postgres',
  synchronize: true,  // Set this to false
  logging: true,
  logger: new PinoLogger(),
  entities: [entityPath],
});
// const dataSource = new DataSource({
//   type: "postgres",
//   host: 'pg-c8f8020-maju-31c9.f.aivencloud.com',
//   port:  '28730',
//   username: 'avnadmin',
//   password: 'AVNS_MwtQUtP9nagQvFYuQQ2', 
//   database: 'defaultdb',
//   synchronize: true,  // Set this to false
//   logging: true,
//   logger: new PinoLogger(),
//   entities: [entityPath],
// });

// const dataSource = new DataSource({
//   type: "postgres",
//   host: "junction.proxy.rlwy.net",  // Public host
//   port: 37929,                      // Port from the public URL
//   username: 'postgres',             // Username
//   password: "HSUELWSKYTKHeWNyEzeToxgcvhEDGLUz",  // Password
//   database: 'railway',              // Database name
//   synchronize: true,                // or false in production
//   logging: true,
//   logger: new PinoLogger(),
//   entities: [entityPath],
// });



// // module.exports = dataSource;
// const { DataSource } = require("typeorm");
// const path = require("path");
// const dotenv = require("dotenv");
// dotenv.config();
// const { PinoLogger } = require("../../logger");

// // Extract connection details from the connection string
// const DATABASE_URL = process.env.DATABASE_URL || "postgres://avnadmin:AVNS_MwtQUtP9nagQvFYuQQ2@pg-c8f8020-maju-31c9.f.aivencloud.com:28730/defaultdb?sslmode=require";
// const url = new URL(DATABASE_URL);

// const dataSource = new DataSource({
//   type: "postgres",
//   host: url.hostname,
//   port: parseInt(url.port, 10),
//   username: url.username,
//   password: url.password,
//   database: url.pathname.split("/")[1],
//   synchronize: true, // Use false in production
//   logging: true,
//   ssl: url.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : false,
//   logger: new PinoLogger(),
//   entities: [path.join(__dirname, "..", "entities", "*.js")],
// });

module.exports = dataSource;
