import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VARIANTS, createMaterials, disposeObject } from './jewelry.js';

const MP_VERSION = '0.10.14';
const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Real-world reference: cheek-to-cheek (landmarks 234 ↔ 454) ≈ 145 mm.
const FACE_WIDTH_MM = 145;
// How far the nostril wing faces sideways from the face's forward direction.
const ALA_YAW = 0.62;
// Weighted landmarks marking the classic nostril piercing spot.
const PIERCE = {
  1: [[294, 0.4], [278, 0.35], [358, 0.25]], // wearer's left
  [-1]: [[64, 0.4], [48, 0.35], [129, 0.25]], // wearer's right
};

const $ = (s) => document.querySelector(s);
const video = $('#video');
const canvas = $('#scene');

/* ---------- state ---------- */
const defaults = { index: 0, side: 1, dx: 0, dy: 0, size: 1 };
const state = { ...defaults };
try { Object.assign(state, JSON.parse(localStorage.getItem('nosepin-state') || '{}')); } catch {}
state.index = Math.min(Math.max(0, state.index | 0), VARIANTS.length - 1);
const save = () => { try { localStorage.setItem('nosepin-state', JSON.stringify(state)); } catch {} };

/* ---------- three ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(0.3, 1, 1);
scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

const camera = new THREE.OrthographicCamera(-640, 640, 360, -360, 0.1, 10000);
camera.position.z = 3000;

const M = createMaterials();
const anchor = new THREE.Group();
const nudge = new THREE.Group();
const sideG = new THREE.Group();
anchor.add(nudge);
nudge.add(sideG);
anchor.visible = false;
scene.add(anchor);

let current = null;
let pendulums = [];
let vw = 1280, vh = 720;

function setVariant(i) {
  state.index = (i + VARIANTS.length) % VARIANTS.length;
  if (current) { sideG.remove(current); disposeObject(current); }
  current = VARIANTS[state.index].build(M);
  sideG.add(current);
  pendulums = [];
  current.traverse((o) => { if (o.userData.pendulum) pendulums.push({ o, ax: 0, az: 0, vx: 0, vz: 0 }); });
  const v = VARIANTS[state.index];
  $('#nowIndex').textContent = `${String(state.index + 1).padStart(2, '0')} / ${VARIANTS.length}`;
  $('#nowName').textContent = v.name;
  $('#nowDesc').textContent = v.desc;
  document.querySelectorAll('.card').forEach((c, k) => {
    const on = k === state.index;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', on);
    if (on) c.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  });
  save();
}

function resize() {
  if (video.videoWidth) { vw = video.videoWidth; vh = video.videoHeight; }
  camera.left = -vw / 2; camera.right = vw / 2;
  camera.top = vh / 2; camera.bottom = -vh / 2;
  camera.updateProjectionMatrix();
  const cover = Math.max(innerWidth / vw, innerHeight / vh);
  renderer.setPixelRatio(Math.min(2.5, Math.max(1, cover * devicePixelRatio)));
  renderer.setSize(vw, vh, false);
}
addEventListener('resize', resize);
video.addEventListener('loadedmetadata', resize);
resize();

/* ---------- smoothing ---------- */
class OneEuro {
  constructor(minCutoff = 1.4, beta = 0.01, dCutoff = 1) { Object.assign(this, { minCutoff, beta, dCutoff }); this.reset(); }
  reset() { this.x = null; this.dx = 0; }
  a(c, dt) { const tau = 1 / (2 * Math.PI * c); return 1 / (1 + tau / dt); }
  filter(x, dt) {
    if (this.x === null) { this.x = x; return x; }
    const dx = (x - this.x) / dt;
    this.dx += this.a(this.dCutoff, dt) * (dx - this.dx);
    this.x += this.a(this.minCutoff + this.beta * Math.abs(this.dx), dt) * (x - this.x);
    return this.x;
  }
}
const fx = new OneEuro(), fy = new OneEuro(), fz = new OneEuro(), fs = new OneEuro(1.0, 0.002);
const resetFilters = () => [fx, fy, fz, fs].forEach((f) => f.reset());

/* ---------- face tracking ---------- */
let landmarker = null;
let running = false;
const landmarkerReady = (async () => {
  const { FaceLandmarker, FilesetResolver } = await import(`${MP_URL}/vision_bundle.mjs`);
  const fileset = await FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO', numFaces: 1,
  });
  try { landmarker = await FaceLandmarker.createFromOptions(fileset, opts('GPU')); }
  catch { landmarker = await FaceLandmarker.createFromOptions(fileset, opts('CPU')); }
})();
landmarkerReady.catch(() => {});

const tmp = { a: new THREE.Vector3(), b: new THREE.Vector3(), x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3(),
  p: new THREE.Vector3(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), n: new THREE.Vector3(), wq: new THREE.Quaternion() };
const lmVec = (l, out) => out.set((l.x - 0.5) * vw, (0.5 - l.y) * vh, -l.z * vw);

