const canvas = document.getElementById("rive-canvas");

// ── Image data ────────────────────────────────────────────────────────────────

const PACK_IMAGES = [
  { label: "PackGraphics_blue",      path: "img/PackGraphics_blue.png" },
  { label: "PackGraphics_goldGreen", path: "img/PackGraphics_goldGreen.png" },
  { label: "PackGraphics_red",       path: "img/PackGraphics_red.png" },
  { label: "PackGraphics_yellow",    path: "img/PackGraphics_yellow.png" },
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
let packImageProp       = null;
let cardImageProp       = null;
let sectionProp         = null;
let rarityProp          = null;
let packCountProp       = null;

// ── Session state — persists across restarts ──────────────────────────────────

const DEFAULT_PACK   = PACK_IMAGES.find(p => p.label === "PackGraphics_goldGreen");

let carriedPackCount    = null;
let carriedPackImage    = DEFAULT_PACK.path;
let carriedCardImage    = randomCard();
let autoCompleteLoading = true;

let activeCardLabel  = null;
let activeCardSrc    = null;
let activePackLabel  = DEFAULT_PACK.label;
let cardHistory      = [];
let collectionViewed = false;
let nextPackFired    = false;

// ── Rive ──────────────────────────────────────────────────────────────────────

let r = null;

function startRive() {
  r = new rive.Rive({
    src: "rex.riv",
    canvas,
    autoplay: false,
    autoBind: true,
    artboard: "MAIN",
    stateMachines: "REX",
    layout: new rive.Layout({ fit: rive.Fit.Layout }),
    onLoad() {
      r.resizeDrawingSurfaceToCanvas();

      const vmi = r.viewModelInstance;

      // Write section before r.play() so the state machine's first frame sees it.
      const startSection = localStorage.getItem("startingSection") ?? "loading";
      vmi.enum("section").value = startSection;
      document.getElementById("section-select").value = startSection;

      loadCompleteTrigger = vmi.trigger("loadComplete");
      shakeHeroTrigger    = vmi.viewModel("heroPack").trigger("shake");
      shakeSide1Trigger   = vmi.viewModel("pack1").trigger("shake");
      shakeSide2Trigger   = vmi.viewModel("pack2").trigger("shake");
      shakeSide4Trigger   = vmi.viewModel("pack4").trigger("shake");
      shakeSide5Trigger   = vmi.viewModel("pack5").trigger("shake");
      packImageProp       = vmi.image("packGraphics");
      cardImageProp       = vmi.image("cardImage");

      if (carriedCardImage) {
        loadImageProperty(cardImageProp, carriedCardImage.path);
        document.getElementById("card-select").value = carriedCardImage.path;
        activeCardLabel  = carriedCardImage.label;
        activeCardSrc    = carriedCardImage.path;
        carriedCardImage = null;
      } else {
        document.getElementById("card-select").value = "";
        activeCardLabel = null;
        activeCardSrc   = null;
      }

      if (carriedPackImage) {
        loadImageProperty(packImageProp, carriedPackImage);
        if (typeof carriedPackImage === "string") {
          document.getElementById("pack-select").value = carriedPackImage;
          activePackLabel = PACK_IMAGES.find(p => p.path === carriedPackImage)?.label ?? null;
        }
      }

      sectionProp   = vmi.enum("section");
      rarityProp    = vmi.enum("rarity");
      packCountProp = vmi.number("packCount");

      document.getElementById("rarity-select").value = rarityProp.value;

      if (carriedPackCount !== null) packCountProp.value = carriedPackCount;
      document.getElementById("pack-count-input").value = packCountProp.value;

      sectionProp.on(value => {
        document.getElementById("section-select").value = value;
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
        document.getElementById("pack-count-input").value = next;
        carriedCardImage = randomCard();
        restart();
      });

      vmi.trigger("viewInCollection").on(() => {
        if (!collectionViewed && (activeCardLabel || activeCardSrc)) {
          cardHistory.push({ label: activeCardLabel, src: activeCardSrc, pack: activePackLabel });
        }
        collectionViewed = true;
        showCollectionModal();
      });

      r.volume = document.getElementById("toggle-audio").checked ? 1 : 0;
      r.play("REX");

      // Defer by one frame so the state machine can process its initial state first.
      if (autoCompleteLoading) requestAnimationFrame(() => loadCompleteTrigger.trigger());
    },
  });
}

startRive();

new ResizeObserver(() => r?.resizeDrawingSurfaceToCanvas()).observe(canvas);

// ── Helpers ───────────────────────────────────────────────────────────────────

function restart() {
  r.cleanup();
  startRive();
}

// Clears session state and restarts. Used by all three reset entry points.
function fullReset() {
  hideCollectionModal();
  cardHistory      = [];
  collectionViewed = false;
  carriedCardImage = randomCard();
  restart();
}

// ── DOM listeners ─────────────────────────────────────────────────────────────

document.getElementById("btn-restart").addEventListener("click", fullReset);
document.getElementById("modal-restart-btn").addEventListener("click", fullReset);

document.getElementById("collection-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) fullReset();
});

