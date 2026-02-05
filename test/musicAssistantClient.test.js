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

  const client = new MusicAssistantClient({
    host: 'localhost',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedMethod = options.method;
      return new Response(JSON.stringify([{ id: 'player-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  const result = await client.getPlayers();
  assert.equal(requestedUrl, 'http://localhost:8095/api/players');
  assert.equal(requestedMethod, 'GET');
  assert.equal(result[0].id, 'player-1');
});

test('playMedia validates required arguments', async () => {
  const client = new MusicAssistantClient({ host: 'localhost', fetchImpl: async () => new Response('{}') });

  await assert.rejects(() => client.playMedia({}, { uri: 'x' }), MusicAssistantError);
  await assert.rejects(() => client.playMedia({ id: 'p1' }, {}), MusicAssistantError);
});

test('throws MusicAssistantHttpError for non-2xx responses', async () => {
  const client = new MusicAssistantClient({
    host: 'localhost',
    fetchImpl: async () => new Response('nope', { status: 500 })
  });

  await assert.rejects(
    () => client.getPlayers(),
    (error) => error instanceof MusicAssistantHttpError && error.status === 500
  );
});

test('testConnection calls /api/info and returns details', async () => {
  let requestedUrl;
  const client = new MusicAssistantClient({
    host: 'ma.local',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({ version: '2.0.0', server_id: 'srv-1' }), { status: 200 });
    }
  });

  const result = await client.testConnection();
  assert.equal(requestedUrl, 'http://ma.local:8095/api/info');
  assert.equal(result.version, '2.0.0');
  assert.equal(result.serverId, 'srv-1');
  assert.equal(result.reachable, true);
});

test('constructor validates host and port', async () => {
  assert.throws(() => new MusicAssistantClient({ host: '' }), MusicAssistantError);
  assert.throws(() => new MusicAssistantClient({ host: 'x', port: 0 }), MusicAssistantError);
});
