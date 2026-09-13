# Parallax

A perspective puzzle game where changing your viewpoint changes which paths exist. Gather the light fragments and find your way to the white arch.

[Play the game](https://parallax-observers-path.lancetyw.chatgpt.site/)

## How to play

- **Amber paths** are solid in the overview.
- **Blue paths** are solid in first person.
- **White stone** stays solid in both views and is a safe place to switch.

Falls return you to the last white platform, keeping the fragments you collected. Use **The Journey** to choose a chamber.

## Levels

The public game has six original chambers and three playable prototypes: **7 — Sightline seals**, **13 — Rotating islands**, and **19 — Combined mechanics**.

The next release changes the chapter order:

| Chambers | Chapter | Status |
| --- | --- | --- |
| 1–6 | Perspective switching | Original chambers |
| 7–12 | Rotating islands | All six built; unreleased |
| 13–18 | Sightline seals | Prototype at 13; 14–18 planned |
| 19–20 | Combined mechanics | Prototype at 19; 20 planned |

The island chapter progresses from a single rotating arm to two-ended islands, connected hubs, and return journeys. It is saved on `codex/rotating-islands-7-12` in the separate Sites source repository. It has not been released or added to this GitHub checkout, which contains the original six chambers.

## Controls

- **WASD / arrows:** move; in first person, left/right arrows turn.
- **Space / 1 / 2:** switch perspective.
- **Drag / Q / E:** rotate the map or look around.
- **Click or tap a connected tile:** walk there.
- **R:** restart the chamber.

In the public prototypes, **F** binds an aligned sightline seal or turns an island from its white hub. The on-screen action button does the same.

## Sound

An original ambient score and subtle effects accompany the game. The Sound menu has separate music and effects volumes and remembers your preferences.

## Run locally

Requires Node.js 22.9 or newer. No dependency installation is needed.

```sh
npm start
```

Open http://127.0.0.1:5174. Set `PORT` to use another local port.

## Credits

Three.js and RoundedBoxGeometry are included under their [MIT license](dist/client/vendor/LICENSE). The original soundtrack is documented in [AUDIO.md](dist/client/assets/AUDIO.md).
