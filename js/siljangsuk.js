// ───────────────────────────────────────────────
// Siljangsuk (실장석) – main entity
// ───────────────────────────────────────────────
const STAGE_COLORS = ['', '#ffb3d9', '#c9a0f5', '#90c0ff', '#78e878', '#f0c060'];
const STAGE_LABELS = ['', '구더기', '엄지', '자실장', '성체실장', '중성체 실장'];

// 단계 / 상황별 대사 — 말 끝 어미는 단계별 고정
const SLEEP_LINES = ['ZzzZzz', 'Zzz…', 'ZzzzZ', 'Zzz~'];

const SPEECHES = {
  1: { // 레후
    idle:    ['프니프니를 바라는레후', '프니프니!', '레후~'],
    food:    ['배고픈레후', '맘마 줘레후~'],
    sleep:   SLEEP_LINES,
    hurt:    ['아픈레후!', '으앙레후!'],
    unci:    ['응가레후', '냠냠레후?'],
    play:    ['신난레후!', '같이 놀자레후~'],
  },
  2: { // 레치
    idle:    ['먹어도 먹어도 배고픈 레치', '심심한레치!', '구더기쨩이랑 놀고싶은레치'],
    food:    ['먹이가 어디있는레치?', '냠냠 시간레치!'],
    sleep:   SLEEP_LINES,
    hurt:    ['아프레치!', '울고싶은레치!'],
    unci:    ['응가하는레치', '시원한레치~'],
    play:    ['노는게 좋은레치!', '뱅뱅 도는레치!'],
  },
  3: { // 테치
    idle: {
      [-1]:    ['먹을 것을 찾아보는테치!'],
      [0]:     ['창고에 맛나맛나 없는테치?'],
      [1]:     ['마마 좋은 테치'],
    },
    food:    ['먹이를 찾아 떠나는테치', '오늘은 어디에 음식이 있을까테치'],
    sleep:   SLEEP_LINES,
    hurt:    ['아프다테치!', '울지 않는테치'],
    unci:    ['용변보는 테치', '운치굴이 가까운테치'],
    raid:    ['싸우러 가는테치!'],
    birth:   ['아기 낳는테치!'],
    play:    ['뱅글뱅글 즐거운테치!', '같이 놀아 신나는테치~'],
  },
  4: { // 데스
    idle:    ['자들을 먹여살리는데스', '공원은 위험한데스', '오늘도 살아남는데스!'],
    food:    ['먹이 사냥에 나서는데스', '가족을 위해 모으는데스'],
    sleep:   SLEEP_LINES,
    hurt:    ['반격하는데스!', '아프지만 견디는데스'],
    unci:    ['용변보는데스', '운치굴 다녀오는데스'],
    raid:    ['적 조직을 박살내는데스!', '습격이다! 모이는데스!'],
    birth:   ['뎃데로게~ 출산이다 데스!'],
    meal:    ['식사 시간데스'],
    evening: ['자들은 모두 착한데스', '마마가 맘마를 주는데스', '오늘도 다같이 무사한데스', '자들과 함께가 좋은데스'],
    taegyo:  ['뎃데로게~ 뎃데로게~', '뎃데로게~ ♪'],
    play:    ['세상은 즐거운데스~', '자들과 노는 시간 행복한데스'],
  },
};

class Siljangsuk {
  constructor(x, y, stage = 1, parentId = null, personality = null, familyId = null) {
    this.id = genId();
    this.x = x;
    this.y = y;
    this.stage = stage;
    this.parentId = parentId;
    this.familyId = familyId ?? this.id;
    this.siblingIds = [];

    this.personality = personality ?? Utils.randomPersonality();

    // Stats
    this.hp        = CONFIG.STAGE_BASE_HP[stage];
    this.maxHp     = CONFIG.STAGE_BASE_HP[stage];
    this.satiation = this.maxHp * 0.55;
    this.maxSat    = this.maxHp;
    this.happiness = 80;

    // AI state
    this.state       = 'idle';
    this.stateTimer  = 0;
    this.wanderTimer = 0;
    this.targetX     = x;
    this.targetY     = y;

    // Carried items
    this.carriedItems = [];
    this.paperCount   = 0;   // paper toward house building

    // House
    this.houseId = null;

    // Stage 1 pniepnie
    this.pniepnieTimer   = 0;
    this.pniepnieCooldown = 0;

    // Pregnancy
    this.pregnant      = false;
    this.pregnancyTimer = 0;

    // Combat
    this.attackCooldown = 0;
    this.fleeing        = false;
    this.fleeTimer      = 0;

    // Status effects
    this.nailBoost = false;

    // Visual
    this.animTimer = 0;
    this.dead      = false;

    // Happiness circuit
    this.happyCircuit      = false;
    this.happyCircuitTimer = 0;

    // 배변 관련
    this.defecateTimer  = Utils.random(0, CONFIG.UNCI_DEFECATE_INTERVAL);
    this.goingToUnci    = false;
    this._eatParticleCd = 0;

    // 이름 (사용자 지정) / 식별 번호 / 출생 순서
    this.name                = null;
    this.serialNo            = null;        // game.nextSerialNo 에서 할당
    this.birthOrder          = 0;           // 부모의 몇 번째 자식인지
    this.parentLabelSnapshot = null;        // 부모 사망 시 라벨 대체용
    this.birthsGiven         = 0;           // 본인이 출산한 누적 새끼 수

    // 신생아/강제독립 시 포만 유지 시간 (초). > 0 이면 포만이 줄지 않고 maxSat 으로 유지됨
    this.satiationFreezeTimer = 0;

    // 습격 상태
    this.raidTarget    = null;  // 공격측: 표적 familyId
    this.defendAgainst = null;  // 방어측: 공격측 familyId
    // 놀이 쿨다운
    this.playCooldown  = 0;
    // 시각 효과 타이머
    this.attackAnimTimer = 0;   // 공격 시 살짝 물러나는 애니
    this.hitFlashTimer   = 0;   // 피격 붉은 효과
    // 행복회로 일일 쿨다운
    this.happyCircuitDayKey = -1;  // 마지막 사용 day 인덱스
    // 관계 (상대 id → -100~+100)
    this.relationships = new Map();
    // AI 현재 목표 잠금 (priority, goal, timer)
    this._lockedGoal = null;     // { kind, targetId, x, y, ttl }

    // 사망 후 시체 페이드 타이머
    this.fadeTimer = 0;

    // 출생 day (노쇠사 판정용) — Game 가 준비됐을 때만
    this.bornDayIndex = (typeof Game !== 'undefined' && Game.dayIndex !== undefined) ? Game.dayIndex : 0;

    // 혈연 세대 (4대 제한용)
    this.generation = 0;

    // 물 마시기 (하루 1회)
    this.thirstyDayKey = -2;     // 마지막으로 물 마신 날
    this.lastWaterDayKey = -2;

    // 말풍선
    this._speech        = null;
    this._speechTimer   = 0;
    this._speechCooldown = Utils.random(5, 15);

    // 먹이 탐색 말풍선 쿨다운
    this._foodSpeechCD = 0;

    // 수풀에 숨음(성체/고양이 인식 회피)
    this.hidden = false;

    // 태교 카운터 (임신 중 자식과 놀이 횟수)
    this._taegyoSessions = 0;
    // 출산 후 3일 불임 — 다음 임신 가능한 dayIndex
    this._fertileAfterDay = -1;
    // 처형 표식 (노예가 굶주리면 표식 → 주인이 직접 처형)
    this.markedForExecution = false;
    // 자식 처분 쿨다운
    this._cullCooldown = 0;
    // 빙글빙글 놀이 상태
    this._orbit = null;          // { cx, cy, angle, radius, ttl, speed }

    // 수풀 잠복 추적: 새끼가 사라진 수풀 주변을 밤까지 탐색
    this._stakeoutBush = null;   // { x, y, r }
    // 수풀 잠복 추적: 마지막 추적했던 표적
    this._stakeoutTarget = null; // siljangsuk id

    // 드래그/던지기/익사 상태
    this.beingDragged = false;
    this.vx = 0; this.vy = 0;      // 던져진 속도
    this.thrown = false;
    this.drowning = false;
    this._drownTimer = 0;

    // stage 4 도달 후 경과 시간 (노쇠사 판정용)
    this.stage4Age = (stage === 4) ? 0 : 0;

    // 전투 반격 관련
    this.lastAttackerId    = null; // 마지막으로 나를 공격한 엔티티 id
    this.counterAttackTimer = 0;   // 남은 반격 의지 시간(초)

    // 노예/학습 관련 필드
    this.slaveOf = null;         // 주인 id
    this._memory = {             // 학습 메모리
      foodZones: [],             // [{x,y,t}] 음식 발견 위치
      dangers:   [],             // [{x,y,t}] 위험 위치
    };
    this._slaveBirthTimer = 0;   // 노예 출산 타이머
    this._houseUnderAttack = false; // 집 공격 감지
  }

  // ── Computed ───────────────────────────────────
  get maxCarry()  { return CONFIG.STAGE_CAPACITY[this.stage]; }
  get baseSpeed() { return CONFIG.STAGE_SPEED[this.stage]; }
  get size() {
    let s = CONFIG.STAGE_SIZE[this.stage] * (this.stage === 4 ? (0.8 + 0.4 * (this.maxHp / CONFIG.STAGE_MAX_HP[4])) : 1);
    if (this.slaveOf) s *= 0.65;          // 독라는 작게
    return s;
  }
  get collisionRadius() { return CONFIG.STAGE_COLLISION[this.stage] ?? 6; }

  get speed() {
    let s = this.baseSpeed;
    if (this.carriedItems.length > 0 && this.maxCarry > 1) {
      s *= (1 - 0.3 * (this.carriedItems.length / this.maxCarry));
    }
    if (this.pregnant)  s *= 0.7;
    if (this.happiness >= 61) s *= 1.1;
    if (this.happiness <= 20) s *= 1.35;            // 불행 → 벗어나려 분주
    // HP 비례 속도 감소 (체력이 낮을수록 느려짐)
    const hpRatio = this.hp / this.maxHp;
    s *= 0.5 + 0.5 * hpRatio;
    if (this.fleeing) s *= 1.6;
    return s;
  }

  // ── 말풍선 ────────────────────────────────────────
  _say(kind = 'idle') {
    const set = SPEECHES[this.stage];
    if (!set) return;
    let pool = set[kind] ?? set.idle;
    if (Array.isArray(pool)) {
      // OK
    } else if (typeof pool === 'object') {
      pool = pool[this.personality] ?? Object.values(pool)[0];
    }
    if (!pool || pool.length === 0) return;
    this._speech       = pool[Utils.randomInt(0, pool.length - 1)];
    this._speechTimer  = 3;
  }

  // ── 관계 시스템 ───────────────────────────────────
  getRelation(otherId) {
    return this.relationships.get(otherId) ?? 0;
  }
  addRelation(otherId, delta) {
    if (!otherId || otherId === this.id) return;
    const cur = this.relationships.get(otherId) ?? 0;
    this.relationships.set(otherId, Utils.clamp(cur + delta, -100, 100));
  }

  get satRatio()  { return this.satiation / this.maxSat; }
  get isHungry()  { return this.satRatio < CONFIG.HUNGER_THRESHOLD; }
  get isFull()    { return this.satRatio > CONFIG.FULL_THRESHOLD; }
  get isChild()   { return this.stage < 4; }
  get isAdult()   { return this.stage >= 4; }

  get happinessLabel() {
    if (this.happiness <= 20) return '불행';
    if (this.happiness <= 60) return '보통';
    return '행복';
  }

  get house() { return Game.getEntity(this.houseId); }

  // 표시용 라벨
  //   - 사용자 지정 이름 우선
  //   - 자식(stage<4)은 부모 라벨 + "-출생순서" 형태로 체인
  //   - 성체(stage=4)는 독립된 번호(name 이 있으면 그대로 / 없으면 #N)
  //   - 이름은 부모가 살아있는 동안 동적으로 자식에 계승됨
  get label() {
    const prefix = this.slaveOf ? '독라 ' : '';
    if (this.name) return prefix + this.name;

    if (this.stage === 4) {
      return `${prefix}#${this.serialNo ?? '?'}`;
    }

    // 자식: '부모의 장녀/차녀/N녀' 형식
    if (this.parentId !== null && this.birthOrder > 0) {
      const titleMap = { 1: '장녀', 2: '차녀', 3: '삼녀' };
      const title = titleMap[this.birthOrder] ?? `${this.birthOrder}녀`;
      const p = Game.getEntity(this.parentId);
      if (p && !p.dead && p.label) {
        return `${prefix}${p.label}의 ${title}`;
      }
      if (this.parentLabelSnapshot) {
        return `${prefix}${this.parentLabelSnapshot}의 ${title}`;
      }
      return `${prefix}${title}`;
    }
    return `${prefix}#${this.serialNo ?? '?'}`;
  }

