# coupeweb

A personal browser interface with a real Scramjet web proxy and a local Wisp relay. Includes an address/search bar, back, forward, reload, home, and quick links.

## Run locally

Install Node.js 22 or later. From this folder:

```sh
npm install --ignore-scripts
npm start
```

Open **http://localhost:8080** in a modern browser. Keep the server running while browsing. Stop it with Ctrl+C. If port 8080 is occupied, use `PORT=8081 npm start`.

With pnpm, use `pnpm install --frozen-lockfile --ignore-scripts` to install the versions recorded in the included lockfile.

## Run on GitHub Pages

The included workflow builds a static copy of coupeweb and publishes it on every push to `main`.

1. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` (or run **Actions → Deploy to GitHub Pages → Run workflow**).
3. Open `https://<user>.github.io/<repository>/`.

GitHub Pages only serves files, so it cannot run the Wisp relay. The Pages build uses the public relay at `wss://wisp.mercurywork.shop/`, run by Mercury Workshop: page traffic passes through their server, and websites see its IP address. To use a different relay, set a repository variable named `WISP_RELAY` (**Settings → Secrets and variables → Actions → Variables**) to its `wss://` address, or change it for one browser under **Relay settings** on the home page.

To build the static site yourself, run `npm run build`; the output is in `dist/`. Set `COUPE_RELAY` to choose the relay.

After the first visit, the app's files are cached by its service worker, so later visits start without downloading them again.

## Run in GitHub Codespaces

1. Open **Code → Codespaces → Create codespace on main**.
2. The included configuration installs the dependencies and starts coupeweb with its own relay. Open port **8080** in the Codespaces **Ports** panel if it does not open automatically.
3. Keep port visibility **Private**. Keep the Codespace running while browsing; stop it when finished.

GitHub Codespaces usage is subject to your account's quotas and billing settings.

## Scope

- The server listens only on this computer by default.
- Websites see the server's outgoing IP. Running locally does not change your network's public IP.
- The proxy handles HTTP and HTTPS sites; some sites, logins, video, and anti-bot checks may not work.
- It requires service workers. Use localhost locally or HTTPS remotely.
- Cookies and site storage can persist in the browser. This is not an anonymous or private-browsing mode.
- This project is intended for local use or private Codespaces forwarding. It has no built-in account system; do not expose it as an unauthenticated public service.
- The local relay rejects other browser origins, direct IP destinations, local/private destinations, UDP, and destination ports other than 80 and 443 using Wisp's configuration.

## Checks

```sh
npm test
```

The included tests cover address parsing, unsupported schemes, credentials in addresses, host validation, and relay Origin checks. Initial local verification passed these tests and confirmed that the homepage serves HTTP 200 with the required isolation headers. A relay regression test also verifies that valid streams do not crash Wisp and that total-stream and destination limits remain enforced. Direct HTTPS tests through the WebSocket relay returned HTTP 200 for YouTube and TikTok; ChatGPT returned HTTP 403. Full browser rendering and the Codespaces configuration have not been verified end to end.

## Credits and license

Powered by [Scramjet](https://github.com/MercuryWorkshop/scramjet), [Bare Mux](https://github.com/MercuryWorkshop/bare-mux), libcurl transport, and Wisp from Mercury Workshop. Integration follows the upstream [Scramjet example application](https://github.com/MercuryWorkshop/Scramjet-App). The interface and application glue are provided under AGPL-3.0-only; see LICENSE. Dependencies retain their own licenses.
