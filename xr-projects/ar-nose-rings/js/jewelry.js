// 15 procedurally modeled nose pins. Units are millimetres.
// Local frame: origin = piercing point on the skin, +Z = out of the skin,
// +Y = up the face, +X = along the skin surface.
import * as THREE from 'three';

const D = THREE.MathUtils.degToRad;
const TAU = Math.PI * 2;

export function createMaterials() {
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xf3c56f, metalness: 1, roughness: 0.16, envMapIntensity: 1.45 });
  const goldSatin = new THREE.MeshPhysicalMaterial({ color: 0xeebf6a, metalness: 1, roughness: 0.3, envMapIntensity: 1.3 });
  const antique = new THREE.MeshPhysicalMaterial({ color: 0xa47c3c, metalness: 1, roughness: 0.46, envMapIntensity: 1.15 });
  const gem = {
    color: 0xffffff, roughness: 0, flatShading: true, clearcoat: 1, clearcoatRoughness: 0,
    iridescence: 1, iridescenceIOR: 2.1, iridescenceThicknessRange: [150, 700],
  };
  const diamond = new THREE.MeshPhysicalMaterial({ ...gem, metalness: 0.62, envMapIntensity: 2.9 });
  const crystal = new THREE.MeshPhysicalMaterial({ ...gem, metalness: 0.48, envMapIntensity: 2.5 });
  const smoky = new THREE.MeshPhysicalMaterial({ ...gem, color: 0xe9e1d2, metalness: 0.5, envMapIntensity: 2.2 });
  const kundan = new THREE.MeshPhysicalMaterial({
    color: 0xf7f2e6, metalness: 0.1, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04,
    sheen: 1, sheenColor: new THREE.Color(0xfff6e0), sheenRoughness: 0.4, envMapIntensity: 1.5,
  });
  const ruby = new THREE.MeshPhysicalMaterial({ color: 0xb3122b, metalness: 0.3, roughness: 0.04, clearcoat: 1, flatShading: true, envMapIntensity: 2 });
  return { gold, goldSatin, antique, diamond, crystal, smoky, kundan, ruby };
}

/* ---------- primitives ---------- */

const mesh = (geo, mat) => new THREE.Mesh(geo, mat);

function bead(r, mat, seg = 16) {
  return mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);
}

function disk(r, thick, mat, seg = 40) {
  const g = new THREE.CylinderGeometry(r, r, thick, seg);
  g.rotateX(Math.PI / 2);
  return mesh(g, mat);
}

// Round brilliant cut, table facing +Z, girdle at z = 0.
function brilliant(d, mat) {
  const r = d / 2;
  const prof = [[0, -0.86], [1, -0.02], [1, 0.05], [0.58, 0.32], [0, 0.32]];
  const g = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x * r, y * r)), 8);
  g.rotateX(Math.PI / 2);
  return mesh(g, mat);
}

// A stone sitting in a gold cup with four prongs. Back of the cup sits on the skin.
function setStone(d, M, { metal = M.gold, stone = M.diamond, prongs = 4 } = {}) {
  const g = new THREE.Group();
  const r = d / 2;
  const s = brilliant(d, stone);
  s.position.z = r * 0.55;
  g.add(s);
  const cupGeo = new THREE.CylinderGeometry(r * 1.06, r * 0.6, r * 0.9, 20);
  cupGeo.rotateX(Math.PI / 2);
  const cup = mesh(cupGeo, metal);
  cup.position.z = r * 0.12;
  g.add(cup);
  const collar = mesh(new THREE.TorusGeometry(r * 1.04, r * 0.11, 8, 28), metal);
  collar.position.z = r * 0.56;
  g.add(collar);
  for (let i = 0; i < prongs; i++) {
    const a = D(45) + (i * TAU) / prongs;
    const p = bead(r * 0.16, metal, 10);
    p.position.set(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, r * 0.72);
    g.add(p);
  }
  return g;
}

// Faceted briolette drop hanging down from y = 0.
function briolette(len, w, mat) {
  const pts = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const u = i / N; // 0 = bottom, 1 = top
    const t = Math.PI * (1 - u);
    const x = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.3) * (w / 2) * 1.25;
    const y = ((Math.cos(t) - 1) / 2) * len;
    pts.push(new THREE.Vector2(Math.max(0, x), y));
  }
  return mesh(new THREE.LatheGeometry(pts, 10), mat);
}

