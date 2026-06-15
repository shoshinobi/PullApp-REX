const canvas = document.getElementById("rive-canvas");

// ── Image data ────────────────────────────────────────────────────────────────

const PACK_IMAGES = [
  { label: "PackGraphics_blue",      path: "img/PackGraphics_blue.png",      sprite: "img/sprites/BlueSprite.png"   },
  { label: "PackGraphics_goldGreen", path: "img/PackGraphics_goldGreen.png", sprite: "img/sprites/GreenSprite.png"  },
  { label: "PackGraphics_red",       path: "img/PackGraphics_red.png",       sprite: "img/sprites/RedSprite.png"    },
  { label: "PackGraphics_yellow",    path: "img/PackGraphics_yellow.png",    sprite: "img/sprites/YellowSprite.png" },
];

// Static VM image bindings — always loaded on every Rive init.
// { prop: ViewModel image property name, path: file path (name + extension) }
const STATIC_RIV_IMAGES = [
  { prop: "imgEdgeFXlines", path: "img/sprites/edgeFX_lines.png" },
  { prop: "imgEdgeFXwaves", path: "img/sprites/edgeFX_waves.png"  },
  { prop: "imgSwirlFX",     path: "img/sprites/swirlFX.png"       },
];

const CARD_IMAGES = [
  { label: "Alakazam",         path: "img/cards/Alakazam.jpeg" },
  { label: "Basculin",         path: "img/cards/Basculin.png" },
  { label: "Blastoise EX",     path: "img/cards/Blastoise EX.png" },
  { label: "Charizard",        path: "img/cards/Charizard.jpeg" },
  { label: "Fire Energy",      path: "img/cards/Fire Energy.jpeg" },
  { label: "Mega Meganium EX", path: "img/cards/Mega Meganium EX.png" },
  { label: "Voltorb",          path: "img/cards/Voltorb.jpeg" },
];

const RARITY_VALUES = ["common", "uncommon", "rare", "epic", "legendary", "grail"];

function randomPack()   { return PACK_IMAGES[Math.floor(Math.random() * PACK_IMAGES.length)]; }
function randomRarity() { return RARITY_VALUES[Math.floor(Math.random() * RARITY_VALUES.length)]; }

// Picks a card different from the last shown. Persists last choice in localStorage
// so the exclusion survives page refreshes.
function randomCard() {
  const last = localStorage.getItem("lastCardPath");
  const pool = CARD_IMAGES.filter(c => c.path !== last);
  const candidates = pool.length ? pool : CARD_IMAGES;
  const card = candidates[Math.floor(Math.random() * candidates.length)];
  localStorage.setItem("lastCardPath", card.path);
  return card;
}

// ── Mutable VM references — re-assigned on every load / restart ───────────────

let loadCompleteTrigger = null;
let shakeHeroTrigger    = null;
let shakeSide1Trigger   = null;
let shakeSide2Trigger   = null;
let shakeSide4Trigger   = null;
let shakeSide5Trigger   = null;
let packImageProp        = null;
let cardImageProp        = null;
let topSpriteImgProp     = null;
let sectionProp          = null;
let rarityProp           = null;
let packCountProp        = null;
let isNativeMobileProp   = null;
let isDegradedProp       = null;
let onboardingActiveProp = null;

// ── Session state — persists across restarts ──────────────────────────────────

let randomPackMode = true;

let carriedPackCount   = 3;
let carriedPackImage   = null;
let carriedSpriteImage = null;
let carriedRarity      = null;
let carriedCardImage   = null;
let autoCompleteLoading = true;

let activeCardLabel = null;
let activeCardSrc   = null;
let activePackLabel = null;
let cardHistory      = [];
let collectionViewed = false;
let nextPackFired    = false;

function applyRandomValues() {
  const pack = randomPack();
  carriedPackImage   = pack.path;
  carriedSpriteImage = pack.sprite;
  activePackLabel    = pack.label;
  carriedCardImage   = randomCard();
  carriedRarity      = randomRarity();
}

if (randomPackMode) applyRandomValues();

// ── GUI state — shared between lil-GUI and Rive callbacks ─────────────────────

const guiState = {};
let packCtrl, cardCtrl, sectionCtrl, rarityCtrl, packCountCtrl;

// ── Rive ──────────────────────────────────────────────────────────────────────

let r = null;
let riveReady      = false;
let currentSection = null;
let idleTimer      = null;

