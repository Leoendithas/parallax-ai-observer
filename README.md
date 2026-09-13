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

## Run locally

Use Node.js 22.9 or newer. Run `npm start`, then open http://127.0.0.1:5174. Set `PORT` to use another port. No installation or build step is needed.

Run `npm run check` and `npm test` to check the source and released chambers.

## Hosting

The game runs entirely in the browser. GitHub `main` contains the same six-chamber game as the public demo. Static files live in `dist/`; `vercel.json` points Vercel at that directory. No server functions or environment variables are required. Sites hosting uses the same static files.

## Development branches

- `codex/three-prototype-demo` preserves the earlier three-level mechanic demo.
- `codex/rotating-islands-7-12` contains the unreleased island chapter in the Sites source repository.

These development levels are excluded from the public demo and GitHub `main`.

## Credits

Three.js and RoundedBoxGeometry are distributed under the MIT license; see `dist/vendor/LICENSE`. The original soundtrack is documented in `dist/assets/AUDIO.md`. Sound effects are synthesized in the browser.
