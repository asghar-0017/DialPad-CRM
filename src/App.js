const express = require('express');
const dotenv = require('dotenv');
const { logger } = require('../logger'); // Adjust path as needed
const AdminAuthRoute = require('./routes/authRoute');
const agentRoute = require('./routes/agentRoute');
const leadRoute = require('./routes/leadRoute');
const followUpRoute = require('./routes/followUpRoute');
const otherRoute = require('./routes/otherRoute'); // Adjust path as needed
const dataSource = require('./infrastructure/psql'); // Adjust path as needed
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// CORS configuration
app.use(cors({
  origin: '*',
}));

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// Test endpoint
app.get('/', async (req, res) => {
  const result = {
    code: 200,
    status: 'OK',
    message: 'Express server is running',
  };
  res.send(result);
});

// Route configurations
AdminAuthRoute(app);
agentRoute(app);
leadRoute(app);
followUpRoute(app);
otherRoute(app);

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('Bad JSON: ', err.message);
    return res.status(400).send({ code: 400, status: 'Bad Request', message: 'Invalid JSON payload' });
  }
  next();
});

// Start server
const startServer = async () => {
  try {
    await dataSource.initialize();
    logger.info("Database connection has been established");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      logger.info(`Server is listening on ${PORT}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = startServer;
