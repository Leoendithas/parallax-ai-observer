# Parallax — AI Observer

A spatial puzzle game where changing your viewpoint changes which paths physically exist. Switch between a rotatable 3D overview and first person, gather light fragments, and find the exit across six authored chambers.

[AI Observer demo](https://parallax-ai-observer.lancetyw.chatgpt.site/) · [Play the public standalone game](https://parallax-observers-path.lancetyw.chatgpt.site/)

The standalone game is public and needs no AI or API key. The hosted AI Observer demo has restricted access. This repository contains the AI Observer edition; it can be run locally, with your own OpenAI API key for automatic adaptation.

## Latest developments

Development continues in two editions. **AI Observer**, in this repository, has six authored chambers, automatic difficulty adaptation, and the original ambient score with saved music and effects settings. The separate **standalone edition** carries the new puzzle mechanics and campaign expansion.

### Available in the public standalone game

The six original perspective chambers are joined by three playable prototypes:

- [Chamber 7 — Sightline seals](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-7): align a split ring from a marked white viewpoint in first person, then bind it to open a blue bridge that stays available until the chamber restarts.
- [Chamber 13 — Rotating islands](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-13): turn an amber arm clockwise from its fixed white hub in overview to reach another landing.
- [Chamber 19 — Combined mechanics](https://parallax-observers-path.lancetyw.chatgpt.site/#chamber-19): use perspective switching, a sightline seal, and island rotation in a return journey.

The standalone edition also includes the ambient score, subtle effects, separate volume controls, and saved sound preferences.

### Next release: rotating islands first

The next campaign order moves rotating islands ahead of sightline seals:

| Chambers | Chapter | Development status |
| --- | --- | --- |
| 1–6 | Perspective switching | Original six chambers retained |
| 7–12 | Rotating islands | All six implemented; unreleased |
| 13–18 | Sightline seals | Prototype moved to 13; 14–18 planned |
| 19–20 | Combined mastery | Prototype 19 retained; 20 planned |

The six island chambers introduce these ideas in sequence:

| Chamber | Name | Puzzle focus |
| --- | --- | --- |
| 7 | A world that turns | One arm, one turn, and a new landing |
| 8 | Back to the center | Return to the hub to choose another destination |
| 9 | Two ends. One turn | Opposite arms rotate together |
| 10 | A second turn | Operate two independent islands |
| 11 | Leave a way back | Restore the route through an earlier island |
| 12 | The roads between | Link two-ended islands through a blue gallery and return home |

This work is saved on `codex/rotating-islands-7-12` in the standalone game's **Sites source repository**. That branch is not part of this GitHub repository and has not been merged into the standalone game's `main` or published. The public links above still use the earlier prototype numbering.

The unreleased chapter preserves completed-room progress when rooms are renumbered. Its 14 regression tests pass, covering puzzle rules, seal geometry, saved-progress migration, and solvability. Exhaustive island checks confirm that reachable states remain recoverable, clockwise turns are safe, and each island must be used to complete its chamber.

## Automatic difficulty adaptation

The Observer runs automatically; there is no chat or question panel. A server-side OpenAI Agents API session, using `gpt-6-astra` by default, assesses puzzle state and player performance and returns a decision:

- **Continue:** preserve the current challenge.
- **Assist:** after repeated falls, enable safety assistance that blocks unsafe steps and perspective shifts for the current chamber.
- **Challenge:** after a strong completion, offer a harder next chamber, skipping one chamber when the game's validation allows it.

Evaluations happen after completion, repeated falls, or a period without movement or fragment progress. Time alone is not treated as failure. The client checks each decision before applying it. Challenge jumps require a completed chamber, no falls, at most 30 moves, and completion of chamber 2, 3, or 4. Safety assistance requires at least two falls. Assistance resets when a chamber starts.

AI decisions are asynchronous, so play continues while the Observer is thinking. If a request fails, difficulty stays unchanged. The current prototype evaluates each snapshot in a new agent session; it does not maintain a long-term player profile.

## Run locally

Requires Node.js 22.9 or newer. Browser libraries are vendored; no dependency installation is needed.

```sh
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local using an API key with Agents API access.
npm start
```

Open http://127.0.0.1:5174. Set `PORT` to use another local port. The game can run without an API key, but automatic AI adaptation needs a valid key with model access and available API quota. Optional `OPENAI_OBSERVER_MODEL` overrides the default model.

Keep `.env.local` out of Git. For Sites hosting, configure `OPENAI_API_KEY` as a server-side runtime secret and redeploy. No key is included in this repository or sent to the browser.

## Soundscape

An original 80-second ambient score starts with the first gameplay click or keypress, then loops continuously. First person softens the mix. The Sound menu has separate music/effects levels and a persistent mute preference. Audio fades out when the tab is hidden and resumes when you return.

Footsteps use quiet filtered texture, perspective shifts use soft air and resonance, fragments ring with gentle glass notes, and completion resolves in a restrained chord. Effects are synthesized in the browser with smooth envelopes and reverb.

## Controls

- **WASD / arrows:** move; in first person, left/right arrows turn.
- **Space / 1 / 2:** switch perspective.
- **Drag / Q / E:** rotate the map or look around.
- **Click a connected solid tile:** walk there.
- **R:** restart the chamber.

Amber paths exist in overview. Blue paths exist in first person. White anchors exist in both. Gather every fragment before entering the white arch.

## Implementation

- `dist/client/game.js`: Three.js world, controls, collision rules, puzzle state, and validated adaptation actions.
- `dist/client/levels.js`: six chambers and pathfinding.
- `dist/client/observer.js`: automatic performance monitoring and adaptation requests.
- `dist/client/audio.js`: music playback, perspective mixing, synthesized effects, and saved volume controls.
- `dist/server/index.js`: Cloudflare Worker endpoint, Agents API request, and streamed final-answer parsing.
- `preview.mjs`: local Node server for the same game and API handler.

The Worker entrypoint and browser assets are authored directly; there is no compilation step. The empty `.openai/hosting.json` is ready for a separate Sites project and contains no private deployment identifiers.

## Validation

```sh
npm run check
```

During development, all six chambers were solved in browser testing. An additional solver audit verified 1,149 suggested steps across chamber and collection states were legal. The Agents API was tested live: a snapshot with four falls in eight moves returned `assist`. Split streaming frames, premature stream termination, and missing-key responses were also checked.

## Credits

Built and iterated with Astra in Codex, including puzzle design, implementation, browser testing, and deployment. Three.js and RoundedBoxGeometry are included under their MIT license in `dist/client/vendor/LICENSE`. The panoramic starfield was generated for the game. The original soundtrack is documented in `dist/client/assets/AUDIO.md`.
