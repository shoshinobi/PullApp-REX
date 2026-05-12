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

---

## Main artboard

The `MAIN` artboard (400 × 850, state machine `REX`) is the entry point for the entire experience. It uses **Rive Layouts**, so it reflows to fill any canvas size — no fixed aspect ratio is required.

`MainVM` exposes two canvas dimension properties, `canvasW` and `canvasH`, that should be kept in sync with the rendered canvas size so that layout-aware components can position themselves correctly.

---

## Carousel

After loading, the user is presented with a carousel of five packs. The center slot (`heroPack`) is the highlighted selection; the surrounding slots are `pack1`, `pack2`, `pack4`, and `pack5`.

- **Navigating** — fire `shuffleLeft` or `shuffleRight` on `MainVM` to move through the carousel.
- **Selecting** — fire `packSelected` on `MainVM` when the user confirms their choice. This transitions the scene from selection into the pack-opening flow.
- **Shaking** — each pack slot exposes a `shake` trigger via its `PackVM`. Call it on `heroPack` to animate the center pack, or on any of the side slots to animate those independently.
- **Hover** — set `isHovered` on any `PackVM` to show the hover highlight. Drive it with pointer-enter and pointer-leave events. `packEdgeGlow` enables an additional edge glow effect on a given pack.

---

## Packs and cards

Once a pack is selected it becomes `openPack` — the `PackVM` instance that drives the rip sequence.

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

The `swap` trigger on `MainVM` can be used to exchange pack content mid-animation during the reveal sequence.

### Pack graphics

`packGraphics` on `MainVM` is a data-bound image slot for the pack face texture. Swapping it updates the design shown across all pack slots simultaneously.

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

Per-event audio triggering and volume control per layer will be documented here once the integration is complete.
