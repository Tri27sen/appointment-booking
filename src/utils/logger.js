
const { NODE_ENV } = require('../config/env');

class Logger {
  static info(message, data = {}) {
    if (NODE_ENV !== 'test') {
      console.log(`[INFO] ${message}`, data);
    }
  }

  static error(message, error = {}) {
    console.error(`[ERROR] ${message}`, error);
  }

  static warn(message, data = {}) {
    if (NODE_ENV !== 'test') {
      console.warn(` [WARN] ${message}`, data);
    }
  }

  static debug(message, data = {}) {
    if (NODE_ENV === 'development') {
      console.log(` [DEBUG] ${message}`, data);
    }
  }

  static success(message, data = {}) {
    if (NODE_ENV !== 'test') {
      console.log(` [SUCCESS] ${message}`, data);
    }
  }
}

module.exports = Logger;