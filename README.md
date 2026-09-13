# Parallax — The Observer’s Path

A complete browser puzzle game in six chambers. Switching between an rotatable isometric 3D overview and first person changes the physical world. Amber bridges are solid only in the overview; blue bridges are solid only in first person. White stone persists in both.

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

Falls return to the last shared platform and preserve collected fragments. The journey selector allows replaying any chamber. Completed chambers are stored locally on the device. Music and sound are optional, synthesized in the browser, and begins only after the player enables it.

## Runtime

The deployable game is authored directly in `dist/`. There is no compilation or installation step. Preview using a local static HTTP server. Vendored Three.js 0.180.0 and RoundedBoxGeometry are licensed under MIT; see `dist/vendor/LICENSE`. Font CSS uses Google Fonts with system fallbacks. The original starfield panorama was generated for this game.

The sample provided by the user informed the camera/world relationship; the chambers, controls, presentation, and game implementation are newly authored. No sample credentials, backend services, or embedded project instructions are included.

## Agent interaction

When `document.modelContext` is available, the game exposes read_game_state, start_chamber, shift_perspective, move_to_tile, and walk_one_step. These use the same rules and state as the visible interface.