let lastVT = -1, lost = 99, facing = true, hasPose = false;

function track(now, dt) {
  if (!landmarker || video.currentTime === lastVT) return;
  lastVT = video.currentTime;
  const res = landmarker.detectForVideo(video, now);
  const lm = res.faceLandmarks && res.faceLandmarks[0];
  if (!lm) {
    if (++lost > 6) { anchor.visible = false; hasPose = false; resetFilters(); setStatus('search'); }
    return;
  }
  lost = 0;

  // Head orientation from landmarks.
  lmVec(lm[454], tmp.x).sub(lmVec(lm[234], tmp.a));
  const faceW = tmp.x.length();
  tmp.x.normalize();
  lmVec(lm[10], tmp.y).sub(lmVec(lm[152], tmp.a));
  tmp.y.addScaledVector(tmp.x, -tmp.x.dot(tmp.y)).normalize();
  tmp.z.crossVectors(tmp.x, tmp.y);
  tmp.m.makeBasis(tmp.x, tmp.y, tmp.z);
  tmp.q.setFromRotationMatrix(tmp.m);

  // Piercing point.
  tmp.p.set(0, 0, 0);
  for (const [i, w] of PIERCE[state.side]) tmp.p.addScaledVector(lmVec(lm[i], tmp.a), w);

  anchor.position.set(fx.filter(tmp.p.x, dt), fy.filter(tmp.p.y, dt), fz.filter(tmp.p.z, dt));
  if (hasPose) anchor.quaternion.slerp(tmp.q, 0.5); else anchor.quaternion.copy(tmp.q);
  hasPose = true;
  anchor.scale.setScalar(fs.filter(faceW / FACE_WIDTH_MM, dt) * state.size);
  nudge.position.set(state.side * state.dx, state.dy, 0);
  sideG.rotation.y = state.side * ALA_YAW;

  // Hide when the nostril turns away from the camera (the nose would cover it).
  anchor.updateMatrixWorld(true);
  sideG.getWorldQuaternion(tmp.wq);
  tmp.n.set(0, 0, 1).applyQuaternion(tmp.wq);
  facing = facing ? tmp.n.z > 0.02 : tmp.n.z > 0.12;
  anchor.visible = facing;
  setStatus(facing ? 'live' : 'turn');
}

/* ---------- drops swing with gravity ---------- */
const down = new THREE.Vector3();
function updatePendulums(dt) {
  for (const p of pendulums) {
    p.o.parent.getWorldQuaternion(tmp.wq);
    down.set(0, -1, 0).applyQuaternion(tmp.wq.invert());
    const tz = Math.atan2(down.x, -down.y);
    const tx = THREE.MathUtils.clamp(Math.atan2(-down.z, -down.y), -0.9, 0);
    p.vz += (140 * (tz - p.az) - 6 * p.vz) * dt;
    p.vx += (140 * (tx - p.ax) - 6 * p.vx) * dt;
    p.az += p.vz * dt;
    p.ax = Math.min(0, p.ax + p.vx * dt);
    p.o.rotation.set(p.ax, 0, p.az);
  }
}

/* ---------- match scene lighting ---------- */
const lc = document.createElement('canvas'); lc.width = 16; lc.height = 9;
const lctx = lc.getContext('2d', { willReadFrequently: true });
let targetExposure = 1.05;
const tint = new THREE.Color(1, 1, 1);
function sampleLight() {
  try {
    lctx.drawImage(video, 0, 0, 16, 9);
    const d = lctx.getImageData(0, 0, 16, 9).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4;
    r /= n * 255; g /= n * 255; b /= n * 255;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    targetExposure = THREE.MathUtils.clamp(0.6 + luma * 1.15, 0.72, 1.35);
    const mx = Math.max(r, g, b, 1e-3);
    tint.setRGB(0.7 + 0.3 * (r / mx), 0.7 + 0.3 * (g / mx), 0.7 + 0.3 * (b / mx));
  } catch {}
}

/* ---------- loop ---------- */
let last = performance.now(), frame = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  if (running && video.readyState >= 2) {
    track(now, dt);
    if (++frame % 20 === 0) sampleLight();
  }
  renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * 0.08;
  key.color.lerp(tint, 0.08);
  updatePendulums(dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

/* ---------- status ---------- */
const STATUS = {
  off: 'Camera off', loading: 'Loading face tracking…', search: 'Looking for your face…',
  live: 'Tracking', turn: 'Turn slightly toward the camera',
};
let lastStatus = '';
function setStatus(k) {
  if (k === lastStatus) return;
  lastStatus = k;
  $('#status').dataset.state = k;
  $('#statusText').textContent = STATUS[k];
}
setStatus('off');

/* ---------- UI ---------- */
const carousel = $('#carousel');
VARIANTS.forEach((v, i) => {
  const b = document.createElement('button');
  b.className = 'card';
  b.type = 'button';
  b.innerHTML = `<span class="thumb"><img alt="" /></span><span class="label">${v.name}</span>`;
  b.addEventListener('click', () => setVariant(i));
  carousel.appendChild(b);
});

$('#prev').addEventListener('click', () => setVariant(state.index - 1));
$('#next').addEventListener('click', () => setVariant(state.index + 1));

function setSide(s) {
  state.side = s;
  document.querySelectorAll('[data-side]').forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.side) === s));
  resetFilters(); hasPose = false;
  save();
}
document.querySelectorAll('[data-side]').forEach((b) => b.addEventListener('click', () => setSide(Number(b.dataset.side))));

