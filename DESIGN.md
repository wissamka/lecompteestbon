# Le Compte est Bon — application design

Status: implemented and publicly deployed, 2026-09-13 (Pacific). Live at https://lecompteestbon.wissamkazan.ai/. The sections below retain the planning record; the delivered release and validation are recorded in [deployment/VERIFICATION.md](deployment/VERIFICATION.md).

Delivered: French default with English switch, four grade levels, all four operations, 192 verified puzzles, current-board hints, undo/restart, optional timer, opt-in sound, local progress and responsive touch/keyboard controls. The private source repository is https://github.com/wissamka/lecompteestbon. The existing public Cloudflare Tunnel serves the isolated VPS app without authentication. The existing apex now serves the branded website, so the game is listed in the live deployment dashboard inventory; the legacy directory artifact is also maintained.

## Confirmed brief

Build a number-puzzle application inspired by Le Compte est Bon: combine a supplied set of numbers with addition, subtraction, multiplication and division to reach a target. Provide four levels for U.S. grades 3, 4, 5 and 6+. Plan the design first, then build and deploy to **https://lecompteestbon.wissamkazan.ai/** using the existing VPS publishing skill. Preserve this exact hostname, corrected by Wissam on 2026-09-13.

The scope is the numbers game. A letters game could be added separately later.

Confirmed by Wissam on 2026-09-13: support **both French and English**, and keep **addition (+), subtraction (−), multiplication (×) and division (÷) available at every level from the start**. No operation unlocks or grade-based operator restrictions. A puzzle need not require every operation to solve it.

Also confirmed on 2026-09-13: the game must be **publicly accessible over HTTPS, with no Tailscale requirement, username, password or sign-in**. This explicitly supersedes the earlier private-access proposal and the publishing skill's private-only default for this application.

## Proposed defaults awaiting feedback

- Both French and English are confirmed. Proposed default: French, with an always-accessible Français / English switch that preserves the current puzzle and remembers the choice locally. Translate instructions, hints, feedback, settings and accessibility labels as well as buttons. Grade labels: CE2 / Grade 3, CM1 / Grade 4, CM2 / Grade 5, 6e+ / Grade 6+. These are approximate school-year equivalents; the levels below are product tuning, not a claim of formal curriculum alignment.
- Individual practice first. No timer unless the player enables a timed challenge.
- Public access without authentication is confirmed. Anyone with the game URL can play from an ordinary internet connection.
- Progress and preferences stay in the browser. No account needed; progress does not synchronize between devices in the first version.

## Game rules

1. A round supplies four to six number tiles and one target. Starting numbers may repeat; repeated tiles remain separate usable pieces.
2. Select a tile, select +, −, × or ÷, then select a second tile. All four operation buttons are always present and selectable at every level; validate the proposed calculation before allowing confirmation. Show the expression and its result before the player confirms it. For subtraction and division, offer a visible swap action.
3. Confirming consumes those two tiles and adds one result tile. The result can be used in a later operation. Each original tile can contribute at most once to a calculation.
4. Players may use any subset of the tiles; using every tile is not required. There is no concatenation, exponentiation or external number entry.
5. All results must be positive whole numbers. Disallow negative or zero results, division by zero and division with a remainder. Explain a blocked move in friendly language without discarding the selection.
6. Any available tile equal to the target completes the round, after validating its calculation. All valid solutions count, including ones the generator did not choose.
7. Keep a visible calculation history. Undo reverses the most recent step and restores its exact tile identities. Restart restores the starting puzzle; a new puzzle is a separate action.
8. No free-form expression parser is required in the first release. The step builder makes parentheses and calculation order explicit through intermediate results.

## Four difficulty levels

| Level | Tiles and starting numbers | Target range | Desired shortest solution | Learning emphasis |
| --- | --- | --- | --- | --- |
| Grade 3 / CE2 | 4 tiles, values 1–10 | 10–100 | 2 steps | Addition/subtraction within 100, multiplication facts, exact division using small divisors |
| Grade 4 / CM1 | 5 tiles, values 1–12 plus at most one 25 | 20–200 | 2–3 steps | Combining operations, larger sums and differences, reasoning backward from the target |
| Grade 5 / CM2 | 6 tiles, values 1–12 plus up to two from 25 and 50 | 50–500 | 3–4 steps | Multi-step planning, factors, exact division of larger whole numbers |
| Grade 6+ / 6e+ | 6 tiles, small values 1–10 plus up to two from 25, 50, 75 and 100 | 100–999 | 4–5 steps | Longer combinations, alternative approaches, less obvious intermediate values |

