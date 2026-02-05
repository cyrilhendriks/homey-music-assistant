'use strict';

const Homey = require('homey');
const { MusicAssistantClient } = require('./lib/musicAssistantClient');
const { Logger } = require('./lib/logger');

class MusicAssistantApp extends Homey.App {
  async onInit() {
    this.logger = new Logger('MusicAssistantApp');
    this.logger.info('Music Assistant app initialized');
  }

  getMusicAssistantConfig() {
    return {
      host: this.homey.settings.get('ma_host'),
      port: this.homey.settings.get('ma_port') || 8095,
      apiKey: this.homey.settings.get('ma_api_key')
    };
  }

  createMusicAssistantClient() {
    const config = this.getMusicAssistantConfig();
    return new MusicAssistantClient({ ...config, logger: this.logger });
  }
}

module.exports = MusicAssistantApp;
