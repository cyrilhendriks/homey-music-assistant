'use strict';

const Homey = require('homey');
const { MusicAssistantClient } = require('./lib/musicAssistantClient');
const { Logger } = require('./lib/logger');

class MusicAssistantApp extends Homey.App {
  async onInit() {
    this.logger = new Logger('MusicAssistantApp');
    this.logger.info('Music Assistant app initialized');
  }

  /**
   * Read Music Assistant connection settings.
   * We do NOT fail app startup if settings are missing;
   * flows/settings UI should guide the user.
   */
  getMusicAssistantConfig() {
    const host = (this.homey.settings.get('ma_host') || '').trim();
    const port = Number(this.homey.settings.get('ma_port') || 8095);
    const token = (this.homey.settings.get('ma_token') || '').trim();

    const baseUrl = host ? `http://${host}:${port}` : undefined;

    this.logger.debug('Music Assistant settings loaded', {
      baseUrl,
      port,
      tokenConfigured: Boolean(token),
    });

    return { host, port, token, baseUrl };
  }

  /**
   * Create a MA client from the current settings.
   * Throws a clear error if host/port invalid.
   */
  createMusicAssistantClient() {
    const { host, port, token } = this.getMusicAssistantConfig();
    return new MusicAssistantClient({ host, port, token, logger: this.logger });
  }
}

module.exports = MusicAssistantApp;
