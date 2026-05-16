// ───────────────────────────────────────────────
// Siljangsuk (실장석) – main entity
// ───────────────────────────────────────────────
const STAGE_COLORS = ['', '#ffb3d9', '#c9a0f5', '#90c0ff', '#78e878', '#f0c060'];
const STAGE_LABELS = ['', '구더기', '엄지', '자실장', '성체실장', '중성체 실장'];

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
  get size()      { return CONFIG.STAGE_SIZE[this.stage] * (this.stage === 4 ? (0.8 + 0.4 * (this.maxHp / CONFIG.STAGE_MAX_HP[4])) : 1); }

  get speed() {
    let s = this.baseSpeed;
    if (this.carriedItems.length > 0 && this.maxCarry > 1) {
      s *= (1 - 0.3 * (this.carriedItems.length / this.maxCarry));
    }
    if (this.pregnant)  s *= 0.7;
    if (this.happiness >= 61) s *= 1.1;
    if (this.happiness <= 20) s *= 1.35;            // 불행 → 벗어나려 분주
    if (this.hp < this.maxHp * 0.3) s *= 0.8;
    if (this.fleeing) s *= 1.6;
    return s;
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
    if (this.name) return this.name;

    if (this.stage === 4) {
      return `#${this.serialNo ?? '?'}`;
    }

    // 자식: 부모 라벨 + 출생순서
    if (this.parentId !== null && this.birthOrder > 0) {
      const p = Game.getEntity(this.parentId);
      if (p && !p.dead && p.label) {
        return `${p.label}-${this.birthOrder}`;
      }
      if (this.parentLabelSnapshot) {
        return `${this.parentLabelSnapshot}-${this.birthOrder}`;
      }
    }
    return `#${this.serialNo ?? '?'}`;
  }

  // ── Master update ──────────────────────────────
  update(dt, game) {
    if (this.dead) return;
    this.animTimer        += dt;
    this.stateTimer       += dt;
    this.attackCooldown    = Math.max(0, this.attackCooldown - dt);
    this.pniepnieCooldown  = Math.max(0, this.pniepnieCooldown - dt);
    this.counterAttackTimer = Math.max(0, this.counterAttackTimer - dt);

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
    // 노예 1-2단계는 즉시 사망
    if (this.slaveOf !== null && this.stage <= 2) {
      this._die(game, '노예처형');
      return;
    }

    // ── 포만 freeze (신생아 1일 / 강제독립 1일 등) ──
    if (this.satiationFreezeTimer > 0) {
      this.satiationFreezeTimer = Math.max(0, this.satiationFreezeTimer - dt);
      this.satiation = this.maxSat;
    } else {
      // Satiation decay
      let sLoss = CONFIG.SATIATION_LOSS_PER_SEC;
      if (this.pregnant) sLoss *= 1.5;
      if (this.stage === 1) sLoss *= 0.45;
      if (this.stage === 2) sLoss *= 0.7;
      this.satiation = Math.max(0, this.satiation - sLoss * dt);
    }

    // HP regen — 오직 밤에만 회복 (포만이 1이상일 때)
    if (game.isNight && this.satiation > 0 && this.hp < this.maxHp) {
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

    // ── stage 4 시간 누적 (분가/행복 판정용; 노쇠사 없음) ──
    if (this.stage === 4) this.stage4Age += dt;

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
    if (this.stage === 4 && !this.pregnant && !this.isHungry) {
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
      if (this.pregnancyTimer >= CONFIG.PREGNANCY_DURATION) this._giveBirth(game);
    }

    // Happy circuit
    if (!this.happyCircuit && this.happiness >= 90 && Math.random() < 0.0008 * dt) {
      this.happyCircuit      = true;
      this.happyCircuitTimer = Utils.random(3, 9);
      game.addParticle(this.x, this.y - 22, '♪~', '#ffee44', 1500);
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

  _die(game, reason) {
    this.dead = true;
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

    // Drop food proportional to maxHp
    const drops = Math.max(1, Math.floor(this.maxHp / 10));
    for (let i = 0; i < drops; i++) {
      game.spawnItem('food_normal',
        this.x + Utils.random(-35, 35),
        this.y + Utils.random(-35, 35));
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
    this.pregnant       = false;
    this.pregnancyTimer = 0;

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

      const child = game.spawnSiljangsuk(bx, by, stage, this.id, personality, this.familyId);
      child.houseId    = this.houseId;
      child.serialNo   = Game.nextSerialNo++;
      this.birthsGiven++;
      child.birthOrder = this.birthsGiven;
      child.parentLabelSnapshot = this.label;
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

    // ── 신생아: 출생 후 1일은 무조건 집으로 가는 게 최우선 ─
    if (this.satiationFreezeTimer > 0 && this.stage === 1) {
      const h = this.house;
      if (h) {
        const d = Utils.distance(this, { x: h.cx, y: h.cy });
        if (d > 35) {
          this._setState('going_home');
          this._setTarget(h.cx, h.cy);
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
          this._setTarget(atk.x, atk.y);
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

      // 2. 극단 굶주림 (satiation === 0): 우선순위 행동 체인
      if (this.satiation <= 0) {
        const isBunchungChild = (this.personality === CONFIG.PERSONALITY_BUNCHUNG && this.stage < 4);

        // 2-a. 분충 새끼는 다른 새끼를 먼저 사냥 (가족 외)
        if (isBunchungChild && this.stage >= 2 && this.attackCooldown <= 0) {
          const baby = game.findNearestSiljangsuk(this.x, this.y, 250, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId && s.isChild);
          if (baby) {
            this._setState('attacking');
            this._setTarget(baby.x, baby.y);
            if (Utils.distance(this, baby) < 26) {
              const dmg = 4 + this.stage * 2;
              baby.hp = Math.max(0, baby.hp - dmg);
              baby.lastAttackerId    = this.id;
              baby.counterAttackTimer = 5;
              this.attackCooldown = 1.2;
              game.addParticle(baby.x, baby.y - 14, `-${dmg}(분충)`, '#ff4444', 900);
            }
            return;
          }
        }

        // 2-b. 운치굴에서 운치 먹기 (모든 단계/성격 공통, 행복 감소)
        const unciHouse = this._findNearestUnci(game);
        if (unciHouse) {
          this._setState('eating_unci');
          this._setTarget(unciHouse.unciX, unciHouse.unciY);
          if (Utils.distance(this, { x: unciHouse.unciX, y: unciHouse.unciY }) < CONFIG.UNCI_RADIUS) {
            const eat = Math.min(unciHouse.unciAmount, 6 * dt);
            unciHouse.unciAmount = Math.max(0, unciHouse.unciAmount - eat);
            this.satiation = Math.min(this.maxSat, this.satiation + eat * 1.5);
            this.happiness = Math.max(0, this.happiness - 0.4 * dt); // 굴욕감
            this._eatParticleCd -= dt;
            if (this._eatParticleCd <= 0) {
              this._eatParticleCd = 1.5;
              game.addParticle(this.x, this.y - 14, '운치 섭취…', '#aa7700', 900);
            }
          }
          return;
        }

        // 2-c. 운치도 없으면 약자 공격 (stage >= 2, 가족 외)
        if (this.stage >= 2 && this.attackCooldown <= 0) {
          const prey = game.findNearestSiljangsuk(this.x, this.y, 250, s =>
            !s.dead && s.id !== this.id && s.familyId !== this.familyId && s.stage < this.stage);
          if (prey) {
            this._setState('attacking');
            this._setTarget(prey.x, prey.y);
            if (Utils.distance(this, prey) < 26) {
              const dmg = 5 + this.stage * 2;
              prey.hp = Math.max(0, prey.hp - dmg);
              prey.lastAttackerId    = this.id;
              prey.counterAttackTimer = 5;
              this.attackCooldown = 1.2;
              game.addParticle(prey.x, prey.y - 14, `-${dmg}(굶주림)`, '#ff4444', 900);
            }
            return;
          }
        }
      }
    }

    // Night → sleep
    if (game.isNight) {
      const h = this.house;
      if (h && h.isNear(this.x, this.y, 20)) {
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
    const h = this.house;

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
      const item = game.findNearestItem(this.x, this.y, 90);
      if (item) {
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
    const h = this.house;

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
      const item = game.findNearestItem(this.x, this.y, 130);
      if (item) {
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
    const h = this.house;

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
      const food = game.findNearestItem(this.x, this.y, 800, i => i.isFood());
      if (food) {
        this._setState('seeking_food');
        this._setTarget(food.x, food.y);
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
      const paper = game.findNearestItem(this.x, this.y, 700, i => i.isPaper());
      if (paper) {
        this._setState('seeking_item');
        this._setTarget(paper.x, paper.y);
        if (Utils.distance(this, paper) < 14) this._pickUp(paper, game);
        return;
      }
    }

    // Collect any item
    if (this.carriedItems.length < this.maxCarry) {
      const item = game.findNearestItem(this.x, this.y, 450);
      if (item) {
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

    const target = game.findNearestSiljangsuk(this.x, this.y, 220, s => {
      if (s.dead || s.id === this.id) return false;
      if (s.familyId === this.familyId) return false;
      if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) return true;
      if (this.personality === CONFIG.PERSONALITY_NORMAL)   return s.stage <= this.stage - 1;
      return false;
    });

    if (!target) return;

    this._setState('attacking');
    this._setTarget(target.x, target.y);

    if (Utils.distance(this, target) < 26) {
      const dmg = (this.nailBoost ? 15 : 7) + this.stage * 2;
      target.hp = Math.max(0, target.hp - dmg);
      target.lastAttackerId    = this.id;
      target.counterAttackTimer = 5;
      this.attackCooldown = 1.8;
      game.addParticle(target.x, target.y - 14, `-${dmg}`, '#ff4444', 900);

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
    // 후보지 25개 평가해서 가장 점수 높은 곳에 집을 짓는다
    const candidates = [];
    for (let i = 0; i < 20; i++) candidates.push(game.world.randomOpenSpot());
    // 본인 근처에서도 5개 후보 (이미 익숙한 위치 가산점)
    for (let i = 0; i < 5; i++) {
      candidates.push({
        x: Utils.clamp(this.x + Utils.random(-350, 350), 100, CONFIG.WORLD_WIDTH  - 100),
        y: Utils.clamp(this.y + Utils.random(-350, 350), 100, CONFIG.WORLD_HEIGHT - 100),
      });
    }

    let best = candidates[0], bestScore = -Infinity;
    for (const spot of candidates) {
      const s = this._scoreHouseSpot(spot, game);
      if (s > bestScore) { bestScore = s; best = spot; }
    }

    const hx = Utils.clamp(best.x, 50, CONFIG.WORLD_WIDTH  - CONFIG.HOUSE_WIDTH  - 50);
    const hy = Utils.clamp(best.y, 50, CONFIG.WORLD_HEIGHT - CONFIG.HOUSE_HEIGHT - 50);
    const house = new House(hx, hy, this.id);
    game.houses.push(house);
    game.entities.set(house.id, house);
    this.houseId  = house.id;
    this.paperCount = 0;
    this.carriedItems = this.carriedItems.filter(i => !i.isPaper());
    game.addParticle(house.cx, house.cy - 20, '집 완성! 🏠', '#ffe066', 2200);
    if (game.logEvent) game.logEvent(`🏠 ${this.label}가 새 집을 지음`, '#ffe066');
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

    return score;
  }

  _pickUp(item, game) {
    if (item.collected) return;
    item.collected  = true;
    item.carriedBy  = this.id;
    this.carriedItems.push(item);
    if (item.isPaper()) this.paperCount++;
    // 학습: 음식 발견 위치 기록
    if (item.isFood && item.isFood()) {
      this._memory.foodZones.push({ x: this.x, y: this.y, t: Date.now() });
      if (this._memory.foodZones.length > 5) this._memory.foodZones.shift();
    }
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
    this.satiation = Math.min(this.maxSat, this.satiation + (item.foodValue ?? 8));
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

  // 가장 가까운 운치굴(운치량 > 1) 보유한 집을 반환
  _findNearestUnci(game) {
    let best = null, bestD = Infinity;
    for (const h of game.houses) {
      if (!h || h.unciAmount <= 1) continue;
      const d = Utils.distance(this, { x: h.unciX, y: h.unciY });
      if (d < bestD) { best = h; bestD = d; }
    }
    return best;
  }

  _findNearestThreat(game) {
    let best = null, bestD = 250;
    for (const s of game.siljangsukList) {
      if (s.dead || s.id === this.id || s.familyId === this.familyId) continue;
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
    this.satiation = Math.min(this.maxSat, this.satiation + (item.foodValue ?? 8));
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
      Utils.clamp(this.y + n.y * 250, 20, CONFIG.WORLD_HEIGHT - 20)
    );
    this.fleeing   = true;
    this.fleeTimer = 3;
    this._setState('fleeing');
  }

  _fleeToHouse(game) {
    const h = this.house;
    if (h) {
      this._setState('fleeing');
      this._setTarget(h.cx, h.cy);
      this.fleeing   = true;
      this.fleeTimer = 4;
    } else {
      this._fleeFrom_raw(this.x + Utils.random(-100, 100), this.y + Utils.random(-100, 100));
    }
  }

  _setTarget(x, y) { this.targetX = x; this.targetY = y; }
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
      this.x += (dx / d) * s * dt;
      this.y += (dy / d) * s * dt;
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
    if (this.dead) return;
    if (!camera.isVisible(this.x, this.y, 40)) return;

    const sz  = this.size;
    const col = STAGE_COLORS[this.stage] ?? '#aaa';
    const img = (this.slaveOf !== null && Images.getSlave)
      ? Images.getSlave(this.stage)
      : Images.get(this.stage);
    const bob = img ? 0 : Math.sin(this.animTimer * 3) * 1.5;

    ctx.save();
    ctx.translate(this.x, this.y + bob);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.7, sz * 0.7, sz * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

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

    // 라벨 (이름 or 자동번호) — 머리 위에 표시
    {
      const txt = this.label;
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.lineWidth   = 3;
      ctx.font        = `bold ${Math.max(10, sz * 0.65)}px "Noto Sans KR", sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.strokeText(txt, 0, -sz * 1.7);
      ctx.fillText(txt,   0, -sz * 1.7);
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