document.getElementById("btn-load-complete").addEventListener("click", () => {
  loadCompleteTrigger?.trigger();
});

document.getElementById("btn-shake-pack3").addEventListener("click", () => {
  shakeHeroTrigger?.trigger();
});

document.getElementById("btn-shake-pack2-4").addEventListener("click", () => {
  shakeSide1Trigger?.trigger();
  shakeSide2Trigger?.trigger();
  shakeSide4Trigger?.trigger();
  shakeSide5Trigger?.trigger();
});

document.getElementById("toggle-audio").addEventListener("change", (e) => {
  r.volume = e.target.checked ? 1 : 0;
});

document.getElementById("toggle-auto-load").addEventListener("change", (e) => {
  autoCompleteLoading = e.target.checked;
});

document.getElementById("section-select").addEventListener("change", (e) => {
  if (sectionProp) sectionProp.value = e.target.value;
});

document.getElementById("rarity-select").addEventListener("change", (e) => {
  if (rarityProp) rarityProp.value = e.target.value;
});

document.getElementById("pack-count-input").addEventListener("input", (e) => {
  const val = Number(e.target.value);
  carriedPackCount = val;
  if (packCountProp) packCountProp.value = val;
});

document.getElementById("sidebar-toggle").addEventListener("click", () => {
  document.getElementById("controls").classList.toggle("collapsed");
});

// Starting section persists in localStorage across page refreshes.
const startSelect = document.getElementById("section-start-select");
startSelect.value = localStorage.getItem("startingSection") ?? "loading";
startSelect.addEventListener("change", (e) => {
  localStorage.setItem("startingSection", e.target.value);
});

// ── Image controls ────────────────────────────────────────────────────────────

async function loadImageProperty(prop, src) {
  const bytes = src instanceof File
    ? new Uint8Array(await src.arrayBuffer())
    : new Uint8Array(await (await fetch(src)).arrayBuffer());
  const img = await rive.decodeImage(bytes);
  prop.value = img;
  img.unref();
}

function setupImageControls(getProp, selectId, images, fileInputId, onSelect) {
  const select = document.getElementById(selectId);
  for (const { label, path } of images) {
    const opt = document.createElement("option");
    opt.value = path;
    opt.textContent = label;
    select.appendChild(opt);
  }
  select.addEventListener("change", () => {
    const prop = getProp();
    if (select.value && prop) {
      loadImageProperty(prop, select.value);
      onSelect?.(select.value);
    }
  });
  document.getElementById(fileInputId).addEventListener("change", (e) => {
    const file = e.target.files[0];
    const prop = getProp();
    if (!file || !prop) return;
    loadImageProperty(prop, file);
    onSelect?.(file);
  });
}

setupImageControls(
  () => packImageProp, "pack-select", PACK_IMAGES, "pack-file-input",
  (src) => {
    carriedPackImage = src;
    activePackLabel  = PACK_IMAGES.find(p => p.path === src)?.label
                       ?? (src instanceof File ? src.name : null);
  }
);

setupImageControls(
  () => cardImageProp, "card-select", CARD_IMAGES, "card-file-input",
  (src) => {
    const entry     = CARD_IMAGES.find(c => c.path === src);
    activeCardLabel = entry?.label ?? (src instanceof File ? src.name : null);
    activeCardSrc   = src instanceof File ? URL.createObjectURL(src) : src;
    if (typeof src === "string") localStorage.setItem("lastCardPath", src);
  }
);

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