  // ── Master update ──────────────────────────────
  update(dt, game) {
    if (this.dead) {
      this.fadeTimer = Math.max(0, this.fadeTimer - dt);
      return;
    }

    // 드래그 중이면 AI/이동 모두 중단
    if (this.beingDragged) return;

    // 던져진 상태: 관성 + 마찰
    if (this.thrown) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const friction = 0.94;
      this.vx *= friction; this.vy *= friction;
      if (Math.hypot(this.vx, this.vy) < 8) {
        this.thrown = false; this.vx = 0; this.vy = 0;
      }
      this.x = Utils.clamp(this.x, 8, CONFIG.WORLD_WIDTH  - 8);
      this.y = Utils.clamp(this.y, 8, CONFIG.WORLD_HEIGHT - 8);
      this._checkPondImmerse(game);
      return;
    }

    // 익사 중: HP 천천히 감소, 어푸어푸 말풍선
    if (this.drowning) {
      this.hp = Math.max(0, this.hp - 8 * dt);
      this._drownTimer -= dt;
      if (this._drownTimer <= 0) {
        this._drownTimer = 1.2;
        this._speech = '어푸어푸!';
        this._speechTimer = 1.5;
        game.addParticle(this.x, this.y - 12, '💧', '#66ccff', 800);
      }
      if (this.hp <= 0) { this._dieDrowned(game); return; }
      // 이동/AI 중단
      return;
    }
    this.animTimer        += dt;
    this.stateTimer       += dt;
    this.attackCooldown    = Math.max(0, this.attackCooldown - dt);
    this.pniepnieCooldown  = Math.max(0, this.pniepnieCooldown - dt);
    this.counterAttackTimer = Math.max(0, this.counterAttackTimer - dt);
    this.playCooldown       = Math.max(0, this.playCooldown - dt);
    this._cullCooldown      = Math.max(0, this._cullCooldown - dt);
    // 빙글빙글 놀이 위치 업데이트 (있을 때만)
    if (this._orbit) {
      this._orbit.angle += this._orbit.speed * dt;
      this._orbit.ttl   -= dt;
      this.x = this._orbit.cx + Math.cos(this._orbit.angle) * this._orbit.radius;
      this.y = this._orbit.cy + Math.sin(this._orbit.angle) * this._orbit.radius;
      if (this._orbit.ttl <= 0) this._orbit = null;
    }
    this.attackAnimTimer    = Math.max(0, this.attackAnimTimer - dt);
    this.hitFlashTimer      = Math.max(0, this.hitFlashTimer - dt);
    this._speechTimer       = Math.max(0, this._speechTimer - dt);
    this._foodSpeechCD      = Math.max(0, this._foodSpeechCD - dt);
    this._speechCooldown   -= dt;
    if (this._speechCooldown <= 0) {
      this._speechCooldown = Utils.random(20, 50);
      if (Math.random() < 0.5) this._say('idle');
    }
    if (this._lockedGoal) {
      this._lockedGoal.ttl -= dt;
      if (this._lockedGoal.ttl <= 0) this._lockedGoal = null;
    }

    this._updateNeeds(dt, game);
    if (this._checkDeath(game)) return;

    // 성체: 집이 공격받고 있으면 귀가
    if (this.isAdult && this.house) {
      if (this.house._underAttack && this.state !== 'sleeping') {
        const h = this.house;
        if (!h.isNear(this.x, this.y, 80)) {
          this._setState('going_home');
          this._setTarget(h.cx, h.cy);
          this._move(dt);
          return; // 행동 건너뜀
        }
      }
    }

