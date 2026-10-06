import * as THREE from "three";
import { createAvatar } from "./avatar-model";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createLaptop } from "./laptop-model";
import { createSculpture } from "./sculpture-model";

export type SculptureMode = "surface" | "structure";
export type SculptureView = "sculpture" | "laptop" | "avatar";
export interface SculptureControls {
  setView(view: SculptureView): void;
  setMode(mode: SculptureMode): void;
  setPaused(paused: boolean): void;
  rotate(x: number, y: number): void;
  hover(x: number, y: number): void;
  reset(): void;
  dispose(): void;
}

export function mountSculpture(
  stage: HTMLDivElement,
  canvas: HTMLCanvasElement,
  onReducedMotion: (reduced: boolean) => void,
): SculptureControls {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, stage.clientWidth < 600 ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0.1, 7.1);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.035);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const light = new THREE.DirectionalLight(0xf1f4ff, 3);
  light.position.set(-3, 4, 5);
  scene.add(light);
  const fill = new THREE.DirectionalLight(0xdbe6ff, 1.2);
  fill.position.set(4, -2, 2);
  scene.add(fill);

  // Ahmed explicitly requested all three views. Keep model factories independent.
  const original = createSculpture();
  const sculpture = original.group;
  scene.add(sculpture);
  let view: SculptureView = "sculpture";
  let mode: SculptureMode = "surface";
  let laptop: ReturnType<typeof createLaptop> | null = null;
  let avatar: ReturnType<typeof createAvatar> | null = null;
  function activeModel() {
    if (view === "laptop" && laptop) return laptop.group;
    if (view === "avatar" && avatar) return avatar.group;
    return sculpture;
  }

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(25,40,80,.23)");
    gradient.addColorStop(0.5, "rgba(25,40,80,.07)");
    gradient.addColorStop(1, "rgba(25,40,80,0)");
    shadowContext.fillStyle = gradient;
    shadowContext.fillRect(0, 0, 128, 128);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.SpriteMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  const shadow = new THREE.Sprite(shadowMaterial);
  shadow.position.set(0, -1.88, -0.4);
  shadow.scale.set(2.6, 0.38, 1);
  scene.add(shadow);

  let disposed = false;
  let paused = false;
  let visible = true;
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pitch = 0.28;
  let yaw = -0.2;
  let hoverX = 0;
  let hoverY = 0;
  let previousFrame = 0;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  onReducedMotion(reduced);

  function renderStill() {
    if (disposed) return;
    activeModel().rotation.x = pitch + hoverY;
    activeModel().rotation.y = yaw + hoverX;
    renderer.render(scene, camera);
  }

  function animate(time: number) {
    const delta = previousFrame ? Math.min((time - previousFrame) / 1000, 0.045) : 0;
    previousFrame = time;
    if (view === "sculpture") yaw += delta * 0.065;
    const idleSway = view === "avatar" ? Math.sin(time * 0.00055) * 0.045 : 0;
    const damping = 1 - Math.exp(-9 * delta);
    const model = activeModel();
    model.rotation.x += (pitch + hoverY - model.rotation.x) * damping;
    model.rotation.y += (yaw + hoverX + idleSway - model.rotation.y) * damping;
    if (view === "laptop") model.position.y = Math.sin(time * 0.0007) * 0.025;
    renderer.render(scene, camera);
  }

  function syncLoop() {
    if (disposed) return;
    previousFrame = 0;
    renderer.setAnimationLoop(!paused && !reduced && visible && !document.hidden ? animate : null);
    renderStill();
  }
  function resize() {
    if (disposed) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.25 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const distance = view === "laptop" ? (camera.aspect < 0.88 ? 7.2 : 6.35) : view === "avatar" ? Math.max(8.6, 4.6 / camera.aspect) : (camera.aspect < 0.88 ? 8.3 : 7.1);
    camera.position.set(0, view === "laptop" ? 0.95 : 0.1, distance);
    camera.lookAt(0, view === "laptop" ? 0.2 : 0.1, 0);
    camera.updateProjectionMatrix();
    renderStill();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncLoop();
  }, { rootMargin: "80px" });
  intersectionObserver.observe(stage);
  function handlePreference(event: MediaQueryListEvent) {
    reduced = event.matches;
    onReducedMotion(reduced);
    syncLoop();
  }
  media.addEventListener("change", handlePreference);
  document.addEventListener("visibilitychange", syncLoop);
  function handleContextLoss(event: Event) {
    event.preventDefault();
    renderer.setAnimationLoop(null);
  }
  canvas.addEventListener("webglcontextlost", handleContextLoss);
  canvas.addEventListener("webglcontextrestored", syncLoop);
  resize();
  syncLoop();

  function resetView() {
    pitch = view === "laptop" ? 0.12 : view === "avatar" ? 0 : 0.28;
    yaw = view === "laptop" ? -0.32 : view === "avatar" ? -0.12 : -0.2;
    hoverX = 0;
    hoverY = 0;
    activeModel().position.y = view === "sculpture" ? 0.18 : 0;
    renderStill();
  }

  return {
    setView(nextView) {
      if (nextView === "laptop" && !laptop) {
        laptop = createLaptop(renderer.capabilities.getMaxAnisotropy());
        scene.add(laptop.group);
      }
      if (nextView === "avatar" && !avatar) { avatar = createAvatar(); scene.add(avatar.group); }
      view = nextView;
      sculpture.visible = view === "sculpture";
      if (laptop) { laptop.group.visible = view === "laptop"; laptop.setMode(mode === "structure"); }
      if (avatar) { avatar.group.visible = view === "avatar"; avatar.setWireframe(mode === "structure"); }
      renderer.toneMappingExposure = view === "avatar" ? 1.05 : 1.35;
      fill.color.set(view === "avatar" ? 0xdbe6ff : 0x90afff);
      shadow.position.y = view === "laptop" ? -1.08 : view === "avatar" ? -1.88 : -1.66;
      shadow.scale.set(view === "avatar" ? 2.6 : 4.1, view === "avatar" ? 0.38 : 0.78, 1);
      resetView();
      resize();
    },
    setMode(nextMode) { mode = nextMode; original.setWireframe(mode === "structure"); avatar?.setWireframe(mode === "structure"); laptop?.setMode(mode === "structure"); renderStill(); },
    setPaused(value) { paused = value; syncLoop(); },
    rotate(x, y) {
      pitch = THREE.MathUtils.clamp(pitch + y, view === "laptop" ? -0.55 : -1.1, view === "laptop" ? 0.8 : 1.1);
      yaw += x;
      if (paused || reduced) renderStill();
    },
    hover(x, y) { hoverX = x * 0.12; hoverY = y * 0.1; if (paused || reduced) renderStill(); },
    reset: resetView,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      media.removeEventListener("change", handlePreference);
      document.removeEventListener("visibilitychange", syncLoop);
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
      canvas.removeEventListener("webglcontextrestored", syncLoop);
      original.dispose();
      avatar?.dispose();
      shadowMaterial.dispose(); shadowTexture.dispose(); environment.dispose();
      laptop?.dispose();
      renderer.dispose();
    },
  };
}
