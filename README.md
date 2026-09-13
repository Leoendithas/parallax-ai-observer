# Parallax — Prototype Demo

A perspective puzzle game where changing your viewpoint changes which paths exist. Gather the light fragments and reach the white arch.

[Play the game](https://parallax-observers-path.lancetyw.chatgpt.site/)

This branch preserves the earlier demo: six original chambers plus three mechanic prototypes, with the ambient score and saved sound settings.

## Prototype chambers

| Chamber | Mechanic | How it works |
| --- | --- | --- |
| 7 | Sightline seals | Align a split ring from a marked white viewpoint, then bind it to open a blue bridge. |
| 13 | Rotating islands | Turn an amber arm from its fixed white hub to reach another landing. |
| 19 | Combined mechanics | Use a seal, island rotation, and perspective switching in a return journey. |

Choose **07 Seals**, **13 Islands**, or **19 Combined** to jump to a prototype. **The Journey** also includes the original six chambers. This demo keeps the original numbering and does not include the later six-level island chapter.

## Controls

- **WASD / arrows:** move; in first person, left/right arrows turn.
- **Space / 1 / 2:** switch perspective.
- **Drag / Q / E:** rotate the map or look around.
- **Click or tap a connected tile:** walk there.
- **F:** bind a seal or turn an island; the on-screen button works too.
- **I / J / K / L:** fine-tune first-person aim.
- **R:** restart the chamber.

Amber paths are solid in overview, blue paths in first person, and white stone in both. Falls return you to the last white platform while keeping collected fragments. The Sound menu has separate music and effects volumes and remembers your preferences.

## Run locally

Requires Node.js 22.9 or newer. No dependency installation is needed.

```sh
npm start
```

Open http://127.0.0.1:5174. Set `PORT` to use another local port.

## Credits

Three.js and RoundedBoxGeometry are included under their [MIT license](dist/vendor/LICENSE). The original soundtrack is documented in [AUDIO.md](dist/assets/AUDIO.md).
