'use strict';

const { MusicAssistantClient, MusicAssistantError } = require('./src/lib/musicAssistantClient');
const { Logger } = require('./src/lib/logger');

function sanitizeSettings(settings) {
  return {
    ma_host: settings.ma_host || '',
    ma_port: Number(settings.ma_port) || 8095,
    ma_api_key: settings.ma_api_key || ''
  };
}

module.exports = [
  {
    method: 'GET',
    path: '/settings',
    fn: async ({ homey }) => {
      const settings = sanitizeSettings({
        ma_host: homey.settings.get('ma_host'),
        ma_port: homey.settings.get('ma_port'),
        ma_api_key: homey.settings.get('ma_api_key')
      });

      return { ok: true, settings };
    }
  },
  {
    method: 'POST',
    path: '/settings',
    fn: async ({ body, homey }) => {
      const ma_host = String(body?.ma_host ?? '').trim();
      const ma_port = Number(body?.ma_port ?? 8095);
      const ma_api_key = String(body?.ma_api_key ?? '').trim();

      if (!ma_host) {
        return { ok: false, error: 'ma_host is verplicht.' };
      }

      if (!Number.isInteger(ma_port) || ma_port < 1 || ma_port > 65535) {
        return { ok: false, error: 'ma_port moet een geldig poortnummer zijn (1-65535).' };
      }

      homey.settings.set('ma_host', ma_host);
      homey.settings.set('ma_port', ma_port);
      homey.settings.set('ma_api_key', ma_api_key);

      return {
        ok: true,
        settings: { ma_host, ma_port, ma_api_key }
      };
    }
  },
  {
    method: 'POST',
    path: '/test-connection',
    fn: async ({ homey }) => {
      const logger = new Logger('MusicAssistantAPI');

      try {
        const client = new MusicAssistantClient({
          host: homey.settings.get('ma_host'),
          port: homey.settings.get('ma_port') || 8095,
          apiKey: homey.settings.get('ma_api_key'),
          logger
        });

        const details = await client.testConnection();
        return { ok: true, details };
      } catch (error) {
        if (error instanceof MusicAssistantError) {
          return { ok: false, error: error.message };
        }

        return { ok: false, error: 'Onverwachte fout tijdens verbindingstest.' };
      }
    }
  }
];
