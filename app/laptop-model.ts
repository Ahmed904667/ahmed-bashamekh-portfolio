import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/** A locally generated model and illustrative IDE; no external model or texture downloads. */
export function createLaptop(maxAnisotropy: number) {
  const group = new THREE.Group();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const aluminum = new THREE.MeshPhysicalMaterial({ color: 0xaab4c4, metalness: 0.92, roughness: 0.27, envMapIntensity: 1.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111620, metalness: 0.35, roughness: 0.42 });
  const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x232936, metalness: 0.1, roughness: 0.6 });
  const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x8793a7, metalness: 0.75, roughness: 0.32 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x385cdd, metalness: 0.65, roughness: 0.25 });
  [aluminum, dark, keyMaterial, trackMaterial, accent].forEach((material) => materials.add(material));

  function box(width: number, height: number, depth: number, radius: number, material: THREE.Material, parent: THREE.Group, x = 0, y = 0, z = 0) {
    const geometry = new RoundedBoxGeometry(width, height, depth, 3, radius);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const base = new THREE.Group();
  base.position.y = -0.73;
  group.add(base);
  box(3.48, 0.13, 2.24, 0.055, aluminum, base);
  box(3.3, 0.025, 2.06, 0.035, trackMaterial, base, 0, -0.075, 0);
  box(2.99, 0.018, 0.96, 0.035, dark, base, 0, 0.073, -0.38);
  box(1.15, 0.008, 0.59, 0.028, trackMaterial, base, 0, 0.069, 0.56);
  box(0.47, 0.016, 0.04, 0.007, dark, base, 0, 0.065, 1.1);
  // Reuse a single geometry and material for the entire keyboard.
  const keyGeometry = new RoundedBoxGeometry(0.185, 0.025, 0.145, 2, 0.016);
  geometries.add(keyGeometry);
  const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, 65);
  const matrix = new THREE.Matrix4();
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      matrix.makeTranslation((col - 6) * 0.218, 0.09, -0.72 + row * 0.172);
      keys.setMatrixAt(row * 13 + col, matrix);
    }
  }
  keys.instanceMatrix.needsUpdate = true;
  base.add(keys);
  box(1.15, 0.027, 0.115, 0.017, keyMaterial, base, 0, 0.095, 0.035);
  // Small side ports and a blue hinge give the chassis a believable silhouette.
  box(0.012, 0.035, 0.19, 0.004, dark, base, -1.735, 0, -0.68);
  box(0.012, 0.035, 0.19, 0.004, dark, base, -1.735, 0, -0.37);
  box(2.77, 0.09, 0.13, 0.038, accent, base, 0, 0.045, -1.04);

  const lid = new THREE.Group();
  lid.position.set(0, -0.67, -1.02);
  lid.rotation.x = -0.17;
  group.add(lid);
  box(3.48, 2.19, 0.09, 0.065, aluminum, lid, 0, 1.1, 0);
  box(3.34, 2.06, 0.025, 0.05, dark, lid, 0, 1.1, 0.056);

  const displayCanvas = document.createElement("canvas");
  displayCanvas.width = 1600;
  displayCanvas.height = 1000;
  const ctx = displayCanvas.getContext("2d");
  if (!ctx) throw new Error("Unable to draw the laptop display");
  function rect(x: number, y: number, width: number, height: number, color: string) {
    ctx!.fillStyle = color;
    ctx!.fillRect(x, y, width, height);
  }
  function text(value: string, x: number, y: number, color: string, size = 26, weight = 400) {
    ctx!.font = `${weight} ${size}px ${size < 25 ? "Arial" : "Consolas, monospace"}`;
    ctx!.fillStyle = color;
    ctx!.fillText(value, x, y);
  }
  rect(0, 0, 1600, 1000, "#101622");
  rect(0, 0, 1600, 58, "#1b2332");
  ["#f47f80", "#eac069", "#82c99b"].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(32 + index * 28, 29, 7, 0, Math.PI * 2); ctx.fill();
  });
  text("Ahmed's workspace", 675, 37, "#b6c2d9", 22);
  rect(0, 58, 60, 900, "#171e2b");
  text("⌘", 14, 112, "#a1b6dd", 31);
  text("⌕", 17, 186, "#687b9e", 34);
  text("⑂", 17, 260, "#687b9e", 34);
  text("▷", 17, 335, "#687b9e", 34);
  rect(60, 58, 245, 900, "#141c29");
  text("EXPLORER", 82, 100, "#899bb9", 19, 600);
  text("⌄  portfolio", 82, 157, "#d0dbef", 24);
  text("⌄  app", 96, 208, "#adbed7", 24);
  rect(60, 228, 245, 43, "#243452");
  text("TS  page.tsx", 108, 256, "#a8c9ff", 24);
  text("TS  HeroOrb.tsx", 108, 305, "#9caeca", 22);
  text("#   globals.css", 108, 354, "#9caeca", 22);
  text("⌄  projects", 96, 422, "#adbed7", 24);
  text("   Hassel", 110, 471, "#9caeca", 22);
  text("   Invaro", 110, 516, "#9caeca", 22);
  text("   Qabas", 110, 561, "#9caeca", 22);
  text("   Sanad", 110, 606, "#9caeca", 22);
  rect(305, 58, 1295, 55, "#182131");
  rect(305, 58, 228, 55, "#101622");
  rect(305, 58, 228, 3, "#739cff");
  text("TS  page.tsx    ×", 331, 95, "#c4d6f5", 23);
  text("app  ›  page.tsx  ›  Portfolio", 343, 153, "#859abc", 21);
  const lines: Array<Array<[string, string]>> = [
    [["import ", "#bd9bff"], ["{ craft } ", "#d4def1"], ["from ", "#bd9bff"], ['"./experience";', "#a5dca0"]],
    [],
    [["const ", "#bd9bff"], ["engineer ", "#91baff"], ["= {", "#d4def1"]],
    [['  name: ', "#d4def1"], ['"Ahmed Bashamekh",', "#a5dca0"]],
    [['  focus: ', "#d4def1"], ['"Full-stack development",', "#a5dca0"]],
    [['  location: ', "#d4def1"], ['"Riyadh, SA",', "#a5dca0"]],
    [["};", "#d4def1"]],
    [],
    [["export default function ", "#bd9bff"], ["Portfolio", "#82cde3"], ["() {", "#d4def1"]],
    [["  return ", "#bd9bff"], ["(", "#d4def1"]],
    [["    <", "#7e96b6"], ["Experience ", "#82cde3"]],
    [["      builtWith", "#91baff"], ["={", "#d4def1"], ['"logic"', "#a5dca0"], ["}", "#d4def1"]],
    [["      madeFor", "#91baff"], ["={", "#d4def1"], ['"people"', "#a5dca0"], ["}", "#d4def1"]],
    [["    />", "#7e96b6"]],
    [["  );", "#d4def1"]],
    [["}", "#d4def1"]],
  ];
  rect(305, 649, 1268, 39, "#1b2941");
  lines.forEach((parts, index) => {
    const y = 205 + index * 39;
    text(String(index + 1).padStart(2, " "), 330, y, "#596b89", 25);
    let x = 393;
    parts.forEach(([value, color]) => {
      text(value, x, y, color, 29);
      x += ctx.measureText(value).width;
    });
  });
  rect(879, 659, 2, 29, "#a0c1ff");
  rect(305, 844, 1295, 2, "#283548");
  text("TERMINAL", 340, 879, "#b5c4dd", 18, 600);
  text("PROBLEMS", 500, 879, "#798ca9", 18);
  text("~/portfolio", 345, 929, "#83d9bf", 23);
  text("$ npm run dev", 548, 929, "#c9d8f0", 25);
  rect(0, 966, 1600, 34, "#3159c9");
  text("⑂ main", 22, 990, "#e3edff", 19);
  text("TypeScript React     UTF-8     Ln 12, Col 28", 1090, 990, "#e3edff", 19);

  const texture = new THREE.CanvasTexture(displayCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, maxAnisotropy);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  materials.add(screenMaterial);
  const screenGeometry = new THREE.PlaneGeometry(3.15, 1.97);
  geometries.add(screenGeometry);
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1.09, 0.074);
  lid.add(screen);
  box(0.022, 0.022, 0.01, 0.004, dark, lid, 0, 2.145, 0.06);

  return {
    group,
    setMode(structural: boolean) {
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) material.wireframe = structural;
      });
      screen.visible = !structural;
    },
    dispose() {
      keys.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      texture.dispose();
    },
  };
}
