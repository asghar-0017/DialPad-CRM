const express = require('express');
const dotenv = require('dotenv');
const { logger } = require('../logger'); // Adjust path as needed
const AdminAuthRoute = require('./routes/authRoute');
const agentRoute=require('./routes/agentRoute')
const leadRoute=require('./routes/leadRoute')
const dataSource = require('./infrastructure/psql'); // Adjust path as needed
const cors=require('cors')

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors({
  origin:'*'
}))


app.get('/', async (req, res) => {
  const result = {
    code: 200,
    status: 'OK',
    message: 'Express server is running',
  };
  res.send(result);
});

AdminAuthRoute(app);
agentRoute(app)
leadRoute(app)


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

module.exports= startServer