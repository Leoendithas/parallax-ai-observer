# Parallax

A thirty-five-chamber browser puzzle game. Switch between an overhead view and first person to change which paths are solid. Amber paths belong to the overhead view, blue paths belong to first person, and white stone exists in both. Chambers 1–6 introduce perspective switching; chambers 7–12 add rotating islands, return journeys, and independent hubs. Chambers 13–18 introduce sightline seals; chambers 19–20 combine seals with rotating islands. The expansion adds Echoes in 21–26, perspective bridges in 27–32, and three combined puzzles in 33–35.

[Play the released twenty-chamber demo](https://parallax-observers-path.lancetyw.chatgpt.site/)

**Unreleased expansion:** this branch, `codex/echo-perspective-21-35`, contains all fifteen new chambers for a later release. It does not publish them to the public demo. Run the branch locally to play all 35 chambers.

## Play

- **WASD / arrows:** walk; left and right arrows turn in first person.
- **Drag / swipe, Q / E:** rotate the map or look around.
- **Space:** switch perspective. **1 / 2:** choose a perspective.
- **Click a connected solid tile:** walk to it.
- **R:** restart the chamber.
- **F / Turn island:** from a white circular hub in overview, rotate that island's amber paths clockwise.
- **F / Bind seal:** from a circle-marked white stone in first person, align the two arcs into one ring, then bind it to open a blue bridge. Drag, swipe, or use the Look arrows (I/J/K/L) to aim.
- **Echo pads:** shift away from the perspective marked on a pad to leave a stationary echo. It holds its opposite-color path open until your next perspective switch. Some pads share a path, letting an echo on the far side reopen the way back.
- **Perspective bridges:** in overview, rotate until the two diamond landings overlap, then press **F / Cross bridge**. The platforms are at different heights and distances; the alignment is physical in the rendered view. Crossings work in either direction at the same angle, and only in overview. Use the on-screen rotate arrows or drag/swipe.
- Collect every light fragment and bind every seal, then reach the white arch.

Falls return you to the last white platform. Completed chambers and sound preferences are saved on your device. Music begins after your first interaction; the Sound menu controls music and effects separately. Guidance is available when you choose to open it.

Choose any of the thirty-five rooms in **The Journey**, or open `/#chamber-7` to start the island chapter, `/#chamber-13` for sightline seals, `/#chamber-19` for the first combined finale, `/#chamber-21` for Echoes, `/#chamber-27` for perspective bridges, or `/#chamber-33` for the new combined finale. White hubs remain fixed when their amber arms turn; each island keeps its own orientation. Bound seals keep their bridges open in both perspectives; blue tiles remain walkable only in first person. Restarting restores the chamber's original layout, closes its seals, and clears its Echo. Falling returns you to the last white platform; a fall by itself does not remove an Echo. Saved completions use stable chamber identities, preserving progress from the six-chamber release and the earlier island preview.

## Leaderboards

Every chamber starts in practice, with no running timer. After finishing, choose **Try a timed attempt** on its completion screen to replay it for the leaderboard. A nickname is required only for ranked attempts. Every chamber has its own board. Times stop at the arch; restarting or moving to another chamber returns to practice. Your best time per chamber is ranked by time, then falls; the board shows the top 20 players. Timers keep running during breaks.

Scores are shared between the Sites and Vercel demos. Nicknames are public display names, not accounts; an anonymous player identifier on each browser groups its personal bests. A completed score can be retried from the leaderboard if saving fails. The server checks the movement sequence, island turns, seal position and alignment, Echo gate state, perspective bridge position and projection, required fragments, and timing bounds; this is a casual leaderboard, not tamper-proof competitive scoring. Adding the later chapters preserves the existing chambers' leaderboard records.

## Run locally

Use Node.js 22.9 or newer. Run `npm ci`, then `npm start` and open http://127.0.0.1:5174. Set `PORT` to use another port. Local testing uses a separate SQLite database under the ignored `.sites-runtime/` directory.

Run `npm run check` and `npm test` to check the game and score validation. `npm run build` bundles the Sites backend and prepares its database migrations.

## Hosting

`main` contains the released twenty-chamber campaign. This branch contains the complete thirty-five-chamber campaign and its matching score verifier. Vercel serves `dist/client/`; its leaderboard requests use the shared public Sites endpoint, so no Vercel database or API key is needed. When you choose to release this branch, deploy it to Sites with its updated backend first, then merge it into `main` for the Vercel frontend release. This makes the verifier ready for timed attempts in chambers 21–35 before Vercel serves those rooms. A static Vercel branch preview can play every new room, but new-room leaderboards require the expanded backend; local preview includes that backend and a separate local database.

Sites hosts the leaderboard API and its persistent D1 database. The logical binding is `DB` in `.openai/hosting.json`; schema and migrations live in `db/` and `drizzle/`. The frontend API origin is configured in `dist/client/leaderboard.js`. Test scores are never included in deployments.

## Expansion chapters

| Chambers | Mechanic | Progression |
|---|---|---|
| 21–26 | Echoes | Leave a first echo, use both perspectives, relay from another pad, and plan return journeys. |
| 27–32 | Perspective bridges | Recognize overlapping landings, rotate for new alignments, explore distant balconies, and chain crossings. |
| 33–35 | Combined puzzles | Use Echoes and perspective bridges together, then bring back rotating islands and sightline seals. |

The automated solver checks complete routes. The state analyzer includes both falls and voluntary shifts to check recovery, and removes mechanisms in turn to verify they matter. Rendering and controls also need browser checks; solvability alone does not assess puzzle enjoyment.

## Development branches

- `codex/three-prototype-demo` preserves the earlier three-level mechanic demo.
- `codex/rotating-islands-7-12` preserves the original island chapter implementation and later prototypes. Its chambers 7–12 have been integrated into `main` with shared leaderboards.

The former prototypes at chambers 13 and 19 are now part of `main`, joined by six new chambers to complete levels 13–20. Their stable save identities preserve earlier prototype completions.

## Credits

Three.js and RoundedBoxGeometry are distributed under the MIT license; see `dist/client/vendor/LICENSE`. The original soundtrack is documented in `dist/client/assets/AUDIO.md`. Sound effects are synthesized in the browser.
