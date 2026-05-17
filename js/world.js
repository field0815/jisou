class World {
  constructor() {
    this.trees = [];
    this.bushes = [];
    this.paths = [];
    this.pond = null;
    this.waterSpots = [];  // {type:'pond'|'fountain'|'tap', x, y, r}
    this._bg = null;
    this._bgDirty = true;
    this._generate();
  }

  _generate() {
    const rng = (min, max) => Math.random() * (max - min) + min;
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;

    // Pond
    this.pond = { x: W * 0.7, y: H * 0.25, rx: 180, ry: 120 };

    // 물 시설: 연못 1, 분수대 2, 수돗가 3 (공원 곳곳에 분산)
    this.waterSpots.push({ type: 'pond',     x: this.pond.x, y: this.pond.y, r: 130 });
    this.waterSpots.push({ type: 'fountain', x: W * 0.25,    y: H * 0.65,    r: 60 });
    this.waterSpots.push({ type: 'fountain', x: W * 0.55,    y: H * 0.85,    r: 60 });
    this.waterSpots.push({ type: 'tap',      x: W * 0.12,    y: H * 0.18,    r: 28 });
    this.waterSpots.push({ type: 'tap',      x: W * 0.85,    y: H * 0.55,    r: 28 });
    this.waterSpots.push({ type: 'tap',      x: W * 0.40,    y: H * 0.10,    r: 28 });

    // Trees
    for (let i = 0; i < 320; i++) {
      const x = rng(0, W), y = rng(0, H);
      const inPond = Math.pow((x - this.pond.x) / this.pond.rx, 2) +
                     Math.pow((y - this.pond.y) / this.pond.ry, 2) < 1.2;
      if (!inPond) {
        this.trees.push({ x, y, r: rng(18, 42), shade: Math.random() });
      }
    }

    // Bushes
    for (let i = 0; i < 180; i++) {
      this.bushes.push({ x: rng(0, W), y: rng(0, H), r: rng(8, 20) });
    }

    // Winding paths (defined as polyline points)
    this.paths.push([
      { x: 0,    y: H / 2 },
      { x: W * 0.2, y: H * 0.45 },
      { x: W * 0.4, y: H * 0.5 },
      { x: W * 0.6, y: H * 0.42 },
      { x: W * 0.8, y: H * 0.48 },
      { x: W,    y: H * 0.45 },
    ]);
    this.paths.push([
      { x: W / 2, y: 0 },
      { x: W * 0.48, y: H * 0.3 },
      { x: W * 0.5, y: H * 0.5 },
      { x: W * 0.52, y: H * 0.7 },
      { x: W / 2, y: H },
    ]);
  }

  _buildBg() {
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    const oc = document.createElement('canvas');
    oc.width = W; oc.height = H;
    const c = oc.getContext('2d');

    // 바닥 — tile.png 우선
    const tileImg = Images.getTile && Images.getTile();
    if (tileImg) {
      const ts = 128;
      for (let gx = 0; gx < W; gx += ts) {
        for (let gy = 0; gy < H; gy += ts) {
          c.drawImage(tileImg, gx, gy, ts, ts);
        }
      }
    } else {
      const grad = c.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#6db33f');
      grad.addColorStop(0.5, '#7ec84a');
      grad.addColorStop(1, '#5fa032');
      c.fillStyle = grad;
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 0.06;
      for (let gx = 0; gx < W; gx += 80) {
        for (let gy = 0; gy < H; gy += 80) {
          const v = (Math.sin(gx * 0.007) + Math.cos(gy * 0.009)) * 0.5 + 0.5;
          c.fillStyle = v > 0.5 ? '#88d44f' : '#5a9a2e';
          c.fillRect(gx, gy, 80, 80);
        }
      }
      c.globalAlpha = 1;
    }

    // Paths
    c.strokeStyle = '#c8a870';
    c.lineWidth = 28;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const path of this.paths) {
      c.beginPath();
      c.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) c.lineTo(path[i].x, path[i].y);
      c.stroke();
    }
    c.strokeStyle = '#dfc090';
    c.lineWidth = 14;
    for (const path of this.paths) {
      c.beginPath();
      c.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) c.lineTo(path[i].x, path[i].y);
      c.stroke();
    }

    // 연못 (top-right) — watergen3.png 우선, 없으면 원래 원형 이미지로 폴백
    const p = this.pond;
    const pondImg = Images.getWatergen3 && Images.getWatergen3();
    if (pondImg) {
      const fs = Math.max(p.rx, p.ry) * 2.2;
      c.drawImage(pondImg, p.x - fs/2, p.y - fs/2, fs, fs);
    } else {
      const pGrad = c.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.rx);
      pGrad.addColorStop(0, '#5aa8e8');
      pGrad.addColorStop(1, '#3b7dbf');
      c.fillStyle = pGrad;
      c.beginPath();
      c.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#2a5f9e';
      c.lineWidth = 3;
      c.stroke();
      c.globalAlpha = 0.3;
      c.fillStyle = '#aaddff';
      c.beginPath();
      c.ellipse(p.x - 50, p.y - 30, 40, 15, -0.3, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
    }

    // Bushes + Trees 통합 Y-sort — 아래쪽(y 큰)이 나중에 그려져 위에 보임
    const bushImg = Images.getSmallTree && Images.getSmallTree();
    const treeImgB = Images.getTree && Images.getTree();
    const decorList = [];
    for (const b of this.bushes) decorList.push({ kind: 'bush', y: b.y, ref: b });
    for (const t of this.trees)  decorList.push({ kind: 'tree', y: t.y, ref: t });
    decorList.sort((a, b) => a.y - b.y);
    for (const d of decorList) {
      if (d.kind === 'bush') {
        const b = d.ref;
        if (bushImg) {
          const sz = 48;
          c.drawImage(bushImg, b.x - sz/2, b.y - sz/2, sz, sz);
        } else {
          c.fillStyle = '#3a7d1e';
          c.globalAlpha = 0.6;
          c.beginPath();
          c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          c.fill();
          c.globalAlpha = 1;
        }
      } else {
        const t = d.ref;
        if (treeImgB) {
          const sz = t.r * 3;
          c.drawImage(treeImgB, t.x - sz/2, t.y - sz * 0.7, sz, sz);
        } else {
          c.fillStyle = 'rgba(0,0,0,0.12)';
          c.beginPath();
          c.ellipse(t.x + 8, t.y + 10, t.r * 0.9, t.r * 0.4, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#7a4a1e';
          c.fillRect(t.x - 5, t.y, 10, t.r * 0.5);
          const shade = t.shade > 0.5 ? '#2a7a12' : '#1e5e0e';
          c.fillStyle = shade;
          c.beginPath();
          c.arc(t.x, t.y - t.r * 0.3, t.r, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = t.shade > 0.5 ? '#3a9a20' : '#2d7a18';
          c.beginPath();
          c.arc(t.x - t.r * 0.2, t.y - t.r * 0.5, t.r * 0.75, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
    c.globalAlpha = 1;

    // Trees는 위 Bushes 블록과 통합 Y-sort에서 함께 그려짐

    // 분수대(watergen1) / 수돗가(watergen2) — 96×96 균일
    const fountW = Images.getWatergen1 && Images.getWatergen1();
    const tapW   = Images.getWatergen2 && Images.getWatergen2();
    for (const w of this.waterSpots) {
      if (w.type === 'fountain' && fountW) {
        const sz = 96;
        c.drawImage(fountW, w.x - sz/2, w.y - sz/2, sz, sz);
      } else if (w.type === 'tap' && tapW) {
        const sz = 96;
        c.drawImage(tapW, w.x - sz/2, w.y - sz/2, sz, sz);
      } else if (w.type === 'fountain') {
        c.fillStyle = '#88aacc';
        c.beginPath(); c.arc(w.x, w.y, w.r, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5588cc';
        c.beginPath(); c.arc(w.x, w.y, w.r * 0.7, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#cce6ff';
        c.beginPath(); c.arc(w.x, w.y, w.r * 0.35, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.font = '14px sans-serif'; c.textAlign = 'center';
        c.fillText('⛲', w.x, w.y + 5);
      } else if (w.type === 'tap') {
        c.fillStyle = '#aaa';
        c.fillRect(w.x - 6, w.y - 16, 12, 24);
        c.fillStyle = '#5588cc';
        c.beginPath(); c.arc(w.x, w.y + 12, 14, 0, Math.PI * 2); c.fill();
        c.font = '12px sans-serif'; c.textAlign = 'center';
        c.fillText('🚰', w.x, w.y + 4);
      }
    }

    this._bg = oc;
    this._bgDirty = false;
  }

  // 가장 가까운 물 시설
  findNearestWater(x, y) {
    let best = null, bestD = Infinity;
    for (const w of this.waterSpots) {
      const d = Utils.distance({ x, y }, w);
      if (d < bestD) { bestD = d; best = w; }
    }
    return best;
  }

  draw(ctx, camera) {
    if (this._bgDirty || !this._bg) this._buildBg();
    ctx.drawImage(this._bg, 0, 0);
  }

  // Find a spot not inside tree canopies (approx)
  randomOpenSpot() {
    for (let attempt = 0; attempt < 30; attempt++) {
      const x = Utils.random(100, CONFIG.WORLD_WIDTH - 100);
      const y = Utils.random(100, CONFIG.WORLD_HEIGHT - 100);
      const inPond = Math.pow((x - this.pond.x) / this.pond.rx, 2) +
                     Math.pow((y - this.pond.y) / this.pond.ry, 2) < 1.4;
      if (!inPond) return { x, y };
    }
    return { x: Utils.random(100, CONFIG.WORLD_WIDTH - 100), y: Utils.random(100, CONFIG.WORLD_HEIGHT - 100) };
  }
}