function chain(links, linkLen, mat) {
  const g = new THREE.Group();
  for (let i = 0; i < links; i++) {
    const l = mesh(new THREE.TorusGeometry(linkLen * 0.34, linkLen * 0.085, 6, 14), mat);
    l.scale.set(1, 1.45, 1);
    l.position.y = -(i + 0.5) * linkLen * 0.8;
    l.rotation.y = i % 2 ? Math.PI / 2 : 0;
    g.add(l);
  }
  return { group: g, length: links * linkLen * 0.8 };
}

// Hanging element on a spring pivot (swings with gravity / head motion).
function dangle(M, { y, links = 2, linkLen = 0.9, metal = M.gold, drop }) {
  const pivot = new THREE.Group();
  pivot.position.set(0, y, 0.25);
  pivot.userData.pendulum = true;
  const jump = mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 14), metal);
  jump.rotation.y = Math.PI / 2;
  jump.position.y = -0.2;
  pivot.add(jump);
  const c = chain(links, linkLen, metal);
  c.group.position.y = -0.4;
  pivot.add(c.group);
  const end = new THREE.Group();
  end.position.y = -0.4 - c.length;
  pivot.add(end);
  drop(end);
  return pivot;
}

const crystalDrop = (M, len = 2.6, w = 1.1, metal = M.gold, mat = M.crystal) => (end) => {
  const cap = bead(0.32, metal, 12);
  cap.position.y = -0.2;
  end.add(cap);
  const b = briolette(len, w, mat);
  b.position.y = -0.38;
  end.add(b);
};

// Hoop through the piercing: top of the ring sits at the piercing, the visible arc
// bulges out of the skin and tucks under the nostril rim.
function hoop(R, wire, mat, { from = -58, to = 90, ball = 0 } = {}) {
  const g = new THREE.Group();
  const holder = new THREE.Group();
  holder.rotation.y = -Math.PI / 2; // ring plane = (skin normal, up)
  g.add(holder);
  const a0 = D(from), a1 = D(to);
  const torus = mesh(new THREE.TorusGeometry(R, wire, 14, 96, a1 - a0), mat);
  torus.rotation.z = a0;
  torus.position.y = -R;
  holder.add(torus);
  const endAt = (a, r) => {
    const s = bead(r, mat, 14);
    s.position.set(Math.cos(a) * R, Math.sin(a) * R - R, 0);
    holder.add(s);
  };
  endAt(a1, wire);
  endAt(a0, ball || wire);
  g.userData.isHoop = true;
  return g;
}

function heartGeo(size, depth = 4) {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * TAU;
    pts.push(new THREE.Vector2(
      16 * Math.sin(t) ** 3,
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    ));
  }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth, bevelEnabled: true, bevelThickness: 4.5, bevelSize: 3, bevelSegments: 8, curveSegments: 24,
  });
  g.center();
  const s = size / 38;
  g.scale(s, s, s);
  return g;
}

function starShape(points, outer, inner) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / points;
    const r = i % 2 ? inner : outer;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function rail(points, radius, mat) {
  const curve = new THREE.CatmullRomCurve3(points);
  return mesh(new THREE.TubeGeometry(curve, 64, radius, 8, false), mat);
}

/* ---------- the 15 variants ---------- */

