#!/usr/bin/env bash
set -euo pipefail

# Normalize project layout for step 9 files.
mkdir -p src/lib src/flow/actions docs test

move_if_exists() {
  local source="$1"
  local target="$2"

  if [[ -f "$source" ]]; then
    mv "$source" "$target"
    echo "Moved: $source -> $target"
  fi
}

move_if_exists app.js src/app.js
move_if_exists logger.js src/lib/logger.js
move_if_exists musicAssistantClient.js src/lib/musicAssistantClient.js
move_if_exists musicAssistantClient.test.js test/musicAssistantClient.test.js
move_if_exists api-notes.md docs/api-notes.md

echo "Layout normalization completed."
