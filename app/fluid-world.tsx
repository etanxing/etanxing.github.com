'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

export function FluidWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.055);
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0, 0, 12);

    const world = new THREE.Group();
    scene.add(world);

    const coral = new THREE.MeshPhysicalMaterial({
      color: 0xff4c30,
      emissive: 0x521006,
      emissiveIntensity: 0.7,
      metalness: 0.28,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const cobalt = new THREE.MeshPhysicalMaterial({
      color: 0x4a59ff,
      emissive: 0x10175f,
      emissiveIntensity: 0.85,
      metalness: 0.4,
      roughness: 0.16,
      clearcoat: 0.9,
    });
    const acid = new THREE.MeshPhysicalMaterial({
      color: 0xc9ff35,
      emissive: 0x526d08,
      emissiveIntensity: 1.1,
      metalness: 0.1,
      roughness: 0.22,
      clearcoat: 1,
    });
    const porcelain = new THREE.MeshPhysicalMaterial({
      color: 0xf1ede4,
      emissive: 0x191713,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1,
      transmission: 0.08,
    });

    scene.add(new THREE.HemisphereLight(0xf1ede4, 0x080811, 2.2));
    const coralLight = new THREE.PointLight(0xff4c30, 55, 22, 1.5);
    coralLight.position.set(-5, 3, 5);
    scene.add(coralLight);
    const blueLight = new THREE.PointLight(0x4a59ff, 48, 22, 1.5);
    blueLight.position.set(5, -2, 4);
    scene.add(blueLight);
    const acidLight = new THREE.PointLight(0xc9ff35, 34, 16, 1.5);
    acidLight.position.set(0, 5, 2);
    scene.add(acidLight);

    const xGroup = new THREE.Group();
    const barGeometry = new RoundedBoxGeometry(4.3, 0.92, 0.86, 8, 0.19);
    const barA = new THREE.Mesh(barGeometry, coral);
    const barB = new THREE.Mesh(barGeometry, coral);
    barA.rotation.z = Math.PI / 4;
    barB.rotation.z = -Math.PI / 4;
    xGroup.add(barA, barB);

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.27, 3), acid);
    core.position.z = 0.72;
    xGroup.add(core);
    world.add(xGroup);

    const orbitalGroup = new THREE.Group();
    const ringPaper = porcelain.clone();
    const ringBlue = cobalt.clone();
    const ringAcid = acid.clone();
    [ringPaper, ringBlue, ringAcid].forEach((material) => {
      material.transparent = true;
      material.depthWrite = false;
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.026, 12, 180), ringPaper);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.045, 12, 160), ringBlue);
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.018, 10, 200), ringAcid);
    ringA.rotation.set(1.17, 0.12, 0.38);
    ringB.rotation.set(0.55, 0.9, -0.28);
    ringC.rotation.set(1.4, -0.4, 0.7);
    orbitalGroup.add(ringA, ringB, ringC);
    world.add(orbitalGroup);

    const liquidUniforms = {
      uTime: { value: 0 },
      uEnergy: { value: 0.2 },
      uScroll: { value: 0 },
      uOpacity: { value: 0.24 },
    };
    const liquidMaterial = new THREE.ShaderMaterial({
      uniforms: liquidUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `
        uniform float uTime;
        uniform float uEnergy;
        uniform float uScroll;
        uniform float uOpacity;
        varying vec3 vNormalWorld;
        varying vec3 vWorld;
        varying float vWave;
        void main() {
          float waveA = sin(position.y * 3.4 + uTime * 1.15 + uScroll * 5.0);
          float waveB = sin(position.x * 4.2 - uTime * 0.86);
          float waveC = cos(position.z * 3.1 + uTime * 0.7);
          float wave = (waveA + waveB + waveC) / 3.0;
          vec3 moved = position + normal * wave * (0.16 + uEnergy * 0.22);
          vec4 worldPosition = modelMatrix * vec4(moved, 1.0);
          vWorld = worldPosition.xyz;
          vNormalWorld = normalize(mat3(modelMatrix) * normal);
          vWave = wave;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform float uOpacity;
        varying vec3 vNormalWorld;
        varying vec3 vWorld;
        varying float vWave;
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorld);
          float fresnel = pow(1.0 - abs(dot(normalize(vNormalWorld), viewDirection)), 2.25);
          vec3 coral = vec3(1.0, 0.14, 0.065);
          vec3 blue = vec3(0.07, 0.12, 1.0);
          vec3 acid = vec3(0.58, 1.0, 0.03);
          vec3 color = mix(coral, blue, clamp(vWave * 0.5 + 0.5 + uScroll * 0.28, 0.0, 1.0));
          color = mix(color, acid, fresnel * (0.28 + 0.2 * sin(uTime)));
          float alpha = 0.08 + fresnel * 0.7;
          gl_FragColor = vec4(color, alpha * uOpacity);
        }
      `,
    });
    const liquid = new THREE.Mesh(new THREE.SphereGeometry(2.48, 96, 64), liquidMaterial);
    liquid.position.z = -1.4;
    world.add(liquid);

    const strandPoints = Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 17) * Math.PI * 2.2;
      return new THREE.Vector3(Math.cos(angle) * (3.8 + index * 0.08), (index - 8.5) * 0.43, Math.sin(angle) * 1.8 - 1.5);
    });
    const strandMaterial = acid.clone();
    strandMaterial.transparent = true;
    strandMaterial.depthWrite = false;
    const strand = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPoints), 220, 0.022, 8, false),
      strandMaterial,
    );
    world.add(strand);

    const particleCount = 240;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 4.8 + ((index * 67) % 700) / 100;
      const angle = index * 2.39996;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = (((index * 113) % 1000) / 1000 - 0.5) * 13;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius - 2;
      particleSeeds[index] = (index % 97) / 97;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(particleSeeds, 1));
    const particleUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uEnergy: { value: 0 },
      uOpacity: { value: 0.25 },
    };
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uScroll;
        uniform float uEnergy;
        uniform float uOpacity;
        varying float vSeed;
        void main() {
          vec3 moved = position;
          float angle = uTime * (0.08 + aSeed * 0.08) + uScroll * 5.0;
          mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          moved.xz = turn * moved.xz;
          moved.y += sin(uTime * 0.5 + aSeed * 24.0) * (0.22 + uEnergy * 0.4);
          vec4 mvPosition = modelViewMatrix * vec4(moved, 1.0);
          gl_PointSize = (2.0 + aSeed * 4.5 + uEnergy * 3.0) * (9.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vSeed = aSeed;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vSeed;
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float distanceToCenter = length(center);
          if (distanceToCenter > 0.5) discard;
          vec3 coral = vec3(1.0, 0.18, 0.08);
          vec3 blue = vec3(0.12, 0.2, 1.0);
          vec3 acid = vec3(0.62, 1.0, 0.05);
          vec3 color = vSeed > 0.82 ? acid : mix(coral, blue, vSeed);
          gl_FragColor = vec4(color, (1.0 - distanceToCenter * 2.0) * 0.82 * uOpacity);
        }
      `,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    world.add(particles);

    const floaters = new THREE.Group();
    const floaterMaterials = [coral, cobalt, acid, porcelain];
    for (let index = 0; index < 10; index += 1) {
      const type = index % 4;
      const geometry: THREE.BufferGeometry = type === 0
        ? new THREE.IcosahedronGeometry(0.16 + (index % 3) * 0.05, 1)
        : type === 1
          ? new THREE.TorusGeometry(0.22, 0.055, 8, 24)
          : type === 2
            ? new THREE.OctahedronGeometry(0.22, 0)
            : new RoundedBoxGeometry(0.28, 0.28, 0.28, 3, 0.06);
      const mesh = new THREE.Mesh(geometry, floaterMaterials[type]);
      const angle = index * 2.39996;
      const radius = 4.4 + (index % 6) * 0.72;
      mesh.userData = { angle, radius, height: ((index * 7) % 13) - 6, speed: 0.08 + (index % 5) * 0.018 };
      floaters.add(mesh);
    }
    world.add(floaters);

    const echoMaterial = new THREE.MeshBasicMaterial({ color: 0xc9ff35, wireframe: true, transparent: true, opacity: 0 });
    const echoes = new THREE.Group();
    for (let index = 0; index < 5; index += 1) {
      const echo = new THREE.Group();
      const first = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.22, 0.18, 3, 0.04), echoMaterial);
      const second = first.clone();
      first.rotation.z = Math.PI / 4;
      second.rotation.z = -Math.PI / 4;
      echo.add(first, second);
      const angle = (index / 5) * Math.PI * 2;
      echo.position.set(Math.cos(angle) * 6, Math.sin(angle) * 3.6, -1 + (index % 3));
      echo.userData = { angle };
      echoes.add(echo);
    }
    world.add(echoes);

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let lastScrollY = window.scrollY;
    let scrollEnergy = 0;
    let impulse = 0;
    let animation = 0;
    const startedAt = performance.now();

    const updateScroll = () => {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScroll = clamp(window.scrollY / available);
      scrollEnergy = Math.min(1.4, scrollEnergy + Math.abs(window.scrollY - lastScrollY) / 90);
      lastScrollY = window.scrollY;
    };
    const updatePointer = (event: PointerEvent) => {
      pointerTargetX = event.clientX / window.innerWidth - 0.5;
      pointerTargetY = event.clientY / window.innerHeight - 0.5;
    };
    const burst = () => { impulse = 1.8; };
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };

    const render = () => {
      const elapsed = reduceMotion ? 1.2 : (performance.now() - startedAt) / 1000;
      pointerX += (pointerTargetX - pointerX) * 0.055;
      pointerY += (pointerTargetY - pointerY) * 0.055;
      smoothScroll += (targetScroll - smoothScroll) * 0.038;
      scrollEnergy *= 0.925;
      impulse *= 0.91;
      const energy = scrollEnergy + impulse;

      const heroFocus = 1 - smoothstep(0.13, 0.23, smoothScroll);
      const multiplyFocus = smoothstep(0.12, 0.21, smoothScroll) * (1 - smoothstep(0.34, 0.43, smoothScroll));
      const connectionFocus = smoothstep(0.34, 0.43, smoothScroll) * (1 - smoothstep(0.55, 0.64, smoothScroll));
      const everyoneFocus = smoothstep(0.55, 0.64, smoothScroll) * (1 - smoothstep(0.76, 0.85, smoothScroll));
      const finalFocus = smoothstep(0.76, 0.87, smoothScroll);

      const split = multiplyFocus * 0.62 + energy * 0.035;
      barA.position.x = -split;
      barB.position.x = split;
      barA.position.z = multiplyFocus * 0.34;
      barB.position.z = -barA.position.z;
      xGroup.rotation.x = elapsed * 0.045 + pointerY * 0.24 + smoothScroll * Math.PI * 0.52;
      xGroup.rotation.y = elapsed * 0.07 + pointerX * 0.34 + smoothScroll * Math.PI * 0.82;
      xGroup.rotation.z = Math.sin(elapsed * 0.28) * 0.035;
      xGroup.scale.setScalar(0.84 + heroFocus * 0.16 + finalFocus * 0.14 - everyoneFocus * 0.1 + impulse * 0.08);
      xGroup.position.x = connectionFocus * 1.08 - finalFocus * 0.38;
      xGroup.position.y = multiplyFocus * 0.28 - everyoneFocus * 0.32;

      core.scale.setScalar(1 + Math.sin(elapsed * 2.1) * 0.1 + energy * 0.25);
      ringPaper.opacity = heroFocus * 0.58;
      ringBlue.opacity = heroFocus * 0.64;
      ringAcid.opacity = heroFocus * 0.46;
      orbitalGroup.rotation.x = elapsed * 0.035 + pointerY * 0.12;
      orbitalGroup.rotation.y = elapsed * -0.04 + pointerX * 0.24;
      orbitalGroup.scale.setScalar(0.92 + heroFocus * 0.08);
      ringA.rotation.z += reduceMotion ? 0 : 0.0008 + energy * 0.0015;
      ringB.rotation.z -= reduceMotion ? 0 : 0.001 + energy * 0.0012;
      ringC.rotation.z += reduceMotion ? 0 : 0.00055;

      liquidUniforms.uTime.value = elapsed;
      liquidUniforms.uEnergy.value += (0.14 + energy * 0.55 - liquidUniforms.uEnergy.value) * 0.06;
      liquidUniforms.uScroll.value = smoothScroll;
      liquidUniforms.uOpacity.value = 0.08 + multiplyFocus * 0.8 + finalFocus * 0.12;
      liquid.rotation.y = elapsed * -0.045 + multiplyFocus * 0.7;
      liquid.rotation.x = pointerY * 0.14;
      liquid.scale.setScalar(0.96 + multiplyFocus * 0.32 + impulse * 0.07);

      particleUniforms.uTime.value = elapsed;
      particleUniforms.uScroll.value = smoothScroll;
      particleUniforms.uEnergy.value += (energy * 0.6 - particleUniforms.uEnergy.value) * 0.08;
      particleUniforms.uOpacity.value = 0.09 + heroFocus * 0.2 + connectionFocus * 0.16 + everyoneFocus * 0.1;
      particles.rotation.z = elapsed * 0.005;
      particles.rotation.x = pointerY * 0.06;

      const floaterFocus = Math.max(connectionFocus, everyoneFocus * 0.65);
      floaters.visible = floaterFocus > 0.01;
      floaters.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const data = mesh.userData as { angle: number; radius: number; height: number; speed: number };
        const angle = data.angle + elapsed * data.speed * 0.42 + smoothScroll * Math.PI * 0.7;
        const gather = 0.72 + everyoneFocus * 0.12 - finalFocus * 0.25;
        mesh.position.set(
          Math.cos(angle) * data.radius * gather,
          data.height * 0.42 * gather + Math.sin(angle * 1.7) * 0.24,
          Math.sin(angle) * data.radius * 0.42 - 1.5,
        );
        mesh.rotation.x = elapsed * (0.07 + index * 0.002);
        mesh.rotation.y = elapsed * (0.09 + index * 0.002);
        mesh.scale.setScalar(floaterFocus * (0.78 + energy * 0.08));
      });

      echoMaterial.opacity = everyoneFocus * 0.34;
      echoes.children.forEach((child, index) => {
        const echo = child as THREE.Group;
        const angle = echo.userData.angle + elapsed * 0.025 + smoothScroll * 0.8;
        echo.position.x = Math.cos(angle) * 4.4;
        echo.position.y = Math.sin(angle) * 2.7;
        echo.rotation.x = elapsed * 0.045 + index;
        echo.rotation.y = elapsed * -0.035 + smoothScroll;
      });

      strandMaterial.opacity = heroFocus * 0.28 + multiplyFocus * 0.46;
      strand.rotation.y = elapsed * 0.025 + multiplyFocus * 0.7;
      strand.rotation.z = pointerX * 0.07;
      world.rotation.z = multiplyFocus * 0.045 - everyoneFocus * 0.035;
      world.position.z = multiplyFocus * 0.45 - finalFocus * 0.28;

      camera.position.x = pointerX * 0.42 + connectionFocus * 0.34 - everyoneFocus * 0.18;
      camera.position.y = pointerY * -0.34 + multiplyFocus * 0.18 - everyoneFocus * 0.12;
      camera.position.z = 12.2 - multiplyFocus * 0.72 - connectionFocus * 0.38 + finalFocus * 0.2 - energy * 0.1;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!reduceMotion) animation = requestAnimationFrame(render);
    };

    updateScroll();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('ixux-burst', burst);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('ixux-burst', burst);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas className="world-canvas" ref={canvasRef} aria-hidden="true" />;
}
