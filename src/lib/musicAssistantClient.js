'use strict';

class MusicAssistantError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'MusicAssistantError';
    this.details = details;
  }
}

class MusicAssistantTimeoutError extends MusicAssistantError {
  constructor(message, details = {}) {
    super(message, details);
    this.name = 'MusicAssistantTimeoutError';
  }
}

class MusicAssistantHttpError extends MusicAssistantError {
  constructor(message, status, details = {}) {
    super(message, { ...details, status });
    this.name = 'MusicAssistantHttpError';
    this.status = status;
  }
}

class MusicAssistantClient {
  constructor({ host, port = 8095, apiKey, timeoutMs = 8000, fetchImpl = fetch, logger } = {}) {
    const sanitizedHost = String(host ?? '').trim();
    const sanitizedPort = Number(port);

    if (!sanitizedHost) {
      throw new MusicAssistantError('Missing Music Assistant host configuration');
    }

    if (!Number.isInteger(sanitizedPort) || sanitizedPort < 1 || sanitizedPort > 65535) {
      throw new MusicAssistantError('Invalid Music Assistant port configuration');
    }

    this.baseUrl = `http://${sanitizedHost}:${sanitizedPort}`;
    this.apiKey = String(apiKey ?? '').trim() || undefined;
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
    this.logger = logger;
  }

  async testConnection() {
    // Based on MA API docs: use server-info style call to verify reachability/auth.
    const info = await this.#request('/api/info');

    return {
      reachable: true,
      authenticated: true,
      version: info?.version,
      serverId: info?.server_id,
      raw: info
    };
  }

  async getPlayers() {
    return this.#request('/api/players');
  }

  async getGroups() {
    return this.#request('/api/player_groups');
  }

  async getRadioStations() {
    return this.#request('/api/library/radio');
  }

  async getPlaylists() {
    return this.#request('/api/library/playlists');
  }

  async searchTracks(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.#request(`/api/search?media_type=track&q=${encodeURIComponent(query.trim())}`);
  }

  async playMedia(target, media) {
    if (!target?.id) {
      throw new MusicAssistantError('playMedia requires target.id');
    }

    if (!media?.uri) {
      throw new MusicAssistantError('playMedia requires media.uri');
    }

    return this.#request('/api/player/play_media', {
      method: 'POST',
      body: {
        player_id: target.id,
        media_uri: media.uri,
        enqueue: media.enqueue ?? false
      }
    });
  }

  async announce(targets, message, options = {}) {
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new MusicAssistantError('announce requires at least one target');
    }

    if (!message || !message.trim()) {
      throw new MusicAssistantError('announce requires a non-empty message');
    }

    // Note: resume behavior can differ per player integration.
    // Some players fully support pause/resume context, others may restart/skip.
    return this.#request('/api/player/announce', {
      method: 'POST',
      body: {
        player_ids: targets.map((target) => target.id),
        message: message.trim(),
        volume_level: options.volumeLevel,
        pre_announce_tone: options.preAnnounceTone ?? false,
        resume_after: options.resumeAfter ?? true
      }
    });
  }

  async #request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger?.warn('Music Assistant request failed', {
          path,
          status: response.status,
          body: text
        });
        throw new MusicAssistantHttpError(`Music Assistant request failed: ${response.status}`, response.status, {
          path,
          responseBody: text
        });
      }

      const text = await response.text();
      if (!text) {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new MusicAssistantTimeoutError('Music Assistant request timed out', {
          path,
          timeoutMs: this.timeoutMs
        });
      }

      if (error instanceof MusicAssistantError) {
        throw error;
      }

      throw new MusicAssistantError('Music Assistant request failed', {
        path,
        cause: error.message
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = {
  MusicAssistantClient,
  MusicAssistantError,
  MusicAssistantHttpError,
  MusicAssistantTimeoutError
};
