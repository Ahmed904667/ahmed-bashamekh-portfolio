import * as THREE from "three";

/** A lightweight, fully volumetric character modeled from Ahmed's reference. */
export function createAvatar() {
  const avatar = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const skin = new THREE.MeshStandardMaterial({ color: "#b97b4e", roughness: 0.65 });
  const hair = new THREE.MeshStandardMaterial({ color: "#242321", roughness: 0.8 });
  const hairHighlight = new THREE.MeshStandardMaterial({ color: "#353330", roughness: 0.75 });
  const jacket = new THREE.MeshStandardMaterial({ color: "#242526", roughness: 0.85 });
  const cream = new THREE.MeshStandardMaterial({ color: "#eee9d9", roughness: 0.9 });
  const white = new THREE.MeshStandardMaterial({ color: "#faf9f3", roughness: 0.75 });
  const denim = new THREE.MeshStandardMaterial({ color: "#72777e", roughness: 0.95 });
  const sole = new THREE.MeshStandardMaterial({ color: "#d8d9d8", roughness: 0.9 });
  const brown = new THREE.MeshStandardMaterial({ color: "#593a26", roughness: 0.45 });
  const pupil = new THREE.MeshStandardMaterial({ color: "#191919", roughness: 0.3 });
  const lip = new THREE.MeshStandardMaterial({ color: "#985c3c", roughness: 0.8 });

  function ellipsoid(parent: THREE.Group, material: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  }
  function curve(parent: THREE.Group, material: THREE.Material, points: number[][], radius: number) {
    const path = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, 24, radius, 8, false), material);
    parent.add(mesh);
    return mesh;
  }
  function body(material: THREE.Material, profile: number[][], x: number, y: number, depth: number) {
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 40), material);
    mesh.position.set(x, y, 0);
    mesh.scale.z = depth;
    avatar.add(mesh);
    return mesh;
  }

  // Loose jeans, layered soles, and rounded sneaker uppers.
  for (const side of [-1, 1]) {
    body(denim, [[0, 0], [.23, 0], [.255, .12], [.27, .5], [.255, .85], [.28, 1.17], [.25, 1.28], [0, 1.29]], side * .255, -1.68, .85);
    ellipsoid(avatar, sole, side * .26, -1.78, .13, .255, .09, .4);
    ellipsoid(avatar, white, side * .26, -1.71, .11, .235, .145, .36);
    for (let i = 0; i < 4; i++) {
      curve(avatar, cream, [[side * .26 - .1, -1.60 - i * .022, .20 + i * .042], [side * .26, -1.585 - i * .022, .22 + i * .042], [side * .26 + .1, -1.60 - i * .022, .20 + i * .042]], .009);
    }
    curve(avatar, sole, [[side * .46, -1.54, .08], [side * .45, -1.1, .17], [side * .46, -.55, .13]], .006);
  }
  body(white, [[0, 0], [.43, 0], [.46, .05], [.45, .24], [.38, .85], [0, .86]], 0, -.44, .64);
  body(jacket, [[0, 0], [.45, 0], [.49, .1], [.47, .38], [.49, .77], [.53, .94], [.42, 1.08], [.26, 1.18], [0, 1.18]], 0, -.34, .64);
  // White shirt visible between the jacket panels.
  ellipsoid(avatar, white, 0, .18, .307, .125, .58, .035);
  for (const side of [-1, 1]) {
    curve(avatar, jacket, [[side * .13, -.30, .32], [side * .12, .12, .345], [side * .13, .55, .32], [side * .19, .76, .22]], .026);
    for (let i = 0; i < 5; i++) ellipsoid(avatar, sole, .16, -.23 + i * .2, .35, .022, .022, .012);
    // Ribbed waistband and striped pocket trim.
    for (let i = 0; i < 2; i++) {
      curve(avatar, cream, [[side * .18, -.28 + i * .045, .30], [side * .34, -.28 + i * .045, .25], [side * .46, -.28 + i * .045, .12]], .016);
      curve(avatar, cream, [[side * (.36 + i * .027), -.07, .25], [side * (.34 + i * .027), .22, .29]], .012);
    }
    const arm = new THREE.Group();
    arm.position.set(side * .47, .60, 0);
    arm.rotation.z = side * .18;
    avatar.add(arm);
    ellipsoid(arm, cream, side * .10, -.32, 0, .19, .43, .19);
    ellipsoid(arm, cream, side * .12, -.64, .02, .16, .33, .17);
    ellipsoid(arm, jacket, side * .12, -.87, .025, .15, .07, .16);
    for (let i = 0; i < 2; i++) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(.151, .151, .017, 24), cream);
      band.position.set(side * .12, -.845 - i * .045, .025);
      arm.add(band);
    }
    ellipsoid(arm, skin, side * .12, -1.04, .025, .115, .18, .065);
    for (let finger = 0; finger < 4; finger++) {
      const x = side * .12 + (finger - 1.5) * .044;
      curve(arm, skin, [[x, -1.08, .045], [x + side * .007, -1.19, .06], [x - side * .01, -1.23 + Math.abs(finger - 1.5) * .025, .085]], .021);
    }
    curve(arm, skin, [[side * .04, -.97, .06], [-side * .015, -1.05, .09], [side * .005, -1.11, .10]], .033);
    // Striped collar follows the open neckline.
    for (let stripe = 0; stripe < 2; stripe++) curve(avatar, cream, [[side * .15, .65, .30], [side * (.24 + stripe * .028), .78, .22], [side * (.22 + stripe * .028), .90, .09]], .015);
  }
  // The varsity letter is a canvas decal; the rest of the avatar is geometry.
  const badgeCanvas = document.createElement("canvas");
  badgeCanvas.width = 128; badgeCanvas.height = 160;
  const badgeContext = badgeCanvas.getContext("2d");
  if (badgeContext) {
    badgeContext.font = "bold 126px Georgia";
    badgeContext.textAlign = "center";
    badgeContext.textBaseline = "middle";
    badgeContext.lineJoin = "round";
    badgeContext.strokeStyle = "#efebde"; badgeContext.lineWidth = 12;
    badgeContext.strokeText("B", 64, 83);
    badgeContext.strokeStyle = "#242526"; badgeContext.lineWidth = 5;
    badgeContext.strokeText("B", 64, 83);
    badgeContext.fillStyle = "#efebde"; badgeContext.fillText("B", 64, 83);
  }
  const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  textures.push(badgeTexture);
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(.22, .27), new THREE.MeshStandardMaterial({ map: badgeTexture, transparent: true, depthWrite: false, roughness: .9 }));
  badge.position.set(.30, .48, .31); badge.rotation.y = .3;
  avatar.add(badge);

  ellipsoid(avatar, skin, 0, .92, 0, .19, .24, .18);
  const head = new THREE.Group();
  avatar.add(head);
  ellipsoid(head, skin, 0, 1.42, 0, .415, .53, .345);
  for (const side of [-1, 1]) {
    ellipsoid(head, skin, side * .414, 1.36, 0, .078, .135, .065);
    ellipsoid(head, lip, side * .447, 1.37, .035, .026, .077, .022);
  }
  // Lower face beard, cheeks and sideburns, with a warm muzzle inset.
  ellipsoid(head, hair, 0, 1.12, .02, .365, .30, .31);
  for (const side of [-1, 1]) {
    ellipsoid(head, hair, side * .33, 1.28, .13, .06, .22, .13);
    ellipsoid(head, skin, side * .19, 1.31, .265, .15, .14, .06);
  }
  ellipsoid(head, skin, 0, 1.18, .311, .23, .12, .063);
  ellipsoid(head, lip, 0, 1.16, .369, .163, .045, .014);
  curve(head, white, [[-.14, 1.18, .377], [0, 1.151, .389], [.14, 1.18, .377]], .015);
  for (const side of [-1, 1]) curve(head, hair, [[0, 1.27, .37], [side * .105, 1.28, .373], [side * .21, 1.245, .34]], .025);
  ellipsoid(head, skin, 0, 1.40, .345, .065, .13, .075);
  ellipsoid(head, skin, 0, 1.32, .40, .082, .055, .056);
  for (const side of [-1, 1]) {
    ellipsoid(head, white, side * .174, 1.51, .312, .113, .056, .036);
    ellipsoid(head, brown, side * .174, 1.509, .344, .045, .046, .013);
    ellipsoid(head, pupil, side * .174, 1.51, .356, .021, .029, .007);
    ellipsoid(head, white, side * .174 - .012, 1.525, .363, .011, .012, .005);
    curve(head, hair, [[side * .072, 1.527, .33], [side * .17, 1.566, .349], [side * .276, 1.526, .30]], .01);
    curve(head, hair, [[side * .075, 1.65, .302], [side * .18, 1.681, .318], [side * .28, 1.646, .273]], .025);
  }
  // Sculpted cap plus swept locks gives the hair depth from every angle.
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * .46), hair);
  cap.position.set(0, 1.66, -.015); cap.scale.set(.435, .42, .365);
  head.add(cap);
  for (let lock = 0; lock < 8; lock++) {
    const x = -.34 + lock * .085;
    curve(head, lock % 3 === 0 ? hairHighlight : hair, [[x, 1.77 + lock * .009, .27], [x + .09, 1.87 + Math.sin(lock * .5) * .07, .32], [x + .12, 1.99, .15], [x + .05, 2.025, -.07]], .042);
  }

  const materials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const wire = new THREE.MeshBasicMaterial({ color: "#315cec", wireframe: true });
  avatar.traverse((object) => { if (object instanceof THREE.Mesh) materials.set(object, object.material); });
  return {
    group: avatar,
    setWireframe(enabled: boolean) {
      materials.forEach((material, mesh) => { mesh.material = enabled ? wire : material; });
      badge.visible = !enabled;
    },
    dispose() {
      const unique = new Set<THREE.Material>();
      materials.forEach((material, mesh) => {
        mesh.geometry.dispose();
        (Array.isArray(material) ? material : [material]).forEach((item) => unique.add(item));
      });
      unique.forEach((material) => material.dispose());
      wire.dispose(); textures.forEach((texture) => texture.dispose());
    },
  };
}
