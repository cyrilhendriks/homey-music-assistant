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

/**
 * Music Assistant 2.7.x client
 *
 * Important:
 * - Server info (no auth): GET /info
 * - Commands (auth required): POST /api  { command, args }
 * - Auth: Authorization: Bearer <token>
 */
class MusicAssistantClient {
  constructor({ host, port = 8095, token, timeoutMs = 8000, fetchImpl, logger } = {}) {
    const rawHost = String(host ?? '').trim();
    const rawPort = Number(port);

    const normalized = this.#normalizeHostAndPort(rawHost, rawPort);

    if (!normalized.host) {
      throw new MusicAssistantError('Music Assistant host is missing (ma_host).');
    }

    if (!Number.isInteger(normalized.port) || normalized.port < 1 || normalized.port > 65535) {
      throw new MusicAssistantError('Music Assistant port is invalid (ma_port).');
    }

    this.fetchImpl = fetchImpl ?? globalThis.fetch;
    if (!this.fetchImpl) {
      throw new MusicAssistantError(
        'No fetch implementation available. Provide fetchImpl when constructing MusicAssistantClient.'
      );
    }

    this.baseUrl = `${normalized.protocol}://${normalized.host}:${normalized.port}`;
    this.token = String(token ?? '').trim();
    this.timeoutMs = timeoutMs;
    this.logger = logger;
  }

  /**
   * GET /info (no auth)
   */
  async getInfo() {
    return this.#request('/info', { method: 'GET', auth: false });
  }

  /**
   * POST /api (RPC)
   */
  async call(command, args = {}, { requireAuth = true } = {}) {
    if (!command || typeof command !== 'string') {
      throw new MusicAssistantError('Music Assistant command is required.');
    }

    if (requireAuth && !this.token) {
      throw new MusicAssistantError('Music Assistant token is missing (ma_token).');
    }

    return this.#request('/api', {
      method: 'POST',
      auth: requireAuth,
      body: {
        command,
        args,
      },
    });
  }

  /**
   * Connection test:
   * 1) reachability via GET /info (no auth)
   * 2) if token is set: auth check via a lightweight command (players/all)
   */
  async testConnection() {
    const info = await this.getInfo();

    let auth = {
      attempted: Boolean(this.token),
      ok: null,
      error: null,
    };

    if (this.token) {
      try {
        await this.call('players/all', {}, { requireAuth: true });
        auth.ok = true;
      } catch (e) {
        auth.ok = false;
        auth.error = e?.message || String(e);
      }
    }

    return {
      reachable: true,
      info,
      auth,
    };
  }

  // --- Convenience wrappers (we only implement the ones we can back by the MA 2.7.x docs confidently) ---

  async getPlayers() {
    return this.call('players/all', {});
  }

  /**
   * Play media on a queue.
   *
   * MA docs example:
   * command: player_queues/play_media
   * args: { queue_id: "player_123", media: ["library://track/456"] }
   */
  async playMedia(target, media) {
    if (!target?.id) {
      throw new MusicAssistantError('playMedia requires target.id (queue_id).');
    }

    const uri = media?.uri || media?.id;
    if (!uri || typeof uri !== 'string') {
      throw new MusicAssistantError(
        'playMedia requires media.uri (for example "library://track/456").'
      );
    }

    return this.call('player_queues/play_media', {
      queue_id: target.id,
      media: [uri],
    });
  }

  // The following methods depend on specific MA commands. We will implement them later using the Commands Reference.
  async getGroups() {
    throw new MusicAssistantError('getGroups is not implemented yet for the MA 2.7.x RPC API.');
  }

  async getRadioStations() {
    throw new MusicAssistantError(
      'getRadioStations is not implemented yet for the MA 2.7.x RPC API.'
    );
  }

  async getPlaylists() {
    throw new MusicAssistantError('getPlaylists is not implemented yet for the MA 2.7.x RPC API.');
  }

  async searchTracks(query) {
    // We will implement this later via the MA Commands Reference (search command).
    if (!query || query.trim().length < 2) {
      return [];
    }

    throw new MusicAssistantError('searchTracks is not implemented yet for the MA 2.7.x RPC API.');
  }

  async announce(targets, message, options = {}) {
    // We will implement this later via the MA Commands Reference (announce/TTS command).
    void options;

    if (!Array.isArray(targets) || targets.length === 0) {
      throw new MusicAssistantError('announce requires at least 1 target.');
    }

    if (!message || !message.trim()) {
      throw new MusicAssistantError('announce requires a non-empty message.');
    }

    throw new MusicAssistantError('announce is not implemented yet for the MA 2.7.x RPC API.');
  }

  #normalizeHostAndPort(host, port) {
    let protocol = 'http';
    let h = host;

    // Allow users to paste a full URL like https://homeassistant.local:8095/
    if (h.toLowerCase().startsWith('http://')) {
      protocol = 'http';
      h = h.slice('http://'.length);
    } else if (h.toLowerCase().startsWith('https://')) {
      protocol = 'https';
      h = h.slice('https://'.length);
    }

    // Remove any path/query fragments and trailing slashes
    h = h.split('/')[0].trim();

    // If the host includes a port (host:1234), optionally use it.
    // We only take the host-specified port when the explicit port argument is the default 8095.
    const match = h.match(/^(.*):(\d{1,5})$/);
    if (match) {
      const extractedHost = match[1];
      const extractedPort = Number(match[2]);
      h = extractedHost;

      if (port === 8095 && Number.isInteger(extractedPort)) {
        port = extractedPort;
      }
    }

    return {
      protocol,
      host: h,
      port,
    };
  }

  async #request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (options.auth === true && !this.token) {
        throw new MusicAssistantError('Music Assistant token is missing (ma_token).');
      }

      if (options.auth !== false && this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        this.logger?.warn?.('Music Assistant request failed', {
          path,
          status: response.status,
          body: text,
        });

        throw new MusicAssistantHttpError(
          `Music Assistant request failed: ${response.status}`,
          response.status,
          {
            path,
            responseBody: text,
          }
        );
      }

      if (!text) {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new MusicAssistantTimeoutError('Music Assistant request timed out', {
          path,
          timeoutMs: this.timeoutMs,
        });
      }

      if (error instanceof MusicAssistantError) {
        throw error;
      }

      throw new MusicAssistantError('Music Assistant request failed', {
        path,
        cause: error?.message,
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
  MusicAssistantTimeoutError,
};
