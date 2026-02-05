'use strict';

class Logger {
  constructor(prefix = 'MusicAssistantApp') {
    this.prefix = prefix;
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
    // Homey-compatible fallback logger.
    // In Homey runtime, this can be replaced by this.homey.log/error wrappers.
    console.log(`[${timestamp}] [${this.prefix}] [${level}] ${message}${details}`);
  }
}

module.exports = { Logger };
