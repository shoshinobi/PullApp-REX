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

---

## Test harness (lil-GUI)

The harness panel appears in the top-right corner of the screen. It starts collapsed — click the **REX Harness** title bar to expand it. The panel has four folders:

| Folder | Contents |
|---|---|
| **Images** | Pack and Card dropdowns to swap live textures |
| **Config** | Starting section, current section display, rarity, pack count |
| **Triggers** | Loading complete, Shake hero pack, Shake side packs, Restart |
| **Settings** | Runtime, Sprite format, Random Pack, Audio, Auto complete loading, Native Mobile, Degraded, Degraded GPU, Degraded scale, Copy GPU link, Onboarding Active |

Pack and card images can also be swapped programmatically by triggering the hidden file inputs `#pack-file-input`, `#sprite-file-input`, and `#card-file-input` in the DOM.

---

## Loading screen

On launch the scene opens on a loading screen (`Loading` artboard, 400 × 800). Once the app has finished fetching any remote data or assets, fire the `loadComplete` trigger on `MainVM` to transition into the main experience.

```js
vmi.trigger("loadComplete").trigger();
```

The **Auto complete loading** toggle in the harness Settings folder fires this automatically after all external images have decoded, so you never have to click it manually during development. Uncheck it when you need to inspect the loading state.

---

## Main artboard

The `MAIN` artboard (400 × 850, state machine `REX`) is the entry point for the entire experience. It uses **Rive Layouts**, so it reflows to fill any canvas size — no fixed aspect ratio is required.

`MainVM` exposes two canvas dimension properties, `canvasW` and `canvasH`, that should be kept in sync with the rendered canvas size so that layout-aware components can position themselves correctly.

---

## Starting section

The `section` enum on `MainVM` controls which part of the experience is active. The harness exposes two controls in the **Config** folder:

- **Starting Section** — sets the initial `section` value written to the VM *before* `r.play()`, so the state machine's first frame starts in the correct state. Persists in `localStorage` across page refreshes. Supported values: `loading`, `rip`.
- **Current Section** — updates the `section` enum on the live instance in real time. Also acts as a read-only display showing the value as Rive drives it.

---

## Carousel

After loading, the user is presented with a carousel of five packs. The center slot (`heroPack`) is the highlighted selection; the surrounding slots are `pack1`, `pack2`, `pack4`, and `pack5`.

- **Navigating** — fire `shuffleLeft` or `shuffleRight` on `MainVM` to move through the carousel. `shuffleLeft2` and `shuffleRight2` are also available as secondary shuffle triggers.
- **Selecting** — fire `packSelected` on `MainVM` when the user confirms their choice. This transitions the scene from selection into the pack-opening flow.
- **Shaking** — each pack slot exposes a `shake` trigger via its `PackVM`. The harness **Shake hero pack** button triggers `heroPack`; **Shake side packs** triggers `pack1`, `pack2`, `pack4`, and `pack5` simultaneously.
- **Hover** — set `isHovered` on any `PackVM` to show the hover highlight. Drive it with pointer-enter and pointer-leave events. `packEdgeGlow` enables an additional edge glow effect on a given pack.
- **Idle timer** — if the user does not interact for 5 seconds while in the carousel section, `shakeHeroPack` fires automatically. Any `pointerdown` event resets the timer.

---

## Packs and cards

Once a pack is selected it becomes `openPack` — the `PackVM` instance that drives the rip sequence.

### Pack graphics

`packGraphics` on `MainVM` is a data-bound image slot for the pack face texture. Swapping it updates the design shown across all pack slots simultaneously. The harness **Pack** dropdown in the Images folder pre-loads four colour variants. Selecting a pack automatically loads its matched sprite overlay — the two are always kept in sync.

### Sprite image

`topSpriteImg` on `MainVM` is a data-bound image slot for the sprite overlay shown during the reveal. The sprite is linked to whichever pack is active and updated automatically whenever the pack changes — no separate control is needed.

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

The harness **Card** dropdown in the Images folder pre-loads several card images from `img/cards/`. On every restart (including after `nextPack`) a random card is auto-selected, always different from the previously shown card.

### Rarity

`rarity` on `MainVM` is an enum with six values: `common`, `uncommon`, `rare`, `epic`, `legendary`, `grail`. Set this before `r.play()` to match the card being revealed. The harness **Rarity** dropdown in the Config folder updates it live. When **Random Pack** is enabled, rarity is also randomised on every restart.

`rarityColor` on `MainVM` is a colour property that can be used to tint rarity-specific UI elements to match the card tier.

### Pack count