The number of steps in the *shortest valid solution*, not merely the generated solution, controls placement. Six tiles permit at most five binary operations. Grades 4–6 should contain a mix of arithmetic demands; not every puzzle needs all four operators. Grade 6+ can offer increasing difficulty within the same card.

Keep a bounded intermediate-result ceiling per level (initial proposal: 100, 500, 2,000 and 10,000). Display the limit in the rules and enforce the same rules in generation, validation and hints. Tune ranges and step counts after children try real puzzles; grade labels alone cannot establish the right challenge.

Example for Grade 3: tiles **3, 4, 6, 8**, target **42**. One solution is **3 + 4 = 7**, followed by **7 × 6 = 42**. The 8 is unused.

## Screen design

### 1. Choose a level

Title: **Le Compte est Bon**. Subtitle: **Combine les nombres. Trouve la cible.**

Four large cards show grade, a short description and a representative arithmetic example. A returning player sees their last level selected, with an obvious way to change it. Language and sound controls sit in a quiet top bar. Use a short first-play tutorial based on one worked example.

### 2. Play

The target is the largest element. Place the active number tiles immediately below it, then the four operator buttons and the pending equation with a confirmation button. Show calculation history beneath the play area, followed by **Annuler**, **Recommencer**, **Indice** and **Nouveau tirage**. Keep exit/change-level secondary so it cannot be confused with a calculation action.

Desktop can use a history panel beside the board. Phone and tablet stack the same controls vertically. The full board remains usable without dragging or horizontal scrolling. A large target should never force the number tiles below the useful viewport on a phone.

Illustrative arrangement:

```text
Le Compte est Bon                  CE2 · Français

                         CIBLE
                           42

                    [3] [4] [6] [8]
                    [+] [−] [×] [÷]

                     3 + 4 = 7
                      [Valider]

Mes calculs
  (Each confirmed step appears here.)

[Annuler] [Recommencer] [Indice]     Nouveau tirage
```

### 3. Celebrate and learn

Inline success state: **Le compte est bon !** Show the player's valid steps and a prominent **Prochain défi** button. Optional **Voir une autre solution** reveals a solver solution when one differs from the player's work; otherwise show the worked solution without claiming it is different.

Celebrate assisted completion too. Distinguish "solved independently" from "solved with hints" in progress; avoid a score that punishes thoughtful play. A brief success animation respects reduced-motion settings. Sound is off by default.

## Visual direction and accessibility

Warm ivory background, dark navy text, blue number tiles and a teal target accent. Use a restrained orange accent for hints. Aim for a playful puzzle board that still feels appropriate to an older child; avoid babyish mascots and dense school worksheets.

Use large high-contrast numerals, rounded tiles, generous spacing and clear selected/consumed states. Selection must use shape or outlines as well as color. Aim for at least 48 px touch controls. Support keyboard selection, visible focus and screen-reader announcements of moves, remaining tiles and success. No time pressure in default play, flashing effects or required audio.

## Hints, feedback and progression

- First hint: a useful strategy grounded in an actual solution, such as a factor or nearby multiple.
- Second hint: suggest one legal next move.
- Final hint: reveal a full worked solution in ordered steps.
- Compute hints from the *current board*. If previous choices made the target unreachable, explain that and identify a useful undo/restart path; do not suggest a move using a consumed tile.
- Wrong attempts remain opportunities to revise. If only one wrong number remains, offer undo or restart with the distance from the target as feedback. In practice, exact equality is the completion condition.
- Optional timed mode uses the same rules and chosen difficulty. At timeout, offer to keep practicing or see a solution. Pause or leave timed mode when the page becomes hidden so a backgrounded mobile browser does not silently consume the round.
- Keep lightweight per-level completion counts, independent/assisted totals and recent puzzles in local browser storage. Level selection stays freely available; do not gate a school grade behind a streak.

## Puzzle quality and technical approach

A client-side web application is sufficient for the first release. Arithmetic, hints and puzzle checking can run locally, with a worker for expensive searches so controls stay responsive. Serve the production assets from an isolated static service on the existing VPS. Choose and pin the implementation stack when building.