// Detects fill-rate-limited GPUs where capping DPR to 1 gives a large fps gain.
// Only relevant on high-DPR screens — at DPR ≤ 1 there's nothing to cap.
function detectDegradedGPU() {
  if (window.devicePixelRatio <= 1) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2")
            || document.createElement("canvas").getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // Known high-performance — leave DPR alone
        if (/nvidia|geforce|rtx|gtx|quadro|radeon|rx \d|vega|navi|intel arc/.test(renderer)) return false;
        if (/apple m\d/.test(renderer)) return false;
        // Integrated / mobile GPUs — fill-rate limited at high DPR
        if (/intel|mali|adreno|powervr|videocore/.test(renderer)) return true;
      }
    }
  } catch (_) {}
  // Fallback: low device memory on a high-DPR screen is a strong proxy
  if (typeof navigator.deviceMemory !== "undefined" && navigator.deviceMemory < 4) return true;
  return false;
}

let degradedGPU = detectDegradedGPU();

// Caps devicePixelRatio at 1 for fill-rate-limited GPUs before calling resize —
// reduces rendered pixels by up to 4× on high-DPI screens (e.g. Intel UHD, Mali).
function resizeDrawingSurface(rInst) {
  if (!degradedGPU || window.devicePixelRatio <= 1) {
    rInst.resizeDrawingSurfaceToCanvas();
    return;
  }
  const prev = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
  if (!prev?.configurable) {
    rInst.resizeDrawingSurfaceToCanvas();
    return;
  }
  try {
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    rInst.resizeDrawingSurfaceToCanvas();
  } finally {
    Object.defineProperty(window, "devicePixelRatio", prev);
  }
}

function startRive() {
  riveReady = false;
  r = new rive.Rive({
    src: "rex.riv",
    canvas,
    autoplay: false,
    autoBind: true,
    artboard: "MAIN",
    stateMachines: "REX",
    layout: new rive.Layout({ fit: rive.Fit.Layout }),
    onLoad() {
      riveReady = true;
      resizeDrawingSurface(r);

      const vmi = r.viewModelInstance;

      // Write section before r.play() so the state machine's first frame sees it.
      const startSection = localStorage.getItem("startingSection") ?? "loading";
      vmi.enum("section").value = startSection;
      guiState.currentSection = startSection;

      loadCompleteTrigger = vmi.trigger("loadComplete");
      shakeHeroTrigger    = vmi.viewModel("heroPack").trigger("shake");
      shakeSide1Trigger   = vmi.viewModel("pack1").trigger("shake");
      shakeSide2Trigger   = vmi.viewModel("pack2").trigger("shake");
      shakeSide4Trigger   = vmi.viewModel("pack4").trigger("shake");
      shakeSide5Trigger   = vmi.viewModel("pack5").trigger("shake");
      packImageProp       = vmi.image("packGraphics");
      cardImageProp       = vmi.image("cardImage");

      const imageLoads = [];

      if (carriedCardImage) {
        imageLoads.push(loadImageProperty(cardImageProp, carriedCardImage.path));
        guiState.card    = carriedCardImage.path;
        activeCardLabel  = carriedCardImage.label;
        activeCardSrc    = carriedCardImage.path;
        carriedCardImage = null;
      } else {
        activeCardLabel = null;
        activeCardSrc   = null;
      }

      if (carriedPackImage) {
        imageLoads.push(loadImageProperty(packImageProp, carriedPackImage));
        if (typeof carriedPackImage === "string") {
          guiState.pack   = carriedPackImage;
          activePackLabel = PACK_IMAGES.find(p => p.path === carriedPackImage)?.label ?? null;
        }
      }

      topSpriteImgProp = vmi.image("topSpriteImg");
      for (const { prop, path } of STATIC_RIV_IMAGES) {
        imageLoads.push(loadImageProperty(vmi.image(prop), path));
      }
      if (carriedSpriteImage) {
        imageLoads.push(loadImageProperty(topSpriteImgProp, carriedSpriteImage));
      }

      sectionProp        = vmi.enum("section");
      rarityProp         = vmi.enum("rarity");
      if (carriedRarity) rarityProp.value = carriedRarity;
      packCountProp      = vmi.number("packCount");
      isNativeMobileProp = vmi.boolean("isNativeMobile");

      isDegradedProp       = vmi.boolean("isDegraded");
      isDegradedProp.value = guiState.degraded;

      const onboardingStored = localStorage.getItem("onboardingActive");
      const onboardingOn     = onboardingStored === null ? true : onboardingStored === "true";
      onboardingActiveProp       = vmi.boolean("onboardingActive");
      onboardingActiveProp.value = onboardingOn;

      packCountProp.value = carriedPackCount;

      guiState.rarity    = rarityProp.value;
      guiState.packCount = packCountProp.value;
      guiState.onboarding = onboardingOn;
      packCtrl?.updateDisplay();
      cardCtrl?.updateDisplay();
      rarityCtrl?.updateDisplay();
      packCountCtrl?.updateDisplay();

      sectionProp.on(value => {
        currentSection = value;
        guiState.currentSection = value;
        sectionCtrl?.updateDisplay();
        if (value === "carousel") {
          resetIdleTimer();
        } else {
          clearTimeout(idleTimer);
          idleTimer = null;
        }
      });

      nextPackFired = false;

      vmi.trigger("nextPack").on(() => {
        if (nextPackFired) return;
        nextPackFired = true;
        showToast("nextPack fired");
        if (!collectionViewed) {
          cardHistory.push({ label: activeCardLabel, src: activeCardSrc, pack: activePackLabel });
        }
        const next = Math.max(0, packCountProp.value - 1);
        packCountProp.value = next;
        carriedPackCount = next;
        guiState.packCount = next;
        packCountCtrl?.updateDisplay();
        if (randomPackMode) applyRandomValues();
        restart();
      });

      vmi.trigger("viewInCollection").on(() => {
        if (!collectionViewed && (activeCardLabel || activeCardSrc)) {
          cardHistory.push({ label: activeCardLabel, src: activeCardSrc, pack: activePackLabel });
        }
        collectionViewed = true;
        showCollectionModal();
      });

      r.volume = guiState.audio ? 1 : 0;
      r.play("REX");

      if (autoCompleteLoading) {
        Promise.all(imageLoads).then(() => requestAnimationFrame(() => loadCompleteTrigger.trigger()));
      }
    },
  });
}

