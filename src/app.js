'use strict';

const Homey = require('homey');
const { MusicAssistantClient } = require('./lib/musicAssistantClient');
const { Logger } = require('./lib/logger');

class MusicAssistantApp extends Homey.App {
  async onInit() {
    const logger = new Logger('MusicAssistantApp');

    const host = this.homey.settings.get('ma_host');
    const port = this.homey.settings.get('ma_port') || 8095;
    const apiKey = this.homey.settings.get('ma_api_key');

    if (!host) {
      logger.warn('Music Assistant host is not configured yet');
      return;
    }

    this.musicAssistantClient = new MusicAssistantClient({ host, port, apiKey, logger });
    logger.info('Music Assistant app initialized');
  }
}

module.exports = MusicAssistantApp;