Generate candidate puzzles from legal expressions, then use an independent exhaustive/subset solver to verify reachability, find shortest solutions and measure difficulty. Reject trivial targets already present among the tiles, candidates with unintended short solutions and excessive repetitions. Validate operation complexity as well as step count so a Grade 3 puzzle does not require advanced division.

Precompute or cache verified puzzles per level, enforce a generation time budget, and fall back to a vetted pool. Never block the interface indefinitely or present a puzzle whose reachability has not been checked. Tile identity and consumption must be explicit in both solver and UI state. Exact whole-number arithmetic removes rounding ambiguity. Cap values and strictly validate restored browser state.

Provide varied draws and minimize repeats within the same browser. A random puzzle is not a shared daily challenge; daily seeds and shared leaderboards are later additions.

## First release and later possibilities

First release: four levels, confirmed French/English interface, guided tile arithmetic with all four operations always available at every level, guaranteed solvable puzzles, history and undo, progressive hints and solutions, local progress, optional timer, responsive keyboard/touch play, and public VPS deployment without authentication.

Later: family profiles, synchronized progress, teacher-created puzzles, a shared daily puzzle, head-to-head play, fraction/negative-number variants for older learners, or a letters mode. None of these is required to deliver the initial numbers game.

## Build and deployment sequence

1. Review the remaining design proposals; both languages and all four operations at every level are confirmed.
2. Set up a dedicated local project and matching **private remote Git repository**, checking for an existing corresponding remote first. Reuse established host/account conventions; no public repository is implied.
3. Implement and verify the rules engine, solver and difficulty pools.
4. Build the responsive game, tutorial, hints, feedback and local progress; exercise complete rounds at every level.
5. Create the production artifact. Use `/Users/wissamkazan/.agents/skills/publish-to-wissamkazan/SKILL.md` and its references for the established VPS layout, build, isolation, backup and verification practices. The user's explicit public-access instruction overrides its private-only routing/DNS rules for this hostname. Recheck live infrastructure, hostname ownership, ports and existing public ingress before choosing the exact public route.
6. Deploy the selected hostname through an isolated service and public HTTPS ingress, with publicly resolvable DNS and no authentication gate. The public DNS must route to public ingress, not a Tailscale-only address. Reuse the VPS's established public hosting pattern after inspection. Preserve unrelated sites and their access restrictions. Add the verified game once to the existing directory at `https://wissamkazan.ai/`; the directory itself can retain its existing private access.
7. Verify actual hostname DNS, TLS, assets and gameplay from an independent client outside the tailnet without credentials, plus desktop/narrow viewport, keyboard, reduced-motion and directory navigation. Do not count a tailnet-only test as proof of public reachability. Do not disconnect or reset the user's network to perform this test. Report public-access verification as incomplete if an independent check is unavailable.

## Acceptance checks

- Every delivered puzzle has a legal exact solution under its displayed level rules. A bounded candidate set per level is checked for shortest-solution length and arithmetic demands.
- Duplicate values remain distinct tiles; consumed tiles cannot be reused. Undo/restart restore correct identities and values.
- Invalid arithmetic never corrupts the board; all legal alternative solutions are accepted. The example above completes successfully.
- Hints respect the current board and correctly handle a state with no remaining solution.
- Children can finish, undo, request a hint and start another round on phone, tablet and desktop, including keyboard-only play.
- Both languages cover all game text, hints, feedback and accessibility labels. Switching language preserves the current puzzle and calculation history; the preference survives reload where storage is available. Failure to store never blocks play.
- All four operation controls remain available at every grade and progress state. An invalid calculation produces explanatory feedback without hiding or locking the operation.
- Timed mode behaves predictably on pause, restart and backgrounding. Default practice is untimed.
- Production build and relevant arithmetic/state tests pass; build/service, DNS, TLS/assets, browser and directory checks from the publishing skill pass. Its tailnet-only acceptance condition is replaced by verified public access for this application.
- A visitor outside Tailscale can open the HTTPS URL and complete a round without a username, password, account or sign-in. Other VPS applications retain their existing access restrictions.

## Open decisions

Both French and English, all four operations at every level, and public access without Tailscale or authentication are confirmed, along with the exact hostname and four requested grade levels. Implementation uses French as the initial default and language-appropriate school labels. Grade tuning remains a product choice to refine through use. The delivered scope and selected public ingress are recorded in the release verification document; this section preserves the distinction between requested requirements and initial design proposals.