export const VARIANTS = [
  {
    name: 'Stud', desc: 'A single round brilliant in a four-prong cup.',
    build: (M) => setStone(2.2, M),
  },
  {
    name: 'Flower Stud', desc: 'Six petal diamonds around a centre stone.',
    build: (M) => {
      const g = new THREE.Group();
      const back = disk(2.15, 0.25, M.gold); back.position.z = -0.15; g.add(back);
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 + Math.PI / 2;
        const p = setStone(1.15, M, { prongs: 0 });
        p.position.set(Math.cos(a) * 1.32, Math.sin(a) * 1.32, 0);
        g.add(p);
      }
      const c = setStone(1.25, M, { prongs: 0 }); c.position.z = 0.12; g.add(c);
      return g;
    },
  },
  {
    name: 'Heart Stud', desc: 'A puffed, high-polish gold heart.',
    build: (M) => {
      const h = mesh(heartGeo(3.2), M.gold);
      h.position.z = 0.45;
      const g = new THREE.Group(); g.add(h); return g;
    },
  },
  {
    name: 'Nose Ring', desc: 'A fine, seamless gold hoop.',
    hoop: true,
    build: (M) => hoop(3.8, 0.34, M.gold),
  },
  {
    name: 'Drop Nose Pin', desc: 'Stud with a short chain and a swinging briolette.',
    build: (M) => {
      const g = setStone(1.6, M);
      g.add(dangle(M, { y: -0.95, links: 3, linkLen: 0.8, drop: crystalDrop(M, 2.4, 1.0) }));
      return g;
    },
  },
  {
    name: 'Curve Nose Pin', desc: 'A line of stones that follows the curve of the nostril.',
    build: (M) => {
      const g = new THREE.Group();
      const pts = [];
      const n = 7;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const p = new THREE.Vector3(1.4 * Math.sin(t * Math.PI * 0.9), -t * 6.0, -t * t * 1.1);
        pts.push(p);
        const s = setStone(1.05 - t * 0.15, M, { prongs: 0 });
        s.position.copy(p);
        s.rotation.x = -t * 0.35;
        g.add(s);
      }
      g.add(rail(pts.map((p) => p.clone().add(new THREE.Vector3(0, 0, -0.2))), 0.24, M.gold));
      g.position.y = 0.6;
      return g;
    },
  },
  {
    name: 'Traditional Nose Pin', desc: 'Gold floral motif with a tiny ruby and a bead drop.',
    build: (M) => {
      const g = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 + Math.PI / 2;
        const p = bead(0.62, M.gold, 14);
        p.scale.set(0.62, 1, 0.5);
        p.position.set(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0.15);
        p.rotation.z = a - Math.PI / 2;
        g.add(p);
        const gr = bead(0.17, M.gold, 8);
        const b = a + Math.PI / 6;
        gr.position.set(Math.cos(b) * 1.45, Math.sin(b) * 1.45, 0.1);
        g.add(gr);
      }
      const c = setStone(0.85, M, { stone: M.ruby, prongs: 0 }); c.position.z = 0.25; g.add(c);
      g.add(dangle(M, {
        y: -1.65, links: 1, linkLen: 0.7,
        drop: (end) => {
          const b1 = bead(0.5, M.gold, 16); b1.position.y = -0.45; end.add(b1);
          const b2 = bead(0.26, M.gold, 10); b2.position.y = -1.15; end.add(b2);
        },
      }));
      return g;
    },
  },
  {
    name: 'Antique Nose Pin', desc: 'Oxidised-gold medallion with granulation and a crystal drop.',
    build: (M) => {
      const g = new THREE.Group();
      const A = M.antique;
      g.add(disk(3.3, 0.5, A));
      for (let i = 0; i < 18; i++) {
        const a = (i * TAU) / 18;
        const b = bead(0.3, A, 10);
        b.position.set(Math.cos(a) * 3.15, Math.sin(a) * 3.15, 0.3);
        g.add(b);
      }
      const ring = mesh(new THREE.TorusGeometry(2.45, 0.2, 8, 48), A); ring.position.z = 0.35; g.add(ring);
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8;
        const p = bead(0.42, A, 12);
        p.scale.set(0.7, 1, 0.6);
        p.position.set(Math.cos(a) * 1.85, Math.sin(a) * 1.85, 0.4);
        p.rotation.z = a - Math.PI / 2;
        g.add(p);
      }
      const c = setStone(2.4, M, { metal: A, stone: M.smoky, prongs: 6 }); c.position.z = 0.25; g.add(c);
      g.add(dangle(M, { y: -3.4, links: 1, linkLen: 0.8, metal: A, drop: crystalDrop(M, 2.2, 1.1, A, M.smoky) }));
      g.scale.setScalar(0.9);
      return g;
    },
  },
  {
    name: 'Gold Nose Ring', desc: 'Heavier polished hoop with a ball end.',
    hoop: true,
    build: (M) => hoop(3.4, 0.5, M.gold, { ball: 0.85 }),
  },
  {
    name: 'Kundan Nose Pin', desc: 'Uncut kundan petals in gold bezels with a crystal drop.',
    build: (M) => {
      const g = new THREE.Group();
      const back = disk(2.45, 0.3, M.gold); back.position.z = -0.1; g.add(back);
      const petal = (x, y, rot, sx, sy) => {
        const k = bead(0.75, M.kundan, 20);
        k.scale.set(sx, sy, 0.42);
        k.position.set(x, y, 0.3);
        k.rotation.z = rot;
        g.add(k);
        const bz = mesh(new THREE.TorusGeometry(0.78, 0.12, 8, 28), M.gold);
        bz.scale.set(sx, sy, 1);
        bz.position.set(x, y, 0.32);
        bz.rotation.z = rot;
        g.add(bz);
      };
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 + Math.PI / 2;
        petal(Math.cos(a) * 1.6, Math.sin(a) * 1.6, a - Math.PI / 2, 0.72, 1);
      }
      petal(0, 0, 0, 0.82, 0.82);
      g.add(dangle(M, { y: -2.5, links: 1, linkLen: 0.7, drop: crystalDrop(M, 2.6, 1.2, M.gold, M.crystal) }));
      g.scale.setScalar(0.85);
      return g;
    },
  },
  {
    name: 'Diamond Nose Pin', desc: 'A rhombus cluster of diamonds with a pear drop.',
    build: (M) => {
      const g = new THREE.Group();
      const frame = mesh(new THREE.TorusGeometry(1.75, 0.17, 6, 4), M.gold);
      frame.position.z = 0.2;
      g.add(frame);
      const plate = mesh(new THREE.CircleGeometry(1.7, 4), M.gold);
      plate.position.z = -0.05;
      g.add(plate);
      [[0, 1.0], [1.0, 0], [0, -1.0], [-1.0, 0]].forEach(([x, y]) => {
        const s = setStone(0.95, M, { prongs: 0 }); s.position.set(x, y, 0); g.add(s);
      });
      const c = setStone(1.15, M, { prongs: 0 }); c.position.z = 0.1; g.add(c);
      g.add(dangle(M, { y: -1.95, links: 1, linkLen: 0.6, drop: crystalDrop(M, 2.2, 1.0, M.gold, M.diamond) }));
      return g;
    },
  },
  {
    name: 'Spiral Nose Pin', desc: 'A gold coil wrapped around a centre diamond.',
    build: (M) => {
      const g = new THREE.Group();
      const pts = [];
      const turns = 1.15;
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const r = 1.35 + 1.15 * t;
        const a = D(100) + t * TAU * turns;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.3 - t * 0.15));
      }
      g.add(rail(pts, 0.3, M.gold));
      const tip = bead(0.3, M.gold, 12); tip.position.copy(pts[pts.length - 1]); g.add(tip);
      const tip0 = bead(0.3, M.gold, 12); tip0.position.copy(pts[0]); g.add(tip0);
      g.add(setStone(1.7, M));
      return g;
    },
  },
  {
    name: 'Plain Nose Ring', desc: 'A wider satin-gold hoop.',
    hoop: true,
    build: (M) => hoop(4.6, 0.6, M.goldSatin, { from: -62 }),
  },
  {
    name: 'V Shape Nose Pin', desc: 'Two diamond arms meeting in a point.',
    build: (M) => {
      const g = new THREE.Group();
      const v = new THREE.Vector3(0, -1.2, 0);
      const s0 = setStone(0.95, M, { prongs: 0 }); s0.position.copy(v); g.add(s0);
      [-1, 1].forEach((side) => {
        const dir = new THREE.Vector3(side * Math.sin(D(32)), Math.cos(D(32)), 0);
        for (let k = 1; k <= 3; k++) {
          const s = setStone(0.88 - k * 0.04, M, { prongs: 0 });
          s.position.copy(v).addScaledVector(dir, k * 0.9);
          g.add(s);
        }
        const end = v.clone().addScaledVector(dir, 2.7);
        g.add(rail([v.clone().setZ(-0.15), end.setZ(-0.15)], 0.22, M.gold));
      });
      g.position.y = 0.4;
      return g;
    },
  },
  {
    name: 'Star Nose Pin', desc: 'Six marquise rays around a round brilliant.',
    build: (M) => {
      const g = new THREE.Group();
      const back = mesh(new THREE.ExtrudeGeometry(starShape(6, 2.1, 0.85), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }), M.gold);
      back.position.z = -0.25;
      g.add(back);
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 2 + (i * TAU) / 6;
        const m = brilliant(0.78, M.diamond);
        m.scale.set(0.62, 1.75, 1);
        m.rotation.z = a - Math.PI / 2;
        m.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.3);
        g.add(m);
      }
      const c = setStone(1.0, M, { prongs: 0 }); c.position.z = 0.1; g.add(c);
      return g;
    },
  },
];

export function disposeObject(obj) {
  obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
}
