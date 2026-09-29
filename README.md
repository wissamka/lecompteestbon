# Le Compte est Bon

A public, bilingual arithmetic game for grades 3, 4, 5 and 6+. French and English, all four operations at every level, hints, undo, optional timed play and local progress. No account or Tailscale connection is required to play.

Live production URL: https://lecompteestbon.wissamkazan.ai/

## Development

Requires Node.js 22+ and Python 3 for the local preview server. There are no npm runtime dependencies, remote fonts or backend accounts. Production uses the existing Cloudflare Web Analytics setup for aggregate traffic and performance reporting; local previews do not load analytics.

```sh
npm test
npm run build
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

`npm run generate` deterministically regenerates 48 validated puzzles per level. The game avoids the most recent 24 puzzles per level in the same browser. The pool is finite: 192 puzzles in this release.

## Implementation

- `src/engine.js`: pure integer arithmetic and exact subset solver, preserving tile identity.
- `src/solver-worker.js`: current-board hint computation outside the UI thread, with an 8-second UI timeout.
- `src/app.js`: bilingual interface, game state, timer and local progress.
- `src/puzzles.json`: vetted puzzle pool with shortest solution lengths.
- `test/engine.test.mjs`: arithmetic, tile consumption, independent expression-tree evaluation and all 192 puzzle checks.
- `test/browser.js` and `test/browser-edge.js`: complete rounds and interaction tests through Playwright CLI. Run `node scripts/browser-check.mjs` against the named `lecompteestbon` test browser; pass the edge-test path for the second suite.

All legal solutions count. Positive whole-number results only; division must be exact. Each starting tile contributes once and unused tiles are allowed. Intermediate caps are 100 / 500 / 2,000 / 10,000 by grade. Grade calibration is product tuning, not formal curriculum certification.

Progress and preferences use `localStorage` on the current browser/device and do not synchronize. Hints make a round assisted even after restart. A previously credited round is not counted twice. Timers pause when the page is hidden or the help dialog is open. Sound is opt-in; animations respect reduced motion.

## Deployment

The app is a static production artifact served by a dedicated nginx container on VPS loopback port 18087. Cloudflare's existing outbound tunnel handles public HTTPS. An exact-host Access bypass overrides the preexisting wildcard login policy for this game only.

`deployment/publish.py` documents and performs initial publication, with hostname conflict checks, shared locks, isolated serving artifacts, backups, narrow hosting-manager registration and rollback. It is intentionally not an update command. Do not re-run it over an existing deployment.

For updates, transfer only `dist/` into a new staging folder; retain the stable `site/` mount directory, back up changed files, replace assets and then HTML atomically, and verify real HTTPS/browser access. Existing DNS and access settings should be reused. Tokens remain on the VPS and are not copied into this repository.

Tailscale split DNS also maps the game to the VPS private address. Its exact-host Caddy route in `~/.config/siteplat/private-routes.caddy` must be retained alongside the public tunnel route; otherwise Tailscale visitors receive a 404 even when public access works. See `deployment/repair-tailnet-route.py` and the September 28 verification record.

The platform's installed and retained `site_sharing.py` snapshots register this game as an explicitly public catalog entry, so ordinary platform configuration reconciliation preserves it. Retain that registration when upgrading the hosting platform. Other sites' settings remain unchanged.

See [DESIGN.md](DESIGN.md) for the design, [deployment/VERIFICATION.md](deployment/VERIFICATION.md) for release verification and [deployment/ANALYTICS.md](deployment/ANALYTICS.md) for accessing traffic reports.
