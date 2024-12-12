const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { PinoLogger } = require("../../logger");

const entityPath = path.join(__dirname, "..", "entities", "*.js");

// Extract connection details securely using environment variables or provided public URL
const DATABASE_URL = 'postgres://postgres:7dvqh9cQlS6RhmEB4LBRo5FkEbS2u4wDs0b6rPtdhEoHBat1aoqpkYGRCzvfh4mP@awcowwwccsgww4oko8kg0w44:5432/postgres';

// Parse connection URL for credentials and connection details
const url = new URL(DATABASE_URL);

const dataSource = new DataSource({
  type: "postgres",
  host: 'localhost',                                // Extract hostname dynamically
  port: '5432',                    // Parse port number
  username: url.username,                           // Extract username dynamically
  password: url.password,                           // Extract password dynamically
  database: url.pathname.split("/")[1],           // Extract database name dynamically
  logging: false,                                   // Turn off logging for production; enable if debugging
  // ssl: {
  //   rejectUnauthorized: false,                     // Use SSL safely
  // },
  entities: [entityPath],
  logger: new PinoLogger(),                        // Use the PinoLogger for logging
});

module.exports = dataSource;
