const r = new rive.Rive({
  src: "rex.riv",
  canvas: document.getElementById("rive-canvas"),
  autoplay: true,
  autoBind: true,
  artboard: "Main_Mobile",
  stateMachines: "REX",
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

    const packImage = vmi.image("packGraphics");
    setupImageControls(packImage);

    const shakePack3 = vmi.viewModel("pack3").trigger("shake");
    document.getElementById("btn-shake-pack3").addEventListener("click", () => {
      shakePack3.trigger();
    });

    const shakePack2 = vmi.viewModel("pack2").trigger("shake");
    const shakePack4 = vmi.viewModel("pack4").trigger("shake");
    document.getElementById("btn-shake-pack2-4").addEventListener("click", () => {
      shakePack2.trigger();
      shakePack4.trigger();
    });
  },
});

// ── Image controls ────────────────────────────────────────────────────────────

const LOCAL_IMAGES = [
  "PackGraphics_blue",
  "PackGraphics_goldGreen",
  "PackGraphics_red",
  "PackGraphics_yellow",
];

function setupImageControls(imageProperty) {
  const select = document.getElementById("asset-select");
  select.innerHTML = '<option value="">— pick a pack —</option>';
  for (const name of LOCAL_IMAGES) {
    const opt = document.createElement("option");
    opt.value = `img/${name}.png`;
    opt.textContent = name;
    select.appendChild(opt);
  }

  select.addEventListener("change", async () => {
    if (!select.value) return;
    const res = await fetch(select.value);
    const img = await rive.decodeImage(new Uint8Array(await res.arrayBuffer()));
    imageProperty.value = img;
    img.unref();
  });

  document.getElementById("file-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await rive.decodeImage(new Uint8Array(await file.arrayBuffer()));
    imageProperty.value = img;
    img.unref();
  });
}
