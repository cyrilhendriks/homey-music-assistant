'use strict';

class Logger {
  constructor(prefix = 'MusicAssistantApp', homeyLogger) {
    this.prefix = prefix;
    this.homeyLogger = homeyLogger;
  }

  info(message, meta) {
    this.#log('INFO', message, meta);
  }

  warn(message, meta) {
    this.#log('WARN', message, meta);
  }

  error(message, meta) {
    this.#log('ERROR', message, meta);
  }

  debug(message, meta) {
    this.#log('DEBUG', message, meta);
  }

  #log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const details = meta ? ` ${JSON.stringify(meta)}` : '';
    if (this.homeyLogger) {
      if (level === 'ERROR' && typeof this.homeyLogger.error === 'function') {
        this.homeyLogger.error(`[${timestamp}] [${this.prefix}] [${level}] ${message}${details}`);
      } else if (
        ['INFO', 'WARN', 'DEBUG'].includes(level) &&
        typeof this.homeyLogger.log === 'function'
      ) {
        this.homeyLogger.log(`[${timestamp}] [${this.prefix}] [${level}] ${message}${details}`);
      } else {
        console.log(`[${timestamp}] [${this.prefix}] [${level}] ${message}${details}`);
      }
    } else {
      console.log(`[${timestamp}] [${this.prefix}] [${level}] ${message}${details}`);
    }
  }
}

module.exports = { Logger };
