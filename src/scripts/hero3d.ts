/**
 * The spinning 3D centerpiece in the homepage hero: two meshing gears,
 * orbit rings, a wireframe shell and a particle cloud. It leans toward
 * the cursor and spins faster while you scroll.
 * Loaded lazily (after the page is interactive) so it never slows the first paint.
 */
import {
  AdditiveBlending, AmbientLight, BufferAttribute, BufferGeometry, Clock, Color, DirectionalLight, EdgesGeometry, ExtrudeGeometry, Group, IcosahedronGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial, Path, PerspectiveCamera, PointLight, Points, PointsMaterial, Scene, Shape, SphereGeometry, TorusGeometry, WebGLRenderer,
  type Material,
} from 'three';
import { scrollState } from './motion';

const ORANGE = 0xff7a1a;
const BLUE = 0x2f7bff;

function gearShape(teeth: number, rOuter: number, rRoot: number, bore: number, holes = 0, holeR = 0, holeDist = 0) {
  const shape = new Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rRoot, a],
      [rOuter, a + step * 0.16],
      [rOuter, a + step * 0.44],
      [rRoot, a + step * 0.6],
    ];
    pts.forEach(([r, t], j) => {
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  const boreHole = new Path();
  boreHole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);
  for (let k = 0; k < holes; k++) {
    const t = (k / holes) * Math.PI * 2;
    const h = new Path();
    h.absarc(Math.cos(t) * holeDist, Math.sin(t) * holeDist, holeR, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  return shape;
}

function gearMesh(shape: Shape, depth: number, edgeColor: number, metal: Material) {
  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
    curveSegments: 28,
  });
  geo.center();
  const mesh = new Mesh(geo, metal);
  const edges = new LineSegments(
    new EdgesGeometry(geo, 25),
    new LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.95 }),
  );
  mesh.add(edges);
  return mesh;
}

export function initHero3D(canvas: HTMLCanvasElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const root = new Group();
  scene.add(root);

  const metal = new MeshStandardMaterial({ color: 0x1c212c, metalness: 0.85, roughness: 0.3 });

  // Main gear (orange edges) + smaller meshing gear (blue edges)
  const gear1 = gearMesh(gearShape(14, 1.8, 1.48, 0.42, 6, 0.24, 0.98), 0.42, ORANGE, metal);
  const gear2 = gearMesh(gearShape(9, 1.15, 0.9, 0.28, 0), 0.36, BLUE, metal);
  const gearDist = 2.72;
  const gearAngle = -Math.PI * 0.27;
  gear2.position.set(Math.cos(gearAngle) * gearDist, Math.sin(gearAngle) * gearDist, -0.2);
  const gears = new Group();
  gears.add(gear1, gear2);
  gears.position.set(-0.45, 0.4, 0);
  root.add(gears);

  // Orbit rings with a little "satellite"
  const ring = new Mesh(
    new TorusGeometry(3.5, 0.014, 8, 220),
    new MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.75 }),
  );
  ring.rotation.x = Math.PI * 0.42;
  const sat = new Mesh(new SphereGeometry(0.1, 16, 16), new MeshBasicMaterial({ color: 0xffb36b }));
  ring.add(sat);
  const ring2 = new Mesh(
    new TorusGeometry(3.15, 0.01, 8, 220),
    new MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.6 }),
  );
  ring2.rotation.set(Math.PI * 0.6, Math.PI * 0.2, 0);
  root.add(ring, ring2);

  // Wireframe shell
  const shell = new LineSegments(
    new EdgesGeometry(new IcosahedronGeometry(4.3, 1)),
    new LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.14 }),
  );
  root.add(shell);

  // Particle cloud
  const N = 520;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const o = new Color(ORANGE);
  const b = new Color(BLUE);
  for (let i = 0; i < N; i++) {
    const r = 3.8 + Math.random() * 1.8;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
    const c = Math.random() > 0.5 ? o : b;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new BufferAttribute(col, 3));
  const points = new Points(
    pGeo,
    new PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  root.add(points);

  // Lights
  scene.add(new AmbientLight(0xffffff, 0.35));
  const l1 = new PointLight(ORANGE, 90, 40);
  l1.position.set(4, 3, 5);
  const l2 = new PointLight(BLUE, 90, 40);
  l2.position.set(-5, -2, 4);
  const l3 = new DirectionalLight(0xffffff, 1.3);
  l3.position.set(0, 5, 8);
  scene.add(l1, l2, l3);

  // Pointer tracking
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  window.addEventListener(
    'pointermove',
    (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  const host = canvas.parentElement!;
  const resize = () => {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  let visible = true;
  new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting)).observe(canvas);

  const clock = new Clock();
  let spin = 0;
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) {
      clock.getDelta();
      return;
    }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    spin += dt * (0.4 + Math.min(Math.abs(scrollState.velocity) * 0.0025, 5));

    gear1.rotation.z = spin;
    gear2.rotation.z = -spin * (14 / 9) + 0.17;

    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;
    root.rotation.y = cur.x * 0.55 + Math.sin(t * 0.3) * 0.15;
    root.rotation.x = cur.y * 0.4 + 0.08;
    root.position.y = Math.sin(t * 0.8) * 0.1;

    ring.rotation.z = t * 0.25;
    sat.position.set(Math.cos(t * 0.9) * 3.5, Math.sin(t * 0.9) * 3.5, 0);
    ring2.rotation.z = -t * 0.18;
    shell.rotation.y = t * 0.06;
    shell.rotation.x = t * 0.03;
    points.rotation.y = -t * 0.04;

    renderer.render(scene, camera);
  });

  host.classList.add('has-3d');
}
