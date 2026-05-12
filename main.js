const canvas = document.getElementById("rive-canvas");

const r = new rive.Rive({
  src: "rex.riv",
  canvas,
  autoplay: true,
  autoBind: true,
  artboard: "MAIN",
  stateMachines: "REX",
  layout: new rive.Layout({ fit: rive.Fit.Layout }),
  onLoad() {
    r.resizeDrawingSurfaceToCanvas();

    const vmi = r.viewModelInstance;

    const loadComplete = vmi.trigger("loadComplete");
    document.getElementById("btn-load-complete").addEventListener("click", () => {
      loadComplete.trigger();
    });

    document.getElementById("toggle-audio").addEventListener("change", (e) => {
      r.volume = e.target.checked ? 1 : 0;
    });

    setupImageControls(vmi.image("packGraphics"), "pack-select", PACK_IMAGES, "pack-file-input");
    setupImageControls(vmi.image("cardImage"),    "card-select", CARD_IMAGES, "card-file-input");

    const shakeHero = vmi.viewModel("heroPack").trigger("shake");
    document.getElementById("btn-shake-pack3").addEventListener("click", () => {
      shakeHero.trigger();
    });

    const shakeSide1 = vmi.viewModel("pack1").trigger("shake");
    const shakeSide2 = vmi.viewModel("pack2").trigger("shake");
    const shakeSide4 = vmi.viewModel("pack4").trigger("shake");
    const shakeSide5 = vmi.viewModel("pack5").trigger("shake");
    document.getElementById("btn-shake-pack2-4").addEventListener("click", () => {
      shakeSide1.trigger();
      shakeSide2.trigger();
      shakeSide4.trigger();
      shakeSide5.trigger();
    });
  },
});

new ResizeObserver(() => r.resizeDrawingSurfaceToCanvas()).observe(canvas);

document.getElementById("sidebar-toggle").addEventListener("click", () => {
  document.getElementById("controls").classList.toggle("collapsed");
});

// ── Image controls ────────────────────────────────────────────────────────────

const PACK_IMAGES = [
  { label: "PackGraphics_blue",      path: "img/PackGraphics_blue.png" },
  { label: "PackGraphics_goldGreen", path: "img/PackGraphics_goldGreen.png" },
  { label: "PackGraphics_red",       path: "img/PackGraphics_red.png" },
  { label: "PackGraphics_yellow",    path: "img/PackGraphics_yellow.png" },
];

const CARD_IMAGES = [
  { label: "Alakazam",        path: "img/cards/Alakazam.jpeg" },
  { label: "Basculin",        path: "img/cards/Basculin.png" },
  { label: "Blastoise EX",    path: "img/cards/Blastoise EX.png" },
  { label: "Charizard",       path: "img/cards/Charizard.jpeg" },
  { label: "Fire Energy",     path: "img/cards/Fire Energy.jpeg" },
  { label: "Mega Meganium EX",path: "img/cards/Mega Meganium EX.png" },
  { label: "Voltorb",         path: "img/cards/Voltorb.jpeg" },
];

async function loadImageProperty(imageProperty, path) {
  const res = await fetch(path);
  const img = await rive.decodeImage(new Uint8Array(await res.arrayBuffer()));
  imageProperty.value = img;
  img.unref();
}

function setupImageControls(imageProperty, selectId, images, fileInputId) {
  const select = document.getElementById(selectId);
  for (const { label, path } of images) {
    const opt = document.createElement("option");
    opt.value = path;
    opt.textContent = label;
    select.appendChild(opt);
  }

  select.addEventListener("change", () => {
    if (select.value) loadImageProperty(imageProperty, select.value);
  });

  document.getElementById(fileInputId).addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await rive.decodeImage(new Uint8Array(await file.arrayBuffer()));
    imageProperty.value = img;
    img.unref();
  });
}
