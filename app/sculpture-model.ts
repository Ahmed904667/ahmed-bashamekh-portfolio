import * as THREE from "three";

/** Preserve the original cobalt-and-silver hero as its own selectable view. */
export function createSculpture() {
  const geometry = new THREE.TorusKnotGeometry(1, 0.285, 240, 32, 2, 3);
  geometry.clearGroups();
  const indicesPerSegment = 32 * 6;
  geometry.addGroup(0, 128 * indicesPerSegment, 0);
  geometry.addGroup(128 * indicesPerSegment, 55 * indicesPerSegment, 1);
  geometry.addGroup(183 * indicesPerSegment, 57 * indicesPerSegment, 0);
  const cobalt = new THREE.MeshPhysicalMaterial({ color: 0x325bf0, metalness: 0.72, roughness: 0.19, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.65 });
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xd7e0ed, metalness: 0.96, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4 });
  const solid = new THREE.Mesh(geometry, [cobalt, silver]);
  const wireGeometry = new THREE.TorusKnotGeometry(1, 0.285, 112, 14, 2, 3);
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x315cec, wireframe: true, transparent: true, opacity: 0.65 });
  const wire = new THREE.Mesh(wireGeometry, wireMaterial);
  wire.visible = false;
  const group = new THREE.Group();
  group.add(solid, wire);
  group.rotation.set(0.28, -0.2, -0.18);
  group.position.y = 0.18;
  return {
    group,
    setWireframe(enabled: boolean) { solid.visible = !enabled; wire.visible = enabled; },
    dispose() { geometry.dispose(); wireGeometry.dispose(); cobalt.dispose(); silver.dispose(); wireMaterial.dispose(); },
  };
}
