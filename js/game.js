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
  dayIndex:  0,           // 며칠째인지 (0부터 시작)
  dayPhase:  'morning',  // 'morning' | 'day' | 'evening' | 'night'
  isNight:   false,
  isPaused:  false,
  gameSpeed: 1,
  totalSpawned: 0,
  prevUnlock:   0,

  cheatUnlockAll: false,

  // 이벤트 로그 (하단 표시)
  events: [],

  // 건축 현장 목록
  constructions: [],

  // 식별 번호 카운터
  nextSerialNo: 1,

  // 조직(familyId 단위) 적대감 & 습격 상태
  tribeHostility: new Map(),       // key: "minId_maxId" → number
  raidingTribes:  new Map(),       // familyId → { targetFamilyId, originalSize }
  defendingTribes: new Map(),      // familyId → { attackerFamilyId, originalSize }
  tribeNames:     new Map(),       // familyId → 사용자 지정 이름
  _raidCheckTimer: 0,

  tribeLabel(familyId) {
    if (!this.tribeNames.has(familyId)) {
      this.tribeNames.set(familyId, this._genTribeName());
    }
    return this.tribeNames.get(familyId);
  },

  // 보스 노쇠사 시 조직 분할 (최대 3개)
  _onBossDeath(boss) {
    if (!boss || !boss.familyId) return;
    const fam = boss.familyId;
    const members = this.siljangsukList.filter(s =>
      !s.dead && s.familyId === fam && s.id !== boss.id && !s.slaveOf);
    if (members.length < 2) return;
    // 혈통별 그룹화 (parentId 기준)
    const groups = new Map();
    for (const m of members) {
      const key = m.parentId ?? 'orphan';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    }
    // 큰 그룹 순으로 상위 3개만 유지, 나머지는 가장 큰 그룹에 흡수
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    const keepCount = Math.min(3, sorted.length);
    const keep = sorted.slice(0, keepCount);
    const rest = sorted.slice(keepCount).flatMap(([, arr]) => arr);
    if (rest.length) keep[0][1].push(...rest);

    // 가장 큰 그룹은 원래 familyId 유지, 나머지는 새 familyId
    for (let i = 0; i < keep.length; i++) {
      const [, arr] = keep[i];
      const newFam = i === 0 ? fam : arr[0].id;
      const name = i === 0 ? this.tribeLabel(fam) : this._genTribeName();
      this.tribeNames.set(newFam, name);
      for (const m of arr) {
        m.familyId = newFam;
        m.generation = 0;
      }
    }
    this.logEvent(`⚜ 보스 사망! 조직이 ${keep.length}개로 분열`, '#ffaa44');
  },

  _genTribeName() {
    const ADJ  = ['무서운', '잔인한', '거대한', '귀여운', '매지컬', '세레브한', '뒷마당', '새카만', '달콤한', '초록빛'];
    const NOUN = ['미도리', '테치카', '들꽃', '쓰레기장', '연못', '사거리', '프라다', '구찌', '안나수이', '에르메스', '스시', '스테이크', '콘페이토'];
    const a = ADJ [Math.floor(Math.random() * ADJ.length)];
    const n = NOUN[Math.floor(Math.random() * NOUN.length)];
    return `${a} ${n}파`;
  },
  renameTribe(familyId, name) {
    if (!name) this.tribeNames.delete(familyId);
    else       this.tribeNames.set(familyId, name);
  },

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
    AudioMgr.load();

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
    AudioMgr.updateForState(this);
    this._draw();

    requestAnimationFrame(t => this._loop(t));
  },

  _update(dt) {
    this.camera.update(dt, this._keys);

    // ── Day phase 계산 ────────────────────────────
    this.dayTime += dt;
    const cycle = CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH;
    if (this.dayTime >= cycle) {
      this.dayTime -= cycle;
      this.dayIndex++;
      this._onNewDay(this.dayIndex);
    }

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

    // 건축 현장 진행
    for (const c of this.constructions) c.progress += dt;
    const completed = this.constructions.filter(c => c.progress >= c.duration);
    this.constructions = this.constructions.filter(c => c.progress < c.duration);
    for (const c of completed) {
      const house = new House(c.x, c.y, c.ownerId);
      this.houses.push(house);
      this.entities.set(house.id, house);
      const owner = this.entities.get(c.ownerId);
      if (owner && !owner.dead) owner.houseId = house.id;
      this.addParticle(house.cx, house.cy - 20, '집 완성! 🏠', '#ffe066', 2200);
      if (owner) this.logEvent(`🏠 ${owner.label}의 집 완공`, '#ffe066');
    }

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

    // 습격 트리거 / 종료 체크
    this._raidCheckTimer -= dt;
    if (this._raidCheckTimer <= 0) {
      this._raidCheckTimer = CONFIG.TRIBE_RAID_CHECK_INTERVAL;
      this._checkRaidTriggers();
    }
    this._checkRaidEnd();

    this.ui.update(dt);

    // 정리
    this.siljangsukList = this.siljangsukList.filter(s => {
      if (s.dead && (s.fadeTimer ?? 0) <= 0) {
        this.entities.delete(s.id);
        return false;
      }
      return true;
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

  // ── 매일 처음 (dayIndex 갱신 시) ────────────────────
  _onNewDay(d) {
    if (d > 0 && d % CONFIG.CAT_SPAWN_DAYS === 0) {
      const h = new Human(3); // cat
      this.humans.push(h); this.entities.set(h.id, h);
      this.logEvent(`🐱 고양이 등장!`, '#ff9944');
    }
    if (d > 0 && d % CONFIG.ATTACKER_SPAWN_DAYS === 0) {
      const h = new Human(2); // attacker
      this.humans.push(h); this.entities.set(h.id, h);
      this.logEvent(`👊 학대파 등장!`, '#ff2222');
    }
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
    const count = this.siljangsukList.filter(s => !s.dead && !s.slaveOf).length;
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

    // 운치굴은 타일셋(배경) 바로 위, 다른 모든 객체보다 아래에 그림
    for (const h of this.houses) {
      if (h.drawUnci) h.drawUnci(ctx, camera);
    }

    // 건축 현장 — 서서히 떠오르는 집
    for (const c of this.constructions) {
      const p = Math.min(1, c.progress / c.duration);
      ctx.save();
      ctx.globalAlpha = 0.25 + p * 0.5;
      const houseImg = Images.getHouse && Images.getHouse();
      if (houseImg) {
        ctx.drawImage(houseImg, c.x - 6, c.y - 12, c.w + 12, c.h + 18);
      } else {
        ctx.fillStyle = '#c8a070';
        ctx.fillRect(c.x, c.y + c.h * 0.25, c.w, c.h * 0.75);
      }
      ctx.restore();
      // 건축중 텍스트
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      const txt = `🔨 건축중… ${Math.floor(p * 100)}%`;
      ctx.strokeText(txt, c.x + c.w / 2, c.y - 4);
      ctx.fillText  (txt, c.x + c.w / 2, c.y - 4);
      ctx.restore();
    }

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

    // 선택된 조직 영역 — 멤버 둘러싸는 반투명 마커
    const selTribe = this.ui.selectedTribeId;
    if (selTribe !== null && selTribe !== undefined) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,220,80,0.18)';
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 2;
      for (const s of this.siljangsukList) {
        if (s.dead || s.familyId !== selTribe || s.slaveOf) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 50, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }

    // 전쟁 중 텍스트 — 각 분쟁 조직 보스 위에 크게
    if (this.raidingTribes.size > 0) {
      ctx.save();
      ctx.font = 'bold 36px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.fillStyle   = '#ff4444';
      const drawn = new Set();
      for (const [atk, info] of this.raidingTribes) {
        for (const fam of [atk, info.targetFamilyId]) {
          if (drawn.has(fam)) continue;
          drawn.add(fam);
          const boss = this.getTribeBoss(fam);
          if (!boss) continue;
          ctx.strokeText('⚔ 전쟁 중! ⚔', boss.x, boss.y - 80);
          ctx.fillText  ('⚔ 전쟁 중! ⚔', boss.x, boss.y - 80);
        }
      }
      ctx.restore();
    }

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

  // ── 조직(혈통) 시스템 ───────────────────────────────
  _tribeKey(a, b) { return a < b ? `${a}_${b}` : `${b}_${a}`; },
  addHostility(fromFamily, toFamily, amount = CONFIG.TRIBE_HOSTILITY_PER_ATTACK) {
    if (!fromFamily || !toFamily || fromFamily === toFamily) return;
    const k = this._tribeKey(fromFamily, toFamily);
    this.tribeHostility.set(k, (this.tribeHostility.get(k) ?? 0) + amount);
  },
  getHostility(a, b) {
    if (!a || !b || a === b) return 0;
    return this.tribeHostility.get(this._tribeKey(a, b)) ?? 0;
  },
  getTribeMembers(familyId, adultOnly = false) {
    return this.siljangsukList.filter(s =>
      !s.dead && s.familyId === familyId && !s.slaveOf
      && (!adultOnly || s.stage === 4));
  },
  getTribeBoss(familyId) {
    const members = this.getTribeMembers(familyId, true);
    if (members.length === 0) return null;
    return members.reduce((a, b) => {
      const sa = a.hp + (a.stage4Age || 0) * 0.1;
      const sb = b.hp + (b.stage4Age || 0) * 0.1;
      return sa >= sb ? a : b;
    });
  },

  // 습격 트리거 체크 (성체 ≥ 20, 식량 부족, 적대감 가장 높은 부족 공격)
  _checkRaidTriggers() {
    const tribes = new Map();   // familyId → adult list
    for (const s of this.siljangsukList) {
      if (s.dead || s.stage !== 4 || s.slaveOf) continue;
      if (!tribes.has(s.familyId)) tribes.set(s.familyId, []);
      tribes.get(s.familyId).push(s);
    }
    for (const [fam, members] of tribes) {
      if (members.length < CONFIG.TRIBE_RAID_MIN_ADULTS) continue;
      if (this.raidingTribes.has(fam)) continue;

      // 인당 식량 계산
      let totalFood = 0;
      const seen = new Set();
      for (const m of members) {
        if (m.houseId !== null && !seen.has(m.houseId)) {
          seen.add(m.houseId);
          const h = this.getEntity(m.houseId);
          if (h) totalFood += h.foodReserves;
        }
      }
      const perMember = totalFood / members.length;
      if (perMember >= CONFIG.TRIBE_FOOD_THRESHOLD) continue;

      // 최고 적대감 타겟 찾기
      let target = null, maxH = 0;
      for (const [other] of tribes) {
        if (other === fam) continue;
        const h = this.getHostility(fam, other);
        if (h > maxH) { maxH = h; target = other; }
      }
      if (target === null) continue;

      // 습격 개시
      const defenderMembers = this.getTribeMembers(target, true);
      this.raidingTribes.set(fam, {
        targetFamilyId: target,
        originalSize:   members.length,
      });
      this.defendingTribes.set(target, {
        attackerFamilyId: fam,
        originalSize:     defenderMembers.length,
      });
      for (const m of members)   m.raidTarget   = target;
      for (const d of defenderMembers) d.defendAgainst = fam;
      const boss = this.getTribeBoss(fam);
      this.logEvent(`⚔️ ${boss?.label ?? fam} 조직이 ${target} 조직 습격!`, '#ff4444');
    }
  },

  // 습격 종료 조건 체크
  _checkRaidEnd() {
    for (const [fam, info] of this.raidingTribes) {
      const cur = this.getTribeMembers(fam, true).length;
      if (cur <= info.originalSize / 3) {
        this._endRaid(fam, info.targetFamilyId, 'attacker_broken');
      }
    }
    for (const [fam, info] of this.defendingTribes) {
      const cur = this.getTribeMembers(fam, true).length;
      if (cur <= info.originalSize / 2) {
        this._defenderCollapse(fam, info.attackerFamilyId);
      }
    }
  },

  _defenderCollapse(defFam, atkFam) {
    // 방어측 1/2 이상 줄어듦 → 남은 절반 도망, 절반 노예
    const remaining = this.getTribeMembers(defFam, true);
    if (remaining.length === 0) {
      this._endRaid(atkFam, defFam, 'defender_defeated');
      return;
    }
    const mid = Math.ceil(remaining.length / 2);
    const flee = remaining.slice(0, mid);
    const enslave = remaining.slice(mid);

    for (const f of flee) {
      f.fleeing = true;
      f.fleeTimer = 30;
      const ang = Math.random() * Math.PI * 2;
      f.targetX = Utils.clamp(f.x + Math.cos(ang) * 1500, 20, CONFIG.WORLD_WIDTH - 20);
      f.targetY = Utils.clamp(f.y + Math.sin(ang) * 1500, 20, CONFIG.WORLD_HEIGHT - 20);
      f.defendAgainst = null;
    }
    const masterBoss = this.getTribeBoss(atkFam);
    for (const e of enslave) {
      e.slaveOf = masterBoss?.id ?? null;
      e.defendAgainst = null;
      this.logEvent(`⛓️ ${e.label} 노예로 전락`, '#cc6666');
    }
    this._endRaid(atkFam, defFam, 'defender_defeated');
  },

  _endRaid(atkFam, defFam, reason) {
    // 공격측 승리 → 방어측 집 식량 약탈해서 공격측 보스 집으로
    if (reason === 'defender_defeated') {
      const atkBoss = this.getTribeBoss(atkFam);
      const atkHouse = atkBoss ? this.getEntity(atkBoss.houseId) : null;
      let loot = 0;
      const defHouses = this.houses.filter(h => {
        const owner = this.getEntity(h.ownerId);
        return owner && owner.familyId === defFam;
      });
      for (const dh of defHouses) {
        loot += dh.foodReserves;
        dh.foodReserves = 0;
        dh.takeDamage(dh.maxHp);
        if (dh.hp <= 0) this.destroyHouse(dh);
      }
      if (atkHouse) atkHouse.foodReserves += loot;
      if (loot > 0) this.logEvent(`💰 습격 승리! 식량 ${Math.floor(loot)} 약탈`, '#ffe066');
    } else {
      this.logEvent(`🕊 습격 종료 (공격측 와해)`, '#aaaaaa');
    }
    this.raidingTribes.delete(atkFam);
    this.defendingTribes.delete(defFam);
    for (const s of this.siljangsukList) {
      if (s.raidTarget === defFam) s.raidTarget = null;
      if (s.defendAgainst === atkFam) s.defendAgainst = null;
    }
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

  findNearestItem(x, y, maxDist, filter = null, requester = null) {
    let best = null, bestD = maxDist;
    const now = Date.now();
    const reqId  = (typeof requester === 'object' && requester) ? requester.id : requester;
    const reqFam = (typeof requester === 'object' && requester) ? requester.familyId : null;
    for (const item of this.items) {
      if (item.collected) continue;
      // 최근(10초) 다른 실장석이 claim 한 경우: 같은 가족이면 제외
      if (item.claimedBy && item.claimedBy !== reqId
          && item._claimTime && (now - item._claimTime) < 10000) {
        if (reqFam !== null) {
          const claimer = this.entities.get(item.claimedBy);
          if (claimer && claimer.familyId === reqFam) continue;
        }
      }
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
      AudioMgr.startOnGesture();
      if (e.code === 'KeyM') AudioMgr.toggleMute();

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        const alive = this.siljangsukList.filter(s => !s.dead && !s.slaveOf).length;
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
      if (e.code === 'KeyH') this.ui.showHelp   = !this.ui.showHelp;
      if (e.code === 'KeyT') this.ui.showTribes = !this.ui.showTribes;
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
      AudioMgr.startOnGesture();
      const sx = e.clientX, sy = e.clientY;
      const wx = this._mouse.worldX, wy = this._mouse.worldY;

      // 배속 버튼
      for (const btn of this._speedBtnAreas) {
        if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
          this.gameSpeed = btn.speed; return;
        }
      }

      if (this.ui.handleTribePanelClick(sx, sy, this)) return;
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
          // 쓰레기통 배치
          if (menuItem.type === 'trashcan') {
            this.trashCans.push(new TrashCan(wx, wy));
            return;
          }
          // 수돗가 배치
          if (menuItem.type === 'tap') {
            this.world.waterSpots.push({ type: 'tap', x: wx, y: wy, r: 28 });
            this.world._bgDirty = true;  // 배경 다시 그림
            this.addParticle(wx, wy - 12, '🚰', '#88ccff', 1500);
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

      // 운치굴은 더이상 클릭 대상 아님 — 운치 양만 그림으로 표시
      this.ui.viewingUnci = false;

      this.ui.handleClick(wx, wy, this);
    });
  },
};

// ── Entry point ───────────────────────────────────────
window.addEventListener('load', () => Game.init());
