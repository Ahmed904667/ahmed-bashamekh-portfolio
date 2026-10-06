import * as THREE from "three";

export interface PortraitControls {
  pause(value: boolean): void;
  wave(): void;
  dispose(): void;
}

/** Reference texture on an extruded relief, with an independent arm and eyes. */
export async function mountPortrait(stage: HTMLDivElement, canvas: HTMLCanvasElement, onReduced: (value: boolean) => void): Promise<PortraitControls> {
  const texture = await new THREE.TextureLoader().loadAsync("/images/ahmed-bust-texture.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch (error) { texture.dispose(); throw error; }
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.9, 1.9, 1.9, -1.9, .1, 30);
  camera.position.set(0, 0, 8);
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const key = new THREE.DirectionalLight(0xfff1de, 1.8);
  key.position.set(-3, 5, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xd9e5ff, .6);
  fill.position.set(4, 1, 4); scene.add(fill);

  // Sample the alpha silhouette to build a closed, textured volume, rather than
  // displaying or replacing whole image frames. UVs remain fixed during waving.
  const sample = document.createElement("canvas");
  const sampleSize = 512;
  sample.width = sample.height = sampleSize;
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) { texture.dispose(); renderer.dispose(); throw new Error("Canvas unavailable"); }
  context.drawImage(texture.image, 0, 0, sampleSize, sampleSize);
  const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
  const divisions = 320;
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  function depth(u: number, v: number) {
    const head = Math.max(0, 1 - ((u - .56) / .23) ** 2 - ((v - .33) / .31) ** 2);
    const torso = Math.max(0, 1 - ((u - .56) / .39) ** 2);
    return .06 + Math.sqrt(head) * .32 + (v > .61 ? Math.sqrt(torso) * .13 : 0);
  }
  for (let y = 0; y <= divisions; y++) for (let x = 0; x <= divisions; x++) {
    const u = x / divisions, v = y / divisions;
    positions.push((u - .5) * 3, (.5 - v) * 3, depth(u, v));
    uv.push(u, 1 - v);
  }
  const count = positions.length / 3;
  for (let i = 0; i < count; i++) { positions.push(positions[i * 3], positions[i * 3 + 1], -.16); uv.push(uv[i * 2], uv[i * 2 + 1]); }
  function opaque(index: number) {
    const x = Math.min(sampleSize - 1, Math.round(index % (divisions + 1) / divisions * (sampleSize - 1)));
    const y = Math.min(sampleSize - 1, Math.round(Math.floor(index / (divisions + 1)) / divisions * (sampleSize - 1)));
    return pixels[(y * sampleSize + x) * 4 + 3] > 25;
  }
  const edges = new Map<string, [number, number, number]>();
  function triangle(a: number, b: number, c: number) {
    if (!opaque(a) || !opaque(b) || !opaque(c)) return;
    indices.push(a, b, c);
    for (const [start, end] of [[a, b], [b, c], [c, a]]) {
      const id = `${Math.min(start, end)}:${Math.max(start, end)}`;
      const edge = edges.get(id);
      if (edge) edge[2]++; else edges.set(id, [start, end, 1]);
    }
  }
  for (let y = 0; y < divisions; y++) for (let x = 0; x < divisions; x++) {
    const a = y * (divisions + 1) + x, b = a + 1, c = a + divisions + 1, d = c + 1;
    triangle(a, c, b); triangle(b, c, d);
  }
  const frontCount = indices.length;
  for (let i = 0; i < frontCount; i += 3) indices.push(indices[i] + count, indices[i + 2] + count, indices[i + 1] + count);
  edges.forEach(([a, b, occurrences]) => { if (occurrences === 1) indices.push(a, b, a + count, b, b + count, a + count); });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  geometry.addGroup(0, frontCount, 0); geometry.addGroup(frontCount, indices.length - frontCount, 1);
  const portrait = new THREE.Mesh(geometry, [new THREE.MeshBasicMaterial({ map: texture, alphaTest: .4 }), new THREE.MeshStandardMaterial({ color: "#252526", roughness: .85 })]);
  scene.add(portrait);

  const skin = new THREE.MeshStandardMaterial({ color: "#c88b58", roughness: .65 });
  const sleeve = new THREE.MeshStandardMaterial({ color: "#eee8d8", roughness: .88 });
  const knit = new THREE.MeshStandardMaterial({ color: "#292827", roughness: .95 });
  const nail = new THREE.MeshStandardMaterial({ color: "#dba678", roughness: .7 });
  const white = new THREE.MeshBasicMaterial({ color: "#fff8ec" });
  const iris = new THREE.MeshBasicMaterial({ color: "#68442b" });
  const dark = new THREE.MeshBasicMaterial({ color: "#231b16" });
  function ellipsoid(parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]); parent.add(mesh); return mesh;
  }
  function segment(parent: THREE.Object3D, material: THREE.Material, from: number[], to: number[], radius: number) {
    const start = new THREE.Vector3(...from as [number, number, number]), end = new THREE.Vector3(...to as [number, number, number]);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(.01, start.distanceTo(end) - radius * 2), 8, 20), material);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    parent.add(mesh); return mesh;
  }
  const arm = new THREE.Group(); arm.position.set(-.63, -.46, .15); scene.add(arm);
  segment(arm, sleeve, [0, 0, 0], [-.36, -.37, .04], .19);
  ellipsoid(arm, sleeve, [-.36, -.37, .04], [.20, .20, .18]);
  const forearm = new THREE.Group(); forearm.position.set(-.36, -.37, .04); arm.add(forearm);
  segment(forearm, sleeve, [0, 0, 0], [-.05, .79, .13], .15);
  // Independently articulated wrist: no movement is applied to the bust.
  const wrist = new THREE.Group(); wrist.position.set(-.05, .76, .13); forearm.add(wrist);
  for (let stripe = 0; stripe < 5; stripe++) {
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.139, .148, .028, 32), stripe % 2 ? sleeve : knit);
    cuff.position.y = stripe * .027; wrist.add(cuff);
  }
  const hand = new THREE.Group(); hand.position.y = .17; wrist.add(hand);
  hand.scale.setScalar(1.13);
  ellipsoid(hand, skin, [0, .12, 0], [.145, .18, .057]);
  const fingerLengths = [.25, .32, .29, .22];
  for (let i = 0; i < 4; i++) {
    const x = -.105 + i * .068, spread = (i - 1.5) * .038, tipY = .25 + fingerLengths[i];
    segment(hand, skin, [x, .20, 0], [x + spread, tipY, -.005], .029);
    ellipsoid(hand, nail, [x + spread, tipY - .025, -.029], [.019, .026, .006]);
  }
  segment(hand, skin, [.12, .12, 0], [.25, .26, .012], .042);
  ellipsoid(hand, skin, [.23, .25, .012], [.047, .064, .04]);

  // Independent irises sit inside the original eye whites. Their movement is
  // clamped inside the eyelids and damped, so the head never follows the cursor.
  // Clip eye overlays against the white pixels of the reference sockets. This
  // keeps even the largest gaze offsets behind the original eyelid silhouettes.
  for (const material of [iris, dark, white]) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.portraitMask = { value: texture };
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 socketUv;");
      shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 socketWorld = modelMatrix * vec4(transformed, 1.0);\nsocketUv = vec2(socketWorld.x / 3.0 + 0.5, socketWorld.y / 3.0 + 0.5);");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D portraitMask;\nvarying vec2 socketUv;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nvec3 socketColor = texture2D(portraitMask, socketUv).rgb;\nif (min(socketColor.r, min(socketColor.g, socketColor.b)) < 0.80) discard;");
    };
    material.customProgramCacheKey = () => "reference-eye-mask-v1";
  }
  const eyeGroups: THREE.Group[] = [];
  for (const [u, v] of [[.456, .303], [.614, .301]]) {
    const eye = new THREE.Group();
    eye.position.set((u - .5) * 3, (.5 - v) * 3, depth(u, v) + .005);
    ellipsoid(eye, iris, [0, 0, 0], [.059, .064, .024]);
    ellipsoid(eye, dark, [0, 0, .023], [.028, .039, .009]);
    ellipsoid(eye, white, [-.018, .023, .032], [.012, .014, .005]);
    scene.add(eye); eyeGroups.push(eye);
  }
  const eyeOrigins = eyeGroups.map((eye) => eye.position.clone());
  let targetX = 0, targetY = 0, gazeX = 0, gazeY = 0;
  let disposed = false, paused = false, visible = true;
  let waveTime = 0, previous = 0;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = media.matches; onReduced(reduced);
  function render() { if (!disposed) renderer.render(scene, camera); }
  function animate(time: number) {
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
    if (!paused && !reduced) waveTime += dt;
    const damping = 1 - Math.exp(-12 * dt);
    gazeX += (targetX - gazeX) * damping; gazeY += (targetY - gazeY) * damping;
    eyeGroups.forEach((eye, i) => { eye.position.x = eyeOrigins[i].x + gazeX * .035; eye.position.y = eyeOrigins[i].y + gazeY * .019; });
    if (!paused && !reduced) {
      const cycle = waveTime % 6;
      const envelope = cycle < 2.5 ? Math.sin(Math.PI * cycle / 2.5) ** 2 : 0;
      const wristTarget = Math.sin(cycle * Math.PI * 3.2) * .27 * envelope;
      const armTarget = Math.sin(cycle * Math.PI * 3.2 + .2) * .07 * envelope;
      wrist.rotation.z += (wristTarget - wrist.rotation.z) * damping;
      forearm.rotation.z += (armTarget - forearm.rotation.z) * damping;
    }
    render();
  }
  function loop() { previous = 0; renderer.setAnimationLoop(visible && !document.hidden && !reduced ? animate : null); render(); }
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    const aspect = width / height, halfHeight = Math.max(1.67, 1.67 / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix(); render();
  }
  function pointer(event: globalThis.PointerEvent) {
    if (reduced || event.pointerType === "touch") return;
    const bounds = stage.getBoundingClientRect();
    const faceX = bounds.left + bounds.width * .56, faceY = bounds.top + bounds.height * .34;
    targetX = THREE.MathUtils.clamp((event.clientX - faceX) / (bounds.width * .65), -1, 1);
    targetY = THREE.MathUtils.clamp((faceY - event.clientY) / (bounds.height * .65), -1, 1);
  }
  function center() { targetX = targetY = 0; }
  function preference(event: MediaQueryListEvent) { reduced = event.matches; onReduced(reduced); if (reduced) { center(); eyeGroups.forEach((eye, i) => eye.position.copy(eyeOrigins[i])); wrist.rotation.z = forearm.rotation.z = 0; } loop(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop(); }); intersectionObserver.observe(stage);
  window.addEventListener("pointermove", pointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", center);
  window.addEventListener("blur", center);
  document.addEventListener("visibilitychange", loop);
  media.addEventListener("change", preference);
  resize(); loop();
  return {
    pause(value) { paused = value; },
    wave() { paused = false; waveTime = 0; },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      window.removeEventListener("pointermove", pointer); window.removeEventListener("blur", center);
      document.documentElement.removeEventListener("pointerleave", center);
      document.removeEventListener("visibilitychange", loop); media.removeEventListener("change", preference);
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material)); } });
      materials.forEach((material) => material.dispose()); texture.dispose(); renderer.dispose();
    },
  };
}