startRive();

new ResizeObserver(() => { if (riveReady && r) resizeDrawingSurface(r); }).observe(canvas);

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => shakeHeroTrigger?.trigger(), 5000);
}

document.addEventListener("pointerdown", () => {
  if (currentSection === "carousel") resetIdleTimer();
});

function restart() {
  clearTimeout(idleTimer);
  idleTimer = null;
  r.cleanup();
  startRive();
}

// Clears session state and restarts. Used by all three reset entry points.
function fullReset() {
  hideCollectionModal();
  cardHistory      = [];
  collectionViewed = false;
  if (randomPackMode) applyRandomValues();
  restart();
}

// ── Modal listeners (remain as direct DOM, not GUI) ───────────────────────────

document.getElementById("modal-restart-btn").addEventListener("click", fullReset);

document.getElementById("collection-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) fullReset();
});

// ── Image loader ──────────────────────────────────────────────────────────────

async function loadImageProperty(prop, src) {
  const bytes = src instanceof File
    ? new Uint8Array(await src.arrayBuffer())
    : new Uint8Array(await (await fetch(src)).arrayBuffer());
  const img = await rive.decodeImage(bytes);
  prop.value = img;
  img.unref();
}

// ── Collection modal ──────────────────────────────────────────────────────────

function showCollectionModal() {
  const list = document.getElementById("modal-cards-list");
  list.innerHTML = "";

  if (!cardHistory.length) {
    const empty = document.createElement("p");
    empty.className = "modal-empty";
    empty.textContent = "No cards collected yet.";
    list.appendChild(empty);
    return;
  }

  for (const card of cardHistory) {
    const row  = document.createElement("div");
    const img  = document.createElement("img");
    const info = document.createElement("div");
    const name = document.createElement("p");
    const pack = document.createElement("p");

    row.className  = "modal-card-row";
    img.className  = "modal-card-thumb";
    info.className = "modal-card-info";
    name.className = "modal-card-name";
    pack.className = "modal-card-pack";

    img.src                = card.src ?? "";
    img.style.visibility   = card.src ? "visible" : "hidden";
    name.textContent       = card.label ?? "—";
    pack.textContent       = card.pack  ?? "—";

    info.append(name, pack);
    row.append(img, info);
    list.appendChild(row);
  }

  document.getElementById("collection-modal").removeAttribute("hidden");
}

function hideCollectionModal() {
  document.getElementById("collection-modal").setAttribute("hidden", "");
}

// ── lil-GUI ───────────────────────────────────────────────────────────────────

const packOptions = Object.fromEntries(PACK_IMAGES.map(p => [p.label, p.path]));
const cardOptions = Object.fromEntries(CARD_IMAGES.map(c => [c.label, c.path]));
const rarityOptions = Object.fromEntries(RARITY_VALUES.map(r => [r[0].toUpperCase() + r.slice(1), r]));

// Seed initial guiState from current carried values (onLoad populates these on restart)
guiState.pack = typeof carriedPackImage === "string" ? carriedPackImage : PACK_IMAGES[0].path;
guiState.card = carriedCardImage?.path ?? CARD_IMAGES[0].path;
guiState.startingSection = localStorage.getItem("startingSection") ?? "loading";
guiState.currentSection  = "loading";
guiState.rarity          = carriedRarity ?? "common";
guiState.packCount       = carriedPackCount;
guiState.randomPack      = randomPackMode;
guiState.audio           = true;
guiState.autoComplete    = autoCompleteLoading;
guiState.nativeMobile    = false;
guiState.degraded        = false;
guiState.degradedGPU     = degradedGPU;
guiState.onboarding      = true;

