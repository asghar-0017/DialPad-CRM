const pino = require("pino");
const pretty = require("pino-pretty");
const { AbstractLogger, QueryRunner } = require("typeorm");

const stream = pretty({
  colorize: true, // colorize output
  levelFirst: false, // log level comes first
  // translateTime: 'SYS:standard', // translate timestamp to readable format
});
const logger = pino(stream);

class PinoLogger extends AbstractLogger {
  logQuery(query, parameters, queryRunner) {
    logger.info(query);
  }

  logQueryError(error, query, parameters, queryRunner) {
    logger.error(error, query, parameters, "Query failed");
  }

  logQuerySlow(time, query, parameters, queryRunner) {
    logger.warn(time, query, parameters, "Slow query");
  }

  logMigration(message, queryRunner) {
    logger.info(message, "Migration");
  }

  log(level, message, queryRunner) {
    switch (level) {
      case "log":
        logger.info(message);
        break;
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
      default:
        logger.error(message);
        break;
    }
  }
}

module.exports = {
  PinoLogger,
  logger,
};