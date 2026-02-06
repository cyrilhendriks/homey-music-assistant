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
  constructor({ host, port = 8095, token, timeoutMs = 8000, fetchImpl = fetch, logger } = {}) {
    const sanitizedHost = String(host ?? '').trim();
    const sanitizedPort = Number(port);

    if (!sanitizedHost) {
      throw new MusicAssistantError('Music Assistant host ontbreekt (ma_host).');
    }

    if (!Number.isInteger(sanitizedPort) || sanitizedPort < 1 || sanitizedPort > 65535) {
      throw new MusicAssistantError('Music Assistant port is ongeldig (ma_port).');
    }

    this.baseUrl = `http://${sanitizedHost}:${sanitizedPort}`;
    this.token = String(token ?? '').trim();
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
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
      throw new MusicAssistantError('Music Assistant command is verplicht.');
    }

    if (requireAuth && !this.token) {
      throw new MusicAssistantError('Bearer token ontbreekt (ma_token).');
    }

    return this.#request('/api', {
      method: 'POST',
      auth: requireAuth,
      body: {
        command,
        args
      }
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
      error: null
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
      auth
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
      throw new MusicAssistantError('playMedia vereist target.id (queue_id).');
    }

    const uri = media?.uri || media?.id;
    if (!uri || typeof uri !== 'string') {
      throw new MusicAssistantError('playMedia vereist media.uri (bijv. "library://track/456").');
    }

    return this.call('player_queues/play_media', {
      queue_id: target.id,
      media: [uri]
    });
  }

  // The following methods depend on specific MA commands. We will implement them later using the Commands Reference.
  async getGroups() {
    throw new MusicAssistantError('getGroups is nog niet geïmplementeerd voor de MA 2.7.x RPC API.');
  }

  async getRadioStations() {
    throw new MusicAssistantError('getRadioStations is nog niet geïmplementeerd voor de MA 2.7.x RPC API.');
  }

  async getPlaylists() {
    throw new MusicAssistantError('getPlaylists is nog niet geïmplementeerd voor de MA 2.7.x RPC API.');
  }

  async searchTracks(query) {
    // We will implement this later via the MA Commands Reference (search command).
    if (!query || query.trim().length < 2) {
      return [];
    }

    throw new MusicAssistantError('searchTracks is nog niet geïmplementeerd voor de MA 2.7.x RPC API.');
  }

  async announce(targets, message, options = {}) {
    // We will implement this later via the MA Commands Reference (announce/TTS command).
    void options;

    if (!Array.isArray(targets) || targets.length === 0) {
      throw new MusicAssistantError('announce vereist minstens 1 target.');
    }

    if (!message || !message.trim()) {
      throw new MusicAssistantError('announce vereist een niet-lege message.');
    }

    throw new MusicAssistantError('announce is nog niet geïmplementeerd voor de MA 2.7.x RPC API.');
  }

  async #request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (options.auth !== false) {
        if (this.token) {
          headers.Authorization = `Bearer ${this.token}`;
        }
      }

      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      const text = await response.text();

      if (!response.ok) {
        this.logger?.warn?.('Music Assistant request failed', {
          path,
          status: response.status,
          body: text
        });

        throw new MusicAssistantHttpError(`Music Assistant request failed: ${response.status}`, response.status, {
          path,
          responseBody: text
        });
      }

      if (!text) {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error?.name === 'AbortError') {
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
        cause: error?.message
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
