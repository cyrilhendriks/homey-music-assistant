'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MusicAssistantClient,
  MusicAssistantError,
  MusicAssistantHttpError
} = require('../src/lib/musicAssistantClient');

test('searchTracks returns empty array for short query', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.searchTracks('a');
  assert.deepEqual(result, []);
});

test('getPlayers performs GET request', async () => {
  let requestedUrl;
  let requestedMethod;
  let requestedBody;

  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedMethod = options.method;
      requestedBody = options.body;
      return new Response(JSON.stringify([{ player_id: 'player-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  const result = await client.getPlayers();
  assert.equal(requestedUrl, 'http://localhost:8095/api');
  assert.equal(requestedMethod, 'POST');
  assert.equal(requestedBody, JSON.stringify({ command: 'players/all', args: {} }));
  assert.equal(result[0].player_id, 'player-1');
});

test('playMedia validates required arguments', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => new Response('{}')
  });

  await assert.rejects(() => client.playMedia({}, { uri: 'x' }), MusicAssistantError);
  await assert.rejects(() => client.playMedia({ id: 'p1' }, {}), MusicAssistantError);
});

test('throws MusicAssistantHttpError for non-2xx responses', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    port: 8095,
    token: 'test-token',
    fetchImpl: async () => new Response('nope', { status: 500 })
  });

  await assert.rejects(
    () => client.getPlayers(),
    (error) => error instanceof MusicAssistantHttpError && error.status === 500
  );
});
