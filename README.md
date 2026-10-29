# coupeweb

A personal browser interface with a real Scramjet web proxy and a local Wisp relay. Includes an address/search bar, back, forward, reload, home, and quick links.

## Run locally

Install Node.js 22 or later. From this folder:

```sh
npm install --ignore-scripts
npm start
```

Open **[http://localhost:8080](https://igncoupe.github.io/coupeweb/)** in a modern browser. Keep the server running while browsing. Stop it with Ctrl+C. If port 8080 is occupied, use `PORT=8081 npm start`.

With pnpm, use `pnpm install --frozen-lockfile --ignore-scripts` to install the versions recorded in the included lockfile.

## Run from a GitHub repository

1. Create a new private GitHub repository named `proxy-browser`.
2. Add this folder's contents to the repository root, including `.devcontainer`, `.gitignore`, and the lockfile. Do not upload `node_modules`.
3. Open **Code → Codespaces → Create codespace on main**.
4. The included configuration installs the dependencies and starts coupeweb. Open port **8080** in the Codespaces **Ports** panel if it does not open automatically.
5. Keep port visibility **Private**. Keep the Codespace running while browsing; stop it when finished.

GitHub Codespaces usage is subject to your account's quotas and billing settings. The repository stores the source; Codespaces runs the server. GitHub Pages by itself cannot run this proxy's relay.

## Scope

- The server listens only on this computer by default.
- Websites see the server's outgoing IP. Running locally does not change your network's public IP.
- The proxy handles HTTP and HTTPS sites; some sites, logins, video, and anti-bot checks may not work.
- It requires service workers and cross-origin isolation. Use localhost locally or HTTPS remotely.
- Cookies and site storage can persist in the browser. This is not an anonymous or private-browsing mode.
- This project is intended for local use or private Codespaces forwarding. It has no built-in account system; do not expose it as an unauthenticated public service.
- The relay rejects other browser origins, direct IP destinations, local/private destinations, UDP, and destination ports other than 80 and 443 using Wisp's configuration.

## Checks

```sh
npm test
```

The included tests cover address parsing, unsupported schemes, credentials in addresses, host validation, and relay Origin checks. Initial local verification passed these tests and confirmed that the homepage serves HTTP 200 with the required isolation headers. A relay regression test also verifies that valid streams do not crash Wisp and that total-stream and destination limits remain enforced. Direct HTTPS tests through the WebSocket relay returned HTTP 200 for YouTube and TikTok; ChatGPT returned HTTP 403. Full browser rendering and the Codespaces configuration have not been verified end to end.

## Credits and license

Powered by [Scramjet](https://github.com/MercuryWorkshop/scramjet), [Bare Mux](https://github.com/MercuryWorkshop/bare-mux), libcurl transport, and Wisp from Mercury Workshop. Integration follows the upstream [Scramjet example application](https://github.com/MercuryWorkshop/Scramjet-App). The interface and application glue are provided under AGPL-3.0-only; see LICENSE. Dependencies retain their own licenses.
