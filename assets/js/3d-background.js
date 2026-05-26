/**
 * 3D Interactive Background - SnapFolio Portfolio
 * Galaxy particle system with scroll-driven camera & geometry animations
 * Uses Three.js loaded via CDN (injected by 3d-background.js init)
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const CFG = {
    particles: 6000,
    particleSize: 1.4,
    galaxyRadius: 35,
    galaxySpirals: 4,
    galaxySpread: 2.5,
    colors: {
      inner:  0x6c63ff,   // vivid violet
      mid:    0x00c3ff,   // electric blue
      outer:  0xff6584,   // coral pink
      star:   0xffffff,   // white stars
    },
    scrollSpeed: 0.0018,
    rotationSpeed: 0.00025,
    floatAmplitude: 0.12,
    floatFrequency: 0.4,
    mouseParallax: 0.006,
  };

  // ─── WAIT FOR THREE.JS ──────────────────────────────────────────────────────
  function waitForThree(cb, tries = 0) {
    if (typeof THREE !== 'undefined') { cb(); return; }
    if (tries > 80) { console.warn('[3D-BG] Three.js not found after 8s'); return; }
    setTimeout(() => waitForThree(cb, tries + 1), 100);
  }

  // ─── MAIN INIT ──────────────────────────────────────────────────────────────
  function init() {
    const canvas = document.getElementById('bg3d-canvas');
    if (!canvas) return;
    const root = document.documentElement;
    const triggerSection = document.getElementById('about') || document.getElementById('skills');
    const holdSection = document.getElementById('portfolio') || document.getElementById('services');

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 8, 28);
    camera.lookAt(0, 0, 0);

    // ── Galaxy Particle System ────────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    const positions  = new Float32Array(CFG.particles * 3);
    const colors     = new Float32Array(CFG.particles * 3);
    const sizes      = new Float32Array(CFG.particles);
    const phases     = new Float32Array(CFG.particles); // for individual float

    const colorInner = new THREE.Color(CFG.colors.inner);
    const colorMid   = new THREE.Color(CFG.colors.mid);
    const colorOuter = new THREE.Color(CFG.colors.outer);
    const colorStar  = new THREE.Color(CFG.colors.star);

    for (let i = 0; i < CFG.particles; i++) {
      const i3 = i * 3;

      // Assign ~15% as pure "stars" scattered far out
      if (i < CFG.particles * 0.15) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = 30 + Math.random() * 70;
        positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
        positions[i3 + 2] = r * Math.cos(phi);
        colorStar.toArray(colors, i3);
        sizes[i] = 0.4 + Math.random() * 0.8;
      } else {
        // Galaxy arms
        const t       = Math.random();               // 0→1 along radius
        const radius  = t * CFG.galaxyRadius;
        const arm     = Math.floor(Math.random() * CFG.galaxySpirals);
        const angle   = (arm / CFG.galaxySpirals) * Math.PI * 2;
        const spinAngle = radius * 0.35;             // tighter spiral
        const spread  = (Math.random() - 0.5) * CFG.galaxySpread * (1 - t * 0.5);
        const spreadY = (Math.random() - 0.5) * 1.2 * (1 - t * 0.7);

        positions[i3]     = Math.cos(angle + spinAngle) * radius + spread;
        positions[i3 + 1] = spreadY;
        positions[i3 + 2] = Math.sin(angle + spinAngle) * radius + spread;

        // Colour: blend inner→mid→outer based on radius
        const mixColor = new THREE.Color();
        if (t < 0.35) {
          mixColor.lerpColors(colorInner, colorMid, t / 0.35);
        } else {
          mixColor.lerpColors(colorMid, colorOuter, (t - 0.35) / 0.65);
        }
        mixColor.toArray(colors, i3);
        sizes[i] = CFG.particleSize * (1.1 - t * 0.55) + Math.random() * 0.4;
      }

      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases,    1));

    // Custom shader material for glowing particles
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          // subtle individual bob
          vec3 pos = position;
          pos.y += sin(uTime * ${CFG.floatFrequency.toFixed(2)} + aPhase) * ${CFG.floatAmplitude.toFixed(2)};

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float dist = -mvPosition.z;
          gl_PointSize = aSize * uPixelRatio * (80.0 / dist);
          gl_Position  = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Soft glowing disc
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.15, 0.5, d);
          gl_FragColor = vec4(vColor, alpha * 0.92);
        }
      `,
      transparent: true,
      depthWrite:  false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── Floating Geometric Accents ────────────────────────────────────────────
    const accents = [];

    function makeAccent(geoFn, color, pos, scale) {
      const m = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const mesh = new THREE.Mesh(geoFn(), m);
      mesh.position.set(...pos);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      accents.push(mesh);
      return mesh;
    }

    // Icosahedra scattered around the galaxy
    makeAccent(() => new THREE.IcosahedronGeometry(1, 0), 0x6c63ff, [-18,  4, -10], 2.2);
    makeAccent(() => new THREE.IcosahedronGeometry(1, 0), 0x00c3ff, [ 20, -3,  -8], 1.6);
    makeAccent(() => new THREE.IcosahedronGeometry(1, 0), 0xff6584, [  4,  6, -18], 1.9);
    makeAccent(() => new THREE.OctahedronGeometry(1,  0), 0xffd86f, [-10, -5,   5], 1.5);
    makeAccent(() => new THREE.TorusGeometry(1.2, 0.04, 8, 32), 0x6c63ff, [14,  2, -5], 2.0);
    makeAccent(() => new THREE.TorusGeometry(0.8, 0.03, 8, 24), 0x00c3ff, [-6,  3,  8], 1.8);

    // ── State ─────────────────────────────────────────────────────────────────
    let scrollY   = 0;
    let targetScrollY = 0;
    let mouseX   = 0;
    let mouseY   = 0;
    let clock     = new THREE.Clock();
    let raf;

    function getScrollProgress(currentScroll) {
      if (!triggerSection || !holdSection) {
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        return Math.min(currentScroll / maxScroll, 1);
      }

      const start = Math.max(triggerSection.offsetTop - window.innerHeight * 0.2, 0);
      const end = Math.max(holdSection.offsetTop - window.innerHeight * 0.15, start + 1);
      return Math.min(Math.max((currentScroll - start) / (end - start), 0), 1);
    }

    function updateDepthFx(currentScroll) {
      const progress = getScrollProgress(currentScroll);
      const soft = progress * progress * (3 - 2 * progress);
      const dramatic = Math.pow(soft, 1.15);

      root.style.setProperty('--bg-depth-opacity', (1 - dramatic * 0.88).toFixed(3));
      root.style.setProperty('--bg-depth-scale', (1 - dramatic * 0.24).toFixed(3));
      root.style.setProperty('--bg-depth-blur', `${(dramatic * 12).toFixed(2)}px`);
      root.style.setProperty('--bg-depth-shift-y', `${(-dramatic * 70).toFixed(2)}px`);
      root.style.setProperty('--bg-overlay-opacity', (0.60 + dramatic * 0.34).toFixed(3));
    }

    // ── Scroll listener ───────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
    }, { passive: true });

    // ── Mouse / touch parallax ────────────────────────────────────────────────
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      mouseX = (t.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (t.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // ── Resize ────────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    });

    // ── Render Loop ───────────────────────────────────────────────────────────
    function animate() {
      raf = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      mat.uniforms.uTime.value = elapsed;

      // Smooth scroll damp
      scrollY += (targetScrollY - scrollY) * 0.06;

      // ── Galaxy rotation (scroll-driven + base) ────────────────────────────
      particles.rotation.y = elapsed * CFG.rotationSpeed * 30 + scrollY * CFG.scrollSpeed;

      // ── Camera drift (mouse parallax + scroll) ────────────────────────────
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 2 + 8 - camera.position.y) * 0.04;

      // Scroll zooms camera out / in and tilts
      const depthProgress = getScrollProgress(scrollY);
      const scrollFactor = scrollY * 0.004;
      camera.position.z = 28 + scrollFactor * 4.2 + depthProgress * 18;
      camera.lookAt(0, scrollFactor * -0.45 - depthProgress * 2.2, 0);
      particles.position.z = -depthProgress * 8;
      particles.rotation.x = scrollY * CFG.scrollSpeed * 0.22 + depthProgress * 0.18;

      updateDepthFx(scrollY);

      // ── Accent meshes rotation ────────────────────────────────────────────
      accents.forEach((a, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        a.rotation.x = elapsed * 0.22 * dir;
        a.rotation.y = elapsed * 0.18 * dir;
        a.rotation.z = elapsed * 0.12;
        // gentle bob
        a.position.y += Math.sin(elapsed * 0.5 + idx) * 0.004;
      });

      renderer.render(scene, camera);
    }

    animate();
    updateDepthFx(targetScrollY);

    // ── Visibility optimisation ───────────────────────────────────────────────
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        clock = new THREE.Clock();
        animate();
      }
    });
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  waitForThree(init);

})();