`packCount` on `MainVM` is an integer tracking how many packs remain in the session. The harness **Pack count** input in the Config folder sets the value directly; the default is `3`. Each `nextPack` event automatically decrements it by one (minimum 0) and the value carries over across restarts.

### nextPack flow

When Rive fires the `nextPack` trigger on `MainVM`, the harness:

1. Records the current card in the session history.
2. Decrements `packCount` by one.
3. Picks a new random pack, sprite, card, and rarity (if **Random Pack** is enabled).
4. Restarts the Rive instance so the new pack-opening sequence begins.

### Vault Collection

When Rive fires the `viewInCollection` trigger on `MainVM`, the harness opens the **Vault Collection** modal — positioned over the canvas — showing every card revealed during the session. Each entry shows the card thumbnail, card name, and pack name. Once the collection is shown, no further cards are recorded.

Clicking **Restart** inside the modal, clicking anywhere outside the modal, or using the **Restart** button in the harness Triggers folder all perform a full reset: session history is cleared, new random values are applied, and the Rive instance restarts from the beginning.

---

## Runtime flags

The following boolean properties on `MainVM` should be set before `r.play()` so the state machine's first frame reflects the correct context. The harness exposes each as a toggle in the **Settings** folder.

| Property | Default | Description |
|---|---|---|
| `isNativeMobile` | `false` | Set to `true` when running inside a native mobile wrapper (React Native, etc.) to enable mobile-specific layout and interaction paths. |
| `isDegraded` | `false` | Set to `true` to reduce visual complexity inside the Rive file — disables particle systems and other heavy effects. Independent of GPU rendering quality. |
| `onboardingActive` | `true` | Set to `false` once the user has completed onboarding to skip the onboarding overlay. Persists in `localStorage`. |

---

## GPU performance

WebGL fill rate — how many pixels the GPU can shade per frame — is the primary bottleneck on weak/integrated GPUs (Intel integrated graphics, ARM Mali, older Adreno). Shrinking the rendered resolution is a direct lever on this, independent of screen DPI.

### Render scale

The harness temporarily overrides `window.devicePixelRatio` before calling `resizeDrawingSurfaceToCanvas()`, shrinking the WebGL drawing buffer below its native resolution while the canvas's CSS size stays untouched. The browser upscales the smaller buffer to fill the canvas as a normal part of the canvas's own paint step — cheap, with no extra GPU compositing layer. This is independent of `isDegraded` — visual content inside the Rive file is unaffected; only the render resolution changes.

The native descriptor and DPR value are captured once at startup, before any patching happens, so every resize call works from the same known-good baseline rather than re-reading a potentially already-patched value. The override is restored on the next animation frame rather than synchronously, giving Rive's Fit: Layout recalculation — which can run slightly after the resize call returns — a chance to see the same DPR the buffer was just sized with.

