#!/bin/zsh
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  node server.js
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
  "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" server.js
else
  echo 'Install Node.js 22 or later, run npm install in this folder, then try again.'
fi
read -r '?Press Enter to close.'
