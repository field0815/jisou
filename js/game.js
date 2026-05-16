// ═══════════════════════════════════════════════════════
//  Main Game Object
// ═══════════════════════════════════════════════════════
const Game = {
  canvas: null,
  ctx:    null,
  camera: null,
  world:  null,
  ui:     null,

  entities: new Map(),

  siljangsukList: [],
  houses:  [],
  items:   [],
  humans:  [],
  particles: [],
  pollenClouds: [],
  trashCans: [],

  dayTime:   0,
  dayPhase:  'morning',  // 'morning' | 'day' | 'evening' | 'night'
  isNight:   false,
  isPaused:  false,
  gameSpeed: 1,
  totalSpawned: 0,
  prevUnlock:   0,

  cheatUnlockAll: false,

  // 이벤트 로그 (하단 표시)
  events: [],

  // 식별 번호 카운터
  nextSerialNo: 1,

  _keys:   {},
  _mouse:  { screenX: 0, screenY: 0, worldX: 0, worldY: 0 },
  _itemSpawnTimer:   0,
  _humanSpawnTimer:  0,
  _pollenSpawnTimer: 0,
  _lastTime: null,
  _speedBtnAreas: [],

  // ── Bootstrap ─────────────────────────────────────────
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');
    this.camera = new Camera(this.canvas);
    this.world  = new World();
    this.ui     = new UI();

    Images.load();

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._bindInput();
    this._spawnInitial();
    this.camera.centerOn(this._initialHouse.cx, this._initialHouse.cy);

    requestAnimationFrame(t => this._loop(t));
  },

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  // ── Initial spawn ─────────────────────────────────────
  _spawnInitial() {
    const hx = CONFIG.WORLD_WIDTH  * 0.35 - CONFIG.HOUSE_WIDTH  / 2;
    const hy = CONFIG.WORLD_HEIGHT * 0.40 - CONFIG.HOUSE_HEIGHT / 2;
    const house = new House(hx, hy, -1);
    this.houses.push(house);
    this.entities.set(house.id, house);
    this._initialHouse = house;

    // 4단계 성체 1마리 (집 주인) — 먼저 생성해 가족 id 확보
    const adult = this.spawnSiljangsuk(
      house.cx + Utils.random(-40, 40),
      house.cy + Utils.random(-40, 40),
      4, null, CONFIG.PERSONALITY_NORMAL, null
    );
    adult.houseId    = house.id;
    adult.satiation  = adult.maxSat;
    adult.happiness  = 85;
    adult.serialNo   = this.nextSerialNo++;
    house.ownerId    = adult.id;
    house.foodReserves = 60;

    // 3단계 새끼 3마리 — 성체와 같은 familyId로 묶음 (형제이자 자식)
    const familyId = adult.familyId;
    for (let i = 0; i < 3; i++) {
      const s = this.spawnSiljangsuk(
        house.cx + Utils.random(-60, 60),
        house.cy + Utils.random(-60, 60),
        3, adult.id, CONFIG.PERSONALITY_NORMAL, familyId
      );
      s.houseId    = house.id;
      s.satiation  = s.maxSat;
      s.happiness  = 80;
      s.serialNo   = this.nextSerialNo++;
      s.birthOrder = i + 1;
      s.parentLabelSnapshot = adult.label;
    }
    adult.birthsGiven = 3;

    // 집 없는 유랑 성체 5마리 — 각자 독립된 번호
    for (let wi = 0; wi < 5; wi++) {
      const spot = this.world.randomOpenSpot();
      const wanderer = this.spawnSiljangsuk(spot.x, spot.y, 4, null, Utils.randomPersonality(), null);
      wanderer.satiation = wanderer.maxSat * 0.5;
      wanderer.happiness = Utils.random(35, 75);
      wanderer.serialNo  = this.nextSerialNo++;
    }

    // 초기 아이템
    for (let i = 0; i < 30; i++) {
      const spot = this.world.randomOpenSpot();
      const type = Math.random() < 0.5 ? randomFoodType() : (Math.random() < 0.5 ? 'paper' : 'leaf');
      this.spawnItem(type, spot.x, spot.y);
    }

    // 쓰레기통 6개 배치
    const trashPositions = [
      [800, 700], [2500, 500], [4200, 800],
      [700, 3200], [2600, 3500], [4100, 3000]
    ];
    for (const [tx, ty] of trashPositions) {
      this.trashCans.push(new TrashCan(tx, ty));
    }
  },

  // ── Game loop ─────────────────────────────────────────
  _loop(timestamp) {
    if (!this._lastTime) this._lastTime = timestamp;
    let dt = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;
    dt = Math.min(dt, 0.1) * this.gameSpeed;

    if (!this.isPaused) this._update(dt);
    this._draw();

    requestAnimationFrame(t => this._loop(t));
  },

  _update(dt) {
    this.camera.update(dt, this._keys);

    // ── Day phase 계산 ────────────────────────────
    this.dayTime += dt;
    const cycle = CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH;
    if (this.dayTime >= cycle) this.dayTime -= cycle;

    const t   = this.dayTime;
    let newPhase;
    if      (t < CONFIG.MORNING_LENGTH)                              newPhase = 'morning';
    else if (t < CONFIG.DAY_LENGTH - CONFIG.EVENING_LENGTH)         newPhase = 'day';
    else if (t < CONFIG.DAY_LENGTH)                                  newPhase = 'evening';
    else                                                             newPhase = 'night';

    if (newPhase !== this.dayPhase) {
      this._onPhaseChange(this.dayPhase, newPhase);
      this.dayPhase = newPhase;
    }
    this.isNight = this.dayPhase === 'night';

    // ── Update entities ───────────────────────────
    for (const s of this.siljangsukList) s.update(dt, this);
    for (const h of this.houses)         h.update(dt);
    for (const h of this.humans)         h.update(dt, this);
    for (const p of this.pollenClouds)   p.update(dt, this);
    for (const tc of this.trashCans)     tc.update(dt, this);

    // 소지 아이템 위치 동기화
    for (const item of this.items) {
      if (item.carriedBy) {
        const carrier = this.entities.get(item.carriedBy);
        if (!carrier || carrier.dead) {
          item.collected = false; item.carriedBy = null;
        } else {
          item.x = carrier.x + Utils.random(-4, 4);
          item.y = carrier.y + Utils.random(-4, 4);
        }
      }
    }

    // 파티클
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.done);

    // 이벤트 로그 시간 진행 (8초 후 사라짐)
    for (const ev of this.events) ev.time += dt;
    this.events = this.events.filter(ev => ev.time < 9);

    this.ui.update(dt);

    // 정리
    this.siljangsukList = this.siljangsukList.filter(s => {
      if (s.dead) { this.entities.delete(s.id); return false; } return true;
    });
    this.humans = this.humans.filter(h => {
      if (h.done) { this.entities.delete(h.id); return false; } return true;
    });
    this.items = this.items.filter(i => {
      if (i.collected && !i.carriedBy) { this.entities.delete(i.id); return false; } return true;
    });
    this.pollenClouds = this.pollenClouds.filter(p => !p.done);

    // 아이템 스폰 (낮에만)
    if (!this.isNight) {
      this._itemSpawnTimer -= dt;
      if (this._itemSpawnTimer <= 0 && this.items.length < CONFIG.MAX_ITEMS) {
        this._itemSpawnTimer = CONFIG.ITEM_SPAWN_INTERVAL;
        this._spawnRandomItem();
      }
    }

    // 인간 자동 스폰 비활성화 (수동 배치만)
    // if (!this.isNight) {
    //   this._humanSpawnTimer -= dt;
    //   if (this._humanSpawnTimer <= 0) {
    //     this._humanSpawnTimer = CONFIG.HUMAN_SPAWN_INTERVAL_DAY + Utils.random(-20, 40);
    //     const type = Utils.randomInt(0, 3);
    //     const h = new Human(type);
    //     this.humans.push(h);
    //     this.entities.set(h.id, h);
    //   }
    // }

    // 꽃가루 스폰
    this._pollenSpawnTimer -= dt;
    if (this._pollenSpawnTimer <= 0 && this.pollenClouds.length < CONFIG.POLLEN_MAX) {
      this._pollenSpawnTimer = CONFIG.POLLEN_SPAWN_INTERVAL + Utils.random(-10, 20);
      const pc = new PollenCloud();
      this.pollenClouds.push(pc);
    }

    this._checkUnlocks();
  },

  // ── Phase change → 식사 스케줄 알림 ──────────────
  _onPhaseChange(from, to) {
    // 밤→아침 전환 시 인간 퇴장
    if (from === 'night' && to === 'morning') {
      for (const h of this.humans) h.done = true;
    }
    // 낮→밤 전환 시에도 인간 퇴장
    if (to === 'night') {
      for (const h of this.humans) h.done = true;
    }

    for (const s of this.siljangsukList) {
      if (s.dead) continue;

      if (to === 'morning') {
        // 아침 식사: 모든 실장석
        s._mealPending = true;
        // 2~3단계: 낮 중간 식사 2회 예약
        if (s.stage >= 2 && s.stage < 4) {
          s._childMealCount = 2;
          s._childMealTimer = 17;
        }
      }

      if (to === 'evening') {
        // 저녁 식사: 모든 실장석
        s._mealPending = true;
      }

      if (to === 'night') {
        // 낮 식사 타이머 초기화
        s._childMealCount = 0;
      }
    }
  },

  _spawnRandomItem() {
    const spot = this.world.randomOpenSpot();
    const r = Math.random();
    let type;
    if (r < 0.45) type = randomFoodType();
    else if (r < 0.70) type = 'paper';
    else type = 'leaf';
    this.spawnItem(type,
      Utils.clamp(spot.x, 10, CONFIG.WORLD_WIDTH  - 10),
      Utils.clamp(spot.y, 10, CONFIG.WORLD_HEIGHT - 10));
  },

  _checkUnlocks() {
    const count = this.siljangsukList.filter(s => !s.dead).length;
    const thresholds = [
      { t: CONFIG.MENU_TIER1, msg: '꽃가루 & 콘페이토 해금!' },
      { t: CONFIG.MENU_TIER2, msg: '대못 & 방수포 해금!'    },
      { t: CONFIG.MENU_TIER3, msg: '전설의 공원 개발 달성!'  },
    ];
    for (const { t, msg } of thresholds) {
      if (count >= t && this.prevUnlock < t) {
        this.prevUnlock = t;
        this.ui.announce('공원 개발: ' + msg);
      }
    }
  },

  // ── Draw ──────────────────────────────────────────────
  _draw() {
    const { ctx, canvas, camera } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.apply(ctx);

    this.world.draw(ctx, camera);

    // Y-sort: 화면상 더 아래(y가 큰) 쪽이 위에 그려짐
    const drawables = [];
    for (const h  of this.houses)         drawables.push({ y: h.y + h.h, e: h  });
    for (const tc of this.trashCans)      drawables.push({ y: tc.y,      e: tc });
    for (const it of this.items)          drawables.push({ y: it.y,      e: it });
    for (const s  of this.siljangsukList) drawables.push({ y: s.y,       e: s  });
    for (const hu of this.humans)         drawables.push({ y: hu.y,      e: hu });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.e.draw(ctx, camera);

    for (const pc of this.pollenClouds) pc.draw(ctx, camera);
    for (const p of this.particles)    p.draw(ctx, camera);

    // 선택 링
    const sel = this.ui.selectedEntity;
    if (sel && !sel.dead && !sel.done) {
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth   = 2;
      ctx.setLineDash([5, 3]);
      if (sel instanceof Siljangsuk) {
        ctx.beginPath();
        ctx.arc(sel.x, sel.y, sel.size + 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (sel instanceof House) {
        ctx.strokeRect(sel.x - 4, sel.y - 4, sel.w + 8, sel.h + 8);
      } else if (sel instanceof Human) {
        ctx.beginPath();
        ctx.arc(sel.x, sel.y, 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    camera.restore(ctx);

    // 밤 오버레이
    if (this.isNight) {
      const nr = Math.min(1, (this.dayTime - CONFIG.DAY_LENGTH) / 8);
      ctx.fillStyle = `rgba(0,0,30,${0.55 * nr})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (this.dayPhase === 'morning' && this.dayTime < 8) {
      const fade = 1 - this.dayTime / 8;
      ctx.fillStyle = `rgba(0,0,30,${0.55 * fade})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (this.dayPhase === 'evening') {
      const ev = (this.dayTime - (CONFIG.DAY_LENGTH - CONFIG.EVENING_LENGTH)) / CONFIG.EVENING_LENGTH;
      ctx.fillStyle = `rgba(30,10,0,${0.25 * ev})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (this.isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏸ 일시정지', canvas.width / 2, canvas.height / 2);
    }

    this._drawSpeedButtons(ctx, canvas);
    this.ui.draw(ctx, canvas, this);
  },

  _drawSpeedButtons(ctx, canvas) {
    const speeds = [1, 2, 4, 8];
    const bw = 36, bh = 22, gap = 4;
    const totalW = speeds.length * (bw + gap) - gap;
    const startX = canvas.width - totalW - 14;
    const startY = 10;

    this._speedBtnAreas = [];
    ctx.save();
    speeds.forEach((sp, i) => {
      const bx = startX + i * (bw + gap);
      const by = startY;
      const isSel = this.gameSpeed === sp;
      ctx.fillStyle   = isSel ? 'rgba(255,220,80,0.9)' : 'rgba(20,15,10,0.65)';
      ctx.strokeStyle = isSel ? '#ffe066' : 'rgba(255,255,255,0.25)';
      ctx.lineWidth   = isSel ? 2 : 1;
      Utils.roundRect(ctx, bx, by, bw, bh, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = isSel ? '#333' : '#ddd';
      ctx.font = `bold ${isSel ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${sp}×`, bx + bw / 2, by + bh * 0.68);
      this._speedBtnAreas.push({ x: bx, y: by, w: bw, h: bh, speed: sp });
    });
    ctx.restore();
  },

  // ── Entity helpers ────────────────────────────────────
  getEntity(id) { return this.entities.get(id); },

  spawnItem(type, x, y) {
    const item = new Item(type, x, y);
    this.items.push(item);
    this.entities.set(item.id, item);
    return item;
  },

  spawnSiljangsuk(x, y, stage, parentId = null, personality = null, familyId = null) {
    const s = new Siljangsuk(x, y, stage, parentId, personality, familyId);
    this.siljangsukList.push(s);
    this.entities.set(s.id, s);
    this.totalSpawned++;
    return s;
  },

  addParticle(x, y, text, color, duration) {
    this.particles.push(new Particle(x, y, text, color, duration));
  },

  // 중요 이벤트 로그 (하단 스크롤)
  logEvent(text, color = '#eeeeee') {
    this.events.push({ text, color, time: 0 });
    if (this.events.length > 10) this.events.shift();
  },

  destroyHouse(house) {
    for (const s of this.siljangsukList) {
      if (s.houseId === house.id) s.houseId = null;
    }
    this.houses = this.houses.filter(h => h.id !== house.id);
    this.entities.delete(house.id);
    this.addParticle(house.cx, house.cy - 20, '집 파괴!', '#ff4444', 2000);
    this.logEvent('🏚️ 집이 파괴되었다', '#ff6666');
  },

  findNearestItem(x, y, maxDist, filter = null, requesterId = null) {
    let best = null, bestD = maxDist;
    for (const item of this.items) {
      if (item.collected) continue;
      if (item.claimedBy && item.claimedBy !== requesterId) continue;
      if (filter && !filter(item)) continue;
      const d = Utils.distance({ x, y }, item);
      if (d < bestD) { best = item; bestD = d; }
    }
    return best;
  },

  findNearestSiljangsuk(x, y, maxDist, filter = null) {
    let best = null, bestD = maxDist;
    for (const s of this.siljangsukList) {
      if (s.dead) continue;
      if (filter && !filter(s)) continue;
      const d = Utils.distance({ x, y }, s);
      if (d < bestD && d > 0.01) { best = s; bestD = d; }
    }
    return best;
  },

  findNearestHuman(x, y, maxDist, filter = null) {
    let best = null, bestD = maxDist;
    for (const h of this.humans) {
      if (h.done) continue;
      if (filter && !filter(h)) continue;
      const d = Utils.distance({ x, y }, h);
      if (d < bestD) { best = h; bestD = d; }
    }
    return best;
  },

  onSiljangsukDeath(s) {},

  // ── Input binding ─────────────────────────────────────
  _bindInput() {
    window.addEventListener('keydown', e => {
      this._keys[e.code] = true;

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        const alive = this.siljangsukList.filter(s => !s.dead).length;
        const avail = MENU_ITEMS.filter(m => alive >= m.unlock || this.cheatUnlockAll);
        const idx   = num - 1;
        if (idx < avail.length) {
          this.ui.selectedMenu = this.ui.selectedMenu === idx ? -1 : idx;
        }
      }

      if (e.key === '`') {
        this._backtickCount = (this._backtickCount ?? 0) + 1;
        clearTimeout(this._backtickTimeout);
        this._backtickTimeout = setTimeout(() => { this._backtickCount = 0; }, 1500);
        if (this._backtickCount >= 3) {
          this.cheatUnlockAll = true;
          this._backtickCount = 0;
          this.addParticle(this.canvas.width / 2, this.canvas.height / 2, '🔓 전체 해금!', '#ffe066', 2500);
        }
      }

      if (e.code === 'Space') { e.preventDefault(); this.isPaused = !this.isPaused; }
      if (e.code === 'F5')   { e.preventDefault(); if (SaveLoad.save(this)) this.addParticle(this.camera.x + this.canvas.width/this.camera.zoom/2, this.camera.y + 60, '💾 저장 완료', '#ffe066', 1800); }
      if (e.code === 'F9')   { e.preventDefault(); if (SaveLoad.load(this)) this.addParticle(this.camera.x + this.canvas.width/this.camera.zoom/2, this.camera.y + 60, '📂 불러오기 완료', '#66aaff', 1800); }
      if (e.code === 'KeyH') this.ui.showHelp = !this.ui.showHelp;
      if (e.code === 'Escape') { this.ui.selectedEntity = null; this.ui.selectedMenu = -1; }
    });

    window.addEventListener('keyup', e => { this._keys[e.code] = false; });

    window.addEventListener('wheel', e => {
      e.preventDefault();
      this.camera.onScroll(e.deltaY, e.clientX, e.clientY);
    }, { passive: false });

    window.addEventListener('mousemove', e => {
      this._mouse.screenX = e.clientX;
      this._mouse.screenY = e.clientY;
      const w = this.camera.screenToWorld(e.clientX, e.clientY);
      this._mouse.worldX = w.x;
      this._mouse.worldY = w.y;
    });

    window.addEventListener('click', e => {
      const sx = e.clientX, sy = e.clientY;
      const wx = this._mouse.worldX, wy = this._mouse.worldY;

      // 배속 버튼
      for (const btn of this._speedBtnAreas) {
        if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
          this.gameSpeed = btn.speed; return;
        }
      }

      if (this.ui.handleRenameClick(sx, sy, this)) return;
      if (this.ui.handlePniepnieClick(sx, sy, this)) return;

      if (this.ui._menuNoneBtn) {
        const nb = this.ui._menuNoneBtn;
        if (sx >= nb.x && sx <= nb.x + nb.w && sy >= nb.y && sy <= nb.y + nb.h) {
          this.ui.selectedMenu = -1; return;
        }
      }

      if (this.ui._menuItemsStartX !== undefined) {
        const iw  = this.ui._menuItemW;
        const ih  = this.ui._menuItemH;
        const gap = this.ui._menuItemGap;
        const by2  = this.ui._menuBaseY;
        const cnt  = this.ui._menuItemCount;
        for (let i = 0; i < cnt; i++) {
          const bx = this.ui._menuItemsStartX + i * (iw + gap);
          if (sx >= bx && sx <= bx + iw && sy >= by2 && sy <= by2 + ih) {
            this.ui.selectedMenu = this.ui.selectedMenu === i ? -1 : i; return;
          }
        }
      }

      if (this.ui._helpBtnArea) {
        const hb = this.ui._helpBtnArea;
        if (sx >= hb.x && sx <= hb.x + hb.w && sy >= hb.y && sy <= hb.y + hb.h) {
          this.ui.showHelp = !this.ui.showHelp; return;
        }
      }

      // 아이템 배치
      if (this.ui.selectedMenu >= 0) {
        const alive2 = this.siljangsukList.filter(s => !s.dead).length;
        const avail2 = MENU_ITEMS.filter(m => alive2 >= m.unlock || this.cheatUnlockAll);
        const menuItem = avail2[this.ui.selectedMenu];
        if (menuItem && menuItem.type !== 'none') {
          // 인간/고양이 스폰
          if (['human_1', 'human_2', 'cat'].includes(menuItem.type)) {
            const typeMap = { human_1: 1, human_2: 2, cat: 3 };
            const h = new Human(typeMap[menuItem.type]);
            h.x = wx; h.y = wy; h.targetX = wx; h.targetY = wy;
            this.humans.push(h);
            this.entities.set(h.id, h);
            return;
          }
          const isFoodMenu = menuItem.type === 'food';
          const count = isFoodMenu ? 3 : 1;
          for (let i2 = 0; i2 < count; i2++) {
            const type = isFoodMenu ? randomFoodType() : menuItem.type;
            this.spawnItem(type, wx + Utils.random(-22, 22), wy + Utils.random(-22, 22));
          }
          return;
        }
      }

      // 운치굴 클릭 감지
      for (const h of this.houses) {
        if (Utils.distance({ x: wx, y: wy }, { x: h.unciX, y: h.unciY }) < CONFIG.UNCI_RADIUS + 14) {
          this.ui.selectedEntity = h;
          this.ui.viewingUnci    = true;
          return;
        }
      }
      this.ui.viewingUnci = false;

      this.ui.handleClick(wx, wy, this);
    });
  },
};

// ── Entry point ───────────────────────────────────────
window.addEventListener('load', () => Game.init());
