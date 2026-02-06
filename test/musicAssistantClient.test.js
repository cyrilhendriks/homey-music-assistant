'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

// Node 18+ provides fetch/Response globally.
// Keep a local reference for clarity in tests.
const { Response } = globalThis;

const {
  MusicAssistantClient,
  MusicAssistantError,
  MusicAssistantHttpError,
} = require('../src/lib/musicAssistantClient');

test('searchTracks returns empty array for short query', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => {
      throw new Error('should not be called');
    },
  });

  const result = await client.searchTracks('a');
  assert.deepEqual(result, []);
});

test('getPlayers performs GET request', async () => {
  let requestedUrl;
  let requestedMethod;
  let requestedBody;
  let requestedHeaders;

  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedMethod = options.method;
      requestedBody = options.body;
      requestedHeaders = options.headers;
      return new Response(JSON.stringify([{ player_id: 'player-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const result = await client.getPlayers();
  assert.equal(requestedUrl, 'http://localhost:8095/api');
  assert.equal(requestedMethod, 'POST');
  assert.equal(requestedBody, JSON.stringify({ command: 'players/all', args: {} }));
  assert.equal(requestedHeaders.Authorization, 'Bearer test-token');
  assert.equal(result[0].player_id, 'player-1');
});

test('getInfo works without token', async () => {
  let requestedHeaders;

  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    fetchImpl: async (url, options) => {
      requestedHeaders = options.headers;
      return new Response(JSON.stringify({ version: '2.7.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const result = await client.getInfo();
  assert.equal(requestedHeaders.Authorization, undefined);
  assert.equal(result.version, '2.7.0');
});

test('playMedia validates required arguments', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => new Response('{}'),
  });

  await assert.rejects(() => client.playMedia({}, { uri: 'x' }), MusicAssistantError);
  await assert.rejects(() => client.playMedia({ id: 'p1' }, {}), MusicAssistantError);
});

test('throws MusicAssistantHttpError for non-2xx responses', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => new Response('nope', { status: 500 }),
  });

  await assert.rejects(
    () => client.getPlayers(),
    (error) => error instanceof MusicAssistantHttpError && error.status === 500
  );
});
