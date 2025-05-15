const fs = require('fs');
const util = require('util');

const LOG_LEVELS = ['INFO', 'DEBUG', 'ERROR'];

function log(level, message, meta = {}) {
  if (!LOG_LEVELS.includes(level)) level = 'INFO';
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  console.log(logMsg);
  // Optionally write to file
  // fs.appendFileSync('server.log', logMsg + '\n');
}

function logRoute(level = 'INFO') {
  return (req, res, next) => {
    log(level, `Request: ${req.method} ${req.originalUrl}`, { body: req.body, query: req.query });
    next();
  };
}

function logError(err) {
  log('ERROR', err.message, { stack: err.stack });
}

const requestLogger = logRoute('INFO');

module.exports = {
  log,
  logRoute,
  logError,
  requestLogger,
}; 