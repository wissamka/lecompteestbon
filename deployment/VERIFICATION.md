# Release verification — 2026-09-13 Pacific

Public application: **https://lecompteestbon.wissamkazan.ai/**

Production build identifier: `0a0494fe6ff0`. Released via the existing Cloudflare Tunnel on 2026-09-14 00:04 UTC (2026-09-13 17:04 Pacific).

## Results

| Check | Result |
| --- | --- |
| Arithmetic tests | 8 tests passed, including every one of the 192 puzzle solutions, shortest lengths, independent expression-tree evaluation, duplicate tile identity, exact division, positive-integer bounds and dead ends |
| Full local and public browser play | Completed exact solutions at every grade; all four operations visible and available |
| Interaction | Language changes preserve history; undo restores original identities; worker hints progress through strategy/move/solution; rules close with Escape and return focus |
| Edge cases | Remainder and negative results blocked with feedback; swap works; current-board dead ends explained; timer expiry permits untimed continuation; assisted classification survives restart |
| Storage | Language and progress survive reload; account and sign-in not required |
| Viewports | No horizontal overflow at 320, 390, 768 and 1365 px; desktop and mobile screenshots inspected; reduced-motion mode exercised |
| DNS and HTTPS | Public Cloudflare IPv4/IPv6 addresses, verified TLS, HTTP → HTTPS redirect, no authentication redirect |
| Production artifacts | All 8 serving files returned HTTP 200 and byte-matched the local production build; missing JavaScript returned 404 and `.git/config` returned 403 |
| Independent external fetch | W3C Nu validator fetched the exact public HTTPS URL; returned the matching URL and zero validation messages. This is an external HTTP fetch, not an external interactive browser test. Full browser rounds were separately tested from the Mac through public Cloudflare DNS |
| Runtime and isolation | Dedicated nginx container `lecompteestbon`, restart policy `unless-stopped`, read-only artifact mount, port bound only at `127.0.0.1:18087`; public access via existing outbound tunnel |
| Authentication | Exact-host Cloudflare Access application with only an `everyone` bypass; wildcard and unrelated sites' access settings preserved |
| Persistent routing | Game registered in installed and retained `site_sharing.py`, settings and applied state. Generated ingress equals the old ingress plus the game route |
| Directory | Inventory and snapshot agree at 11 apps, new rendered card occurs once and old links preserved. The active directory is the deployment dashboard; apex already serves the branded site and was preserved |
| Browser console | Fresh final page load has no errors. Cloudflare's formerly injected analytics beacon was blocked by CSP; `Cache-Control: public, no-cache, no-transform` now prevents its injection |

The initial release's no-transform behavior followed [Cloudflare Web Analytics documentation](https://developers.cloudflare.com/web-analytics/faq/). This initial analytics setting is superseded by the requested instrumentation update below.

## Operational record

- Serving root: `/home/wissamka/public-sites/lecompteestbon/site`.
- Local repository: `/Users/wissamkazan/Documents/Codex/2026-09-13-do-you-have-access-to-my`.
- Private remote: `https://github.com/wissamka/lecompteestbon`.
- VPS deployment metadata: `/home/wissamka/public-sites/lecompteestbon/deployment.json`.
- Before-publication backup: `/home/wissamka/.config/siteplat/lecompteestbon-before-20260914T000356Z`.
- Directory backup: `/home/wissamka/.config/siteplat/lecompteestbon-directory-before-20260914T000644Z`.
- Serving image pinned to `nginx@sha256:54f2a904c251d5a34adf545a72d32515a15e08418dae0266e23be2e18c66fefa`.
- Preserve the game registration in `site_sharing.py` when upgrading the existing hosting platform. The retained `siteplat-src` snapshot is patched as well as the installed copy; the deployment script records the narrow changes.

## Practical limits

This release contains 48 puzzles per grade (192 total), avoiding the 24 most recent puzzles per level in the browser. Progress is local to the browser/device; there is no cloud synchronization. School-year difficulty is initial product tuning. Browser checks used Chrome on the Mac with responsive viewport emulation; no physical phone or Safari test is claimed. The help dialog contains the worked tutorial, available from the header.

## Visual adjustment — 2026-09-13 Pacific

Removed the light green target-number underline at Wissam's request. Build `33908907c415` was published and verified on the real hostname: the target's `::after` content is `none`. Only the stylesheet and versioned page were replaced; backup `/home/wissamka/public-sites/lecompteestbon/before-remove-underline-20260914T001653Z`.

## Traffic instrumentation — 2026-09-13 Pacific

Build `7dbff521d7ae` enables the domain's existing Cloudflare Web Analytics beacon for this app and updates both language privacy notices. Nginx configuration passed validation and was reloaded. The public browser loaded exactly one beacon, posted `/cdn-cgi/rum?` successfully with HTTP 204 and rendered four starting tiles. No duplicate manual snippet was added. Dashboard totals were not verified because the browser was signed out and the existing deployment token lacks analytics read access. See [ANALYTICS.md](ANALYTICS.md) for report access, definitions and limits. Backup: `/home/wissamka/public-sites/lecompteestbon/before-analytics-20260914T002124Z`.
