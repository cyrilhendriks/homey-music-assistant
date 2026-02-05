'use strict';

const { execSync } = require('node:child_process');

const files = [
  'api.js',
  'src/app.js',
  'src/lib/logger.js',
  'src/lib/musicAssistantClient.js',
  'test/musicAssistantClient.test.js'
];

for (const file of files) {
  execSync(`node --check ${file}`, { stdio: 'inherit' });
}

console.log('Lint checks passed (node --check).');
