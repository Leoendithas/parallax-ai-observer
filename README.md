# Parallax — The Observer’s Path

A browser puzzle game with six original chambers and three playable prototypes for its next chapters. Switching between a rotatable isometric 3D overview and first person changes the physical world. Amber bridges are solid only in the overview; blue bridges are solid only in first person. White stone persists in both.

[Play the public game](https://parallax-observers-path.lancetyw.chatgpt.site/)

This edition runs entirely in the browser, with authored chambers and no AI Observer or API key requirement.

## Run locally

With Node.js 22.9 or newer, run `npm start` and open http://127.0.0.1:5174. Set `PORT` to choose a different port. No dependency installation or compilation is needed. Run `npm run check` for JavaScript syntax checks and `npm test` for puzzle-state and seal-geometry verification.

## New chapter prototypes

Only three sample levels are implemented for feedback; the intervening campaign levels have not been built.

- [Chamber 7 — Sightline seals](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-7): find the marked white viewpoint, enter first person, center the split ring, then press **F** or **Bind seal**. Its blue bridge stays open.
- [Chamber 13 — Rotating islands](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-13): stand on the white circular hub in overview and press **F** or **Turn island**. The amber arm turns clockwise; white platforms stay fixed.
- [Chamber 19 — Combined mechanics](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-19): use both mechanics to reach the fragments and exit.

The **07 Seals**, **13 Islands**, and **19 Combined** buttons jump directly to each prototype. The journey selector also includes the six original chambers. **I/J/K/L** gently adjust first-person aim; drag/swipe and the on-screen Look arrows work too. **R** restarts the current chamber, resetting its seal and island.

## Play

- WASD: walk; in first person movement follows camera heading
- Arrow keys: walk in the overview; up/down walk and left/right turn in first person
- Drag / swipe: rotate the overview or look around in first person
- Q / E: rotate the overview or turn left / right in first person
- Space: shift perspective
- 1 / 2: choose Overview / First person
- Click or tap a connected solid tile: walk to it
- R: restart the current chamber
- Collect every fragment and enter the arch

Falls return to the last shared platform and preserve collected fragments. The journey selector allows replaying any chamber. Completed chambers are stored locally on the device. The original ambient score starts on the first click or keypress. The Sound menu has separate music and effects volumes and remembers mute preferences. First person softens the soundtrack, and audio fades out when the tab is hidden.

## Runtime

The deployable game is authored directly in `dist/`. There is no compilation or installation step. Preview using a local static HTTP server. Vendored Three.js 0.180.0 and RoundedBoxGeometry are licensed under MIT; see `dist/vendor/LICENSE`. Font CSS uses Google Fonts with system fallbacks. The original starfield panorama was generated for this game. The original 80-second soundtrack is documented in `dist/assets/AUDIO.md`; effects are synthesized in the browser.

The sample provided by the user informed the camera/world relationship; the chambers, controls, presentation, and game implementation are newly authored. No sample credentials, backend services, or embedded project instructions are included.

## Agent interaction

When `document.modelContext` is available, the game exposes read_game_state, read_audio_state, start_chamber, shift_perspective, move_to_tile, walk_one_step, look_direction, and use_chamber_mechanism. These use the same rules and state as the visible interface.
