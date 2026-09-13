# Parallax

A six-chamber browser puzzle game. Switch between an overhead view and first person to change which paths are solid. Amber paths belong to the overhead view, blue paths belong to first person, and white stone exists in both.

[Play the public demo](https://parallax-observers-path.lancetyw.chatgpt.site/)

## Play

- **WASD / arrows:** walk; left and right arrows turn in first person.
- **Drag / swipe, Q / E:** rotate the map or look around.
- **Space:** switch perspective. **1 / 2:** choose a perspective.
- **Click a connected solid tile:** walk to it.
- **R:** restart the chamber.
- Collect every light fragment, then reach the white arch.

Falls return you to the last white platform. Completed chambers and sound preferences are saved on your device. Music begins after your first interaction; the Sound menu controls music and effects separately. Guidance is available when you choose to open it.

## Leaderboards

Every chamber starts in practice, with no running timer. After finishing, choose **Try a timed attempt** on its completion screen to replay it for the leaderboard. A nickname is required only for ranked attempts. Every chamber has its own board. Times stop at the arch; restarting or moving to another chamber returns to practice. Your best time per chamber is ranked by time, then falls; the board shows the top 20 players. Timers keep running during breaks.

Scores are shared between the Sites and Vercel demos. Nicknames are public display names, not accounts; an anonymous player identifier on each browser groups its personal bests. A completed score can be retried from the leaderboard if saving fails. The server checks the movement sequence, required fragments, and timing bounds; this is a casual leaderboard, not tamper-proof competitive scoring.

## Run locally

Use Node.js 22.9 or newer. Run `npm ci`, then `npm start` and open http://127.0.0.1:5174. Set `PORT` to use another port. Local testing uses a separate SQLite database under the ignored `.sites-runtime/` directory.

Run `npm run check` and `npm test` to check the game and score validation. `npm run build` bundles the Sites backend and prepares its database migrations.

## Hosting

GitHub `main` contains the same six-chamber game as the public demo. Vercel serves `dist/client/`; its leaderboard requests use the shared public Sites endpoint, so no Vercel database or API key is needed.

Sites hosts the leaderboard API and its persistent D1 database. The logical binding is `DB` in `.openai/hosting.json`; schema and migrations live in `db/` and `drizzle/`. The frontend API origin is configured in `dist/client/leaderboard.js`. Test scores are never included in deployments.

## Development branches

- `codex/three-prototype-demo` preserves the earlier three-level mechanic demo.
- `codex/rotating-islands-7-12` contains the unreleased island chapter in the Sites source repository.

These development levels are excluded from the public demo and GitHub `main`.

## Credits

Three.js and RoundedBoxGeometry are distributed under the MIT license; see `dist/client/vendor/LICENSE`. The original soundtrack is documented in `dist/client/assets/AUDIO.md`. Sound effects are synthesized in the browser.
