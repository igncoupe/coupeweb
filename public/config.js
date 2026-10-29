// The local server (server.js) runs its own Wisp relay at /wisp/.
// The GitHub Pages build replaces this file with a public relay address (see scripts/build.js).
export const relay = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/`;
