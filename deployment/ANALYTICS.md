# Traffic analytics

Cloudflare Web Analytics is enabled on the public game through the domain's existing automatic beacon injection. No Google Analytics account or extra service is needed.

## View reports

1. Sign in to [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics) with the account that manages `wissamkazan.ai`.
2. Open the domain's analytics report and filter **Host** to **lecompteestbon.wissamkazan.ai**.
3. Choose the date range. Use **Exclude Bots = Yes** to focus on likely human traffic.

Reports include visits, page views, referring sites, countries, devices, browsers and loading performance. See Cloudflare's [metric definitions](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/) and [available dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/).

Visits are not a count of unique individual people. Reloads can add page views; direct or external arrivals count as visits. The game does not send custom events for puzzle starts, solves or grade selection. Progress stays on the player's device. Cloudflare Web Analytics uses no tracking cookies, and browser blockers can suppress measurements. Data may take a few minutes to appear. See the [FAQ](https://developers.cloudflare.com/web-analytics/faq/) and [setup guide](https://developers.cloudflare.com/web-analytics/get-started/).

## Implementation and verification

On 2026-09-14 00:21 UTC (September 13 Pacific), production build `7dbff521d7ae` was deployed. The app's nginx policy now allows `static.cloudflareinsights.com` scripts and `cloudflareinsights.com` connections, alongside same-origin requests. Removing `no-transform` permits Cloudflare to inject its existing beacon. No manual snippet is embedded, avoiding duplicate tracking. Both languages describe the analytics in the privacy note.

A browser visit to the public hostname loaded exactly one Cloudflare beacon and successfully posted to `/cdn-cgi/rum?` with HTTP **204**; the game rendered its four starting tiles. This verifies collection transport, not the dashboard's displayed totals. The dashboard browser was signed out, and the existing deployment token could not read the analytics API. Account-specific totals and any geographic collection exclusions were not inspected; token permissions were not expanded.

Backup before this change: `/home/wissamka/public-sites/lecompteestbon/before-analytics-20260914T002124Z`. The existing public route and private repository remain in use.
