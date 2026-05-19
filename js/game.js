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

  // 바닥에 떨어진 운치 (집 운치굴 외, "데후웃!" 배변)
  floorUnci: [],     // [{ x, y, amount, life }]

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
      this.tribeNames.set(familyId, this._genTribeBase());
    }
    const base = this.tribeNames.get(familyId);
    // 베이스에 이미 접미사가 박혀있으면 (구버전 호환) 그대로
    if (/(가족|파|부족)$/.test(base)) return base;
    const adultCount = this.siljangsukList.filter(s =>
      !s.dead && s.familyId === familyId && s.stage === 4 && !s.slaveOf).length;
    let suffix;
    if      (adultCount <= 3)  suffix = '가족';
    else if (adultCount <= 15) suffix = '파';
    else                       suffix = '부족';
    return `${base} ${suffix}`;
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
    this.logEvent(`⚜ 보스 사망! 조직이 ${keep.length}개로 분열`, '#ffaa44', boss ? { x: boss.x, y: boss.y } : null);
  },

  _genTribeBase() {
    const ADJ  = ['무서운', '잔인한', '거대한', '귀여운', '매지컬', '세레브한', '뒷마당', '새카만', '달콤한', '초록빛'];
    const NOUN = ['미도리', '테치카', '들꽃', '쓰레기장', '연못', '사거리', '프라다', '구찌', '안나수이', '에르메스', '스시', '스테이크', '콘페이토'];
    const a = ADJ [Math.floor(Math.random() * ADJ.length)];
    const n = NOUN[Math.floor(Math.random() * NOUN.length)];
    return `${a} ${n}`;
  },
  _genTribeName() { return this._genTribeBase(); },  // 호환
  renameTribe(familyId, name) {
    if (!name) this.tribeNames.delete(familyId);
    else       this.tribeNames.set(familyId, name);
  },

  _keys:   {},
  _mouse:  { screenX: 0, screenY: 0, worldX: 0, worldY: 0 },
  _drag:   null,            // { entity, lastX, lastY, vx, vy, startTime, moved }
  _lastTap:{ entity: null, time: 0 },
  _itemSpawnTimer:   0,
  _humanSpawnTimer:  0,
  _pollenSpawnTimer: 0,
  _lastTime: null,
  _speedBtnAreas: [],

  // ── Bootstrap ─────────────────────────────────────────
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');

    Images.load();
    AudioMgr.load();

    this._resize();
    window.addEventListener('resize', () => this._resize());

    // 타이틀 화면부터 시작
    this._showTitle();
  },

  // 모드를 결정한 후 실제 게임 초기화
  _startGame(mode) {
    console.log('[_startGame] mode=', mode);
    CONFIG.GAME_MODE = mode;
    this.camera = new Camera(this.canvas);
    this.world  = new World();
    this.ui     = new UI();
    this._bindInput();
    console.log('[_startGame] core systems initialized');

    if (mode === 'load') {
      // 모드는 저장된 데이터에서 복원
      if (!SaveLoad.load(this)) {
        // 저장본이 없으면 공원 모드로 폴백
        CONFIG.GAME_MODE = 'park';
        this._spawnInitial();
      }
    } else if (mode === 'family') {
      this._spawnInitialFamily();
      console.log('[_startGame] family spawn done, playerFamilyId=', this.playerFamilyId);
    } else {
      this._spawnInitial();
    }

    if (this._initialHouse) {
      this.camera.centerOn(this._initialHouse.cx, this._initialHouse.cy);
    }

    // 자동저장 타이머
    this._autosaveTimer = 0;

    this._titleActive = false;

    // BGM 패널 표시
    const bgm = document.getElementById('bgmPanel');
    if (bgm) bgm.style.display = 'flex';

    console.log('[_startGame] entering main loop. siljangsuk=',
      this.siljangsukList.length, 'houses=', this.houses.length);
    requestAnimationFrame(t => this._loop(t));
  },

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  // ── Title screen ──────────────────────────────────────
  _titleActive: false,
  _titleBtnAreas: [],
  _showTitle() {
    this._titleActive = true;
    this._titleBtnAreas = [];

    const drawTitle = () => {
      if (!this._titleActive) return;
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const titleImg = Images.getTitle && Images.getTitle();
      if (titleImg && titleImg.complete && titleImg.naturalWidth > 0) {
        // 비율 유지하면서 화면에 꽉 채우기
        const sc = Math.min(canvas.width / titleImg.naturalWidth,
                            canvas.height / titleImg.naturalHeight);
        const w = titleImg.naturalWidth * sc;
        const h = titleImg.naturalHeight * sc;
        ctx.drawImage(titleImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      } else {
        // 폴백 타이틀 텍스트
        ctx.fillStyle = '#ffe066';
        ctx.font = 'bold 64px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('후타바 공원', canvas.width / 2, canvas.height * 0.4);
        ctx.font = '24px "Noto Sans KR", sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('실장석 시뮬레이터', canvas.width / 2, canvas.height * 0.4 + 50);
      }

      // 메뉴 (중앙 하단)
      const labels = [
        { key: 'family', label: '가족 시작 (베타)' },
        { key: 'park',   label: '공원 시작' },
        { key: 'load',   label: '불러오기' },
      ];
      const bw = 200, bh = 56, gap = 20;
      const totalW = labels.length * bw + (labels.length - 1) * gap;
      let x = (canvas.width - totalW) / 2;
      const y = canvas.height - 140;
      this._titleBtnAreas = [];
      for (const item of labels) {
        const hover = this._titleHover === item.key;
        ctx.fillStyle = hover ? 'rgba(255,224,102,0.9)' : 'rgba(40,30,20,0.85)';
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = 2;
        Utils.roundRect(ctx, x, y, bw, bh, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = hover ? '#1a1a2a' : '#ffe066';
        ctx.font = 'bold 22px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, x + bw / 2, y + bh / 2);
        ctx.textBaseline = 'alphabetic';
        this._titleBtnAreas.push({ x, y, w: bw, h: bh, key: item.key });
        x += bw + gap;
      }

      // 불러오기 가능 표시
      const hasSave = !!localStorage.getItem('futaba_park_save');
      if (!hasSave) {
        const loadBtn = this._titleBtnAreas[2];
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        Utils.roundRect(ctx, loadBtn.x, loadBtn.y, loadBtn.w, loadBtn.h, 10);
        ctx.fill();
        ctx.fillStyle = '#aaa';
        ctx.font = '14px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(저장본 없음)', loadBtn.x + loadBtn.w / 2, loadBtn.y + loadBtn.h - 8);
      }

      requestAnimationFrame(drawTitle);
    };

    const onMove = (e) => {
      if (!this._titleActive) return;
      const mx = e.clientX, my = e.clientY;
      this._titleHover = null;
      for (const b of this._titleBtnAreas) {
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          this._titleHover = b.key;
          break;
        }
      }
    };
    const tryHit = (e) => {
      if (!this._titleActive) return;
      const mx = e.clientX, my = e.clientY;
      for (const b of this._titleBtnAreas) {
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          if (b.key === 'load' && !localStorage.getItem('futaba_park_save')) return;
          // 리스너 정리
          window.removeEventListener('mousemove', onMove, true);
          window.removeEventListener('mousedown', tryHit, true);
          window.removeEventListener('click', tryHit, true);
          try {
            this._startGame(b.key);
          } catch (err) {
            console.error('Failed to start game:', err);
            // 실패하면 타이틀로 돌아가기
            this._titleActive = true;
            window.addEventListener('mousemove', onMove, true);
            window.addEventListener('mousedown', tryHit, true);
            window.addEventListener('click', tryHit, true);
            requestAnimationFrame(drawTitle);
          }
          return;
        }
      }
    };
    window.addEventListener('mousemove', onMove, true);
    window.addEventListener('mousedown', tryHit, true);
    window.addEventListener('click', tryHit, true);

    requestAnimationFrame(drawTitle);
  },

  // ── 공통: 한 가족(집 + 부모 + 자실장 3) 스폰 + 주변 시설 ──
  // options: { personality, isPlayer }
  _createFamilyAt(x, y, options = {}) {
    const hx = x - CONFIG.HOUSE_WIDTH  / 2;
    const hy = y - CONFIG.HOUSE_HEIGHT / 2;
    const house = new House(hx, hy, -1);
    this.houses.push(house);
    this.entities.set(house.id, house);

    const personality = options.personality
      ?? (Utils.randomPersonality ? Utils.randomPersonality() : CONFIG.PERSONALITY_NORMAL);
    const adult = this.spawnSiljangsuk(
      house.cx + Utils.random(-30, 30),
      house.cy + Utils.random(-30, 30),
      4, null, personality, null
    );
    adult.houseId      = house.id;
    adult.satiation    = adult.maxSat;
    adult.happiness    = 80;
    adult.serialNo     = this.nextSerialNo++;
    house.ownerId      = adult.id;
    house.foodReserves = 50;
    if (options.isPlayer) adult.isPlayerFamily = true;

    const familyId = adult.familyId;
    for (let k = 0; k < 3; k++) {
      const child = this.spawnSiljangsuk(
        house.cx + Utils.random(-50, 50),
        house.cy + Utils.random(-50, 50),
        3, adult.id, CONFIG.PERSONALITY_NORMAL, familyId
      );
      child.houseId    = house.id;
      child.satiation  = child.maxSat;
      child.happiness  = 80;
      child.serialNo   = this.nextSerialNo++;
      child.birthOrder = k + 1;
      child.parentLabelSnapshot = adult.label;
    }
    adult.birthsGiven = 3;

    // 주변 쓰레기통(우상) + 수돗가(좌하) 배치 — 집과 충돌하지 않게
    const trash = new TrashCan(
      Utils.clamp(house.cx + 130, 50, CONFIG.WORLD_WIDTH - 50),
      Utils.clamp(house.cy - 110, 50, CONFIG.WORLD_HEIGHT - 50)
    );
    this.trashCans.push(trash);

    if (this.world && this.world.waterSpots) {
      this.world.waterSpots.push({
        type: 'tap',
        x: Utils.clamp(house.cx - 130, 50, CONFIG.WORLD_WIDTH - 50),
        y: Utils.clamp(house.cy + 110, 50, CONFIG.WORLD_HEIGHT - 50),
        r: 28,
      });
      this.world._bgDirty = true;   // 배경 캐시 재생성
    }

    return { house, adult, familyId };
  },

  // ── Initial spawn ─────────────────────────────────────
  _spawnInitial() {
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    // 메인 가족(중앙쪽)
    const main = this._createFamilyAt(W * 0.35, H * 0.40, { personality: CONFIG.PERSONALITY_NORMAL });
    this._initialHouse = main.house;
    main.house.foodReserves = 60;

    // 추가 가족 5 — 흩어 배치
    const positions = [
      [W * 0.18, H * 0.20],
      [W * 0.78, H * 0.25],
      [W * 0.20, H * 0.78],
      [W * 0.82, H * 0.80],
      [W * 0.55, H * 0.65],
    ];
    for (const [x, y] of positions) {
      this._createFamilyAt(x, y);
    }

    // 초기 아이템
    for (let i = 0; i < 30; i++) {
      const spot = this.world.randomOpenSpot();
      const type = Math.random() < 0.5 ? randomFoodType() : (Math.random() < 0.5 ? 'paper' : 'leaf');
      this.spawnItem(type, spot.x, spot.y);
    }
  },

  // ── 가족 모드 초기 스폰 ───────────────────────────
  _spawnInitialFamily() {
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    const totalFamilies = (CONFIG.FAMILY_STARTING_FAMILIES ?? 4) + 1;
    this.playerFamilyId = null;

    let firstHouse = null;
    for (let i = 0; i < totalFamilies; i++) {
      const angle = (i / totalFamilies) * Math.PI * 2 + Math.random() * 0.3;
      const r = Math.min(W, H) * 0.30;
      const cx = Utils.clamp(W / 2 + Math.cos(angle) * r, 300, W - 300);
      const cy = Utils.clamp(H / 2 + Math.sin(angle) * r, 300, H - 300);
      const fam = this._createFamilyAt(cx, cy, { isPlayer: i === 0 });
      if (i === 0) {
        firstHouse = fam.house;
        this.playerFamilyId = fam.familyId;
      }
    }
    this._initialHouse = firstHouse;

    // 초기 바닥 아이템
    for (let i = 0; i < 15; i++) {
      const spot = this.world.randomOpenSpot();
      const type = Math.random() < 0.5 ? randomFoodType() : (Math.random() < 0.5 ? 'paper' : 'leaf');
      this.spawnItem(type, spot.x, spot.y);
    }
  },

  // ── Game loop ─────────────────────────────────────────
  _loop(timestamp) {
    if (!this._lastTime) this._lastTime = timestamp;
    let dt = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;
    dt = Math.min(dt, 0.1) * this.gameSpeed;

    if (!this.isPaused) {
      try { this._update(dt); }
      catch (e) { console.error('Update error:', e); this.isPaused = true; }
    }
    AudioMgr.updateForState(this);
    try { this._draw(); }
    catch (e) { console.error('Draw error:', e); }

    // 자동 저장
    this._autosaveTimer = (this._autosaveTimer ?? 0) + dt;
    if (this._autosaveTimer >= (CONFIG.AUTOSAVE_INTERVAL ?? 10)) {
      this._autosaveTimer = 0;
      try { SaveLoad.save(this); } catch (e) {}
    }

    requestAnimationFrame(t => this._loop(t));
  },

  _update(dt) {
    this.camera.update(dt, this._keys);

    // 카메라 추적 모드
    if (this.camera.followEntity) {
      const fe = this.camera.followEntity;
      if (fe.dead || fe.done) {
        this.camera.followEntity = null;
      }
    }

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

    // 바닥 운치 수명 감소
    for (const u of this.floorUnci) u.life -= dt;
    this.floorUnci = this.floorUnci.filter(u => u.life > 0);

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
      if (owner) this.logEvent(`🏠 ${owner.label}의 집 완공`, '#ffe066', { x: c.x + c.w/2, y: c.y + c.h/2 });
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

    // 이벤트 로그 시간 진행 (사라지지 않음, time은 페이드인용 - 첫 0.5초만)
    for (const ev of this.events) {
      if (ev.time < 1) ev.time += dt;
    }

    // 습격 트리거 / 종료 체크
    this._raidCheckTimer -= dt;
    if (this._raidCheckTimer <= 0) {
      this._raidCheckTimer = CONFIG.TRIBE_RAID_CHECK_INTERVAL;
      this._checkRaidTriggers();
    }
    this._checkRaidEnd();

    // 역병 업데이트 (가족 모드: 자동 전파 비활성, 이벤트로만 발동)
    const plagueSpreadEnabled = CONFIG.GAME_MODE !== 'family';
    for (const s of this.siljangsukList) {
      if (s.dead || !s._plagueInfected) continue;
      s._plagueTimer -= dt;
      if (s._plagueTimer > 0) continue;
      // 감염 진행
      s._plagueStage = Math.min(1, (s._plagueStage ?? 0) + dt / 30);
      // 주변 실장석에게 전파 (가족 모드에선 자동 전파 차단)
      if (plagueSpreadEnabled && Math.random() < 0.02) {
        const near = this.findNearestSiljangsuk(s.x, s.y, 80, t =>
          !t.dead && !t._plagueInfected && t.id !== s.id);
        if (near) {
          near._plagueInfected = true;
          near._plagueTimer = 0;
          near._plagueStage = 0;
          this.logEvent(`🦠 ${near.label} 역병 전파됨`, '#44aa44', { x: near.x, y: near.y });
        }
      }
      // 감염 완료 후 HP 감소
      if (s._plagueStage >= 1) {
        s._plagueDeathTimer = (s._plagueDeathTimer ?? 0) + dt;
        if (s._plagueDeathTimer >= (CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH)) {
          s.hp = Math.max(0, s.hp - 3 * dt);
        }
      }
    }

    // 화염 업데이트
    if (this._flames) {
      for (const f of this._flames) {
        f.life -= dt;
        if (f.spread && Math.random() < 0.15) {
          const nx = f.x + Utils.random(-40, 40);
          const ny = f.y + Utils.random(-40, 40);
          if (f.life > 1) this._flames.push({ x: nx, y: ny, r: 40, life: 2.0, spread: false });
        }
        // 불에 닿은 실장석
        for (const s of this.siljangsukList) {
          if (s.dead || s._onFire) continue;
          if (Utils.distance(s, f) < f.r) {
            s._onFire = true;
            s._fireTimer = 8;
            this.addParticle(s.x, s.y - 10, '🔥', '#ff6600', 1000);
          }
        }
        // 불에 닿은 집
        for (const h of this.houses) {
          if (h._onFire) continue;
          if (Utils.distance({ x: h.cx, y: h.cy }, f) < f.r + 40) {
            h._onFire = true;
            h._fireTimer = 15;
          }
        }
      }
      this._flames = this._flames.filter(f => f.life > 0);

      // 불타는 실장석 처리 — 죽을 때까지 안 꺼짐, 지속 파티클 생성
      for (const s of this.siljangsukList) {
        if (!s._onFire || s.dead) continue;
        s.hp = Math.max(0, s.hp - 15 * dt);
        if (!s._fireFleeSet) {
          s._fireFleeSet = true;
          const ang = Math.random() * Math.PI * 2;
          s.targetX = Utils.clamp(s.x + Math.cos(ang) * 300, 0, CONFIG.WORLD_WIDTH);
          s.targetY = Utils.clamp(s.y + Math.sin(ang) * 300, 0, CONFIG.WORLD_HEIGHT);
          s.fleeing = true; s.fleeTimer = 999;
        }
        // 지속 불꽃 파티클
        s._fireParticleCD = (s._fireParticleCD ?? 0) - dt;
        if (s._fireParticleCD <= 0) {
          s._fireParticleCD = 0.12;
          this.addParticle(
            s.x + Utils.random(-8, 8),
            s.y - 10 + Utils.random(-6, 6),
            '🔥', '#ff6600', 500);
        }
      }
      // 불타는 집 — 지속 파티클
      for (const h of this.houses) {
        if (!h._onFire) continue;
        h._fireTimer -= dt;
        h.hp = Math.max(0, h.hp - 5 * dt);
        h._fireParticleCD = (h._fireParticleCD ?? 0) - dt;
        if (h._fireParticleCD <= 0) {
          h._fireParticleCD = 0.15;
          this.addParticle(
            h.cx + Utils.random(-20, 20),
            h.cy + Utils.random(-15, 15),
            '🔥', '#ff6600', 600);
        }
        if (h._fireTimer <= 0 || h.hp <= 0) {
          h._onFire = false;
          if (h.hp <= 0) this.destroyHouse(h);
        }
      }
      // 화염 자체의 지속 파티클
      for (const f of this._flames) {
        f._particleCD = (f._particleCD ?? 0) - dt;
        if (f._particleCD <= 0) {
          f._particleCD = 0.1;
          this.addParticle(
            f.x + Utils.random(-f.r*0.5, f.r*0.5),
            f.y + Utils.random(-f.r*0.5, f.r*0.5),
            '🔥', '#ff8800', 500);
        }
      }
    }

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
    // 집 안락함에 따라 거주자 행복 +5/별 (별=comfort/20)
    for (const h of this.houses) {
      const stars = Math.round(h.comfort / 20);
      if (stars <= 0) continue;
      const gain = stars * 5;
      for (const s of this.siljangsukList) {
        if (s.dead) continue;
        if (s.houseId !== h.id) continue;
        if (s.slaveOf) continue;
        s.happiness = Math.min(100, s.happiness + gain);
      }
    }

    if (d > 0 && d % CONFIG.CAT_SPAWN_DAYS === 0) {
      const h = new Human(3);
      this.humans.push(h); this.entities.set(h.id, h);
      this.logEvent(`🐱 고양이 등장!`, '#ff9944', { x: h.x, y: h.y });
    }
    if (d > 0 && d % CONFIG.ATTACKER_SPAWN_DAYS === 0) {
      const h = new Human(2);
      this.humans.push(h); this.entities.set(h.id, h);
      this.logEvent(`👊 학대파 등장!`, '#ff2222', { x: h.x, y: h.y });
    }
    // 필드에 떨어진 음식 3일 후 소멸 (집에 들어간 비축 식량은 별개)
    let rotted = 0;
    this.items = this.items.filter(it => {
      if (it.collected) return true;
      if (it.isFood && it.isFood() && (d - (it.spawnDayIndex ?? 0)) >= 3) {
        this.entities.delete(it.id);
        rotted++;
        return false;
      }
      return true;
    });
    if (rotted > 0) this.logEvent(`🍂 오래된 음식 ${rotted}개 부패`, '#888888');

    // 폐지, 낙엽도 3일 후 소멸
    let decayed = 0;
    this.items = this.items.filter(it => {
      if (it.collected) return true;
      if ((it.type === 'paper' || it.type === 'leaf') && (d - (it.spawnDayIndex ?? 0)) >= 3) {
        this.entities.delete(it.id);
        decayed++;
        return false;
      }
      return true;
    });
    if (decayed > 0) this.logEvent(`📄 오래된 폐지/낙엽 ${decayed}개 소멸`, '#888888');

    // 모든 집 HP 자동 소모 (빈집은 더 빨리)
    for (const h of this.houses) {
      const decay = h.vacant ? CONFIG.HOUSE_VACANT_DAILY_DECAY : CONFIG.HOUSE_DAILY_DECAY;
      h.hp = Math.max(0, h.hp - decay);
      if (h.hp <= 0) this.destroyHouse(h);
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
      // 페이즈 변경 시 행동 잠금 해제 (변수 발생)
      if (s._breakActionLock) s._breakActionLock();

      if (to === 'morning') {
        // 밤사이 탈주한 노예의 은신 효과 해제
        if (s._stealth) s._stealth = false;
        // 아침 식사: 모든 실장석
        s._mealPending = true;
        // 아침 물 마시기 욕구 (성체만) - drink 후 소풍 판정
        if (s.stage === 4 && !s.slaveOf) {
          s._needDrink = true;
          s._drankToday = false;
          s._picnicToday = false;
        }
        // 2~3단계: 낮 중간 식사 2회 예약
        if (s.stage >= 2 && s.stage < 4) {
          s._childMealCount = 2;
          s._childMealTimer = 17;
        }
      }
      if (to === 'evening' || to === 'night') {
        // 저녁/밤 되면 소풍 종료
        if (s._picnicToday) s._picnicToday = false;
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

  // ── 가족 모드: 선택된 엔티티 조회 ─────────────────
  _getSelectedFamilyEntities() {
    const ids = this.ui?._selectedIds;
    if (!ids || ids.size === 0) return [];
    const out = [];
    for (const s of this.siljangsukList) {
      if (s.dead) continue;
      if (!ids.has(s.id)) continue;
      if (s.familyId !== this.playerFamilyId) continue;
      if (s.slaveOf) continue;
      out.push(s);
    }
    return out;
  },

  // ── 가족 모드: 우클릭 명령 처리 ───────────────────
  _handleFamilyRightClick(wx, wy, shiftAdd) {
    const selected = this._getSelectedFamilyEntities();
    if (selected.length === 0) return;

    // 타겟 분류
    // 1) 운치굴: 어떤 집의 unci 반경?
    let unciHouse = null;
    for (const h of this.houses) {
      if (Utils.distance({ x: wx, y: wy }, { x: h.unciX, y: h.unciY }) <= CONFIG.UNCI_RADIUS + 6) {
        unciHouse = h; break;
      }
    }
    // 2) 쓰레기통
    let trash = null;
    for (const tc of this.trashCans) {
      if (Utils.distance({ x: wx, y: wy }, tc) < 40) { trash = tc; break; }
    }
    // 3) 수풀
    let bush = null;
    if (!trash && this.world && this.world.bushes) {
      let bd = Infinity;
      for (const b of this.world.bushes) {
        const d = Utils.distance({ x: wx, y: wy }, b);
        if (d < (b.r ?? 16) + 8 && d < bd) { bd = d; bush = b; }
      }
    }
    // 4) 다른 실장석
    let targetSilj = null;
    for (const s of this.siljangsukList) {
      if (s.dead) continue;
      if (Utils.distance({ x: wx, y: wy }, s) < (s.size + 6)) { targetSilj = s; break; }
    }

    // 명령 분배
    if (targetSilj && targetSilj.familyId === this.playerFamilyId && !targetSilj.slaveOf
        && targetSilj.stage >= 2 && targetSilj.stage <= 3) {
      // 자기 가족 자식(2/3단계) → 프니프니 담당
      for (const e of selected) {
        e._command = { type: 'pniepnie' };
      }
      this.addParticle(targetSilj.x, targetSilj.y - 20,
        `프니프니 담당 ${selected.length}명`, '#ffaaff', 1800);
      // 명령 받은 새끼 자체에게 부여 (대상이 명령 받는 게 자연스러우니)
      targetSilj._command = { type: 'pniepnie' };
      return;
    }

    if (targetSilj && targetSilj.stage <= 3 && targetSilj.familyId === this.playerFamilyId
        && !targetSilj.slaveOf && unciHouse === null) {
      // 일반적인 새끼 클릭은 위에서 처리. 폴백 — 이동
    }

    if (unciHouse && targetSilj && targetSilj.stage >= 2 && targetSilj.stage <= 3
        && !targetSilj.slaveOf) {
      // 운치굴 + 새끼: 처박는 명령 (선택된 1명이 데려감)
      const carrier = selected[0];
      carrier._command = {
        type: 'put_in_unci',
        babyId: targetSilj.id,
        houseId: unciHouse.id,
      };
      this.addParticle(targetSilj.x, targetSilj.y - 20, '운치굴로 끌고감!', '#cc6666', 1800);
      return;
    }

    if (trash) {
      const adults = selected.filter(s => s.stage === 4);
      const limit = 3;
      let slots = limit - this._countAssignedToTrash(trash);
      for (const e of adults) {
        if (slots <= 0) break;
        e._command = { type: 'gather_trash', x: trash.x, y: trash.y, targetId: trash.id };
        slots--;
      }
      this.addParticle(trash.x, trash.y - 30, '쓰레기통 채집 지정', '#cccc66', 1500);
      return;
    }

    if (bush) {
      const adults = selected.filter(s => s.stage === 4);
      let slots = 1 - this._countAssignedToBush(bush);
      for (const e of adults) {
        if (slots <= 0) break;
        e._command = { type: 'gather_bush', x: bush.x, y: bush.y, bushId: this._bushKey(bush) };
        slots--;
      }
      this.addParticle(bush.x, bush.y - 20, '수풀 채집 지정', '#88dd88', 1500);
      return;
    }

    // 기본: 이동
    // 선택된 멤버를 우클릭 지점 주변에 원형 배치 목표
    const N = selected.length;
    for (let i = 0; i < N; i++) {
      const ang = (i / Math.max(1, N)) * Math.PI * 2;
      const r = N > 1 ? 28 : 0;
      selected[i]._command = {
        type: 'move',
        x: wx + Math.cos(ang) * r,
        y: wy + Math.sin(ang) * r,
      };
    }
    this.addParticle(wx, wy, '이동', '#aaffff', 800);
  },

  _countAssignedToTrash(trash) {
    let n = 0;
    for (const s of this.siljangsukList) {
      if (s.dead) continue;
      if (s._command && s._command.type === 'gather_trash' && s._command.targetId === trash.id) n++;
    }
    return n;
  },
  _bushKey(b) { return `${Math.round(b.x)}_${Math.round(b.y)}`; },
  _countAssignedToBush(bush) {
    const key = this._bushKey(bush);
    let n = 0;
    for (const s of this.siljangsukList) {
      if (s.dead) continue;
      if (s._command && s._command.type === 'gather_bush' && s._command.bushId === key) n++;
    }
    return n;
  },

  // ── 전장의 안개 (가족 모드) ─────────────────────────
  // 플레이어 가족 멤버 주변만 시야 — 픽셀 마스크.
  // 화면 크기로 fog 캔버스를 한 번 채우고, 각 멤버 위치에서 radial gradient로 구멍을 뚫는다.
  _drawFogOfWar(ctx, camera) {
    if (!this._fogCanvas) this._fogCanvas = document.createElement('canvas');
    const fc = this._fogCanvas;
    if (fc.width !== this.canvas.width || fc.height !== this.canvas.height) {
      fc.width  = this.canvas.width;
      fc.height = this.canvas.height;
    }
    const fctx = fc.getContext('2d');

    // 1) 전체를 어둡게
    fctx.globalCompositeOperation = 'source-over';
    fctx.fillStyle = 'rgba(0,0,15,0.85)';
    fctx.fillRect(0, 0, fc.width, fc.height);

    // 2) 플레이어 가족 멤버 위치마다 구멍 뚫기 (destination-out)
    fctx.globalCompositeOperation = 'destination-out';
    const R = CONFIG.FOG_VISIBILITY_RADIUS ?? 350;
    const R_screen = R * camera.zoom;
    const drawVision = (wx, wy) => {
      const sx = (wx - camera.x) * camera.zoom;
      const sy = (wy - camera.y) * camera.zoom;
      if (sx < -R_screen || sy < -R_screen || sx > fc.width + R_screen || sy > fc.height + R_screen) return;
      const grad = fctx.createRadialGradient(sx, sy, 0, sx, sy, R_screen);
      grad.addColorStop(0,    'rgba(0,0,0,1)');
      grad.addColorStop(0.65, 'rgba(0,0,0,0.85)');
      grad.addColorStop(1,    'rgba(0,0,0,0)');
      fctx.fillStyle = grad;
      fctx.beginPath();
      fctx.arc(sx, sy, R_screen, 0, Math.PI * 2);
      fctx.fill();
    };
    for (const s of this.siljangsukList) {
      if (s.dead || s.familyId !== this.playerFamilyId) continue;
      drawVision(s.x, s.y);
    }
    // 자기 가족 집 주변도 시야 확보
    for (const h of this.houses) {
      const owner = this.entities.get(h.ownerId);
      if (owner && owner.familyId === this.playerFamilyId) {
        drawVision(h.cx, h.cy);
      }
    }
    fctx.globalCompositeOperation = 'source-over';

    // 3) 화면에 합성 — camera 변환 무시하고 스크린 좌표로 통째로 덮기
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(fc, 0, 0);
    ctx.restore();
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
    // 바닥 운치 — 근접한 것끼리 그룹화하여 표시 (×N, 최대 10)
    for (const u of this.floorUnci) { u._skipDraw = false; u.groupCount = 1; }
    for (const u of this.floorUnci) {
      if (u._skipDraw) continue;
      let count = 1;
      for (const v of this.floorUnci) {
        if (v === u || v._skipDraw) continue;
        if (Utils.distance(u, v) < 48 && count < 10) {
          count++;
          v._skipDraw = true;
        }
      }
      u.groupCount = count;
    }
    for (const u of this.floorUnci) {
      if (u._skipDraw) continue;
      if (!camera.isVisible(u.x, u.y, 30)) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, u.life / 30) * 0.7;
      ctx.fillStyle = '#7a5020';
      const r = 10 + Math.min(u.amount * u.groupCount, 60) * 0.35;
      ctx.beginPath();
      ctx.arc(u.x, u.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💩', u.x, u.y + 4);
      if (u.groupCount > 1) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 11px sans-serif';
        const txt = `×${u.groupCount}`;
        ctx.strokeText(txt, u.x + r + 4, u.y - r + 4);
        ctx.fillText(txt, u.x + r + 4, u.y - r + 4);
      }
      ctx.restore();
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

    // 아이템 그룹화 (64px 이내 같은 타입 합치기, 최대 10개)
    for (const item of this.items) {
      item._skipDraw = false;
      item.groupCount = 1;
    }
    for (const item of this.items) {
      if (item.collected || item._skipDraw) continue;
      let count = 1;
      for (const other of this.items) {
        if (other === item || other.collected || other._skipDraw) continue;
        if (other.type === item.type && Utils.distance(item, other) < 64) {
          count++;
          other._skipDraw = true;
        }
      }
      item.groupCount = Math.min(count, 10);
    }

    // Y-sort: 화면상 더 아래(y가 큰) 쪽이 위에 그려짐
    const drawables = [];
    for (const h  of this.houses)         drawables.push({ y: h.y + h.h, e: h  });
    for (const tc of this.trashCans)      drawables.push({ y: tc.y,      e: tc });
    for (const it of this.items) {
      if (it._skipDraw) continue;
      drawables.push({ y: it.y, e: it });
    }
    for (const s  of this.siljangsukList) drawables.push({ y: s.y,       e: s  });
    for (const hu of this.humans)         drawables.push({ y: hu.y,      e: hu });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.e.draw(ctx, camera);

    for (const pc of this.pollenClouds) pc.draw(ctx, camera);
    for (const p of this.particles)    p.draw(ctx, camera);

    // 화염 렌더링
    if (this._flames) {
      for (const f of this._flames) {
        if (!camera.isVisible(f.x, f.y, f.r)) continue;
        const alpha = Math.min(1, f.life) * 0.75;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        grad.addColorStop(0,   'rgba(255,200,0,0.9)');
        grad.addColorStop(0.5, 'rgba(255,80,0,0.7)');
        grad.addColorStop(1,   'rgba(200,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 역병 실장석 오버레이
    for (const s of this.siljangsukList) {
      if (!s._plagueInfected || s._plagueTimer > 0 || s.dead) continue;
      const stage = s._plagueStage ?? 0;
      ctx.save();
      ctx.globalAlpha = 0.4 * stage;
      ctx.fillStyle = `rgba(50,200,50,${0.7 * stage})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 선택된 조직 영역 — 멤버 둘러싸는 반투명 마커 + 보스는 붉은 원
    const selTribe = this.ui.selectedTribeId;
    if (selTribe !== null && selTribe !== undefined) {
      const boss = this.getTribeBoss(selTribe);
      ctx.save();
      ctx.fillStyle = 'rgba(255,220,80,0.18)';
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 2;
      for (const s of this.siljangsukList) {
        if (s.dead || s.familyId !== selTribe || s.slaveOf) continue;
        if (boss && s.id === boss.id) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 50, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      if (boss) {
        ctx.fillStyle   = 'rgba(255,40,40,0.30)';
        ctx.strokeStyle = '#ff3030';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, 60, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }

    // 다중선택된 실장석 강조 (노란 링)
    if (this.ui._selectedIds && this.ui._selectedIds.size > 0) {
      ctx.save();
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      for (const s of this.siljangsukList) {
        if (s.dead || !this.ui._selectedIds.has(s.id)) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 가족 모드: 명령 받은 멤버에 작은 명령 표식
    if (CONFIG.GAME_MODE === 'family') {
      ctx.save();
      const cmdIcon = {
        move:          { txt: '➤', color: '#aaffff' },
        gather_trash:  { txt: '🗑', color: '#ddcc66' },
        gather_bush:   { txt: '🌿', color: '#88dd88' },
        pniepnie:      { txt: '💝', color: '#ffaaff' },
        put_in_unci:   { txt: '⛓', color: '#cc6666' },
        build:         { txt: '🔨', color: '#ffcc66' },
      };
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      for (const s of this.siljangsukList) {
        if (s.dead || !s._command) continue;
        if (s.familyId !== this.playerFamilyId) continue;
        const ico = cmdIcon[s._command.type];
        if (!ico) continue;
        ctx.fillStyle = ico.color;
        ctx.fillText(ico.txt, s.x + s.size + 6, s.y - s.size - 4);
        // 이동/작업 타겟까지 점선
        if (s._command.x !== undefined) {
          ctx.strokeStyle = ico.color;
          ctx.globalAlpha = 0.4;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s._command.x, s._command.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    }

    // 마퀴 (드래그 중인 선택 사각형)
    if (this._marqueeActive) {
      const m = this._marqueeActive;
      const x = Math.min(m.x0, m.x1), y = Math.min(m.y0, m.y1);
      const w = Math.abs(m.x1 - m.x0), h = Math.abs(m.y1 - m.y0);
      ctx.save();
      ctx.fillStyle   = 'rgba(255,220,80,0.15)';
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
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

    // 전장의 안개 (가족 모드 한정) — camera 변환 적용된 상태에서 그리기
    if (CONFIG.GAME_MODE === 'family' && this.playerFamilyId !== null && this.playerFamilyId !== undefined) {
      this._drawFogOfWar(ctx, camera);
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

  // 중요 이벤트 로그 (영구 — 마우스 호버 시 스크롤 가능, 클릭 시 위치 이동)
  logEvent(text, color = '#eeeeee', pos = null) {
    this.events.push({ text, color, time: 0, pos });
    if (this.events.length > 200) this.events.shift();
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
      this.logEvent(`⚔️ ${boss?.label ?? fam} 조직이 ${target} 조직 습격!`, '#ff4444', boss ? { x: boss.x, y: boss.y } : null);
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
      this.logEvent(`⛓️ ${e.label} 노예로 전락`, '#cc6666', { x: e.x, y: e.y });
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
      s._warDecision = undefined;
    }
  },

  destroyHouse(house) {
    for (const s of this.siljangsukList) {
      if (s.houseId === house.id) {
        s.houseId = null;
        // 집에 있던 고아 새끼는 진짜 고아 처리 시작
        if (s._orphanVulnerable && s.stage < 4 && !s.slaveOf) {
          s.familyId = s.id;
          s.generation = 0;
          s._orphanGoal = null;
        }
      }
    }
    this.houses = this.houses.filter(h => h.id !== house.id);
    this.entities.delete(house.id);
    this.addParticle(house.cx, house.cy - 20, '집 파괴!', '#ff4444', 2000);
    this.logEvent('🏚️ 집이 파괴되었다', '#ff6666', { x: house.cx, y: house.cy });
  },

  findNearestItem(x, y, maxDist, filter = null, requester = null) {
    let best = null, bestD = maxDist;
    const now = Date.now();
    const reqId  = (typeof requester === 'object' && requester) ? requester.id : requester;
    const reqFam = (typeof requester === 'object' && requester) ? requester.familyId : null;
    for (const item of this.items) {
      if (item.collected) continue;
      // 같은 가족 누군가가 claim 했으면 항상 제외 (시간 무관)
      if (item.claimedBy && item.claimedBy !== reqId && reqFam !== null) {
        const claimer = this.entities.get(item.claimedBy);
        if (claimer && !claimer.dead && claimer.familyId === reqFam) continue;
      }
      // 추가: 같은 가족 누군가가 이미 이 아이템 근처로 향하고 있으면 제외
      if (reqFam !== null) {
        let alreadyHeading = false;
        for (const s of this.siljangsukList) {
          if (s.dead || s.id === reqId) continue;
          if (s.familyId !== reqFam) continue;
          if (s.targetX === undefined) continue;
          const td = Math.hypot(s.targetX - item.x, s.targetY - item.y);
          if (td < 18 && Utils.distance(s, item) < 200) {
            alreadyHeading = true; break;
          }
        }
        if (alreadyHeading) continue;
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
      // 로그 영역 위라면 로그 스크롤
      if (this.ui.handleLogWheel && this.ui.handleLogWheel(e.clientX, e.clientY, e.deltaY)) return;
      this.camera.onScroll(e.deltaY, e.clientX, e.clientY);
    }, { passive: false });

    window.addEventListener('mousemove', e => {
      if (this._panDrag) {
        const dx = e.clientX - this._panDrag.lastX;
        const dy = e.clientY - this._panDrag.lastY;
        this.camera._tx -= dx / this.camera._tz;
        this.camera._ty -= dy / this.camera._tz;
        this._panDrag.lastX = e.clientX;
        this._panDrag.lastY = e.clientY;
      }
      this._mouse.screenX = e.clientX;
      this._mouse.screenY = e.clientY;
      const w = this.camera.screenToWorld(e.clientX, e.clientY);
      this._mouse.worldX = w.x;
      this._mouse.worldY = w.y;
      // 로그 호버 갱신
      if (this.ui.updateLogHover) this.ui.updateLogHover(e.clientX, e.clientY);
      // 상태창 드래그
      if (this.ui._statDrag) {
        this.ui._statPanelPos = {
          x: e.clientX - this.ui._statDrag.offX,
          y: e.clientY - this.ui._statDrag.offY,
        };
      }
      // 마퀴 다중선택 갱신
      if (this._marqueeActive) {
        this._marqueeActive.x1 = w.x;
        this._marqueeActive.y1 = w.y;
      }
      // 그룹 드래그
      if (this._groupDrag) {
        const dxm = w.x - this._groupDrag.lastX;
        const dym = w.y - this._groupDrag.lastY;
        for (const s of this._groupDrag.entities) {
          if (!s.dead) { s.x += dxm; s.y += dym; s.targetX = s.x; s.targetY = s.y; }
        }
        this._groupDrag.lastX = w.x; this._groupDrag.lastY = w.y;
      }
      // 드래그 중: 엔티티 위치 동기화 + 속도 추적
      if (this._drag && this._drag.entity && !this._drag.entity.dead) {
        const dxm = w.x - this._drag.lastX, dym = w.y - this._drag.lastY;
        if (Math.hypot(dxm, dym) > 2) this._drag.moved = true;
        this._drag.vx = dxm / 0.016;
        this._drag.vy = dym / 0.016;
        this._drag.entity.x = w.x;
        this._drag.entity.y = w.y;
        this._drag.lastX = w.x;
        this._drag.lastY = w.y;
      }
    });

    // 컨텍스트 메뉴(우클릭 기본 동작) 차단 — 가족 모드 명령 입력용
    window.addEventListener('contextmenu', e => {
      if (CONFIG.GAME_MODE === 'family') e.preventDefault();
    });

    // 마우스 다운: 실장석 위에서 드래그 시작
    window.addEventListener('mousedown', e => {
      // 휠 버튼(중간 버튼) pan 시작
      if (e.button === 1) {
        e.preventDefault();
        this._panDrag = { lastX: e.clientX, lastY: e.clientY };
        return;
      }
      // 우클릭(가족 모드 명령)
      if (e.button === 2 && CONFIG.GAME_MODE === 'family') {
        e.preventDefault();
        this._handleFamilyRightClick(this._mouse.worldX, this._mouse.worldY, e.shiftKey);
        return;
      }
      if (e.button !== 0) return;
      // 상태창 헤더 드래그 시작
      if (this.ui._statHeaderArea && this.ui.selectedEntity) {
        const h = this.ui._statHeaderArea;
        if (e.clientX >= h.x && e.clientX <= h.x + h.w
            && e.clientY >= h.y && e.clientY <= h.y + h.h) {
          this.ui._statDrag = { offX: e.clientX - h.x, offY: e.clientY - h.y };
          return;
        }
      }
      if (this.ui.selectedMenu >= 0) return;
      const wx = this._mouse.worldX, wy = this._mouse.worldY;
      let picked = null;
      for (const s of this.siljangsukList) {
        if (s.dead) continue;
        if (Utils.distance({ x: wx, y: wy }, s) < (s.size + 6)) { picked = s; break; }
      }
      // 선택된 실장석을 누르면 그룹 드래그 시작 (한 곳에 뭉쳐서 함께 이동)
      if (picked && this.ui._selectedIds && this.ui._selectedIds.has(picked.id) && this.ui._selectedIds.size > 1) {
        const entities = this.siljangsukList.filter(s => !s.dead && this.ui._selectedIds.has(s.id));
        // 한 자리에 뭉치기 — 마우스 위치 주변 32px 원형 배치
        const N = entities.length;
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          entities[i].x = wx + Math.cos(a) * 24;
          entities[i].y = wy + Math.sin(a) * 24;
          entities[i].targetX = entities[i].x;
          entities[i].targetY = entities[i].y;
        }
        this._groupDrag = { entities, lastX: wx, lastY: wy };
        return;
      }
      // 빈 땅 클릭 → 마퀴 시작
      if (!picked) {
        this._marqueeActive = { x0: wx, y0: wy, x1: wx, y1: wy };
        // 기존 선택 해제 (Shift 없이)
        if (!e.shiftKey) this.ui._selectedIds = new Set();
        return;
      }
      if (picked) {
        // 가족 모드: 플레이어 가족 클릭 = 선택 (물리 드래그 X)
        if (CONFIG.GAME_MODE === 'family' && picked.familyId === this.playerFamilyId && !picked.slaveOf) {
          if (!this.ui._selectedIds) this.ui._selectedIds = new Set();
          if (!e.shiftKey) this.ui._selectedIds.clear();
          if (this.ui._selectedIds.has(picked.id) && e.shiftKey) {
            this.ui._selectedIds.delete(picked.id);
          } else {
            this.ui._selectedIds.add(picked.id);
          }
          // 단일 선택 상태에서 상세 패널 표시도
          if (this.ui._selectedIds.size === 1) this.ui.selectedEntity = picked;
          return;
        }

        // 더블탭 체크 (350ms 이내 같은 대상)
        const now = performance.now();
        if (this._lastTap.entity === picked && (now - this._lastTap.time) < 350) {
          const dmg = picked.stage === 4 ? 10 : 5;
          picked.hp = Math.max(0, picked.hp - dmg);
          picked.hitFlashTimer = 0.35;
          this.addParticle(picked.x, picked.y - 18, `-${dmg}(찰싹)`, '#ff4444', 1000);
          // 운치굴 갇힘 + HP 0 → 죽지 않고 노예화
          if (picked._stuckInUnci && picked.hp <= 0 && !picked.slaveOf) {
            picked.hp = 1;
            picked.slaveOf  = picked._stuckOwnerId ?? null;
            picked.wasSlave = true;
            picked._stuckInUnci = false;
            this.addParticle(picked.x, picked.y - 30, '⛓ 노예화!', '#cc6666', 2500);
            this.logEvent && this.logEvent(`⛓ ${picked.label} 독라 노예로 전락`, '#cc6666', { x: picked.x, y: picked.y });
          }
          this._lastTap = { entity: null, time: 0 };
          return;
        }
        this._lastTap = { entity: picked, time: now };

        this._drag = {
          entity: picked, lastX: wx, lastY: wy,
          vx: 0, vy: 0, startTime: now, moved: false,
        };
        picked.beingDragged = true;
        picked.thrown = false;
        picked.vx = 0; picked.vy = 0;
        // 익사 중인 실장석을 잡으면 익사 해제 (물 밖으로 꺼냄)
        if (picked.drowning) {
          picked.drowning = false;
          this.addParticle(picked.x, picked.y - 18, '구조됨!', '#66ccff', 1800);
          this.logEvent(`💧 ${picked.label} 익사에서 구조됨`, '#66ccff', { x: picked.x, y: picked.y });
        }
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 1) {
        this._panDrag = null;
        return;
      }
      if (e.button !== 0) return;
      // 상태창 드래그 종료 — 직후 click 이벤트로 선택 해제 안 되게 가드
      if (this.ui._statDrag) {
        this.ui._statDrag = null;
        this._justEndedStatDrag = true;
        return;
      }
      // 마퀴 선택 종료
      if (this._marqueeActive) {
        const m = this._marqueeActive;
        const x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1);
        const y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1);
        const sel = new Set();
        const familyOnly = (CONFIG.GAME_MODE === 'family');
        for (const s of this.siljangsukList) {
          if (s.dead) continue;
          if (familyOnly && s.familyId !== this.playerFamilyId) continue;
          if (familyOnly && s.slaveOf) continue;
          if (s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1) sel.add(s.id);
        }
        this.ui._selectedIds = sel;
        this._marqueeActive = null;
        if (sel.size > 0) {
          this.addParticle((x0 + x1) / 2, y0 - 10, `${sel.size}마리 선택`, '#ffe066', 1500);
        }
        return;
      }
      // 그룹 드래그 종료
      if (this._groupDrag) {
        this._groupDrag = null;
        this._justDragged = true;
        return;
      }
      if (this._drag && this._drag.entity) {
        const ent = this._drag.entity;
        ent.beingDragged = false;
        if (this._drag.moved) this._justDragged = true;
        const sp = Math.hypot(this._drag.vx, this._drag.vy);
        // 빠르게 놓으면 던져짐 — 속도 비례 데미지
        if (sp > 600) {
          ent.thrown = true;
          ent.vx = this._drag.vx * 0.4;
          ent.vy = this._drag.vy * 0.4;
          const dmg = Math.min(40, Math.floor(sp / 100));
          if (dmg > 0) {
            ent.hp = Math.max(0, ent.hp - dmg);
            ent.hitFlashTimer = 0.35;
            this.addParticle(ent.x, ent.y - 16, `-${dmg}(던지기)`, '#ff4444', 1200);
          }
        }
        // 놓은 자리가 연못이면 익사 시작
        ent._checkPondImmerse(this);
        this._drag = null;
      }
    });

    window.addEventListener('click', e => {
      AudioMgr.startOnGesture();
      // 방금 드래그 했으면 click 무시 (잘못된 메뉴/선택 방지)
      if (this._justDragged) { this._justDragged = false; return; }
      const sx = e.clientX, sy = e.clientY;
      const wx = this._mouse.worldX, wy = this._mouse.worldY;

      // 배속 버튼
      for (const btn of this._speedBtnAreas) {
        if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
          this.gameSpeed = btn.speed; return;
        }
      }

      if (this.ui.handleLogClick && this.ui.handleLogClick(sx, sy, this)) return;
      if (this.ui.handleTribePanelClick(sx, sy, this)) return;
      if (this.ui.handleRenameClick(sx, sy, this)) return;
      if (this.ui.handlePniepnieClick(sx, sy, this)) return;
      if (this.ui.handleCamTrackClick && this.ui.handleCamTrackClick(sx, sy, this)) return;

      // 상위 카테고리 버튼 클릭
      if (this.ui._catBtnAreas) {
        for (const btn of this.ui._catBtnAreas) {
          if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
            if (this.ui.selectedCategory === btn.catIdx) {
              this.ui.selectedCategory = -1; // 토글 닫기
            } else {
              this.ui.selectedCategory = btn.catIdx;
            }
            this.ui.selectedMenu = -1;
            return;
          }
        }
      }

      // 대사 추가 버튼
      if (this.ui._addSpeechBtn) {
        const asb = this.ui._addSpeechBtn;
        if (sx >= asb.x && sx <= asb.x + asb.w && sy >= asb.y && sy <= asb.y + asb.h) {
          const stage = window.prompt('어느 단계 대사? (1/2/3/4)', '4');
          if (!stage) return;
          const cat = window.prompt('카테고리? (idle/food/sleep/hurt/unci/play/raid/birth/meal/evening/taegyo)', 'idle');
          if (!cat) return;
          const text = window.prompt('대사 내용:', '');
          if (!text) return;
          try {
            const sNum = parseInt(stage);
            if (SPEECHES[sNum] && SPEECHES[sNum][cat]) {
              if (Array.isArray(SPEECHES[sNum][cat])) {
                SPEECHES[sNum][cat].push(text.trim());
              }
              this.addParticle(this.canvas.width/2, this.canvas.height/2, '대사 추가됨!', '#aaffaa', 2000);
            }
          } catch(e) {}
          return;
        }
      }

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
        const menuItem = this.ui._menuCurrentItems
          ? this.ui._menuCurrentItems[this.ui.selectedMenu]
          : (() => {
              const alive2 = this.siljangsukList.filter(s => !s.dead).length;
              return MENU_ITEMS.filter(m => alive2 >= m.unlock || this.cheatUnlockAll)[this.ui.selectedMenu];
            })();
        if (menuItem && menuItem.type !== 'none') {
          // 인간/고양이/일반인 스폰
          if (['human_1', 'human_2', 'cat', 'human_4'].includes(menuItem.type)) {
            const typeMap = { human_1: 1, human_2: 2, cat: 3, human_4: 4 };
            const h = new Human(typeMap[menuItem.type]);
            h.x = wx; h.y = wy; h.targetX = wx; h.targetY = wy;
            this.humans.push(h);
            this.entities.set(h.id, h);
            return;
          }
          // 실장석 직접 스폰
          const spawnMap = {
            spawn_adult:        { stage: 4, slave: false },
            spawn_stage3:       { stage: 3, slave: false },
            spawn_stage2:       { stage: 2, slave: false },
            spawn_stage1:       { stage: 1, slave: false },
            spawn_adult_slave:  { stage: 4, slave: true  },
            spawn_stage3_slave: { stage: 3, slave: true  },
            spawn_stage2_slave: { stage: 2, slave: true  },
          };
          if (spawnMap[menuItem.type]) {
            const cfg = spawnMap[menuItem.type];
            const s = this.spawnSiljangsuk(wx, wy, cfg.stage, null,
              Utils.randomPersonality(), null);
            s.serialNo = this.nextSerialNo++;
            s.satiation = s.maxSat;
            s.happiness = 60;
            if (cfg.slave) {
              s.wasSlave = true;
              s.fugitive = true;
              s.parentId = null;
              s.familyId = s.id;
              s.generation = 0;
            }
            this.addParticle(wx, wy - 20, '+1', '#ffe066', 1000);
            return;
          }
          // 꽃가루: 클릭한 4단계 성체를 즉시 임신
          if (menuItem.type === 'pollen') {
            const target = this.findNearestSiljangsuk(wx, wy, 50,
              s => !s.dead && s.stage === 4 && !s.pregnant && !s.slaveOf);
            if (target && target._onPregnant) {
              target._onPregnant(this);
              this.addParticle(target.x, target.y - 22, '🌸 임신!', '#ffaaff', 2000);
              this.logEvent(`🌸 ${target.label} 꽃가루 임신`, '#ffaaff', { x: target.x, y: target.y });
            }
            return;
          }
          // 역병 선택 후 실장석 클릭
          if (menuItem.type === 'plague') {
            const target = this.findNearestSiljangsuk(wx, wy, 40, s => !s.dead);
            if (target) {
              target._plagueTimer = 30; // 30초 후 감염 시작
              target._plagueInfected = true;
              target._plagueStage = 0;
              this.addParticle(target.x, target.y - 20, '🦠 역병 감염!', '#44cc44', 2000);
              this.logEvent(`🦠 ${target.label} 실장역병 감염`, '#44aa44', { x: target.x, y: target.y });
            }
            return;
          }
          // 화염방사기
          if (menuItem.type === 'flamethrower') {
            if (!this._flames) this._flames = [];
            this._flames.push({ x: wx, y: wy, r: 60, life: 3.0, spread: true });
            this.addParticle(wx, wy - 10, '🔥', '#ff6600', 1000);
            return;
          }
          // 대사 추가: prompt로 입력 받아 단계/카테고리 풀에 추가
          if (menuItem.type === 'add_speech') {
            const stage = window.prompt('어느 단계 대사? (1/2/3/4)', '4');
            if (!stage) return;
            const cat = window.prompt('카테고리? (idle/food/sleep/hurt/unci/play/raid/birth/meal/evening/taegyo)', 'idle');
            if (!cat) return;
            const text = window.prompt('대사 내용:', '');
            if (!text) return;
            try {
              const sNum = parseInt(stage);
              if (SPEECHES[sNum] && SPEECHES[sNum][cat]) {
                if (Array.isArray(SPEECHES[sNum][cat])) {
                  SPEECHES[sNum][cat].push(text.trim());
                } else {
                  // stage 3 idle의 경우 객체 (성격별)
                  const subKey = Object.keys(SPEECHES[sNum][cat])[0];
                  SPEECHES[sNum][cat][subKey].push(text.trim());
                }
                this.logEvent(`💬 ${sNum}단계 ${cat} 대사 추가: "${text}"`, '#aaffee');
              } else {
                alert('해당 단계/카테고리가 없습니다.');
              }
            } catch (e) { console.warn(e); }
            return;
          }
          // 제거: 클릭 위치의 오브젝트/객체 파괴
          if (menuItem.type === 'remove') {
            // 실장석
            for (const s of this.siljangsukList) {
              if (!s.dead && Utils.distance({ x: wx, y: wy }, s) < (s.size + 6)) {
                s.hp = 0; s._die(this, '제거됨'); return;
              }
            }
            // 인간
            for (const hh of this.humans) {
              if (!hh.done && Utils.distance({ x: wx, y: wy }, hh) < 30) {
                hh.done = true; return;
              }
            }
            // 집
            for (const h of this.houses) {
              if (wx >= h.x && wx <= h.x + h.w && wy >= h.y && wy <= h.y + h.h) {
                this.destroyHouse(h); return;
              }
            }
            // 쓰레기통
            for (let i = 0; i < this.trashCans.length; i++) {
              const t = this.trashCans[i];
              if (Utils.distance({ x: wx, y: wy }, t) < 30) {
                this.trashCans.splice(i, 1); return;
              }
            }
            // 물 시설
            if (this.world?.waterSpots) {
              for (let i = 0; i < this.world.waterSpots.length; i++) {
                const w = this.world.waterSpots[i];
                if (Utils.distance({ x: wx, y: wy }, w) < 40) {
                  this.world.waterSpots.splice(i, 1);
                  this.world._bgDirty = true;
                  return;
                }
              }
            }
            // 아이템
            for (const it of this.items) {
              if (!it.collected && Utils.distance({ x: wx, y: wy }, it) < 20) {
                it.collected = true; it.carriedBy = null; return;
              }
            }
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

      // 상태창 드래그 직후의 click은 무시 (선택 해제 방지)
      if (this._justEndedStatDrag) { this._justEndedStatDrag = false; return; }

      const picked = this.ui.handleClick(wx, wy, this);
      if (picked && picked instanceof Siljangsuk) {
        picked._speech = '텟츙♥';
        picked._speechTimer = 1.8;
        for (let i = 0; i < 3; i++) {
          this.addParticle(
            picked.x + Utils.random(-12, 12),
            picked.y - 18 + Utils.random(-8, 4),
            '❤', '#ff66aa', 1500);
        }
      }
    });
  },
};

// ── Entry point ───────────────────────────────────────
window.addEventListener('load', () => Game.init());
