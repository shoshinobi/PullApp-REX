# PullApp — REX

A Rive-powered pack-opening experience. The scene is built in `rex.riv` and rendered via the Rive WebGL2 runtime. The full technical manifest — artboards, view model properties, assets — is in [rex.md](rex.md).

---

## Quick start

Rive requires the file to be served over HTTP:

```bash
npx serve .
# or
python3 -m http.server 8080
```

The test harness sidebar can be collapsed with the **›** toggle on its left edge, which is useful when testing on a narrow screen or mobile device.

---

## Loading screen

On launch the scene opens on a loading screen (`Loading` artboard, 400 × 800). Once the app has finished fetching any remote data or assets, fire the `loadComplete` trigger on `MainVM` to transition into the main experience.

```js
vmi.trigger("loadComplete").trigger();
```

The **Auto complete loading** toggle in the harness sidebar fires this automatically on every load, so you never have to click it manually during development. Uncheck it when you need to inspect the loading state.

---

## Main artboard

The `MAIN` artboard (400 × 850, state machine `REX`) is the entry point for the entire experience. It uses **Rive Layouts**, so it reflows to fill any canvas size — no fixed aspect ratio is required.

`MainVM` exposes two canvas dimension properties, `canvasW` and `canvasH`, that should be kept in sync with the rendered canvas size so that layout-aware components can position themselves correctly.

---

## Starting section

The `section` enum on `MainVM` controls which part of the experience is active. The harness exposes two controls:

- **Starting Section** — sets the initial `section` value written to the VM *before* `r.play()`, so the state machine's first frame starts in the correct state. Persists in `localStorage` across page refreshes. Supported values: `loading`, `rip`.
- **Current Section** — updates the `section` enum on the live instance in real time. Read-only display also shows the current value as Rive drives it.

---

## Carousel

After loading, the user is presented with a carousel of five packs. The center slot (`heroPack`) is the highlighted selection; the surrounding slots are `pack1`, `pack2`, `pack4`, and `pack5`.

- **Navigating** — fire `shuffleLeft` or `shuffleRight` on `MainVM` to move through the carousel.
- **Selecting** — fire `packSelected` on `MainVM` when the user confirms their choice. This transitions the scene from selection into the pack-opening flow.
- **Shaking** — each pack slot exposes a `shake` trigger via its `PackVM`. The harness **Shake hero pack** button triggers `heroPack`; **Shake side packs** triggers `pack1`, `pack2`, `pack4`, and `pack5` simultaneously.
- **Hover** — set `isHovered` on any `PackVM` to show the hover highlight. Drive it with pointer-enter and pointer-leave events. `packEdgeGlow` enables an additional edge glow effect on a given pack.

---

## Packs and cards

Once a pack is selected it becomes `openPack` — the `PackVM` instance that drives the rip sequence.

### Pack graphics

`packGraphics` on `MainVM` is a data-bound image slot for the pack face texture. Swapping it updates the design shown across all pack slots simultaneously. The harness **Pack** dropdown pre-loads four colour variants; you can also upload any image via the file picker. The selected pack persists across restarts.

### Rip interaction

The rip is a drag gesture controlled by two progress values on `RipVM` (accessed via `openPack.propertyOfRipVM`):

- **`prog`** — driven by mouse or pointer drag. Range `0.0` (untouched) → `1.0` (fully ripped).
- **`mobileProg`** — the equivalent channel for mobile touch swipe. Drive this integer value with touch move events on mobile devices to control the tearing animation.

Set `isPressed` to `true` on pointer/touch down and `false` on release. Set `isTracking` to `true` while a drag is active, and `aligned` to `true` when the gesture direction is on-axis with the rip. When `prog` or `mobileProg` reaches `1.0`, fire the `ripped` trigger to complete the sequence.

`readyToRip` on `MainVM` must be set to `true` before the rip gesture is live.

### Card reveal

`cardImage` on `MainVM` is a data-bound image slot that accepts the card artwork to be revealed. Swap in the target image before the rip completes so it is in place when the card becomes visible.

```js
const img = await rive.decodeImage(new Uint8Array(await res.arrayBuffer()));
vmi.image("cardImage").value = img;
img.unref();
```

The harness **Card** dropdown pre-loads several card images from `img/cards/`; you can also upload any image via the file picker. On every restart (including after `nextPack`) a random card is auto-selected, always different from the previously shown card.

### Rarity

`rarity` on `MainVM` is an enum with four values: `common`, `uncommon`, `rare`, `special`. The harness **Rarity** dropdown updates it live.

### Pack count

`packCount` on `MainVM` is an integer tracking how many packs remain in the session. The harness **Pack count** input sets the value directly. Each `nextPack` event automatically decrements it by one (minimum 0) and the value carries over across restarts.

### nextPack flow

When Rive fires the `nextPack` trigger on `MainVM`, the harness:

1. Records the current card in the session history.
2. Decrements `packCount` by one.
3. Picks a new random card for the next reveal.
4. Restarts the Rive instance so the new pack-opening sequence begins.

### Vault Collection

When Rive fires the `viewInCollection` trigger on `MainVM`, the harness opens the **Vault Collection** modal showing every card revealed during the session. Each entry shows the card thumbnail, card name, and pack name. Once the collection is shown, no further cards are recorded.

Clicking **Restart** inside the modal, clicking anywhere outside the modal, or clicking the sidebar **Restart** button all perform a full reset: session history is cleared, a new random card is selected, and the Rive instance restarts from the beginning.

---

## Background and particle layers

The background effects are controlled through `BackgroundVM`, accessed via `MainVM.propertyOfBackgroundVM`. Three independent particle emitters can be toggled on or off:

| Emitter | Property |
|---|---|
| Streaks | `streaksActive` |
| Stars | `starsActive` |
| Dots | `dotsActive` |

Set `streaksFast` to `true` to accelerate the streak emitter. The radial burst that fires during key moments is controlled via `RadialStreaks` (nested inside `BackgroundVM`); `radialStreaksActive` enables it and `radialStreakColor` sets its tint. The same color is mirrored on `MainVM.radialStreakColor`.

---

## Audio

> **Work in progress** — audio integration is not yet finalised. This section will be updated.

The scene includes several bundled audio assets (whooshes, ambient loops, heartbeat, transitions). Volume can be muted globally via the Rive runtime:

```js
r.volume = 0; // mute
r.volume = 1; // full
```

The harness **Audio** toggle mutes and unmutes the running Rive instance in real time. Its state is preserved across restarts so the file resumes at the same volume level. Per-event audio triggering and per-layer volume control will be documented here once the integration is complete.