const panel = $('#adjust');
$('#adjustBtn').addEventListener('click', () => {
  panel.hidden = !panel.hidden;
  $('#adjustBtn').setAttribute('aria-expanded', !panel.hidden);
});
const sliders = { upDown: 'dy', inOut: 'dx', size: 'size' };
function syncSliders() {
  for (const [id, k] of Object.entries(sliders)) {
    $(`#${id}`).value = state[k];
    $(`#${id}Out`).textContent = k === 'size' ? `${Math.round(state[k] * 100)}%` : `${state[k] > 0 ? '+' : ''}${(+state[k]).toFixed(1)} mm`;
  }
}
for (const [id, k] of Object.entries(sliders)) {
  $(`#${id}`).addEventListener('input', (e) => { state[k] = parseFloat(e.target.value); syncSliders(); save(); });
}
$('#resetBtn').addEventListener('click', () => { state.dx = 0; state.dy = 0; state.size = 1; syncSliders(); save(); });
syncSliders();

addEventListener('keydown', (e) => {
  if (e.target.matches('input')) return;
  if (e.key === 'ArrowRight') setVariant(state.index + 1);
  if (e.key === 'ArrowLeft') setVariant(state.index - 1);
  if (e.key.toLowerCase() === 'p' && running) snapshot();
});

/* ---------- snapshot ---------- */
function snapshot() {
  renderer.render(scene, camera);
  const c = document.createElement('canvas');
  c.width = vw; c.height = vh;
  const ctx = c.getContext('2d');
  ctx.translate(vw, 0); ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, vw, vh);
  ctx.drawImage(canvas, 0, 0, vw, vh);
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nose-pin-${VARIANTS[state.index].name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
  const f = $('#flash');
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
$('#snapBtn').addEventListener('click', () => running && snapshot());

/* ---------- start ---------- */
$('#startBtn').addEventListener('click', async () => {
  const err = $('#introError');
  err.textContent = '';
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    err.textContent = 'Camera needs a secure page. Open this over https:// or http://localhost.';
    return;
  }
  $('#startBtn').disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
    });
    video.srcObject = stream;
    await video.play();
    resize();
  } catch (e) {
    $('#startBtn').disabled = false;
    err.textContent = e.name === 'NotAllowedError'
      ? 'Camera permission was blocked. Allow it in your browser and try again.'
      : 'No camera could be started on this device.';
    return;
  }
  document.body.classList.add('started');
  setStatus('loading');
  try { await landmarkerReady; } catch {
    setStatus('off');
    $('#statusText').textContent = 'Face tracking failed to load. Check your connection.';
    return;
  }
  running = true;
  setStatus('search');
});

/* ---------- thumbnails ---------- */
function makeThumbs() {
  const tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  tr.setPixelRatio(1);
  tr.setSize(176, 176);
  tr.outputColorSpace = THREE.SRGBColorSpace;
  tr.toneMapping = THREE.ACESFilmicToneMapping;
  tr.toneMappingExposure = 1.1;
  const ts = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(tr);
  ts.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const l = new THREE.DirectionalLight(0xffffff, 1.4); l.position.set(0.4, 1, 1); ts.add(l);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
  const TM = createMaterials();
  const imgs = carousel.querySelectorAll('img');
  const box = new THREE.Box3(), size = new THREE.Vector3(), center = new THREE.Vector3();
  VARIANTS.forEach((v, i) => {
    const wrap = new THREE.Group();
    const obj = v.build(TM);
    wrap.add(obj);
    wrap.rotation.set(0.12, v.hoop ? -1.15 : -0.22, 0);
    ts.add(wrap);
    wrap.updateMatrixWorld(true);
    box.setFromObject(wrap).getSize(size); box.getCenter(center);
    const dist = (Math.max(size.x, size.y) / 2) / Math.tan(THREE.MathUtils.degToRad(15)) * 1.3 + size.z;
    cam.position.set(center.x, center.y, center.z + dist);
    cam.lookAt(center);
    tr.render(ts, cam);
    imgs[i].src = tr.domElement.toDataURL('image/png');
    ts.remove(wrap);
    disposeObject(wrap);
  });
  pm.dispose();
  tr.dispose();
  tr.forceContextLoss();
}

setVariant(state.index);
setSide(state.side);
requestAnimationFrame(() => setTimeout(makeThumbs, 50));