(An intermediate version of this feature shrank the canvas's CSS box and applied a counter `transform: scale()` instead. That fixed a layout-resize regression but reintroduced the original performance problem: `transform` forces the canvas onto its own GPU compositing layer, and the compositor still has to fill the full output resolution when blitting that layer back to size — costing just as much fill rate as rendering at full resolution would have. The DPR-override approach avoids both problems.)

The amount of reduction is controlled by `degradedScale` (default `0.75`, exposed in the harness as **Degraded scale**, range `0.4`–`1.0`). Since GPU fill rate scales with pixel count, this is a direct performance lever:

| Scale | Pixel reduction |
|---|---|
| `1.0` | none (native resolution) |
| `0.75` | ~44% fewer pixels |
| `0.5` | 75% fewer pixels |

Lower values trade visual sharpness for frame rate — useful on weak integrated GPUs where shrinking the browser window is observed to help, since that's effectively the same fill-rate relief applied manually.

### Auto-detection

`detectDegradedGPU()` runs at startup and sets the initial state. It defaults to **on** for any GPU that cannot be identified as high-performance, making it safe for older and budget devices out of the box — regardless of screen DPI, since render scale helps standard displays just as much as high-DPI ones:

| GPU family | Result |
|---|---|
| NVIDIA GeForce / Quadro | off — full resolution |
| AMD Radeon | off — full resolution |
| Intel Arc (discrete) | off — full resolution |
| Apple M-series | off — full resolution |
| Intel integrated, Mali, Adreno, PowerVR | on — scale applied |
| Unknown / renderer info unavailable | on — scale applied |

### URL parameters

Two URL parameters override the defaults — useful for sharing test links or for a native wrapper that already knows the device tier:

```
?degradedGPU=1      → force render scale on
?degradedGPU=false  → force render scale off
?degradedGPU=0      → force render scale off
?renderScale=0.6    → set the degraded scale to 0.6
```

The harness **Degraded GPU** toggle and **Degraded scale** slider in the Settings folder provide the same overrides at runtime without reloading.

The **Copy GPU link** button (also in Settings) copies the current page URL to the clipboard with both params baked in, reflecting whatever the toggle and slider are currently set to — useful for sending a tester a link that reproduces a specific GPU preset exactly.

---

## Rive runtime

The harness can switch between Rive's two web runtimes — **WebGL2** (default) and **Canvas** — to compare their performance on a given device. Unlike the other Settings toggles, this isn't a live property: each runtime is a separate JS/WASM bundle, so switching requires a full page reload.

The choice is persisted in `localStorage` under `riveRuntime` and read by an inline bootstrap script in `index.html`, which runs before any other script and writes the matching `<script>` tag (`@rive-app/webgl2` or `@rive-app/canvas`) into the page. The harness **Runtime** dropdown (Settings folder) updates that stored value and calls `location.reload()` immediately.

A `?runtime=` URL parameter overrides the stored value, useful for sharing a test link pinned to a specific runtime:

```
?runtime=webgl2
?runtime=canvas
```

The rest of `main.js` is runtime-agnostic — both packages expose the same `rive.Rive` constructor and ViewModel API, so no other code needs to change when switching.

---

## Random Pack mode

The **Random Pack** toggle in the harness Settings folder controls all session randomisation. When enabled (default), every restart picks a new pack colour, matched sprite overlay, card, and rarity automatically. Disable it to lock in specific values via the Images and Config folder controls.

---

## Sprite format

All sprite images (color pack overlays and FX sheets) are available in three formats under `img/sprites/`:

| Format | Folder | Notes |
|---|---|---|
| PNG | `png/` | Original, uncompressed |
| PNG Compressed | `png compressed/` | ~4× smaller than standard PNG; best overall size |
| WebP | `webp/` | Comparable to PNG Compressed for color sprites; larger for FX sheets |

The active format is selected via the **Sprite format** dropdown in the harness Settings folder. Changing it immediately re-fetches all sprite VM props at the new paths — no restart needed. The default is **PNG Compressed**.

To add a new format variant, add a folder under `img/sprites/`, place identically-named files inside it, then add an entry to `SPRITE_FORMATS` in `main.js`:

```js
const SPRITE_FORMATS = {
  "PNG":            { dir: "img/sprites/png/",            ext: ".png"  },
  "PNG Compressed": { dir: "img/sprites/png compressed/", ext: ".png"  },
  "WebP":           { dir: "img/sprites/webp/",           ext: ".webp" },
};
```

Pack graphics (`img/PackGraphics_*.png`) and card images (`img/cards/`) have no format variants and are unaffected by this setting.

---

## FX images

Three effect spritesheets are data-bound to `MainVM` and loaded automatically on every Rive init. To swap a file or add a new binding, edit `STATIC_RIV_IMAGES` at the top of `main.js`:

```js
const STATIC_RIV_IMAGES = [
  { prop: "imgEdgeFXlines", file: "edgeFX_lines" },
  { prop: "imgEdgeFXwaves", file: "edgeFX_waves"  },
  { prop: "imgSwirlFX",     file: "swirlFX"       },
];
```

Each entry maps a `MainVM` image property name (`prop`) to a bare sprite filename (`file`, no extension). The full path is built at load time using the active sprite format. Files are fetched and decoded in parallel so the textures are ready before the first frame that needs them.

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

## WebGL context loss

The OS can reclaim the WebGL context under memory pressure — most commonly on Android, when an iOS tab backgrounds, or on low-memory Windows machines when the GPU driver resets under load. Without handling this, the canvas goes black and stays that way.

The harness listens for both browser events on the canvas:

- **`webglcontextlost`** — calls `e.preventDefault()` (required to signal that recovery is wanted), cancels the idle timer, cleans up the Rive instance, and resets `riveReady` so no other callbacks fire into the dead context.
- **`webglcontextrestored`** — calls `startRive()` to reinitialise with the same carried values (pack, card, rarity) that were in play before the loss. This is a technical recovery, not a user restart, so no new random values are applied.

---

## Audio

The scene includes several bundled audio assets (whooshes, ambient loops, heartbeat, transitions). Volume is controlled globally via the Rive runtime:

```js
r.volume = 0; // mute
r.volume = 1; // full
```

The harness **Audio** toggle in the Settings folder mutes and unmutes the running Rive instance in real time. Its state is preserved across restarts.