const gui = new lil.GUI({ title: "REX Settings" });
gui.close();

// Images
const imgFolder = gui.addFolder("Images");

packCtrl = imgFolder.add(guiState, "pack", packOptions).name("Pack")
  .onChange(path => {
    const linked     = PACK_IMAGES.find(p => p.path === path);
    carriedPackImage = path;
    activePackLabel  = linked?.label ?? null;
    if (linked) {
      carriedSpriteImage = linked.sprite;
      if (topSpriteImgProp) loadImageProperty(topSpriteImgProp, linked.sprite);
    }
    if (packImageProp) loadImageProperty(packImageProp, path);
  });

cardCtrl = imgFolder.add(guiState, "card", cardOptions).name("Card")
  .onChange(path => {
    const entry     = CARD_IMAGES.find(c => c.path === path);
    activeCardLabel = entry?.label ?? null;
    activeCardSrc   = path;
    if (typeof path === "string") localStorage.setItem("lastCardPath", path);
    if (cardImageProp) loadImageProperty(cardImageProp, path);
  });

document.getElementById("pack-file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  carriedPackImage = file;
  activePackLabel  = file.name;
  if (packImageProp) loadImageProperty(packImageProp, file);
});

document.getElementById("sprite-file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  carriedSpriteImage = file;
  if (topSpriteImgProp) loadImageProperty(topSpriteImgProp, file);
});

document.getElementById("card-file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  activeCardLabel = file.name;
  activeCardSrc   = URL.createObjectURL(file);
  if (cardImageProp) loadImageProperty(cardImageProp, file);
});

// Config
const cfgFolder = gui.addFolder("Config");

cfgFolder.add(guiState, "startingSection", { Loading: "loading", Rip: "rip" })
  .name("Starting section")
  .onChange(v => localStorage.setItem("startingSection", v));

sectionCtrl = cfgFolder.add(guiState, "currentSection", {
  Loading: "loading", Carousel: "carousel", Rip: "rip", Cover: "cover", Reveal: "reveal",
}).name("Current section").onChange(v => { if (sectionProp) sectionProp.value = v; });

rarityCtrl = cfgFolder.add(guiState, "rarity", rarityOptions).name("Rarity")
  .onChange(v => { carriedRarity = v; if (rarityProp) rarityProp.value = v; });

packCountCtrl = cfgFolder.add(guiState, "packCount", 0, 99, 1).name("Pack count")
  .onChange(v => { carriedPackCount = v; if (packCountProp) packCountProp.value = v; });

// Triggers
const trgFolder = gui.addFolder("Triggers");
trgFolder.add({ fn: () => loadCompleteTrigger?.trigger()                            }, "fn").name("Loading complete");
trgFolder.add({ fn: () => shakeHeroTrigger?.trigger()                               }, "fn").name("Shake hero pack");
trgFolder.add({ fn: () => { shakeSide1Trigger?.trigger(); shakeSide2Trigger?.trigger();
                             shakeSide4Trigger?.trigger(); shakeSide5Trigger?.trigger(); }
              }, "fn").name("Shake side packs");
trgFolder.add({ fn: () => fullReset()                                               }, "fn").name("Restart");

// Settings
const setFolder = gui.addFolder("Settings");
setFolder.add(guiState, "randomPack"   ).name("Random Pack"           ).onChange(v => { randomPackMode    = v; });
setFolder.add(guiState, "audio"        ).name("Audio"                 ).onChange(v => { if (r) r.volume = v ? 1 : 0; });
setFolder.add(guiState, "autoComplete" ).name("Auto complete loading" ).onChange(v => { autoCompleteLoading = v; });
setFolder.add(guiState, "nativeMobile" ).name("Native Mobile"         ).onChange(v => { if (isNativeMobileProp)   isNativeMobileProp.value   = v; });
setFolder.add(guiState, "degraded"     ).name("Degraded"              ).onChange(v => { if (isDegradedProp) isDegradedProp.value = v; });
setFolder.add(guiState, "degradedGPU"  ).name("Degraded GPU"           ).onChange(v => { degradedGPU = v; if (riveReady && r) resizeDrawingSurface(r); });
setFolder.add(guiState, "onboarding"   ).name("Onboarding Active"     ).onChange(v => {
  localStorage.setItem("onboardingActive", v);
  if (onboardingActiveProp) onboardingActiveProp.value = v;
});

// ── Toasts ────────────────────────────────────────────────────────────────────

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2500);
}