    this._updateBehavior(dt, game);
    this._move(dt);
  }

  // ── Needs ──────────────────────────────────────
  _updateNeeds(dt, game) {
    // 노예 처형 표식: 포만이 0 이고 stage ≤ 2 → 주인이 직접 처형하러 옴
    if (this.slaveOf !== null && this.satiation <= 0 && this.stage <= 2) {
      this.markedForExecution = true;
    } else if (this.satiation > 0) {
      this.markedForExecution = false;
    }

    // ── 포만 freeze (신생아 1일 / 강제독립 1일 등) ──
    if (this.satiationFreezeTimer > 0) {
      this.satiationFreezeTimer = Math.max(0, this.satiationFreezeTimer - dt);
      this.satiation = this.maxSat;
    } else {
      // 정지/이동 따라 다른 손실률
      const moving = Utils.distance(this, { x: this.targetX, y: this.targetY }) > 6
                     && this.state !== 'sleeping';
      let sLoss = moving ? CONFIG.SATIATION_LOSS_MOVING : CONFIG.SATIATION_LOSS_PER_SEC;
      // 단계별 비율: 4=1, 3=1/2, 2=1/4, 1=1/8
      const stageMult = [0, 1/8, 1/4, 1/2, 1][this.stage] ?? 1;
      sLoss *= stageMult;
      if (this.pregnant) sLoss *= 1.5;
      this.satiation = Math.max(0, this.satiation - sLoss * dt);
    }

    // HP regen — 밤 + 집 근처 + 포만 > 0 (노숙 시 회복 X)
    const houseNear = this.house && this.house.isNear(this.x, this.y, 60);
    if (game.isNight && houseNear && this.satiation > 0 && this.hp < this.maxHp) {
      const regen = CONFIG.HP_REGEN_PER_SEC * dt;
      this.hp        = Math.min(this.maxHp, this.hp + regen);
      this.satiation = Math.max(0, this.satiation - regen * 0.4);
    }

    // HP loss from starvation
    if (this.satiation === 0) {
      this.hp = Math.max(0, this.hp - CONFIG.HP_HUNGER_LOSS_PER_SEC * dt);
    }

    // Happiness ────────────────────────────────────
    if (this.isHungry)  this.happiness = Math.max(0,   this.happiness - CONFIG.HAPPINESS_HUNGRY_LOSS * dt);
    if (this.isFull)    this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_FULL_GAIN   * dt);

    // 살아있는 자식이 있으면 (성체 기준) 행복
    if (this.stage === 4) {
      const hasChild = game.siljangsukList.some(s =>
        !s.dead && s.parentId === this.id && s.stage < 4);
      if (hasChild) this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_HAS_CHILD_GAIN * dt);

      // 성체인데 집이 없음 → 불행 (분가 직후 30초는 유예)
      if (this.houseId === null && this.stage4Age > 30) {
        this.happiness = Math.max(0, this.happiness - CONFIG.HAPPINESS_NO_HOUSE_LOSS * dt);
      }
    }

    const hComfort = this.house;
    if (hComfort && hComfort.isNear(this.x, this.y, 150) && hComfort.comfort > 50) {
      this.happiness = Math.min(100, this.happiness + 0.04 * dt);
    }

    // Stage 1 pniepnie timer
    if (this.stage === 1) this.pniepnieTimer += dt;

    // 집 비축 식량에서 먹기 (허기 상태일 때)
    const h = this.house;
    if (this.isHungry && h && h.foodReserves > 0 && h.isNear(this.x, this.y, 120)) {
      const eatRate  = Math.min(h.foodReserves, 8 * dt);
      const consumed = h.consumeFood(eatRate);
      this.satiation = Math.min(this.maxSat, this.satiation + consumed);
      this._eatParticleCd -= dt;
      if (this._eatParticleCd <= 0) {
        this._eatParticleCd = 2.2;
        game.addParticle(this.x, this.y - 16, '냠냠~', '#ff9933', 900);
        if (Math.random() < 0.3) this._say('meal');
      }
    } else {
      this._eatParticleCd = Math.max(0, this._eatParticleCd - dt);
    }

    // ── 성장: 전 단계(1~4), 포만이 1이라도 있으면 maxHp 증가 ──
    if (this.satiation > 0 && this.stage >= 1 && this.stage <= 4) {
      let growRate;
      if (this.happiness > 60)        growRate = CONFIG.GROWTH_RATE_HIGH;
      else if (this.happiness <= 20)   growRate = CONFIG.GROWTH_RATE_LOW;
      else                             growRate = CONFIG.GROWTH_RATE_MID;
      // 분충은 성장 속도 1.5배 (대신 음식 많이 소비)
      if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) growRate *= 1.5;

      // 각 단계의 성장 상한
      const growCap = this.stage < 4
        ? CONFIG.STAGE_MAX_HP[this.stage]  // 1→15, 2→30, 3→50
        : CONFIG.STAGE4_DEATH_HP;           // 4→100(노쇠사)

      this.maxHp  = Math.min(growCap, this.maxHp + growRate * dt);
      this.maxSat = this.maxHp;

      // 진화 판정 (1~3단계만)
      if (this.stage < 4 && this.maxHp >= CONFIG.STAGE_BASE_HP[this.stage + 1]) {
        this._evolve(game); return;
      }
    }

    // ── stage 4 시간 누적 + 10일 후 노쇠사 ──────────────
    if (this.stage === 4) {
      this.stage4Age += dt;
      const age = game.dayIndex - (this.bornDayIndex ?? 0);
      if (age >= CONFIG.OLDAGE_DAYS) {
        this._die(game, '노쇠');
        // 보스였다면 조직 분할 트리거
        if (game._onBossDeath) game._onBossDeath(this);
        return;
      }
    }

    // ── stage 4 분가: 부모 집에 잠깐 머문 뒤 독립해서 공원으로 퍼져나감 ──
    //   조건: 본인이 집 주인이 아니고 + 충분히 자랐고(90초≈1일) + 굶주리지 않음
    if (this.stage === 4 && this.houseId !== null
        && this.stage4Age > CONFIG.STAGE4_MOVEOUT_TIME && !this.isHungry) {
      const h = this.house;
      if (h && h.ownerId !== this.id) {
        this.houseId    = null;
        this.paperCount = 0;
        game.addParticle(this.x, this.y - 30, '분가! 🏃🌿', '#aaccff', 2400);
        if (game.logEvent) game.logEvent(`🏃 ${this.label} 분가`, '#aaccff');
      }
    }

    // 4단계 임신 판정 (자동 임신 + 꽃가루 추가 가속)
    //   단, 출산 후 3일간은 불임
    if (this.stage === 4 && !this.pregnant && !this.isHungry
        && game.dayIndex >= this._fertileAfterDay) {
      if (Math.random() < CONFIG.PREGNANCY_CHANCE_PER_SEC * dt) {
        this.pregnant       = true;
        this.pregnancyTimer = 0;
        game.addParticle(this.x, this.y - 24, '임신!', '#ffaaff', 2000);
      }
    }

    // 배변 타이머
    if (this.stage >= 2) {
      this.defecateTimer += dt;
      if (this.defecateTimer >= CONFIG.UNCI_DEFECATE_INTERVAL) {
        // 운치굴에 있으면 배변 완료, 없으면 집 안락함 감소
        const house = this.house;
        if (house && house.isInUnci(this.x, this.y)) {
          house.addUnci(3);
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_DEFECATE_GAIN);
          game.addParticle(this.x, this.y - 14, '💩', '#aa7700', 1000);
          if (Math.random() < 0.4) this._say('unci');
        } else if (house) {
          house.addUnci(8);  // 운치굴 밖에서 배변 → 더 많은 운치 (행복 보너스 없음)
        }
        this.defecateTimer = 0;
        this.goingToUnci   = false;
      }
      // 배변 욕구가 80% 차면 운치굴로 이동 욕구 발생
      if (this.defecateTimer >= CONFIG.UNCI_DEFECATE_INTERVAL * 0.8) {
        this.goingToUnci = true;
      }
    }

    // 노예: 운치굴에서 먹기
    if (this.slaveOf !== null && this.stage >= 3 && this.isHungry) {
      const masterEntity = game.getEntity(this.slaveOf);
      const masterHouse = masterEntity ? game.getEntity(masterEntity.houseId) : null;
      if (masterHouse && masterHouse.isInUnci(this.x, this.y) && masterHouse.unciAmount > 2) {
        const eat = Math.min(masterHouse.unciAmount, 3 * dt);
        masterHouse.unciAmount -= eat;
        this.satiation = Math.min(this.maxSat, this.satiation + eat);
      }
    }

    // 노예 출산 (4단계 노예: 주기적으로 1단계 새끼, 3단계 노예: 더 드물게)
    if (this.slaveOf !== null && (this.stage === 4 || this.stage === 3)) {
      this._slaveBirthTimer += dt;
      const interval = this.stage === 4 ? 90 : 180;
      if (this._slaveBirthTimer >= interval) {
        this._slaveBirthTimer = 0;
        const masterEntity2 = game.getEntity(this.slaveOf);
        const masterHouse2 = masterEntity2 ? game.getEntity(masterEntity2.houseId) : null;
        const bx = masterHouse2 ? masterHouse2.unciX + Utils.random(-15, 15) : this.x + Utils.random(-20, 20);
        const by = masterHouse2 ? masterHouse2.unciY + Utils.random(-15, 15) : this.y + Utils.random(-20, 20);
        const baby = game.spawnSiljangsuk(bx, by, 1, this.id, Utils.randomPersonality(), this.familyId);
        if (masterHouse2) baby.houseId = masterHouse2.id;
        game.addParticle(this.x, this.y - 20, '노예 출산!', '#ffaaff', 1500);
      }
    }

    if (this.pregnant) {
      this.pregnancyTimer += dt;
      if (this.pregnancyTimer >= CONFIG.PREGNANCY_DURATION) {
        const hb = this.house;
        if (hb && hb.isNear(this.x, this.y, 60)) {
          this._giveBirth(game);
        } else if (hb) {
          this._setState('going_home');
          this._setTarget(hb.cx, hb.cy, true);
        }
      }
    }

    // 자식 처분 — 본인 굶주림 + 비축 없음 + 자식 3+ → 가장 어린 자식 잡아먹음
    if (this.stage === 4 && this.satiation <= 0 && this._cullCooldown <= 0) {
      const houseFood = this.house ? this.house.foodReserves : 0;
      if (houseFood < 10) {
        const myKids = game.siljangsukList.filter(s =>
          !s.dead && s.parentId === this.id && s.stage <= 2 && !s.slaveOf);
        if (myKids.length >= 3) {
          // 가장 최근 태어난(=어린) 자식 처분
          myKids.sort((a, b) => b.serialNo - a.serialNo);
          const victim = myKids[0];
          this._cullCooldown = 20;
          this.happiness = Math.max(0, this.happiness - 20);
          if (game.logEvent) game.logEvent(`🥩 ${this.label}가 굶주려 ${victim.label}를 잡아먹음`, '#ff4444');
          victim._die(game, '굶주려 잡아먹힘');
          this.satiation = this.maxSat * 0.5;
        }
      }
    }

    // ── 관계 누적 (주변 실장석과 천천히 반응) — 1% 확률로 매 틱 체크 ──
    if (Math.random() < 0.01) {
      for (const o of game.siljangsukList) {
        if (o.dead || o.id === this.id || o.slaveOf) continue;
        if (Utils.distance(this, o) > 200) continue;
        let delta = 0;
        if (o.personality === this.personality) delta += 0.5;
        if (o.familyId === this.familyId)       delta += 1.0;
        // 식량 많은 집 주민에 대해서는 부러움
        const oh = Game.getEntity(o.houseId);
        if (oh && oh.foodReserves > 60) delta -= 0.3;
        if (delta !== 0) this.addRelation(o.id, delta);
      }
    }

    // 관계가 -100이면 가까이 있는 그 실장석을 즉시 공격 우선순위로
    // (실제 공격은 hunger / combat 분기에서 처리)

    // 행복회로: 행복 5 이하 + 하루 1회 → 행복 +20 즉시 회복
    const dayKey = Math.floor((game.dayTime ?? 0) / (CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH));
    if (this.happiness <= 5 && this.happyCircuitDayKey !== dayKey) {
      this.happyCircuitDayKey = dayKey;
      this.happiness          = Math.min(100, this.happiness + 20);
      this.happyCircuit       = true;
      this.happyCircuitTimer  = 3;
      game.addParticle(this.x, this.y - 22, '🌀 행복회로!', '#ffee44', 2000);
    }
    if (this.happyCircuit) {
      this.happyCircuitTimer -= dt;
      if (this.happyCircuitTimer <= 0) this.happyCircuit = false;
    }
  }

  // ── Death checks ────────────────────────────────
  _checkDeath(game) {
    if (this.stage === 1 && this.pniepnieTimer >= CONFIG.PNIEPNIE_TIMEOUT) { this._die(game, '방치'); return true; }
    if (this.happiness <= 0) { this._die(game, '파킨'); return true; }
    if (this.hp <= 0)        { this._die(game, '사망'); return true; }
    return false;
  }

  // 연못/물 위치 체크 — 빠지면 익사 시작
  _checkPondImmerse(game) {
    const pond = game.world?.pond;
    if (!pond) return;
    const dx = (this.x - pond.x) / pond.rx;
    const dy = (this.y - pond.y) / pond.ry;
    if (dx * dx + dy * dy < 1) {
      this.drowning = true;
      this._drownTimer = 0;
      this.thrown = false; this.vx = 0; this.vy = 0;
    }
  }

  // 익사 사망 — 음식 drop 없이 사망
  _dieDrowned(game) {
    this.dead = true;
    this.fadeTimer = 6;
    game.addParticle(this.x, this.y - 20, '꼬르륵…', '#3377cc', 2500);
    if (game.logEvent) game.logEvent(`💧 ${this.label} 익사`, '#88aaff');
    if (this.parentId !== null) {
      const p = game.getEntity(this.parentId);
      if (p && !p.dead && p.happiness !== undefined) {
        p.happiness = Math.max(0, p.happiness - CONFIG.HAPPINESS_CHILD_DEATH);
      }
    }
    game.onSiljangsukDeath(this);
  }

  // 공격 시 효과 적용 (애니메이션·핏방울·hitFlash·관계 악화·적대감)
  applyAttack(target, dmg, game, label = '') {
    if (!target || target.dead) return;
    target.hp = Math.max(0, (target.hp ?? 0) - dmg);
    target.lastAttackerId    = this.id;
    target.counterAttackTimer = 5;
    target.hitFlashTimer     = 0.35;
    this.attackAnimTimer     = 0.35;
    // 관계 악화
    if (target.addRelation) target.addRelation(this.id, -30);
    if (this.addRelation && target.id) this.addRelation(target.id, -10);
    // 행복 + (공격하면 행복 상승)
    this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_COMBAT_GAIN);
    // 적대감 누적
    if (target.familyId && this.familyId && game.addHostility) {
      game.addHostility(this.familyId, target.familyId);
    }
    // 핏방울 파티클
    for (let i = 0; i < 3; i++) {
      game.addParticle(
        target.x + Utils.random(-6, 6),
        target.y - 6 + Utils.random(-4, 4),
        '•', '#cc1818', 600);
    }
    game.addParticle(target.x, target.y - 14, `-${dmg}${label}`, '#ff4444', 900);
    if (target._say) target._say('hurt');
    // 넉백 (위치 살짝 밀려남)
    const dxk = target.x - this.x, dyk = target.y - this.y;
    const dk  = Math.sqrt(dxk * dxk + dyk * dyk) || 1;
    target.x += (dxk / dk) * 8;
    target.y += (dyk / dk) * 8;
  }

  _die(game, reason) {
    this.dead = true;
    this.fadeTimer = 10;        // 시체 페이드 (10초)
    game.addParticle(this.x, this.y - 28, reason, '#ff4444', 2500);

    // 로그
    if (game.logEvent) game.logEvent(`💀 ${this.label} 사망 (${reason})`, '#ff8888');

    // 부모에게 슬픔 (자식 사망 이벤트)
    if (this.parentId !== null) {
      const parent = game.getEntity(this.parentId);
      if (parent && !parent.dead && parent.happiness !== undefined) {
        parent.happiness = Math.max(0, parent.happiness - CONFIG.HAPPINESS_CHILD_DEATH);
        game.addParticle(parent.x, parent.y - 22, '💔', '#ff6688', 1800);
      }
    }

    // 부모 잃은 새끼 처리 — 60% 잡아먹힘 / 30% 노예 / 10% 입양
    if (this.stage === 4) {
      const orphans = game.siljangsukList.filter(s =>
        !s.dead && s.parentId === this.id && s.stage < 4 && !s.slaveOf);
      for (const o of orphans) {
        const r = Math.random();
        const adopter = game.findNearestSiljangsuk(o.x, o.y, 600,
          s => !s.dead && s.stage === 4 && s.id !== this.id && !s.slaveOf);
        if (!adopter) continue;
        if (r < 0.60) {
          // 잡아먹힘
          o.hp = 0; o._die(game, '잡아먹힘');
          adopter.satiation = Math.min(adopter.maxSat, adopter.satiation + 15);
          if (game.logEvent) game.logEvent(`🍖 부모잃은 ${o.label} 잡아먹힘`, '#ff6666');
        } else if (r < 0.90) {
          // 노예
          o.slaveOf = adopter.id;
          if (game.logEvent) game.logEvent(`⛓ 부모잃은 ${o.label} 노예가 됨`, '#cc6666');
        } else {
          // 입양
          o.parentId = adopter.id;
          o.familyId = adopter.familyId;
          o.houseId  = adopter.houseId;
          if (game.logEvent) game.logEvent(`🤝 부모잃은 ${o.label} 입양됨`, '#aaffaa');
        }
      }
    }

    // 단계별 식량 가치 (사망 시 항상 맛있는 음식으로 drop)
    //   stage 1: 50, stage 2: 50, stage 3: 80, stage 4: 150
    const totalFood = [0, 50, 50, 80, 150][this.stage] ?? 30;
    let remaining = totalFood;
    while (remaining > 0) {
      const it = game.spawnItem('food_good',
        this.x + Utils.random(-35, 35),
        this.y + Utils.random(-35, 35));
      // food_good 의 기본 foodVal 은 [10,15] — 평균 12 정도. 남은 양에 맞춰 캡
      if (it && it.foodValue > remaining) it.foodValue = remaining;
      remaining -= (it?.foodValue ?? 12);
    }
    // Return carried items to ground
    for (const item of this.carriedItems) {
      item.x = this.x + Utils.random(-25, 25);
      item.y = this.y + Utils.random(-25, 25);
      item.carriedBy = null;
      item.collected  = false;
    }
    this.carriedItems = [];

    // Kill bunchung offspring of concept parents
    game.onSiljangsukDeath(this);
  }

  // ── 진화 (1→2→3→4) ─────────────────────────────
  _evolve(game) {
    const prevStage = this.stage;
    this.stage++;
    const label = STAGE_LABELS[this.stage] ?? `${this.stage}단계`;

    // 기본 체력을 새 단계 기준으로 초기화
    const baseHp   = CONFIG.STAGE_BASE_HP[this.stage];
    this.hp     = Math.min(this.hp, baseHp);
    this.maxHp  = baseHp;
    this.maxSat = baseHp;

    if (this.stage === 4) {
      this.paperCount = 0;
      this.stage4Age  = 0;
      this.bornDayIndex = game.dayIndex; // 노쇠사 카운트 시작
      // 4대 이상이면 새 조직으로 독립
      if ((this.generation ?? 0) >= CONFIG.MAX_GENERATION) {
        this.familyId   = this.id;
        this.generation = 0;
        if (game.logEvent) game.logEvent(`🆕 ${this.label} 4대 분파 — 새 조직 창설`, '#aaffee');
      }
      game.addParticle(this.x, this.y - 32, '성체 됨! 🌿', '#aaffaa', 3000);
      if (game.logEvent) game.logEvent(`🌿 ${this.label} 성체로 진화`, '#aaffaa');
    } else {
      game.addParticle(this.x, this.y - 24, `${label} 성장! ▲`, '#aaffee', 2000);
      if (game.logEvent && this.stage >= 3) {
        game.logEvent(`▲ ${this.label} ${label}(으)로 성장`, '#aaffee');
      }
    }
  }

  _giveBirth(game) {
    this.pregnant         = false;
    this.pregnancyTimer   = 0;
    // 출산 후 3일 불임
    this._fertileAfterDay = (game.dayIndex ?? 0) + 3;
    // 출산 후 태교 카운터 리셋
    const taegyoBonus     = this._taegyoSessions;
    this._taegyoSessions  = 0;
    if (taegyoBonus > 0 && game.logEvent) {
      game.logEvent(`✨ 태교 ${taegyoBonus}회 효과 — 개념 비율 증가`, '#ffaaff');
    }

    const hap = this.happiness;
    let w1, w2, w3;
    if (hap <= 20)      { w1 = 0.7; w2 = 0.2; w3 = 0.1; }
    else if (hap <= 60) { w1 = 0.3; w2 = 0.5; w3 = 0.2; }
    else                { w1 = 0.1; w2 = 0.3; w3 = 0.6; }

    const count   = Utils.randomInt(CONFIG.BIRTH_MIN, CONFIG.BIRTH_MAX);
    const newIds  = [];

    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const stage = r < w1 ? 1 : r < w1 + w2 ? 2 : 3;
      const bx    = this.x + Utils.random(-40, 40);
      const by    = this.y + Utils.random(-40, 40);

      // Concept parent kills bunchung offspring
      let personality = Utils.randomPersonality();
      if (this.personality === CONFIG.PERSONALITY_CONCEPT && personality === CONFIG.PERSONALITY_BUNCHUNG) {
        personality = CONFIG.PERSONALITY_NORMAL;
      }
      // 태교 효과: 횟수 × 10% 확률로 개념으로 변경
      if (this._taegyoSessions > 0 && Math.random() < this._taegyoSessions * 0.1) {
        personality = CONFIG.PERSONALITY_CONCEPT;
      }

      const child = game.spawnSiljangsuk(bx, by, stage, this.id, personality, this.familyId);
      child.houseId    = this.houseId;
      child.serialNo   = Game.nextSerialNo++;
      this.birthsGiven++;
      child.birthOrder = this.birthsGiven;
      child.parentLabelSnapshot = this.label;
      child.bornDayIndex = game.dayIndex;
      child.generation  = (this.generation ?? 0) + 1;
      // 신생아: 포만 100% + 하루 동안 포만 유지
      child.satiation             = child.maxSat;
      child.satiationFreezeTimer  = 90;
      newIds.push(child.id);
    }

    // Assign siblings
    for (const id of newIds) {
      const s = game.getEntity(id);
      if (s) s.siblingIds = newIds.filter(x => x !== id);
    }

    game.addParticle(this.x, this.y - 36, `뎃데로게~! ${count}마리`, '#ffccff', 3000);
    if (game.logEvent) game.logEvent(`👶 ${this.label}가 ${count}마리 출산!`, '#ffaaff');
    this._say('birth');

    // 집 정원 9마리 제한 — 초과 시 성체 자식 강제 독립 or 새 새끼 노예
    this._enforceHouseCapacity(game);
  }

  // ── 집 정원(9) 초과 처리 ──────────────────────────
  _enforceHouseCapacity(game) {
    const h = this.house;
    if (!h) return;
    let safety = 30;
    while (safety-- > 0) {
      const occupants = game.siljangsukList.filter(s =>
        !s.dead && s.houseId === h.id && !s.slaveOf);
      if (occupants.length <= 9) break;

      // 1순위: 성체가 된 자식(집주인 제외)을 강제 독립시킴
      const adultChild = occupants.find(s =>
        s.stage === 4 && s.id !== h.ownerId && s.id !== this.id);
      if (adultChild) {
        adultChild.houseId               = null;
        adultChild.paperCount            = 0;
        adultChild.satiation             = adultChild.maxSat;
        adultChild.satiationFreezeTimer  = 90; // 하루 동안 포만 유지
        game.addParticle(adultChild.x, adultChild.y - 30, '강제 분가!', '#ffaa44', 2500);
        if (game.logEvent) game.logEvent(`🏃 ${adultChild.label} 정원초과로 강제 독립 (하루 포만 보장)`, '#ffaa44');
        continue;
      }

      // 2순위: 가장 최근 태어난 새끼를 노예로 책정
      const newSlave = occupants.find(s =>
        s.stage <= 2 && !s.slaveOf && s.id !== h.ownerId && s.id !== this.id);
      if (newSlave) {
        newSlave.slaveOf = h.ownerId || this.id;
        game.addParticle(newSlave.x, newSlave.y - 22, '노예 책정!', '#cc6666', 2200);
        if (game.logEvent) game.logEvent(`⚠️ ${newSlave.label} 정원초과로 노예 책정`, '#cc6666');
        continue;
      }
      break;
    }
  }

  // ── Behavior ────────────────────────────────────
  _updateBehavior(dt, game) {
    // 슬레이브 행동
    if (this.slaveOf !== null) {
      this._behaveAsSlave(dt, game);
      return;
    }

    // ── 수풀에 숨었는지 매 틱 갱신 ─────────────────────
    const wasHidden = this.hidden;
    this.hidden = false;
    let hidingBush = null;
    if (this.stage < 4 && (this.fleeing || this.state === 'fleeing')) {
      for (const b of (game.world?.bushes || [])) {
        if (Utils.distance(this, b) < b.r + 4) {
          this.hidden = true;
          hidingBush = b;
          break;
        }
      }
    }
    // 갓 숨었으면, 직전 공격자/추적자에게 stakeout 설정
    if (!wasHidden && this.hidden && hidingBush && this.lastAttackerId) {
      const hunter = game.getEntity(this.lastAttackerId);
      if (hunter && !hunter.dead && hunter._stakeoutBush !== undefined) {
        hunter._stakeoutBush  = { x: hidingBush.x, y: hidingBush.y, r: hidingBush.r };
        hunter._stakeoutTarget = this.id;
      }
    }

    // ── 하루 1회 물 마시기 (독라/1단계 새끼 제외, 아침/낮에만) ─
    if (!game.isNight && this.lastWaterDayKey !== game.dayIndex
        && this.satiationFreezeTimer <= 0
        && !this.slaveOf && this.stage !== 1) {
      const w = game.world?.findNearestWater
        ? game.world.findNearestWater(this.x, this.y) : null;
      if (w) {
        const d = Utils.distance(this, w);
        if (d < (w.r ?? 30)) {
          this.lastWaterDayKey = game.dayIndex;
          this.happiness = Math.min(100, this.happiness + 4);
          this.satiation = Math.min(this.maxSat, this.satiation + 8);
          game.addParticle(this.x, this.y - 14, '💧 물 마심', '#66ccff', 1200);
        } else if (d < 1500) {
          // 물 마시러 가는 길 — 단, 가족이 공격받고 있으면 성체는 가족 우선
          if (this.stage === 4) {
            const inDanger = game.siljangsukList.find(s =>
              !s.dead && s.familyId === this.familyId && s.id !== this.id
              && s.counterAttackTimer > 0 && s.lastAttackerId
              && Utils.distance(this, s) < 600);
            if (inDanger) {
              this._setState('attacking');
              this._setTarget(inDanger.x, inDanger.y);
              return;
            }
          }
          this._setState('seeking_water');
          this._setTarget(w.x, w.y);
          return;
        }
      }
    }

    // ── 수풀 잠복 (새끼가 사라진 수풀 주변을 밤까지 탐색) ──
    if (this._stakeoutBush) {
      if (game.isNight) {
        this._stakeoutBush = null;
        this._stakeoutTarget = null;
      } else {
        const sb = this._stakeoutBush;
        const d = Utils.distance(this, sb);
        // 접촉(수풀 반경 안) → 새끼 강제 도주
        if (d < sb.r + 6) {
          const t = this._stakeoutTarget != null ? game.getEntity(this._stakeoutTarget) : null;
          if (t && !t.dead) {
            t.hidden = false;
            // 수풀 바깥 반대편으로 강제 이동
            const dx = t.x - sb.x, dy = t.y - sb.y;
            const n  = Utils.normalize(dx, dy);
            t._fleeFrom_raw(sb.x - n.x * 200, sb.y - n.y * 200);
            game.addParticle(t.x, t.y - 16, '발각!', '#ff8844', 1500);
          }
          // 접촉 후엔 잠복 해제 (다시 추격)
          this._stakeoutBush = null;
          this._stakeoutTarget = null;
        } else {
          // 수풀 주변을 빙빙 돌면서 탐색
          const ang = (this.animTimer * 0.5) % (Math.PI * 2);
          this._setState('stakeout');
          this._setTarget(sb.x + Math.cos(ang) * (sb.r + 18),
                          sb.y + Math.sin(ang) * (sb.r + 18));
          return;
        }
      }
    }

    // ── 신생아: 출생 후 1일은 무조건 집으로 가는 게 최우선 ─
    if (this.satiationFreezeTimer > 0 && this.stage === 1) {
      const h = this.house;
      if (h) {
        const d = Utils.distance(this, { x: h.cx, y: h.cy });
        if (d > 35) {
          this._setState('going_home');
          this._setTarget(h.cx, h.cy, true);
          return;
        }
      }
    }

    // ── 공격받은 경우: 반격 또는 도주 ──────────────
    if (this.counterAttackTimer > 0 && this.lastAttackerId) {
      // 공격자 탐색 (실장석 or 인간/고양이)
      let atk = game.siljangsukList.find(s => s.id === this.lastAttackerId && !s.dead);
      if (!atk) atk = (game.humans || []).find(h => h.id === this.lastAttackerId && !h.done) ?? null;

      if (atk) {
        const atkStage    = atk.stage ?? 5; // 인간은 5로 취급(강함)
        // 불리 조건: 더 높은 단계 + HP 절반 미만
        const disadvantaged = atkStage > this.stage && this.hp < this.maxHp * 0.5;
        if (!disadvantaged) {
          // 반격
          this._setState('attacking');
          this._setTarget(atk.x, atk.y, true);
          if (Utils.distance(this, atk) < 30 && this.attackCooldown <= 0) {
            const dmg = 2 + this.stage * 2;
            atk.hp = Math.max(0, (atk.hp ?? 0) - dmg);
            this.attackCooldown = 1.5;
            // 공격자에게도 반격 의지 전달 (실장석이면)
            if (atk.lastAttackerId !== undefined) {
              atk.lastAttackerId    = this.id;
              atk.counterAttackTimer = 3;
            }
            game.addParticle(atk.x, atk.y - 14, `-${dmg}(반격)`, '#ffaa00', 800);
          }
          return;
        } else {
          // 불리 → 도주
          if (this.isChild) this._fleeToHouse(game);
          else this._fleeFrom_raw(atk.x, atk.y);
          return;
        }
      } else {
        // 공격자가 이미 사라짐
        this.lastAttackerId    = null;
        this.counterAttackTimer = 0;
      }
    }

    // HP < 50% + 주변 위협 감지 → 도주 (lastAttackerId 없을 때 일반 위협)
    if (this.hp < this.maxHp * 0.5 && this.stage >= 2) {
      const thr = this._findNearestThreat(game);
      if (thr) {
        if (this.isChild) { this._fleeToHouse(game); }
        else { this._fleeFrom_raw(thr.x, thr.y); }
        return;
      }
    }

    // 고양이 근처 → 반격
    if (this.stage >= 2) {
      const cat = game.findNearestHuman && game.findNearestHuman(this.x, this.y, 160, h => h.type === 3);
      if (cat) {
        this._setState('attacking');
        this._setTarget(cat.x, cat.y);
        if (Utils.distance(this, cat) < 30 && this.attackCooldown <= 0) {
          const dmg = 3 + this.stage * 2;
          cat.hp = Math.max(0, cat.hp - dmg);
          this.attackCooldown = 1.5;
          if (cat.hp <= 0) cat.done = true;
          game.addParticle(cat.x, cat.y - 14, `-${dmg}`, '#ff8800', 800);
        }
        return;
      }
      const atkHuman = game.findNearestHuman && game.findNearestHuman(this.x, this.y, 200, h => h.type === 2);
      if (atkHuman) { this._fleeFrom_raw(atkHuman.x, atkHuman.y); return; }
    }

    // 허기 → 위급할 때만 손에 든 음식 즉시 섭취 (그 외엔 집에 가져가서 비축)
    if (this.isHungry) {
      const heldFood = this.carriedItems.find(i => i.isFood && i.isFood());
      const h = this.house;
      const critical    = this.satiation <= this.maxSat * 0.08; // 거의 0
      const farFromHome = !h || Utils.distance(this, { x: h.cx, y: h.cy }) > 350;
      const noReserves  = !h || h.foodReserves < 1;
      if (heldFood && (critical || farFromHome || noReserves)) {
        this._eatCarriedItem(heldFood, game);
      }

      // 2. 극단 굶주림 (satiation === 0): 우선순위 행동 체인 — 성격별로 다르게
      if (this.satiation <= 0) {
        const pBun = this.personality === CONFIG.PERSONALITY_BUNCHUNG;
        const pCon = this.personality === CONFIG.PERSONALITY_CONCEPT;

        // 2-a. 분충: 다른 실장석을 적극적으로 공격 (가족 외, 다른 성향 우선)
        if (pBun && this.stage >= 2 && this.attackCooldown <= 0) {
          let target = game.findNearestSiljangsuk(this.x, this.y, 280, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId
            && s.personality !== this.personality && !s.slaveOf);
          if (!target) target = game.findNearestSiljangsuk(this.x, this.y, 280, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId && !s.slaveOf);
          if (target) {
            const eh = this._targetInsideEnemyHouse(target, game);
            if (eh) {
              this._setState('attacking');
              this._setTarget(eh.cx, eh.cy);
              if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
                eh.takeDamage(6);
                this.attackCooldown = 1.2;
                game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
                if (eh.hp <= 0) game.destroyHouse(eh);
              }
              return;
            }
            this._setState('attacking');
            this._setTarget(target.x, target.y);
            if (Utils.distance(this, target) < 26) {
              const dmg = 4 + this.stage * 2;
              this.applyAttack(target, dmg, game);
              this.attackCooldown = 1.2;
            }
            return;
          }
        }

        // 2-a'. 개념: 먼 거리 먹이 적극 탐색 (운치보다 먼저)
        if (pCon) {
          const food = game.findNearestItem(this.x, this.y, 1500, i => i.isFood(), this);
          if (food) {
            this._claimItem(food);
            this._setState('seeking_food');
            this._setTarget(food.x, food.y);
            if (Utils.distance(this, food) < 14) this._pickUp(food, game);
            return;
          }
        }

        // 2-b. 운치굴에서 운치 먹기 — 포만 가득 찰 때까지 (행복 감소)
        const unciHouse = this._findNearestUnci(game);
        if (unciHouse && !this.isFull) {
          this._setState('eating_unci');
          this._setTarget(unciHouse.unciX, unciHouse.unciY);
          if (Utils.distance(this, { x: unciHouse.unciX, y: unciHouse.unciY }) < CONFIG.UNCI_RADIUS) {
            const eat = Math.min(unciHouse.unciAmount, 6 * dt);
            unciHouse.unciAmount = Math.max(0, unciHouse.unciAmount - eat);
            this.satiation = Math.min(this.maxSat, this.satiation + eat * 1.5);
            this.happiness = Math.max(0, this.happiness - 0.4 * dt);
            this._eatParticleCd -= dt;
            if (this._eatParticleCd <= 0) {
              this._eatParticleCd = 1.5;
              game.addParticle(this.x, this.y - 14, '운치 섭취…', '#aa7700', 900);
            }
          }
          return;
        }

        // 2-c. 운치도 없으면 약자 공격 (stage >= 2, 가족 외, 다른 성향 우선)
        if (this.stage >= 2 && this.attackCooldown <= 0) {
          let prey = game.findNearestSiljangsuk(this.x, this.y, 250, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId
            && s.personality !== this.personality && s.stage < this.stage);
          if (!prey) prey = game.findNearestSiljangsuk(this.x, this.y, 250, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId && s.stage < this.stage);
          if (prey) {
            const eh = this._targetInsideEnemyHouse(prey, game);
            if (eh) {
              this._setState('attacking');
              this._setTarget(eh.cx, eh.cy);
              if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
                eh.takeDamage(6);
                this.attackCooldown = 1.2;
                game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
                if (eh.hp <= 0) game.destroyHouse(eh);
              }
              return;
            }
            this._setState('attacking');
            this._setTarget(prey.x, prey.y);
            if (Utils.distance(this, prey) < 26) {
              const dmg = 5 + this.stage * 2;
              this.applyAttack(prey, dmg, game);
              this.attackCooldown = 1.2;
            }
            return;
          }
        }
      }
    }

    // 저녁이 되면 전쟁 중이 아닌 모든 실장석은 집 근처로
    const atWar = this.raidTarget !== null || this.defendAgainst !== null;
    if (game.dayPhase === 'evening' && !atWar && !this.slaveOf) {
      const h = this.house;
      if (h && !h.isNear(this.x, this.y, 120)) {
        this._setState('going_home');
        this._setTarget(h.cx, h.cy);
        return;
      }
    }

    // Night → sleep (전쟁 중이면 귀가 안 함, 노숙 시 체력 회복 X)
    if (game.isNight && !atWar) {
      const h = this.house;
      if (h && h.isNear(this.x, this.y, 20)) {
        if (this.state !== 'sleeping' && Math.random() < 0.5) this._say('sleep');
        this._setState('sleeping');
        return;
      } else {
        this._setState('going_home');
        const tx = h ? h.cx : this.x;
        const ty = h ? h.cy : this.y;
        this._setTarget(tx, ty);
        return;
      }
    }

    // Happy circuit – do nothing
    if (this.happyCircuit) { this._setState('happy_circuit'); return; }

    switch (this.stage) {
      case 1: this._behaveStage1(dt, game); break;
      case 2: this._behaveStage2(dt, game); break;
      case 3: this._behaveStage3(dt, game); break;
      case 4: this._behaveStage4(dt, game); break;
    }
  }

  _behaveStage1(dt, game) {
    // Stay near house / unci
    const h = this.house;
    if (h && !h.isNear(this.x, this.y, 55)) {
      this._setTarget(h.unciX + Utils.random(-10,10), h.unciY + Utils.random(-10,10));
    }
    this._setState('idle');

    // Pniepnie needed
    if (this.pniepnieTimer > CONFIG.PNIEPNIE_TIMEOUT * 0.6) {
      this._setState('needs_pniepnie');
    }
  }

  _behaveStage2(dt, game) {
    let h = this.house;

    // 집이 없으면 빈집 찾기
    if (!h) {
      const vac = this._findVacantHouse(game);
      if (vac) {
        if (Utils.distance(this, { x: vac.cx, y: vac.cy }) < 50) {
          vac.vacant  = false;
          this.houseId = vac.id;
          if (!vac.ownerId) vac.ownerId = this.id;
          h = vac;
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집으로 이주`, '#aaccff');
        } else {
          this._setState('going_home');
          this._setTarget(vac.cx, vac.cy);
          return;
        }
      }
    }

    // 새끼가 노예를 상대로 놀이 (HP 10 이하 / 도주 중 X)
    if (!this.fleeing && this.hp > 10 && this.playCooldown <= 0 && Math.random() < 0.012) {
      const slave = game.findNearestSiljangsuk(this.x, this.y, 120,
        s => !s.dead && s.slaveOf && s.stage <= 3);
      if (slave) {
        this._setState('playing');
        this._setTarget(slave.x, slave.y);
        if (Utils.distance(this, slave) < 20) {
          slave.hp = Math.max(1, slave.hp - Utils.random(1, 4));
          slave.hitFlashTimer = 0.35;
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
          this.playCooldown = 12;
          game.addParticle(this.x, this.y - 20, '😆 놀이!', '#ffccaa', 1500);
        }
        return;
      }
    }

    // 새끼 놀이 (가족 + 같은 단계 형제와, HP 10 초과)
    //   확률 한번 성공하면 _playPartnerId 로 잠가서 만날 때까지 추적
    if (!this.fleeing && this.hp > 10 && this.playCooldown <= 0) {
      if (this._playPartnerId === undefined && Math.random() < 0.03) {
        const f = game.findNearestSiljangsuk(this.x, this.y, 250,
          s => !s.dead && s.id !== this.id && s.familyId === this.familyId
            && s.stage < 4 && !s.slaveOf && s.hp > 10);
        if (f) this._playPartnerId = f.id;
      }
      const friend = this._playPartnerId !== undefined ? game.getEntity(this._playPartnerId) : null;
      if (friend && !friend.dead) {
        this._setState('playing');
        this._setTarget(friend.x, friend.y, true);
        if (Utils.distance(this, friend) < 32) {
          // 부모(stage 4 같은 가족)가 없으면 모든 새끼 형제를 모아 다인 놀이
          const parentNearby = game.siljangsukList.some(p =>
            !p.dead && p.stage === 4 && p.familyId === this.familyId
            && Utils.distance(this, p) < 250 && !p.slaveOf);
          const radius = 24;
          const midX = (this.x + friend.x) / 2, midY = (this.y + friend.y) / 2;
          let players;
          if (!parentNearby) {
            players = game.siljangsukList.filter(s =>
              !s.dead && !s.slaveOf && s.stage < 4 && s.hp > 10
              && s.familyId === this.familyId
              && Utils.distance(s, { x: midX, y: midY }) < 120);
          } else {
            players = [this, friend];
          }
          const N = Math.max(2, players.length);
          for (let i = 0; i < players.length; i++) {
            const p = players[i];
            p.happiness = Math.min(100, p.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
            p.hp        = Math.max(1, p.hp - Utils.random(0.3, 1.5));
            p.playCooldown = 20;
            const a = (i / N) * Math.PI * 2;
            p._orbit = { cx: midX, cy: midY, angle: a, radius, ttl: 2.8, speed: 4 };
          }
          game.addParticle(midX, midY - 20, `😆 놀이!(${players.length}명)`, '#ffccaa', 1800);
          if (Math.random() < 0.4) this._say('play');
          this._playPartnerId = undefined;
        }
        return;
      } else {
        // 파트너 사라짐
        this._playPartnerId = undefined;
      }
    }

    // Flee from non-family adults
    const threat = game.findNearestSiljangsuk(this.x, this.y, 120,
      s => s.isAdult && s.familyId !== this.familyId && !s.dead);
    if (threat) { this._fleeToHouse(game); return; }

    // Give pniepnie to stage 1 sibling (가족 우선, 없으면 위급한 타가족 새끼도 돌봄)
    if (this.pniepnieCooldown <= 0) {
      let baby = game.findNearestSiljangsuk(this.x, this.y, 130,
        s => s.stage === 1 && s.familyId === this.familyId && s.pniepnieTimer > 8);
      if (!baby) {
        baby = game.findNearestSiljangsuk(this.x, this.y, 110,
          s => s.stage === 1 && s.pniepnieTimer > 25); // 위급한 타가족도
      }
      if (baby) {
        this._setState('giving_pniepnie');
        this._setTarget(baby.x, baby.y);
        if (Utils.distance(this, baby) < 18) {
          baby.pniepnieTimer = 0;
          baby.happiness = Math.min(100, baby.happiness + CONFIG.HAPPINESS_PNIEPNIE_GAIN);
          game.addParticle(baby.x, baby.y - 18, '프니프니!', '#ffaaff', 1500);
          this.pniepnieCooldown = 6;
        }
        return;
      }
    }

    // Collect 1 item near home
    if (this.carriedItems.length < this.maxCarry) {
      const item = game.findNearestItem(this.x, this.y, 90, null, this);
      if (item && !this._hasCloserCompetitor(item, game)) {
        this._claimItem(item);
        this._setState('seeking_item');
        this._setTarget(item.x, item.y);
        if (Utils.distance(this, item) < 14) this._pickUp(item, game);
        return;
      }
    } else if (h) {
      this._setState('carrying_item');
      this._setTarget(h.cx, h.cy);
      if (h.isNear(this.x, this.y, 30)) this._depositAll(game);
      return;
    }

    this._wander(dt, game, 90);
  }

  _behaveStage3(dt, game) {
    let h = this.house;

    // 집이 없으면 빈집 이주
    if (!h) {
      const vac = this._findVacantHouse(game);
      if (vac) {
        if (Utils.distance(this, { x: vac.cx, y: vac.cy }) < 50) {
          vac.vacant  = false;
          this.houseId = vac.id;
          if (!vac.ownerId) vac.ownerId = this.id;
          h = vac;
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집으로 이주`, '#aaccff');
        } else {
          this._setState('going_home');
          this._setTarget(vac.cx, vac.cy);
          return;
        }
      }
    }

    // 새끼 놀이 (가족 형제 / 인원 무제한 모임 가능)
    if (!this.fleeing && this.hp > 10 && this.playCooldown <= 0) {
      if (this._playPartnerId === undefined && Math.random() < 0.03) {
        const f = game.findNearestSiljangsuk(this.x, this.y, 280,
          s => !s.dead && s.id !== this.id && s.familyId === this.familyId
            && s.stage < 4 && !s.slaveOf && s.hp > 10);
        if (f) this._playPartnerId = f.id;
      }
      const friend = this._playPartnerId !== undefined ? game.getEntity(this._playPartnerId) : null;
      if (friend && !friend.dead) {
        this._setState('playing');
        this._setTarget(friend.x, friend.y, true);
        if (Utils.distance(this, friend) < 32) {
          const parentNearby = game.siljangsukList.some(p =>
            !p.dead && p.stage === 4 && p.familyId === this.familyId
            && Utils.distance(this, p) < 250 && !p.slaveOf);
          const midX = (this.x + friend.x) / 2, midY = (this.y + friend.y) / 2;
          let players;
          if (!parentNearby) {
            players = game.siljangsukList.filter(s =>
              !s.dead && !s.slaveOf && s.stage < 4 && s.hp > 10
              && s.familyId === this.familyId
              && Utils.distance(s, { x: midX, y: midY }) < 150);
          } else {
            players = [this, friend];
          }
          const N = Math.max(2, players.length);
          for (let i = 0; i < players.length; i++) {
            const p = players[i];
            p.happiness    = Math.min(100, p.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
            p.hp           = Math.max(1, p.hp - Utils.random(0.5, 2));
            p.playCooldown = 25;
            const a = (i / N) * Math.PI * 2;
            p._orbit = { cx: midX, cy: midY, angle: a, radius: 24, ttl: 2.8, speed: 4 };
          }
          game.addParticle(midX, midY - 20, `😆 놀이!(${players.length}명)`, '#ffccaa', 1800);
          if (Math.random() < 0.4) this._say('play');
          this._playPartnerId = undefined;
        }
        return;
      } else {
        this._playPartnerId = undefined;
      }
    }

    const threat = game.findNearestSiljangsuk(this.x, this.y, 140,
      s => s.isAdult && s.familyId !== this.familyId && !s.dead);
    if (threat) { this._fleeToHouse(game); return; }

    // Pniepnie for stage 1 (가족 우선, 없으면 위급한 타가족도)
    if (this.pniepnieCooldown <= 0) {
      let baby = game.findNearestSiljangsuk(this.x, this.y, 150,
        s => s.stage === 1 && s.familyId === this.familyId && s.pniepnieTimer > 8);
      if (!baby) {
        baby = game.findNearestSiljangsuk(this.x, this.y, 130,
          s => s.stage === 1 && s.pniepnieTimer > 25);
      }
      if (baby) {
        this._setState('giving_pniepnie');
        this._setTarget(baby.x, baby.y);
        if (Utils.distance(this, baby) < 18) {
          baby.pniepnieTimer = 0;
          baby.happiness = Math.min(100, baby.happiness + CONFIG.HAPPINESS_PNIEPNIE_GAIN);
          game.addParticle(baby.x, baby.y - 18, '프니프니!', '#ffaaff', 1500);
          this.pniepnieCooldown = 8;
        }
        return;
      }
    }

    if (this.carriedItems.length < this.maxCarry) {
      const item = game.findNearestItem(this.x, this.y, 130, null, this);
      if (item && !this._hasCloserCompetitor(item, game)) {
        this._claimItem(item);
        this._setState('seeking_item');
        this._setTarget(item.x, item.y);
        if (Utils.distance(this, item) < 14) this._pickUp(item, game);
        return;
      }
    } else if (h) {
      this._setState('carrying_item');
      this._setTarget(h.cx, h.cy);
      if (h.isNear(this.x, this.y, 30)) this._depositAll(game);
      return;
    }

    this._wander(dt, game, 140);
  }

  _behaveStage4(dt, game) {
    let h = this.house;

    // ── 노예 처형: 표식된 노예가 본인 소유 + 같은 집이면 직접 죽이러 감 ──
    const markedSlave = game.siljangsukList.find(s =>
      !s.dead && s.markedForExecution && s.slaveOf === this.id);
    if (markedSlave) {
      this._setState('attacking');
      this._setTarget(markedSlave.x, markedSlave.y);
      if (Utils.distance(this, markedSlave) < 30 && this.attackCooldown <= 0) {
        markedSlave._die(game, '노예처형');
        this.attackCooldown = 1.5;
        if (game.logEvent) game.logEvent(`⛓ ${this.label}가 노예 ${markedSlave.label} 처형`, '#cc6666');
      }
      return;
    }

    // ── 저녁 모임: 집에 있을 때 가끔 대사 / 임신 중이면 태교 ────────────
    if (game.dayPhase === 'evening' && h && h.isNear(this.x, this.y, 100)) {
      if (Math.random() < 0.003) this._say('evening');
    }

    // ── 태교: 임신 + 비축 식량 충분 + 자식 있음 → 자식과 놀이 ────────────
    if (this.pregnant && h && h.foodReserves > 30) {
      const child = game.siljangsukList.find(s =>
        !s.dead && s.parentId === this.id && s.stage < 4 && !s.slaveOf
        && Utils.distance(this, s) < 200);
      if (child) {
        this._setState('playing');
        this._setTarget(child.x, child.y);
        if (Utils.distance(this, child) < 30) {
          this._taegyoSessions++;
          this.happiness = Math.min(100, this.happiness + 3);
          child.happiness = Math.min(100, child.happiness + 5);
          // 빙글빙글 놀이 시작
          const midX = (this.x + child.x) / 2, midY = (this.y + child.y) / 2;
          const ang  = Math.atan2(this.y - midY, this.x - midX);
          this._orbit  = { cx: midX, cy: midY, angle: ang,            radius: 24, ttl: 3, speed: 3 };
          child._orbit = { cx: midX, cy: midY, angle: ang + Math.PI,  radius: 24, ttl: 3, speed: 3 };
          // 30% 확률로 "세상은 즐거운데스~" 식 놀이 대사 / 그 외 태교 대사
          if (Math.random() < 0.3) this._say('play'); else this._say('taegyo');
          game.addParticle(midX, midY - 16, '✨ 태교 ✨', '#ffaaff', 1500);
          game.addParticle(midX + Utils.random(-12, 12), midY - 24, '♪', '#ffaaff', 1800);
          game.addParticle(midX + Utils.random(-12, 12), midY - 30, '♫', '#ffaaff', 1800);
          this.playCooldown = 5;
        }
        return;
      }
    }

    // ── 빈집 점유 우선: 집이 없고 가까운 빈집이 있으면 무조건 점유 ──
    if (!h) {
      const vacant = this._findVacantHouse(game);
      if (vacant) {
        const d = Utils.distance(this, { x: vacant.cx, y: vacant.cy });
        if (d < 60) {
          vacant.vacant  = false;
          vacant.ownerId = this.id;
          this.houseId   = vacant.id;
          h = vacant;
          game.addParticle(vacant.cx, vacant.cy - 24, '빈집 점유!', '#aaccff', 2200);
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집을 점유`, '#aaccff');
        } else {
          this._setState('going_home');
          this._setTarget(vacant.cx, vacant.cy);
          return;
        }
      }
    }

    // ── 습격 행동: 표적 가족원/집을 향해 진군 ─────────────
    if (this.raidTarget !== null) {
      if (Math.random() < 0.005) this._say('raid');
      // 적 성원 우선
      const enemy = game.findNearestSiljangsuk(this.x, this.y, 2000,
        s => !s.dead && s.familyId === this.raidTarget && !s.slaveOf);
      if (enemy) {
        this._setState('attacking');
        this._setTarget(enemy.x, enemy.y);
        if (Utils.distance(this, enemy) < 28 && this.attackCooldown <= 0) {
          const dmg = (this.nailBoost ? 18 : 10) + this.stage * 2;
          enemy.hp = Math.max(0, enemy.hp - dmg);
          enemy.lastAttackerId    = this.id;
          enemy.counterAttackTimer = 5;
          this.attackCooldown = 1.5;
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_COMBAT_GAIN);
          game.addParticle(enemy.x, enemy.y - 14, `-${dmg}(습격)`, '#ff2222', 1000);
        }
        return;
      }
      // 적 집 공격
      for (const eh of game.houses) {
        const owner = game.getEntity(eh.ownerId);
        if (owner && owner.familyId === this.raidTarget && !eh.vacant) {
          this._setState('attacking');
          this._setTarget(eh.cx, eh.cy);
          if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 50 && this.attackCooldown <= 0) {
            eh.takeDamage(8);
            this.attackCooldown = 1.5;
            if (eh.hp <= 0) game.destroyHouse(eh);
          }
          return;
        }
      }
    }

    // ── 개념 성향: 식량 충분하면 굶주린 타인에게 음식 나눠줌 ──
    if (this.personality === CONFIG.PERSONALITY_CONCEPT
        && !this.isHungry && h && h.foodReserves > 30
        && this.attackCooldown <= 0) {
      const hungry = game.findNearestSiljangsuk(this.x, this.y, 200,
        s => !s.dead && s.id !== this.id && s.familyId !== this.familyId
        && s.isHungry && !s.slaveOf);
      if (hungry) {
        const d = Utils.distance(this, hungry);
        if (d < 30) {
          // 음식 transfer
          const amt = Math.min(h.foodReserves, 10);
          h.foodReserves -= amt;
          hungry.satiation = Math.min(hungry.maxSat, hungry.satiation + amt);
          hungry.addRelation(this.id, +15);
          this.happiness = Math.min(100, this.happiness + 3);
          this.attackCooldown = 3;
          game.addParticle(hungry.x, hungry.y - 20, '🍱 음식 받음', '#aaffaa', 1800);
          if (game.logEvent) game.logEvent(`🍱 ${this.label}(개념)이 ${hungry.label}에게 음식 나눔`, '#aaffaa');
        } else {
          this._setState('giving_food');
          this._setTarget(hungry.x, hungry.y);
          return;
        }
      }
    }

    // ── 빈집 약탈: 본인 집 있고 다른 빈집에 식량 있으면 약탈 ──
    const vacant = this._findVacantHouse(game);
    if (vacant && h && vacant.foodReserves > 5
               && Utils.distance(this, { x: vacant.cx, y: vacant.cy }) < 600) {
      // 집이 있으면 빈집을 약탈 (식량 회수)
      this._setState('attacking');
      this._setTarget(vacant.cx, vacant.cy);
      if (Utils.distance(this, { x: vacant.cx, y: vacant.cy }) < 50 && this.attackCooldown <= 0) {
        const loot = Math.min(vacant.foodReserves, 10);
        vacant.foodReserves -= loot;
        if (h) h.foodReserves += loot;
        vacant.takeDamage(15);
        this.attackCooldown = 1.0;
        game.addParticle(this.x, this.y - 18, `🗝 약탈 +${Math.floor(loot)}`, '#ffaa44', 1500);
        if (vacant.hp <= 0) game.destroyHouse(vacant);
      }
      return;
    }

    // ── 같은 조직원이 외부 공격받으면 반격 도움 (그리고 관계 ↑) ──
    const ally = game.siljangsukList.find(s =>
      !s.dead && s.id !== this.id && s.familyId === this.familyId
      && s.counterAttackTimer > 0 && s.lastAttackerId !== null
      && Utils.distance(this, s) < 400);
    if (ally) {
      const atk = game.getEntity(ally.lastAttackerId);
      if (atk && !atk.dead && (atk.familyId === undefined || atk.familyId !== this.familyId)) {
        this._setState('attacking');
        this._setTarget(atk.x, atk.y);
        if (Utils.distance(this, atk) < 30 && this.attackCooldown <= 0) {
          const dmg = 5 + this.stage * 2;
          if (atk.hp !== undefined) atk.hp = Math.max(0, atk.hp - dmg);
          ally.addRelation(this.id, +10); // 도움받은 동료 → 관계 ↑
          this.attackCooldown = 1.5;
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_COMBAT_GAIN);
          game.addParticle(atk.x, atk.y - 14, `-${dmg}(원군)`, '#ffaa44', 1000);
        }
        return;
      }
    }

    // ── 부모 개입: 자식들끼리 싸움 → 먼저 공격한 새끼 처형 ──
    //   같은 가족 자식 중 lastAttackerId 가 같은 가족 자식인 경우
    const victim = game.siljangsukList.find(s =>
      !s.dead && s.familyId === this.familyId && s.stage < 4
      && s.lastAttackerId !== null && s.counterAttackTimer > 0);
    if (victim) {
      const aggr = game.getEntity(victim.lastAttackerId);
      if (aggr && !aggr.dead && aggr.familyId === this.familyId
          && aggr instanceof Siljangsuk && aggr.stage < 4 && aggr.id !== this.id) {
        this._setState('attacking');
        this._setTarget(aggr.x, aggr.y);
        if (Utils.distance(this, aggr) < 30 && this.attackCooldown <= 0) {
          aggr.hp = 0;
          this.attackCooldown = 1.5;
          game.addParticle(aggr.x, aggr.y - 22, '⚔️ 처형!', '#ff2222', 2500);
          if (game.logEvent) game.logEvent(`⚔️ 성체가 다툼을 일으킨 새끼를 처형함`, '#ff6666');
        }
        return;
      }
    }

    // Build house
    if (!h && this.paperCount >= CONFIG.HOUSE_BUILD_COST) {
      this._buildHouse(game);
      return;
    }

    // 운치굴 방문 (배변 욕구)
    if (this.goingToUnci && h) {
      this._setState('going_to_unci');
      this._setTarget(h.unciX, h.unciY);
      return;
    }

    // Hunger → 외부 음식 탐색 (집 비축량은 _updateNeeds에서 자동 소비)
    if (this.isHungry && !(h && h.foodReserves > 5 && h.isNear(this.x, this.y, 120))) {
      // 학습: 기억한 음식 위치 우선 탐색
      const recentFood = this._memory.foodZones.filter(z => Date.now() - z.t < 120000);
      if (recentFood.length && this.isHungry) {
        const nearest = recentFood.reduce((a, b) =>
          Utils.distance(this, a) < Utils.distance(this, b) ? a : b);
        if (Utils.distance(this, nearest) > 50) {
          this._setState('seeking_food');
          this._setTarget(nearest.x, nearest.y);
          // 계속 일반 음식 탐색도 시도
        }
      }
      const food = game.findNearestItem(this.x, this.y, 800, i => i.isFood(), this);
      if (food) {
        this._claimItem(food);
        this._setState('seeking_food');
        this._setTarget(food.x, food.y);
        if (this._foodSpeechCD <= 0) {
          this._foodSpeechCD = 60;
          this._say('food');
        }
        if (Utils.distance(this, food) < 14) this._pickUp(food, game);
        return;
      }
    }

    // Deposit if have items
    if (this.carriedItems.length > 0 && h) {
      this._setState('carrying_item');
      this._setTarget(h.cx, h.cy);
      if (h.isNear(this.x, this.y, 40)) this._depositAll(game);
      return;
    }

    // Collect paper if no house
    if (!h && this.paperCount < CONFIG.HOUSE_BUILD_COST && this.carriedItems.length < this.maxCarry) {
      const paper = game.findNearestItem(this.x, this.y, 700, i => i.isPaper(), this);
      if (paper) {
        this._claimItem(paper);
        this._setState('seeking_item');
        this._setTarget(paper.x, paper.y);
        if (Utils.distance(this, paper) < 14) this._pickUp(paper, game);
        return;
      }
    }

    // Collect any item
    if (this.carriedItems.length < this.maxCarry) {
      const item = game.findNearestItem(this.x, this.y, 450, null, this);
      if (item && !this._hasCloserCompetitor(item, game)) {
        this._claimItem(item);
        this._setState('seeking_item');
        this._setTarget(item.x, item.y);
        if (Utils.distance(this, item) < 14) this._pickUp(item, game);
        return;
      }
    }

    // Combat
    if (this.attackCooldown <= 0) this._doCombat(game);

    this._wander(dt, game, CONFIG.WORLD_WIDTH);
  }

  _doCombat(game) {
    if (this.personality === CONFIG.PERSONALITY_CONCEPT) return;

    // 관계 -100 이하인 실장석이 가까이 있으면 최우선 공격
    const enemy = game.findNearestSiljangsuk(this.x, this.y, 300, s =>
      !s.dead && !s.hidden && s.id !== this.id
      && this.getRelation(s.id) <= -100);
    if (enemy) {
      this._setState('attacking');
      this._setTarget(enemy.x, enemy.y);
      if (Utils.distance(this, enemy) < 26) {
        const dmg = (this.nailBoost ? 15 : 7) + this.stage * 2;
        this.applyAttack(enemy, dmg, game);
        this.attackCooldown = 1.8;
      }
      return;
    }

    const target = game.findNearestSiljangsuk(this.x, this.y, 220, s => {
      if (s.dead || s.id === this.id) return false;
      if (s.hidden) return false; // 수풀에 숨어있으면 공격 못 함
      if (s.familyId === this.familyId) return false;
      if (s.personality === this.personality && this.satiation > 0) return false;
      if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) return true;
      if (this.personality === CONFIG.PERSONALITY_NORMAL)   return s.stage <= this.stage - 1;
      return false;
    });

    if (!target) return;

    // 표적이 집 안에 숨었으면 집을 공격
    const enemyHouse = this._targetInsideEnemyHouse(target, game);
    if (enemyHouse) {
      this._setState('attacking');
      this._setTarget(enemyHouse.cx, enemyHouse.cy);
      if (Utils.distance(this, { x: enemyHouse.cx, y: enemyHouse.cy }) < 55
          && this.attackCooldown <= 0) {
        enemyHouse.takeDamage(6 + this.stage);
        this.attackCooldown = 1.5;
        game.addParticle(enemyHouse.cx, enemyHouse.cy - 10, '💢 집 공격!', '#ff6644', 1200);
        if (enemyHouse.hp <= 0) game.destroyHouse(enemyHouse);
      }
      return;
    }

    this._setState('attacking');
    this._setTarget(target.x, target.y);

    if (Utils.distance(this, target) < 26) {
      const dmg = (this.nailBoost ? 15 : 7) + this.stage * 2;
      this.applyAttack(target, dmg, game);
      this.attackCooldown = 1.8;

      // Steal if target low
      if (target.carriedItems.length > 0 && target.hp < target.maxHp * 0.35) {
        const stolen = target.carriedItems.pop();
        if (stolen) {
          stolen.carriedBy = this.id;
          this.carriedItems.push(stolen);
          game.addParticle(this.x, this.y - 18, '약탈!', '#ff8800', 1100);
        }
      }
    }
  }

  // ── House / Items ───────────────────────────────
  _buildHouse(game) {
    // 후보지: 본인 근처(가까운 위치 선호) 20개 + 월드 랜덤 10개
    const candidates = [];
    for (let i = 0; i < 20; i++) {
      candidates.push({
        x: Utils.clamp(this.x + Utils.random(-280, 280), 100, CONFIG.WORLD_WIDTH  - 100),
        y: Utils.clamp(this.y + Utils.random(-280, 280), 100, CONFIG.WORLD_HEIGHT - 100),
      });
    }
    for (let i = 0; i < 10; i++) candidates.push(game.world.randomOpenSpot());

    let best = candidates[0], bestScore = -Infinity;
    for (const spot of candidates) {
      const s = this._scoreHouseSpot(spot, game);
      if (s > bestScore) { bestScore = s; best = spot; }
    }

    const hx = Utils.clamp(best.x, 50, CONFIG.WORLD_WIDTH  - CONFIG.HOUSE_WIDTH  - 50);
    const hy = Utils.clamp(best.y, 50, CONFIG.WORLD_HEIGHT - CONFIG.HOUSE_HEIGHT - 50);

    // 건축 현장 등록 (5초 후 실제 집 생성)
    game.constructions = game.constructions ?? [];
    game.constructions.push({
      x: hx, y: hy, w: CONFIG.HOUSE_WIDTH, h: CONFIG.HOUSE_HEIGHT,
      ownerId: this.id, progress: 0, duration: CONFIG.BUILD_DURATION,
    });
    this.paperCount = 0;
    this.carriedItems = this.carriedItems.filter(i => !i.isPaper());
    game.addParticle(hx + CONFIG.HOUSE_WIDTH/2, hy - 8, '🔨 건축 시작', '#ffe066', 2000);
    if (game.logEvent) game.logEvent(`🔨 ${this.label}가 집을 짓기 시작`, '#ffcc66');
  }

  // 집 후보지 점수 계산
  //   + 쓰레기통/연못/현재 음식이 가까우면 가산
  //   - 다른 집/월드 경계가 너무 가까우면 감점
  _scoreHouseSpot(spot, game) {
    let score = 0;

    // 1) 다른 집과의 거리 — 250 미만은 큰 페널티, 멀수록 안전
    let minHouseDist = Infinity;
    for (const h of game.houses) {
      const d = Utils.distance(spot, { x: h.cx, y: h.cy });
      if (d < minHouseDist) minHouseDist = d;
    }
    if (minHouseDist < 250)      score -= (250 - minHouseDist) * 3;
    else                         score += Math.min(minHouseDist, 800) * 0.25;

    // 2) 쓰레기통과의 거리 — 음식 공급원, 가까울수록 좋음 (단, 50 미만은 너무 붙음)
    let minTrashDist = Infinity;
    for (const tc of (game.trashCans || [])) {
      const d = Utils.distance(spot, tc);
      if (d < minTrashDist) minTrashDist = d;
    }
    if (minTrashDist < 60)        score -= (60 - minTrashDist);
    else if (minTrashDist < 500)  score += (500 - minTrashDist) * 0.5;

    // 3) 연못 (물 공급원) — 너무 가까우면 위험, 적당히 가까우면 좋음 (추후 물 시스템 대비)
    if (game.world?.pond) {
      const pondD = Utils.distance(spot, game.world.pond);
      if (pondD < 150)             score -= (150 - pondD);
      else if (pondD < 700)        score += (700 - pondD) * 0.2;
    }

    // 4) 주변 떨어진 음식 (현재 음식 핫스팟) — 많을수록 가산
    let foodCount = 0;
    for (const item of game.items) {
      if (item.collected) continue;
      if (!item.isFood || !item.isFood()) continue;
      if (Utils.distance(spot, item) < 450) foodCount++;
    }
    score += foodCount * 25;

    // 5) 월드 경계 — 200 미만은 페널티
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    const margin = Math.min(spot.x, spot.y, W - spot.x, H - spot.y);
    if (margin < 200) score -= (200 - margin) * 2;

    // 6) 같은 성향 실장석이 근처에 있으면 보너스 (군집 선호)
    let samePersonalityNearby = 0;
    let sameFamilyNearby = 0;
    for (const s of game.siljangsukList) {
      if (s.dead || s.id === this.id || s.slaveOf) continue;
      const d = Utils.distance(spot, s);
      if (s.personality === this.personality && d < 500) samePersonalityNearby++;
      if (s.familyId   === this.familyId   && d < 600) sameFamilyNearby++;
    }
    score += samePersonalityNearby * 12;
    score += sameFamilyNearby * 25;          // 가족 근처 큰 가산점

    // 7) 본인 현재 위치와의 거리 — 가까울수록 좋음
    const dSelf = Utils.distance(spot, this);
    score -= dSelf * 0.05;

    return score;
  }

  _pickUp(item, game) {
    if (item.collected) return;
    // 다른 실장석이 노리던 음식을 가로채면 관계 -1
    if (item.claimedBy && item.claimedBy !== this.id) {
      const claimer = game.getEntity(item.claimedBy);
      if (claimer && !claimer.dead && claimer.addRelation) {
        claimer.addRelation(this.id, -1);
        game.addParticle(claimer.x, claimer.y - 18, '내 거였는데…', '#ffaa44', 1500);
      }
    }
    item.collected  = true;
    item.carriedBy  = this.id;
    item.claimedBy  = null;
    this.carriedItems.push(item);
    if (item.isPaper()) this.paperCount++;
    if (item.isFood && item.isFood()) {
      this._memory.foodZones.push({ x: this.x, y: this.y, t: Date.now() });
      if (this._memory.foodZones.length > 5) this._memory.foodZones.shift();
    }
  }

  // 음식 타겟 잡으면서 claim
  _claimItem(item) {
    if (!item) return;
    item.claimedBy  = this.id;
    item._claimTime = Date.now();
  }

  _depositAll(game) {
    const h = this.house;
    if (!h) return;

    for (const item of this.carriedItems) {
      if (item.isFood() || item.type === 'confetto') {
        // 집 비축량에 저장 → _updateNeeds 에서 허기 시 자동 소비
        h.addFood(item.foodValue ?? 8);
        game.addParticle(this.x, this.y - 16, `🍱+${Math.floor(item.foodValue ?? 8)}`, '#ff9933', 700);
      } else if (item.isLeaf()) {
        h.addLeaf();
      } else if (item.isPaper()) {
        h.repair(1);
      } else if (item.isTarp()) {
        h.maxHp   = Math.min(CONFIG.HOUSE_MAX_HP, h.maxHp + 30);
        h.comfort = Math.min(100, h.comfort + 20);
      } else if (item.isNail()) {
        this.nailBoost = true;
        game.addParticle(this.x, this.y - 18, '공격력 ↑', '#ff6600', 1200);
      } else if (item.isPollen()) {
        if (this.stage === 4 && !this.pregnant) {
          this.pregnant       = true;
          this.pregnancyTimer = 0;
          game.addParticle(this.x, this.y - 22, '임신!', '#ffaaff', 2000);
        }
      }
      // Mark as consumed and detach
      item.collected = true;
      item.carriedBy = null;
    }
    this.carriedItems = [];
  }

  _eat(item) {
    // 코로리: 즉사
    if (item.isKorori && item.isKorori()) {
      this._die(Game, '코로리 중독');
      return;
    }
    // 도돈파: 포만 0 + 운치 대량 생성
    if (item.isDodonpa && item.isDodonpa()) {
      this.satiation = 0;
      const h = this.house;
      if (h) h.addUnci(40);
      this.happiness = Math.max(0, this.happiness - 20);
      Game.addParticle(this.x, this.y - 18, '💜 도돈파!', '#aa55cc', 1800);
      return;
    }
    // 분충: 음식을 많이 먹음 (포만 적게 차고 식량 많이 소비)
    //   → satiation += val * 0.7
    // 개념: 음식을 적게 먹어도 포만이 많이 참
    //   → satiation += val * 1.5
    let mult = 1;
    if (this.personality === CONFIG.PERSONALITY_CONCEPT)  mult = 1.5;
    if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) mult = 0.7;
    this.satiation = Math.min(this.maxSat, this.satiation + (item.foodValue ?? 8) * mult);
    if (item.happinessEffect) {
      this.happiness = Utils.clamp(this.happiness + item.happinessEffect, 0, 100);
    }
  }

  // ── Movement helpers ────────────────────────────
  _wander(dt, game, range) {
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = Utils.random(2, 6);
      const h = this.house;
      const cx = h ? h.cx : this.x;
      const cy = h ? h.cy : this.y;
      const r  = this.isChild ? Math.min(range, 150) : range;
      this._setTarget(
        Utils.clamp(cx + Utils.random(-r, r), 20, CONFIG.WORLD_WIDTH  - 20),
        Utils.clamp(cy + Utils.random(-r, r), 20, CONFIG.WORLD_HEIGHT - 20)
      );
      this._setState('idle');
    }
  }

  _behaveAsSlave(dt, game) {
    const master = game.getEntity(this.slaveOf);
    if (!master || master.dead) { this.slaveOf = null; return; }
    const masterHouse = game.getEntity(master.houseId);

    // 3단계 노예: 1단계 새끼 프니프니
    if (this.stage === 3 && this.pniepnieCooldown <= 0) {
      const baby = game.findNearestSiljangsuk(this.x, this.y, 120,
        s => s.stage === 1 && !s.dead && s.familyId === master.familyId);
      if (baby) {
        this._setState('giving_pniepnie');
        this._setTarget(baby.x, baby.y);
        if (Utils.distance(this, baby) < 18) {
          baby.pniepnieTimer = 0;
          baby.happiness = Math.min(100, baby.happiness + CONFIG.HAPPINESS_PNIEPNIE_GAIN);
          game.addParticle(baby.x, baby.y - 18, '프니프니!', '#ffaaff', 1500);
          this.pniepnieCooldown = 10;
        }
        return;
      }
    }

    // 운치굴 근처에서 배회
    if (masterHouse) {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = Utils.random(2, 5);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (CONFIG.UNCI_RADIUS * 0.7);
        this._setTarget(masterHouse.unciX + Math.cos(angle) * r, masterHouse.unciY + Math.sin(angle) * r);
      }
      if (Utils.distance(this, { x: masterHouse.unciX, y: masterHouse.unciY }) > CONFIG.UNCI_RADIUS) {
        this._setTarget(masterHouse.unciX, masterHouse.unciY);
      }
    }
    this._setState('idle');
  }

  // 대상 실장석이 본인 가족이 아닌 집 내부에 있으면 그 집을 반환 (아니면 null)
  _targetInsideEnemyHouse(target, game) {
    if (!target) return null;
    for (const h of game.houses) {
      if (h.vacant) continue;
      const owner = game.getEntity(h.ownerId);
      if (owner && owner.familyId === this.familyId) continue;
      if (target.x > h.x + 2 && target.x < h.x + h.w - 2
          && target.y > h.y + 2 && target.y < h.y + h.h - 2) {
        return h;
      }
    }
    return null;
  }

  // 같은 목표 아이템에 더 가까운 다른 실장석이 있는지
  _hasCloserCompetitor(item, game) {
    const myD = Utils.distance(this, item);
    for (const s of game.siljangsukList) {
      if (s.dead || s.id === this.id) continue;
      if (Utils.distance(s, item) < myD - 10) return true; // 10px 이상 가까우면 양보
    }
    return false;
  }

  // 빈집(vacant) 중 가장 가까운 것
  _findVacantHouse(game) {
    let best = null, bestD = Infinity;
    for (const h of game.houses) {
      if (!h.vacant) continue;
      const d = Utils.distance(this, { x: h.cx, y: h.cy });
      if (d < bestD) { bestD = d; best = h; }
    }
    return best;
  }

  // 가장 가까운 운치굴(운치량 > 1) — 본인 집만 사용
  //   노예는 주인 집 운치굴 허용
  _findNearestUnci(game) {
    // 노예: 주인 집 운치굴
    if (this.slaveOf) {
      const master = game.getEntity(this.slaveOf);
      const mh = master ? game.getEntity(master.houseId) : null;
      if (mh && mh.unciAmount > 1) return mh;
      return null;
    }
    // 일반: 본인 집만
    const h = this.house;
    if (h && h.unciAmount > 1) return h;
    return null;
  }

  _findNearestThreat(game) {
    let best = null, bestD = 250;
    for (const s of game.siljangsukList) {
      if (s.dead || s.id === this.id || s.familyId === this.familyId) continue;
      // 같은 성향은 위협으로 인식 안 함 (포만 있을 때)
      if (s.personality === this.personality && this.satiation > 0) continue;
      if (!s.isAdult) continue;
      const d = Utils.distance(this, s);
      if (d < bestD) { best = s; bestD = d; }
    }
    for (const h of game.humans) {
      if (h.done) continue;
      if (h.type === 2 || h.type === 3) {
        const d = Utils.distance(this, h);
        if (d < bestD) { best = h; bestD = d; }
      }
    }
    return best;
  }

  _eatCarriedItem(item, game) {
    if (!item.isFood || !item.isFood()) return;
    const mult = (this.personality === CONFIG.PERSONALITY_CONCEPT) ? 1.5 : 1;
    this.satiation = Math.min(this.maxSat, this.satiation + (item.foodValue ?? 8) * mult);
    if (item.happinessEffect) this.happiness = Utils.clamp(this.happiness + item.happinessEffect * 0.5, 0, 100);
    item.collected = true; item.carriedBy = null;
    this.carriedItems = this.carriedItems.filter(i => i.id !== item.id);
    if (game) game.addParticle(this.x, this.y - 16, '냠냠!', '#ff9933', 800);
  }

  _fleeFrom(fx, fy) {
    this._fleeFrom_raw(fx, fy);
  }

  _fleeFrom_raw(fx, fy) {
    const dx = this.x - fx, dy = this.y - fy;
    const n  = Utils.normalize(dx, dy);
    this._setTarget(
      Utils.clamp(this.x + n.x * 250, 20, CONFIG.WORLD_WIDTH  - 20),
      Utils.clamp(this.y + n.y * 250, 20, CONFIG.WORLD_HEIGHT - 20),
      true   // force
    );
    this.fleeing   = true;
    this.fleeTimer = 3;
    this._setState('fleeing');
  }

  _fleeToHouse(game) {
    // 우선 가장 가까운 수풀로 (집보다 가까우면)
    let bestBush = null, bushD = Infinity;
    for (const b of (game.world?.bushes || [])) {
      const d = Utils.distance(this, b);
      if (d < bushD) { bushD = d; bestBush = b; }
    }
    const h = this.house;
    if (bestBush && (!h || bushD < Utils.distance(this, { x: h.cx, y: h.cy }))) {
      this._setState('fleeing');
      this._setTarget(bestBush.x, bestBush.y, true);
      this.fleeing = true; this.fleeTimer = 4;
      return;
    }
    if (h) {
      this._setState('fleeing');
      this._setTarget(h.cx, h.cy, true);
      this.fleeing   = true;
      this.fleeTimer = 4;
    } else {
      this._fleeFrom_raw(this.x + Utils.random(-100, 100), this.y + Utils.random(-100, 100));
    }
  }

  _setTarget(x, y, force = false) {
    const now = performance.now();
    if (!force && this.targetX !== undefined) {
      // 현재 타겟에 이미 도달했으면 락 해제 — 새 목표 즉시 수락
      const distToCurrent = Math.hypot(this.x - this.targetX, this.y - this.targetY);
      if (distToCurrent < 25) {
        this.targetX = x; this.targetY = y;
        this._lastTargetT = now;
        return;
      }
      // 아직 도달 못 했고 5초 안 + 새 타겟이 멀리 다른 방향 → 유지 (현재 목표 추격 우선)
      const d = Math.hypot(x - this.targetX, y - this.targetY);
      const since = (now - (this._lastTargetT ?? 0)) / 1000;
      if (since < 5 && d > 60) return;
    }
    this.targetX = x; this.targetY = y;
    this._lastTargetT = now;
  }
  _setState(s)      { if (this.state !== s) { this.state = s; this.stateTimer = 0; } }

  _move(dt) {
    if (this.state === 'sleeping') { return; }

    if (this.fleeing) {
      this.fleeTimer -= dt;
      if (this.fleeTimer <= 0) { this.fleeing = false; }
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d > 4) {
      const s = this.speed;
      let nx = this.x + (dx / d) * s * dt;
      let ny = this.y + (dy / d) * s * dt;
      // 가족이 아닌 다른 집 내부로는 들어갈 수 없음 (공격용은 외벽까지만)
      for (const h of Game.houses) {
        if (h.vacant) continue;
        if (h.ownerId === this.id) continue;
        const owner = Game.getEntity(h.ownerId);
        if (owner && owner.familyId === this.familyId) continue;
        // 집 영역 안으로 침입 차단
        if (nx > h.x + 2 && nx < h.x + h.w - 2 && ny > h.y + 2 && ny < h.y + h.h - 2) {
          // 외벽에서 멈춤
          nx = this.x; ny = this.y;
          break;
        }
      }
      this.x = nx; this.y = ny;
    }
    this.x = Utils.clamp(this.x, 8, CONFIG.WORLD_WIDTH  - 8);
    this.y = Utils.clamp(this.y, 8, CONFIG.WORLD_HEIGHT - 8);
  }

  // ── 이동 방향 계산 (스프라이트 행 결정용) ───────────
  _getDirection() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 6) return 'front';                     // 정지 중 → 앞
    if (Math.abs(dy) >= Math.abs(dx)) {
      return dy > 0 ? 'front' : 'back';            // 위아래
    }
    return dx > 0 ? 'right' : 'left';              // 좌우
  }

  // ── Rendering ───────────────────────────────────
  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, 40)) return;
    // 시체 페이드 그리기
    if (this.dead) {
      if (this.fadeTimer <= 0) return;
      const sz = this.size;
      const alpha = this.fadeTimer / 10;
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.PI / 2);
      const img = Images.get(this.stage);
      if (img) {
        ctx.drawImage(img, 0, 0, 48, 48, -sz, -sz, sz * 2.2, sz * 2.2);
      } else {
        ctx.fillStyle = '#666';
        ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      return;
    }

    const sz  = this.size;
    const col = STAGE_COLORS[this.stage] ?? '#aaa';
    let img;
    if (this.slaveOf !== null && Images.getSlave) {
      img = Images.getSlave(this.stage);
    } else if (this.stage === 4 && this.pregnant && Images.getPregnant && Images.getPregnant()) {
      img = Images.getPregnant();
    } else {
      img = Images.get(this.stage);
    }
    const bob = img ? 0 : Math.sin(this.animTimer * 3) * 1.5;

    // 공격 애니메이션: 살짝 물러났다 부딪치는 효과 (target 방향으로 0~1 진행)
    let atkOffsetX = 0, atkOffsetY = 0;
    if (this.attackAnimTimer > 0) {
      const t = 1 - this.attackAnimTimer / 0.35;          // 0(처음) → 1(끝)
      const phase = t < 0.4 ? -t * 1.2 : (t - 0.4) * 1.5; // 뒤로 → 앞으로
      const dx = this.targetX - this.x, dy = this.targetY - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;
      atkOffsetX = (dx / d) * phase * 10;
      atkOffsetY = (dy / d) * phase * 10;
    }

    ctx.save();
    ctx.translate(this.x + atkOffsetX, this.y + bob + atkOffsetY);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.7, sz * 0.7, sz * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 피격 붉은 효과 (잠시 빨갛게 깜빡)
    if (this.hitFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255,40,40,${0.55 * (this.hitFlashTimer / 0.35)})`;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (img) {
      // ── 스프라이트 시트 렌더링 ──────────────────────
      // 포맷: 48×48 per frame, 가로 4열(프레임), 세로 4행(방향)
      //   행 0 = front(↓)  행 1 = back(↑)  행 2 = left(←)  행 3 = right(→)
      const FSIZE  = 48;
      const FPS    = 6;
      const moving = Utils.distance(this, { x: this.targetX, y: this.targetY }) > 6
                     && this.state !== 'sleeping';
      const frame  = moving ? Math.floor(this.animTimer * FPS) % 4 : 0;
      const ROW    = { front: 0, back: 1, left: 2, right: 3 };
      const row    = ROW[this._getDirection()] ?? 0;
      const dispSz = sz * 2.6;
      ctx.drawImage(img,
        frame * FSIZE, row * FSIZE, FSIZE, FSIZE,
        -dispSz / 2, -dispSz / 2, dispSz, dispSz
      );
    } else {
      // ── 폴백: 원형 ──────────────────────────────────
      ctx.fillStyle = col;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, sz, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      const eyeR = Math.max(1.5, sz * 0.18);
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-sz * 0.28, -sz * 0.1, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( sz * 0.28, -sz * 0.1, eyeR, 0, Math.PI * 2); ctx.fill();
    }

    // 머리 위에는 사용자가 명명한 이름만 표시 — 단순 번호 / 노예는 숨김
    if (!this.slaveOf) {
      const txt = this.label;
      if (txt && !txt.startsWith('#') && !txt.startsWith('독라')) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth   = 3;
        ctx.font        = `bold ${Math.max(10, sz * 0.65)}px "Noto Sans KR", sans-serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(txt, 0, -sz * 1.7);
        ctx.fillText(txt,   0, -sz * 1.7);
      }
    }

    // 보스 왕관 (해당 가족의 최강 성체)
    if (this.stage === 4) {
      const boss = Game.getTribeBoss && Game.getTribeBoss(this.familyId);
      if (boss && boss.id === this.id) {
        ctx.font = `${sz * 1.1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -sz * 1.3);
      }
    }

    // State visual overlays
    if (this.state === 'sleeping') {
      ctx.font = `${sz * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💤', 0, -sz * 1.2);
    } else if (this.happyCircuit) {
      ctx.font = `${sz * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('♪', 0, -sz * 1.2);
    } else if (this.state === 'needs_pniepnie') {
      ctx.font = `${sz * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -sz * 1.3);
    }

    // Pregnant icon
    if (this.pregnant) {
      ctx.font = `${sz * 0.8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🤰', sz * 1.1, -sz * 0.5);
    }

    // Nail boost
    if (this.nailBoost) {
      ctx.font = `${sz * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('⚔️', -sz * 1.1, -sz * 0.5);
    }

    // 말풍선
    if (this._speech && this._speechTimer > 0) {
      ctx.save();
      const text = this._speech;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(text).width;
      const bx = -tw / 2 - 6, by = -sz * 2.8, bw = tw + 12, bh = 18;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      Utils.roundRect(ctx, bx, by, bw, bh, 6);
      ctx.fill(); ctx.stroke();
      // 꼬리
      ctx.beginPath();
      ctx.moveTo(-3, by + bh);
      ctx.lineTo(0, by + bh + 5);
      ctx.lineTo(3, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.fillText(text, 0, by + 13);
      ctx.restore();
    }

    // Carried item count badge
    if (this.carriedItems.length > 0) {
      ctx.fillStyle = '#ffe066';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sz * 0.8, -sz * 0.8, sz * 0.45, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#333';
      ctx.font = `bold ${sz * 0.55}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.carriedItems.length, sz * 0.8, -sz * 0.8 + sz * 0.2);
    }

    ctx.restore();

    // HP bar (for adults)
    if (this.isAdult || this.stage === 3) {
      const bw = sz * 3;
      const bh = 4;
      const bx = this.x - bw / 2;
      const by = this.y - sz - 14;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, bw, bh);
      const hpR = this.hp / this.maxHp;
      ctx.fillStyle = hpR > 0.6 ? '#44cc44' : hpR > 0.3 ? '#cccc44' : '#cc4444';
      ctx.fillRect(bx, by, bw * hpR, bh);
    }
  }

  // ── Info for UI ─────────────────────────────────
  getStatusText() {
    const pName = ['분충', '보통', '개념'][this.personality];
    const stateNames = {
      idle: '한가로움', sleeping: '취침', seeking_item: '수집 중',
      seeking_food: '음식 탐색', carrying_item: '귀환 중',
      attacking: '공격 중', fleeing: '도주 중', going_home: '귀가 중',
      giving_pniepnie: '프니프니 중', needs_pniepnie: '돌봄 필요', happy_circuit: '행복회로!',
      eating_unci: '운치 섭취 중', going_to_unci: '운치굴로',
    };
    return {
      label: this.label,
      stage: STAGE_LABELS[this.stage],
      personality: pName,
      hp: `${Math.floor(this.hp)} / ${Math.floor(this.maxHp)}`,
      satiation: `${Math.floor(this.satRatio * 100)}%`,
      happiness: `${Math.floor(this.happiness)} (${this.happinessLabel})`,
      state: stateNames[this.state] ?? this.state,
      items: this.carriedItems.length,
      pregnant: this.pregnant ? `임신 중 (${Math.floor(this.pregnancyTimer)}/${CONFIG.PREGNANCY_DURATION}s)` : '아님',
      slave: this.slaveOf !== null ? `노예 (주인ID:${this.slaveOf})` : '자유',
    };
  }
}
