// ───────────────────────────────────────────────
// Siljangsuk (실장석) – main entity
// ───────────────────────────────────────────────
const STAGE_COLORS = ['', '#ffb3d9', '#c9a0f5', '#90c0ff', '#78e878', '#f0c060'];
const STAGE_LABELS = ['', '구더기', '엄지', '자실장', '성체실장', '중성체 실장'];

// 단계 / 상황별 대사 — 말 끝 어미는 단계별 고정
const SLEEP_LINES = ['ZzzZzz', 'Zzz…', 'ZzzzZ', 'Zzz~', 'Zzzz', 'zZ zZ', 'Zzz♪', 'zzz...', 'Zzz Zzz', 'Z…'];

const SPEECHES = {
  1: { // 레후
    idle: [
      '프니프니를 바라는레후', '프니프니!', '레후~', '으응…레후', '따뜻한레후',
      '마마 어디 있는레후?', '안아줘레후~', '헤헤 레후', '졸린레후', '레후레후~',
    ],
    food: [
      '배고픈레후', '맘마 줘레후~', '우물우물레후', '마마…레후', '더 먹을래레후!',
      '맛있는레후!', '응응 음식 좋아하는레후', '입이 마른레후', '으아앙 빨리 줘레후', '뭐든지 다 먹는레후',
    ],
    sleep: SLEEP_LINES,
    hurt: [
      '아픈레후!', '으앙레후!', '아야야레후', '무서운레후…', '살려달라레후',
      '누가 도와줘레후', '무서워서 우는레후', '마마! 마마! 도와줘레후', '도망가는레후', '무섭다레후…',
    ],
    unci: [
      '응가레후', '냠냠레후?', '잘 쌌레후', '시원하레후', '우끼끼레후',
      '또 응가레후', '더러운 거 아니레후', '운치 좋아하는레후', '운치 시간이레후', '행복한 응가레후',
    ],
    play: [
      '신난레후!', '같이 놀자레후~', '빙글빙글 즐거운레후', '누구든 같이 놀자레후', '우유아유유 즐거운레후',
      '어지러운레후', '다같이 빙글빙글 레후', '즐거워레후 헤헤', '노래도 부른레후~', '친구들 좋아레후',
    ],
  },
  2: { // 레치
    idle: [
      '먹어도 먹어도 배고픈 레치', '심심한레치!', '구더기쨩이랑 놀고싶은레치', '오늘은 무엇을 할 레치?',
      '마마 어디 갔레치?', '누가 옆에 있어주면 좋겠레치', '따뜻한 햇살이 좋은레치', '운치굴 가는 길레치',
      '부지런해야 하는레치', '한가하면 졸린레치',
    ],
    food: [
      '먹이가 어디있는레치?', '냠냠 시간레치!', '맛있는 거 어디 없레치?', '꼬르륵 소리나는레치',
      '음식만 있으면 행복하레치', '마마가 음식 가져오는레치?', '음식 사냥하는레치', '떨어진 거 주워먹는레치',
      '또 배고프네 레치', '맛있는 거 먹고 싶은레치',
    ],
    sleep: SLEEP_LINES,
    hurt: [
      '아프레치!', '울고싶은레치!', '마마! 도와줘레치', '아야 아야 레치', '무섭레치',
      '살려달라 레치', '누가 와줘 레치', '도망가야 하는레치', '아파서 못 움직이는레치', '어지럽레치',
    ],
    unci: [
      '응가하는레치', '시원한레치~', '운치굴 들어간레치', '또 똥 누는레치', '화장실 가는레치',
      '살 빠질것 같은레치', '큰 일 본레치', '하루의 임무 끝낸레치', '시원하니 후련한레치', '운치는 좋은 것 레치',
    ],
    play: [
      '노는게 좋은레치!', '뱅뱅 도는레치!', '빙글빙글 즐거운레치', '다같이 노는 시간 레치',
      '어지러워서 행복한레치', '친구가 있어 좋은레치', '같이 빙빙 돌자 레치', '이렇게 놀면 어지럽레치',
      '헤헤 친구들이랑 노는레치', '더 놀고 싶은레치~',
    ],
  },
  3: { // 테치
    idle: {
      [-1]: [
        '먹을 것을 찾아보는테치!', '음식이 어디 있을지 고민하는테치', '가족 위해 부지런해야 하는테치',
        '효율적으로 모아야 하는테치', '체계가 중요한테치', '먹을 거 충분히 모아야 하는테치',
        '오늘도 한 차례 둘러봐야 하는테치', '음식 모으는 게 보람있는테치', '비축이 가족을 살리는테치',
        '생각이 많은테치',
      ],
      [0]: [
        '창고에 맛나맛나 없는테치?', '내 거 좀 더 가져가도 되는테치', '나만 굶주리면 안되는테치',
        '가족이라도 내 먼저인테치', '음식은 내가 먼저 보는테치', '나누는 거 싫어하는테치',
        '경쟁자가 많아진테치', '이런 데서 음식 또 어디 있을까테치', '먹을 거만 보면 욕심 나는테치',
        '내 몫은 챙겨야 하는테치',
      ],
      [1]: [
        '마마 좋은 테치', '오늘은 평화로운테치', '심심하지만 좋은 테치', '마마와 같이 있는테치',
        '따뜻한 햇살 좋은테치', '운치굴 곁이 안심되는테치', '가족이 모이면 행복한테치',
        '평화로운 하루 만족하는테치', '큰 일 없으면 좋은테치', '오늘도 무사한테치',
      ],
    },
    food: [
      '먹이를 찾아 떠나는테치', '오늘은 어디에 음식이 있을까테치', '맛난 거 보이면 가져갈테치',
      '음식 모으는 게 중요한테치', '가족 위해 음식 가져가는테치', '누가 음식 떨어뜨려주면 좋겠테치',
      '음식이 많아야 평화로운테치', '굶주리면 큰일나는테치', '음식 좀 더 있으면 좋겠테치', '사냥감 어디 있는테치?',
    ],
    sleep: SLEEP_LINES,
    hurt: [
      '아프다테치!', '울지 않는테치', '도망가야 하는테치', '화나는테치!', '누가 도와주는테치?',
      '죽고 싶지 않은테치', '살 수 있을지 걱정되는테치', '다시는 안 맞을테치', '아파도 참는테치', '마마 어디 있는테치?',
    ],
    unci: [
      '용변보는 테치', '운치굴이 가까운테치', '시원한 일 보는테치', '운치 잘 나오는테치', '화장실 시간테치',
      '큰 일 했더니 후련한테치', '운치 많아지면 좋은테치', '응가 시간 행복한테치', '깔끔하게 본 테치', '운치굴 좋아하는테치',
    ],
    raid: [
      '싸우러 가는테치!', '적을 박살내는테치!', '가족을 위해 싸우는테치', '우리 조직이 이기는테치!',
      '보스님 따라가는테치', '위험해도 가는테치', '무서워도 가는테치', '적을 혼내주는테치',
      '다 같이 가는테치!', '이번엔 꼭 이기는테치',
    ],
    birth: [
      '아기 낳는테치!', '새 자가 태어나는테치~', '마마가 되는테치', '새 생명 환영하는테치',
      '가족이 늘어나는테치', '자가 건강하면 좋은테치', '출산은 행복한테치', '자들이 자라는 게 기쁜테치',
      '처음 만나는 자들테치', '따뜻한 출산 시간테치',
    ],
    play: [
      '뱅글뱅글 즐거운테치!', '같이 놀아 신나는테치~', '친구들이 있어 좋은테치', '빙빙 도는 게 재미있는테치',
      '누구든 같이 놀자테치', '어지러워도 행복한테치', '노래 부르며 도는테치', '가장 좋은 시간테치',
      '더 놀고 싶은테치', '친구가 있어 다행인테치',
    ],
  },
  4: { // 데스
    idle: [
      '자들을 먹여살리는데스', '공원은 위험한데스', '오늘도 살아남는데스!', '평화로운 하루데스',
      '가족이 모두 안전한데스', '음식이 충분해야 안심하는데스', '책임이 무거운데스',
      '자들과 함께가 행복한데스', '보스님은 든든한데스', '모두를 지키는데스',
    ],
    food: [
      '먹이 사냥에 나서는데스', '가족을 위해 모으는데스', '좋은 사냥감 찾는데스', '음식이 부족하면 큰일나는데스',
      '자들 먼저 먹여야 하는데스', '비축이 중요한데스', '쓰레기통도 살펴보는데스',
      '동서남북 다 뒤지는데스', '음식 많은 곳을 기억해두는데스', '가족 위해 부지런해야 하는데스',
    ],
    sleep: SLEEP_LINES,
    hurt: [
      '반격하는데스!', '아프지만 견디는데스', '적을 응징하는데스!', '가족을 위해 버티는데스',
      '죽지 않는데스', '다친 정도는 괜찮은데스', '누구의 짓인지 가만 안 두는데스',
      '동료들이 도와주는데스', '일어서야 하는데스', '아파도 가족이 우선인데스',
    ],
    unci: [
      '용변보는데스', '운치굴 다녀오는데스', '운치 많이 쌓는데스', '시원한 시간데스',
      '운치굴에 노예가 있어 흐뭇한데스', '운치는 가족의 자원이데스', '항상 운치굴 깨끗이 하는데스',
      '자들도 운치를 보는 시간이데스', '운치 가득 차면 좋은데스', '일하고 나서 운치 시간이데스',
    ],
    raid: [
      '적 조직을 박살내는데스!', '습격이다! 모이는데스!', '가족 영역을 지키는데스!',
      '보스님 따라 진군하는데스!', '적이 모두 쓰러질 때까지 가는데스', '식량을 약탈해 오는데스',
      '우리가 이기는데스!', '적 집을 부숴버리는데스!', '다 함께 출진하는데스!', '두려움 없이 가는데스',
    ],
    birth: [
      '뎃데로게~ 출산이다 데스!', '새 자가 태어나는 데스', '가족이 늘어나는 기쁜 데스',
      '자를 따뜻하게 안아주는 데스', '마마가 되는 시간 데스', '자들아 환영한다 데스',
      '건강하게 자라야 하는데스', '가문이 번성하는 데스!', '자를 위해 모든 걸 다하겠다 데스', '새 생명이 빛나는 데스',
    ],
    meal: [
      '식사 시간데스', '자들과 함께 먹는 시간데스', '비축한 음식이 든든한데스', '잘 먹어야 잘 사는데스',
      '자들 먼저 먹여주는데스', '모두 배부르면 좋겠는데스', '음식 맛이 좋은데스',
      '가족 식사가 가장 행복한데스', '부지런히 모은 보람이 있는데스', '한 끼 한 끼 소중한데스',
    ],
    evening: [
      '자들은 모두 착한데스', '마마가 맘마를 주는데스', '오늘도 다같이 무사한데스', '자들과 함께가 좋은데스',
      '평화로운 저녁이데스', '하루가 저물어가는데스', '자들 곁에 있으면 안심하는데스',
      '별이 뜨기 시작하는데스', '모두 모이는 시간데스', '따뜻한 가족 시간데스',
    ],
    taegyo: [
      '뎃데로게~ 뎃데로게~', '뎃데로게~ ♪', '자에게 들려주는데스 ♪', '자가 건강하게 자랄데스',
      '사랑하는데스~ 뎃데로게~', '노래 부르는데스 ♫', '자야 잘 들어둬라 데스',
      '따뜻한 마음 전달하는데스', '자가 행복하길 바라는데스', '뎃데로게 뎃데로게 ♪♫',
    ],
    play: [
      '세상은 즐거운데스~', '자들과 노는 시간 행복한데스', '빙글빙글 함께 도는데스',
      '자들 웃음소리가 좋은데스', '노는 시간만큼은 모두 평등데스', '어지러워도 즐거운데스',
      '자들 자랑스러운데스', '잠깐 쉬어가는 시간데스', '가족이 가장 즐거운데스', '평화로운 한때데스',
    ],
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

    this._bushHideTimer = 0;  // 현재 수풀에 숨어있는 시간

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

    // 운치 섭취 의도 — 한번 시작하면 포만 가득 찰 때까지 유지 (갈팡질팡 방지)
    this._eatingUnci = false;
    this._seekingFoodId = null; // 바닥 음식 타겟 캐시 (매 틱 재탐색 방지)

    // 막힘 감지: 동일 좌표 누적 시간 / 마지막 좌표
    this._stuckTime = 0;
    this._lastMoveX = this.x;
    this._lastMoveY = this.y;

    // 마지막 피격 시각 — 밤 회복 3초 지연용
    this._lastHitTime = -999;

    // 탈주 독라 플래그
    this.fugitive = false;
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
    this.wasSlave = false;       // 한번이라도 노예였는지 (탈주 후 독라 이미지 유지)
    this._memory = {             // 학습 메모리
      foodZones: [],             // [{x,y,t}] 음식 발견 위치
      dangers:   [],             // [{x,y,t}] 위험 위치
    };
    this._slaveBirthTimer = 0;   // 노예 출산 타이머
    this._houseUnderAttack = false; // 집 공격 감지
  }

  // ── Computed ───────────────────────────────────
  get maxCarry() {
    const base = CONFIG.STAGE_CAPACITY[this.stage];
    // 독라 새끼(2/3단계, 노예 또는 탈주독라)는 최대 3
    if (this.stage <= 3 && (this.slaveOf || this.wasSlave)) return Math.min(base, 3);
    return base;
  }
  get baseSpeed() {
    let s = CONFIG.STAGE_SPEED[this.stage];
    // 가족 모드: 1단계 새끼는 아주 느림
    if (CONFIG.GAME_MODE === 'family' && this.stage === 1) {
      s = CONFIG.STAGE_SPEED[1] * 0.25;
    }
    // 패배 탈주 가속 (성체 1.3배 / 새끼 1.2배)
    if (this._fleeBoostTimer > 0) s *= (this._childDefeatFlee ? 1.2 : 1.3);
    return s;
  }
  get size() {
    let s = CONFIG.STAGE_SIZE[this.stage] * (this.stage === 4 ? (0.8 + 0.4 * (this.maxHp / CONFIG.STAGE_MAX_HP[4])) : 1);
    if (this.slaveOf) s *= 0.65;          // 독라는 작게
    return s;
  }
  get collisionRadius() { return CONFIG.STAGE_COLLISION[this.stage] ?? 6; }

  get speed() {
    let s = this.baseSpeed;
    if (this.carriedItems.length > 0 && this.maxCarry > 1) {
      // 최대 -50%까지만 감소
      const reduce = Math.min(0.5, 0.3 * (this.carriedItems.length / this.maxCarry));
      s *= (1 - reduce);
    }
    if (this.pregnant)  s *= 0.7;
    if (this.happiness >= 61) s *= 1.1;
    if (this.happiness <= 20) s *= 1.35;            // 불행 → 벗어나려 분주
    // HP 비례 속도 감소 (체력이 낮을수록 느려짐)
    const hpRatio = this.hp / this.maxHp;
    s *= 0.5 + 0.5 * hpRatio;
    if (this.fleeing) s *= 1.6;
    if (this._tagPlay && this._tagPlay.role === 'tagger') s *= 1.5;
    if (this._plagueInfected && (this._plagueTimer ?? 30) <= 0) s *= 1.2;
    return s;
  }

  // ── 말풍선 ────────────────────────────────────────
  _say(kind = 'idle') {
    // 수면 중에는 ZZZ 외 대사 금지
    if (this.state === 'sleeping') return;
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
    // 구더기(1단계)는 단계 그대로 표시
    if (this.stage === 1) {
      const baseName = this.name ? this.name : `#${this.serialNo ?? '?'}`;
      return `구더기 ${baseName}`;
    }
    // 독라/탈주독라는 단계별로 명시: '독라 성체실장' / '독라 자실장' / '독라 엄지'
    const stageWordMap = { 2: '엄지', 3: '자실장', 4: '성체실장' };
    const stageWord = stageWordMap[this.stage] ?? '';
    let prefix = '';
    if (this.slaveOf)       prefix = `독라 ${stageWord} `;
    else if (this.wasSlave) prefix = `탈주독라 ${stageWord} `;
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

    // 패배-탈주 HP 1 유지 / 1.3배 가속 타이머
    if (this._hp1Timer > 0) {
      this._hp1Timer -= dt;
      this.hp = Math.max(1, this.hp);
      if (this._hp1Timer <= 0) this._defeatRescued = false;
    }
    if (this._fleeBoostTimer > 0) {
      this._fleeBoostTimer -= dt;
    }

    // 성체 독라(wasSlave+stage4): 행복 지속 감소
    if (this.wasSlave && this.stage === 4 && !this.slaveOf) {
      this.happiness = Math.max(0, this.happiness - 0.4 * dt);
      // 자식 근처에 있으면 '마마는 노예분충' 대사 + 추가 행복 하락
      this._shameCD = (this._shameCD ?? 0) - dt;
      if (this._shameCD <= 0) {
        const kid = game.findNearestSiljangsuk(this.x, this.y, 200,
          s => !s.dead && s.parentId === this.id && s.stage <= 3);
        if (kid) {
          this._shameCD = Utils.random(8, 16);
          const stageWord = kid.stage === 3 ? '레치' : (kid.stage === 2 ? '레치' : '인테치');
          kid._speech = `마마는 노예분충인테치`;
          kid._speechTimer = 2;
          this.happiness = Math.max(0, this.happiness - 5);
          game.addParticle(kid.x, kid.y - 22, '💔', '#ff66aa', 1500);
        }
      }
    }

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
    // 술래잡기 놀이 진행
    if (this._tagPlay) {
      this._tagPlay.ttl       -= dt;
      this._tagPlay.swapAt    -= dt;
      if (this._tagPlay.startDelay > 0) this._tagPlay.startDelay -= dt;
      if (this._tagPlay.swapAt <= 0) {
        const others = (this._tagPlay.group || []).filter(id => id !== this.id);
        if (others.length > 0) {
          const newTaggerId = others[Math.floor(Math.random() * others.length)];
          for (const id of this._tagPlay.group) {
            const m = Game.getEntity(id);
            if (m && m._tagPlay) {
              const becomesTagger = (id === newTaggerId);
              m._tagPlay.role = becomesTagger ? 'tagger' : 'runner';
              m._tagPlay.startDelay = becomesTagger ? 0.5 : 0;
              m._tagPlay.swapAt = 1.7;
            }
          }
        }
      }
      if (this._tagPlay.ttl <= 0) this._tagPlay = null;
    }
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
    // 분수대/수돗가 근처 자동 음용 (성체 + 새끼 모두) — 갈증 처리 + 행복 소폭 회복
    if (!this.dead && this.state !== 'sleeping' && this._birthState !== 'loading') {
      const spots = game.world?.waterSpots || [];
      for (const w of spots) {
        if (w.type !== 'fountain' && w.type !== 'tap') continue;
        if (Utils.distance(this, w) < (w.r ?? 28) + 20) {
          this._drinkCD = (this._drinkCD ?? 0) - dt;
          if (this._drinkCD <= 0) {
            this._drinkCD = 30;   // 30초 쿨다운
            this._needDrink = false;
            this._drankToday = true;
            this.happiness = Math.min(100, this.happiness + 2);
            game.addParticle(this.x, this.y - 22, '💧 꿀꺽', '#66ccff', 1200);
          }
          break;
        }
      }
    }

    // 운치굴 안에 사는 1단계 새끼는 무조건 독라 노예 신분
    if (this.stage === 1 && !this.slaveOf && !this.dead) {
      for (const oh of game.houses) {
        if (Utils.distance(this, { x: oh.unciX, y: oh.unciY }) <= CONFIG.UNCI_RADIUS && oh.ownerId) {
          this.slaveOf  = oh.ownerId;
          this.wasSlave = true;
          this.houseId  = oh.id;
          this.fugitive = false;
          break;
        }
      }
    }

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

    // HP regen — 밤 + 집 근처 + 포만 > 0 + 마지막 피격 후 3초 이상 (노숙 시 회복 X)
    const houseNear = this.house && this.house.isNear(this.x, this.y, 60);
    const nowSec    = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    const sinceHit  = nowSec - (this._lastHitTime ?? -999);
    if (game.isNight && houseNear && this.satiation > 0 && this.hp < this.maxHp && sinceHit > 3) {
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

    // 집 비축 식량에서 먹기 (허기 상태일 때, 밤에는 식사 X)
    const h = this.house;
    if (!game.isNight && this.isHungry && h && h.foodReserves > 0 && h.isNear(this.x, this.y, 120)) {
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
    // 고아 구더기는 성장 안 함. 탈주 독라/탈주 구더기는 성장 1/4 (보통의 절반의 절반)
    const isFugitiveDokra = this.wasSlave && !this.slaveOf;
    const isOrphanGrub = this.stage === 1 && !this.houseId && !this.parentId && !this.slaveOf && !this.wasSlave;
    if (this.satiation > 0 && this.stage >= 1 && this.stage <= 4 && !isOrphanGrub) {
      let growRate;
      if (this.happiness > 60)        growRate = CONFIG.GROWTH_RATE_HIGH;
      else if (this.happiness <= 20)   growRate = CONFIG.GROWTH_RATE_LOW;
      else                             growRate = CONFIG.GROWTH_RATE_MID;
      // 분충은 성장 속도 1.5배 (대신 음식 많이 소비)
      if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) growRate *= 1.5;
      // 새끼 단계(1~3)는 1/2 속도
      if (this.stage <= 3) growRate *= 0.5;
      // 탈주 독라 새끼는 추가로 1/2 (부모 있는 새끼의 절반)
      if (isFugitiveDokra && this.stage <= 3) growRate *= 0.5;
      // 탈주 독라 성체는 성장 안 함
      if (isFugitiveDokra && this.stage === 4) growRate = 0;

      // 각 단계의 성장 상한
      const growCap = this.stage < 4
        ? CONFIG.STAGE_MAX_HP[this.stage]  // 1→15, 2→30, 3→50
        : CONFIG.STAGE4_DEATH_HP;           // 4→100(노쇠사)

      this.maxHp  = Math.min(growCap, this.maxHp + growRate * dt);
      this.maxSat = this.maxHp;

      // 진화 판정 (1~3단계만)
      if (this.stage > 1 && this.stage < 4 && this.maxHp >= CONFIG.STAGE_BASE_HP[this.stage + 1]) {
        this._evolve(game); return;
      }
      // 1단계: maxHp 15부터 매 초 3% 확률로 2단계 진화
      if (this.stage === 1 && this.maxHp >= 15 && Math.random() < 0.03 * dt) {
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
        // 폐지 5장 / 음식 30 가져갈 수 있으면 챙김
        let dp = 0, df = 0;
        if ((h.paperStock ?? 0) >= 10) { dp = 5; h.paperStock -= 5; this.paperCount = (this.paperCount ?? 0) + 5; }
        if (h.foodReserves >= 30)      { df = 30; h.foodReserves -= 30; }
        this.houseId = null;
        game.addParticle(this.x, this.y - 30, '분가! 🏃🌿', '#aaccff', 2400);
        if (game.logEvent) game.logEvent(`🏃 ${this.label} 분가 (📄${dp} 🍱${df})`, '#aaccff', { x: this.x, y: this.y });
      }
    }

    // 4단계 임신 판정 (자동 임신 + 꽃가루 추가 가속)
    //   단, 출산 후 3일간은 불임 + 집이 있어야 임신 가능
    if (this.stage === 4 && !this.pregnant && !this.isHungry
        && this.houseId !== null
        && game.dayIndex >= this._fertileAfterDay) {
      if (Math.random() < CONFIG.PREGNANCY_CHANCE_PER_SEC * dt) {
        this._onPregnant(game);
      }
    }

    // ─ 구더기 전용 배변/HP 로직 ─
    // 프니프니를 받을 때만 운치를 쌈. 60초 이상 못 받으면 20초마다 HP -1 (수면 시 유예)
    const sleeping  = this.state === 'sleeping';
    const birthing  = this._birthState === 'loading' || this.state === 'giving_birth';
    const building  = this._isBuilding === true;
    if (this.stage === 1) {
      if (!sleeping) {
        this._sinceLastPniepnie = (this._sinceLastPniepnie ?? 0) + dt;
        if (this._sinceLastPniepnie >= 60) {
          this._grubDecayCD = (this._grubDecayCD ?? 0) + dt;
          if (this._grubDecayCD >= 20) {
            this._grubDecayCD = 0;
            this.hp = Math.max(0, this.hp - 1);
            const lines = ['프니프니가 필요한레후!!', '우지챠 고독한레후...', '프니프니! 프니프니!'];
            this._speech = lines[Math.floor(Math.random() * lines.length)];
            this._speechTimer = 3;
            game.addParticle(this.x, this.y - 22, '💧', '#aaccff', 1200);
          }
        } else {
          this._grubDecayCD = 0;
        }
      }
    } else if (this.stage >= 2 && !sleeping && !birthing && !building) {
      // 배변 타이머 — 2단계 이상. 수면/출산/건축 중 유예
      this.defecateTimer += dt;
      if (this.defecateTimer >= CONFIG.UNCI_DEFECATE_INTERVAL) {
        const house = this.house;
        const distToHome = house
          ? Utils.distance(this, { x: house.cx, y: house.cy })
          : Infinity;
        const atUnciEdge = house && house.hasUnci && Utils.distance(this,
          { x: house.unciX, y: house.unciY }) < CONFIG.UNCI_RADIUS * 1.5;
        if (atUnciEdge) {
          house.addUnci(3);
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_DEFECATE_GAIN);
          game.addParticle(this.x, this.y - 14, '💩', '#aa7700', 1000);
          if (Math.random() < 0.4) this._say('unci');
        } else if (distToHome >= 600) {
          // 집에서 충분히 멀리 떨어졌으면 그 자리에 운치
          const dayLen = (CONFIG.DAY_LENGTH ?? 155) + (CONFIG.NIGHT_LENGTH ?? 40);
          game.floorUnci.push({ x: this.x, y: this.y, amount: 10, life: dayLen });
          this._speech = '데후웃!'; this._speechTimer = 1.5;
          game.addParticle(this.x, this.y - 14, '💩 데후웃!', '#aa7700', 1800);
        } else {
          // 집 근처(600px 미만)지만 운치굴 없음 → 좀더 멀리 가야 함, 배변 대기 유지
          this.defecateTimer = CONFIG.UNCI_DEFECATE_INTERVAL * 0.95;
          this.goingToUnci = true;
          return;
        }
        this.defecateTimer = 0;
        this.goingToUnci   = false;
      }
      // 배변 욕구가 80% 차면 운치굴(있으면) / 집 600px 밖으로 이동 욕구 발생
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
        // 출산 시퀀스 — 물가로 이동 → 10초 로딩 → 출산
        if (!this._birthState) this._birthState = 'go_water';
        if (this._birthState === 'go_water') {
          const ws = this._findNearestWaterTap
            ? this._findNearestWaterTap(game) : null;
          if (ws) {
            const dw = Utils.distance(this, ws);
            if (dw > 40) {
              this._setState('seeking_water');
              this._setTarget(ws.x, ws.y, true);
              this._lockAction && this._lockAction('seeking_target',
                { target: { x: ws.x, y: ws.y }, subState: 'seeking_water' });
              return;
            }
            // 도착 — 출산 로딩 시작
            this._birthState   = 'loading';
            this._birthLoading = 0;
            this._speech = '뎃데로게~ 자들은 세상 밖으로 나오는데스~';
            this._speechTimer = 10;
            this._birthFacingFront = true;   // 그리기에서 정면 보기
            return;
          }
          // 물가 없으면 그냥 출산
          this._birthState = 'loading';
          this._birthLoading = 0;
        }
        if (this._birthState === 'loading') {
          this._birthLoading += dt;
          this._setState('giving_birth');
          this._birthFacingFront = true;
          // 출산 임팩트
          if ((this._birthLoading % 1) < dt) {
            game.addParticle(this.x, this.y - 22, '뎃데로게~', '#ffaaff', 1200);
          }
          if (this._birthLoading >= 10) {
            this._birthState = null;
            this._birthFacingFront = false;
            this._giveBirth(game);
          }
          return;
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
          if (game.logEvent) game.logEvent(`🥩 ${this.label}가 굶주려 ${victim.label}를 잡아먹음`, '#ff4444', { x: this.x, y: this.y });
          victim._die(game, '굶주려 잡아먹힘');
          this.satiation = this.maxSat * 0.5;
        }
      }
    }

    // ── 관계 누적 (주변 실장석과 천천히 반응) — 1% 확률로 매 틱 체크 ──
    if (Math.random() < 0.01) {
      for (const o of game.siljangsukList) {
        if (o.dead || o.id === this.id || o.slaveOf) continue;
        const d = Utils.distance(this, o);
        if (d > 200) continue;
        let delta = 0;
        if (o.personality === this.personality) delta += 0.5;
        if (o.familyId === this.familyId)       delta += 1.0;
        // 성체끼리 너무 좁은 간격(60px 미만)에 있으면 관계 악화
        if (this.stage === 4 && o.stage === 4 && d < 60 && o.familyId !== this.familyId) {
          delta -= 1.5;
        }
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
    if (this.hp <= 0) {
      const inCombat = this.lastAttackerId && !this._onFire
        && !(this._plagueInfected && (this._plagueStage ?? 0) >= 1);
      // 새끼(2/3단계) 전투 사망 시 20% 확률로 독라화 + 1.2배속 도망
      if (inCombat && !this.slaveOf && !this.wasSlave
          && this.stage >= 2 && this.stage <= 3
          && !this._defeatRescued && Math.random() < 0.20) {
        this._defeatRescued = true;
        this._origMasterId = null;
        this.slaveOf = null;
        this.wasSlave = true;
        this.fugitive = true;
        this.houseId = null;
        this.parentId = null;
        this.familyId = this.id;
        this.generation = 0;
        this.hp = 1;
        this._hp1Timer = 3;
        this._fleeBoostTimer = 4;   // 1.2x (조정 가능)
        this._childDefeatFlee = true;
        const atk = game.getEntity(this.lastAttackerId);
        if (atk) {
          const dx = this.x - atk.x, dy = this.y - atk.y;
          const d = Math.hypot(dx, dy) || 1;
          this._setTarget(
            Utils.clamp(this.x + (dx / d) * 500, 20, CONFIG.WORLD_WIDTH - 20),
            Utils.clamp(this.y + (dy / d) * 500, 20, CONFIG.WORLD_HEIGHT - 20),
            true);
        }
        this.fleeing = true; this.fleeTimer = 6;
        game.addParticle(this.x, this.y - 30, '☆ 새끼 독라화!', '#ffaa88', 2200);
        if (game.logEvent) game.logEvent(`☆ 새끼가 독라가 되어 도망`, '#ffaa88', { x: this.x, y: this.y });
        return false;
      }
      // 전투 사망 시 25% 확률로 성체 독라가 되어 도망 (이미 노예/탈주독라/구더기 제외)
      if (inCombat && !this.slaveOf && !this.wasSlave && this.stage >= 2
          && !this._defeatRescued && Math.random() < 0.25) {
        this._defeatRescued = true;
        this._origMasterId = null;
        this.slaveOf = null;
        this.wasSlave = true;
        this.fugitive = true;
        this.houseId = null;
        this.parentId = null;
        this.hp = 1;
        this._hp1Timer = 3;        // 3초간 HP 1 유지
        this._fleeBoostTimer = 3;   // 1.3x 가속
        // 마지막 공격자 반대 방향으로 도주
        const atk = game.getEntity(this.lastAttackerId);
        if (atk) {
          const dx = this.x - atk.x, dy = this.y - atk.y;
          const d = Math.hypot(dx, dy) || 1;
          this._setTarget(
            Utils.clamp(this.x + (dx / d) * 600, 20, CONFIG.WORLD_WIDTH - 20),
            Utils.clamp(this.y + (dy / d) * 600, 20, CONFIG.WORLD_HEIGHT - 20),
            true);
        }
        this.fleeing = true; this.fleeTimer = 6;
        game.addParticle(this.x, this.y - 30, '☆ 패배 후 탈주!', '#ffaa88', 2500);
        if (game.logEvent) game.logEvent(`☆ ${this.label} 패배 후 성체 독라가 되어 도망`, '#ffaa88', { x: this.x, y: this.y });
        return false;
      }
      let deathReason;
      if (this._onFire) {
        deathReason = '소사';
      } else if (this._plagueInfected && (this._plagueStage ?? 0) >= 1) {
        deathReason = '역병';
      } else if (this.lastAttackerId) {
        const killer = game.getEntity(this.lastAttackerId);
        const killerLabel = killer?.label ?? '누군가';
        deathReason = `${killerLabel}에게 사망`;
      } else if (this.satiation <= 0) {
        deathReason = '아사';
      } else {
        deathReason = '사망';
      }
      this._die(game, deathReason); return true;
    }
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
    if (game.logEvent) game.logEvent(`💧 ${this.label} 익사`, '#88aaff', { x: this.x, y: this.y });
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
    // 역병 감염자는 다른 감염자를 공격하지 않음
    if (this._plagueInfected && target._plagueInfected) return;
    target.hp = Math.max(0, (target.hp ?? 0) - dmg);
    // 피격 → 행동 잠금 해제 (반응 가능하게)
    if (target._breakActionLock) target._breakActionLock();
    target.lastAttackerId    = this.id;
    target.counterAttackTimer = 5;
    target.hitFlashTimer     = 0.35;
    target._lastHitTime      = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    this.attackAnimTimer     = 0.35;
    // 역병 감염자에게 공격당한 비감염자: 30초 뒤 감염
    if (this._plagueInfected && !target._plagueInfected) {
      target._plagueInfected = true;
      target._plagueTimer = 30;
      target._plagueStage = 0;
      game.addParticle(target.x, target.y - 22, '🦠 감염!', '#44cc44', 1500);
      if (game.logEvent) game.logEvent(`🦠 ${target.label} 역병 감염 (공격 전파)`, '#44aa44', { x: target.x, y: target.y });
    }
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
    // 넉백 — 단계 차이에 따라 강도 조절, 명확한 위치 이동
    const dxk = target.x - this.x, dyk = target.y - this.y;
    const dk  = Math.sqrt(dxk * dxk + dyk * dyk) || 1;
    const stageDiff = (this.stage ?? 4) - (target.stage ?? 1);
    const kb = 18 + Math.max(0, stageDiff) * 6;
    target.x = Utils.clamp(target.x + (dxk / dk) * kb, 0, CONFIG.WORLD_WIDTH);
    target.y = Utils.clamp(target.y + (dyk / dk) * kb, 0, CONFIG.WORLD_HEIGHT);
    // 목표 위치도 같이 옮겨야 다시 끌려오지 않음
    target.targetX = target.x;
    target.targetY = target.y;
  }

  _die(game, reason) {
    this.dead = true;
    this.fadeTimer = 10;        // 시체 페이드 (10초)
    game.addParticle(this.x, this.y - 28, reason, '#ff4444', 2500);

    // 로그 (위치 포함 — 클릭 시 카메라 이동)
    if (game.logEvent) game.logEvent(`💀 ${this.label} 사망 (${reason})`, '#ff8888', { x: this.x, y: this.y });

    // 부모에게 슬픔 (자식 사망 이벤트)
    if (this.parentId !== null) {
      const parent = game.getEntity(this.parentId);
      if (parent && !parent.dead && parent.happiness !== undefined) {
        parent.happiness = Math.max(0, parent.happiness - CONFIG.HAPPINESS_CHILD_DEATH);
        game.addParticle(parent.x, parent.y - 22, '💔', '#ff6688', 1800);
      }
    }

    // 임신한 실장석 사망 시 10~15마리 고아 구더기 출산
    if (this.pregnant) {
      const count = Utils.randomInt(10, 15);
      for (let i = 0; i < count; i++) {
        const bx = this.x + Utils.random(-30, 30);
        const by = this.y + Utils.random(-30, 30);
        const orphan = game.spawnSiljangsuk(bx, by, 1, null, Utils.randomPersonality(), this.id);
        orphan.serialNo  = Game.nextSerialNo++;
        orphan.parentId  = null;       // 고아
        orphan.parentLabelSnapshot = this.label;
      }
      game.addParticle(this.x, this.y - 30, `💔 ${count}마리 고아!`, '#ff66aa', 2800);
      if (game.logEvent) game.logEvent(`💔 ${this.label} 임신 사망 — 고아 ${count}마리`, '#ff66aa', { x: this.x, y: this.y });
    }

    // 탈주 독라(fugitive)를 새끼가 죽이면 행복 +10
    if (this.fugitive && this.lastAttackerId) {
      const killer = game.getEntity(this.lastAttackerId);
      if (killer && !killer.dead && killer.stage < 4 && killer.happiness !== undefined) {
        killer.happiness = Math.min(100, killer.happiness + 10);
        game.addParticle(killer.x, killer.y - 22, '+10 행복', '#aaffaa', 1500);
      }
    }

    // 부모 잃은 새끼 처리 — 집은 유지 (집이 부서지기 전까지 그대로 거주)
    if (this.stage === 4) {
      const orphans = game.siljangsukList.filter(s =>
        !s.dead && s.parentId === this.id && s.stage < 4 && !s.slaveOf);
      for (const o of orphans) {
        o.parentId = null;
        // houseId 유지 — 집이 부서지지 않는 한 그대로 거주
        // familyId/generation도 유지 (기존 조직에 남음)
        o._orphanVulnerable = true;   // 공격에 취약한 표식
        game.addParticle(o.x, o.y - 20, '고아', '#aaaaaa', 1800);
      }
      if (orphans.length > 0 && game.logEvent) {
        game.logEvent(`👤 ${this.label} 사망 — 자식 ${orphans.length}마리 고아 (집 거주)`, '#aaaaaa', { x: this.x, y: this.y });
      }
      // 주인(this)의 독라들을 즉시 자유의 몸으로
      const mySlaves = game.siljangsukList.filter(s =>
        !s.dead && s.slaveOf === this.id);
      for (const slave of mySlaves) {
        slave.slaveOf = null;
        slave.fugitive = true;
        slave.wasSlave = true;       // 독라 이미지 유지
        slave.parentId = null;
        slave.houseId  = null;
        game.addParticle(slave.x, slave.y - 20, '자유!', '#aaffaa', 1800);
        if (game.logEvent) game.logEvent(`🔓 ${slave.label} 주인 사망으로 탈주 독라`, '#aaffaa', { x: slave.x, y: slave.y });
      }
    }

    // 처형으로 인한 사망은 운치굴에 고기로 생성 → 직접 집 비축에 저장
    //   (운치는 별개로 계속 운치굴에 남음)
    const isExecution = ['노예처형', '굶주려 잡아먹힘', '부모의 처형'].includes(reason);
    const totalFood = [0, 50, 50, 80, 150][this.stage] ?? 30;

    if (isExecution) {
      // 주인/부모의 집을 찾아 자동 비축
      let masterHouse = null;
      if (this.slaveOf) {
        const m = game.getEntity(this.slaveOf);
        masterHouse = m ? game.getEntity(m.houseId) : null;
      }
      if (!masterHouse && this.parentId) {
        const p = game.getEntity(this.parentId);
        masterHouse = p ? game.getEntity(p.houseId) : null;
      }
      if (masterHouse) {
        masterHouse.foodReserves += totalFood;
        game.addParticle(masterHouse.unciX, masterHouse.unciY,
          `🥩 고기 +${totalFood}`, '#aa3333', 2400);
        if (game.logEvent) game.logEvent(`🥩 운치굴에서 고기 ${totalFood} 생성 (${reason})`, '#cc6666', { x: masterHouse.unciX, y: masterHouse.unciY });
      } else {
        // 주인 집을 못 찾으면 필드에 그냥 drop
        let remaining = totalFood;
        while (remaining > 0) {
          const it = game.spawnItem('food_good', this.x + Utils.random(-35, 35), this.y + Utils.random(-35, 35));
          if (it && it.foodValue > remaining) it.foodValue = remaining;
          remaining -= (it?.foodValue ?? 12);
        }
      }
    } else {
      // 일반 사망: 필드에 음식 drop
      let remaining = totalFood;
      while (remaining > 0) {
        const it = game.spawnItem('food_good', this.x + Utils.random(-35, 35), this.y + Utils.random(-35, 35));
        if (it && it.foodValue > remaining) it.foodValue = remaining;
        remaining -= (it?.foodValue ?? 12);
      }
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
        if (game.logEvent) game.logEvent(`🆕 ${this.label} 4대 분파 — 새 조직 창설`, '#aaffee', { x: this.x, y: this.y });
      }
      game.addParticle(this.x, this.y - 32, '성체 됨! 🌿', '#aaffaa', 3000);
      if (game.logEvent) game.logEvent(`🌿 ${this.label} 성체로 진화`, '#aaffaa', { x: this.x, y: this.y });
    } else {
      game.addParticle(this.x, this.y - 24, `${label} 성장! ▲`, '#aaffee', 2000);
      if (game.logEvent && this.stage >= 3) {
        game.logEvent(`▲ ${this.label} ${label}(으)로 성장`, '#aaffee', { x: this.x, y: this.y });
      }
    }
  }

  // 임신 시작 처리 — 부모 집에서 자식이 임신하면 즉시 분가
  _onPregnant(game) {
    this.pregnant       = true;
    this.pregnancyTimer = 0;
    game.addParticle(this.x, this.y - 24, '임신!', '#ffaaff', 2000);

    // 본인이 거주하는 집이 본인 소유가 아니면 즉시 분가
    const h = this.house;
    if (h && h.ownerId !== this.id) {
      // 폐지 5장 / 음식 30 보너스 수령
      let dowryPaper = 0, dowryFood = 0;
      if ((h.paperStock ?? 0) >= 10) {
        dowryPaper = 5; h.paperStock -= 5; this.paperCount = (this.paperCount ?? 0) + 5;
      }
      if (h.foodReserves >= 30) {
        dowryFood = 30; h.foodReserves -= 30;
      }
      // 분가 — 집에서 나오기, 하루 포만 100% 유지
      this.houseId               = null;
      this.satiation             = this.maxSat;
      this.satiationFreezeTimer  = 90;
      // 분가 직후 자기 집 짓도록 paperCount 보너스
      game.addParticle(this.x, this.y - 36, '임신 → 즉시 분가!', '#aaccff', 2500);
      if (game.logEvent) game.logEvent(`🏃 ${this.label} 임신으로 즉시 분가 (📄${dowryPaper} 🍱${dowryFood})`, '#aaccff', { x: this.x, y: this.y });
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
      game.logEvent(`✨ 태교 ${taegyoBonus}회 효과 — 개념 비율 증가`, '#ffaaff', { x: this.x, y: this.y });
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
      // 노예 부모의 자식은 자동으로 노예 신분 (운치굴 출생)
      if (this.slaveOf) child.slaveOf = this.slaveOf;
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
    if (game.logEvent) game.logEvent(`👶 ${this.label}가 ${count}마리 출산!`, '#ffaaff', { x: this.x, y: this.y });
    this._say('birth');

    // 집 정원 9마리 제한 — 초과 시 성체 자식 강제 독립 or 새 새끼 노예
    this._enforceHouseCapacity(game);

    // 본인의 살아있는 자식이 9명 초과 → 가장 어린 초과분을 운치굴 독라화 예약
    const myKidsAll = game.siljangsukList.filter(s =>
      !s.dead && s.parentId === this.id && !s.slaveOf);
    if (myKidsAll.length > 9) {
      // 가장 어린 (가장 최근 태어난) 새끼부터 초과 처리
      myKidsAll.sort((a, b) => (b.bornDayIndex ?? 0) - (a.bornDayIndex ?? 0));
      const excess = myKidsAll.slice(0, myKidsAll.length - 9);
      const h = this.house;
      for (const kid of excess) {
        kid._destinedAsSlave = true;
        kid._destinedHouseId = h ? h.id : null;
        kid._setTarget && h && kid._setTarget(h.cx, h.cy, true);
      }
    }
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
        if (game.logEvent) game.logEvent(`🏃 ${adultChild.label} 정원초과로 강제 독립 (하루 포만 보장)`, '#ffaa44', { x: adultChild.x, y: adultChild.y });
        continue;
      }

      // 2순위: 가장 최근 태어난 새끼를 노예로 책정
      const newSlave = occupants.find(s =>
        s.stage <= 2 && !s.slaveOf && s.id !== h.ownerId && s.id !== this.id);
      if (newSlave) {
        newSlave.slaveOf = h.ownerId || this.id;
        game.addParticle(newSlave.x, newSlave.y - 22, '노예 책정!', '#cc6666', 2200);
        if (game.logEvent) game.logEvent(`⚠️ ${newSlave.label} 정원초과로 노예 책정`, '#cc6666', { x: newSlave.x, y: newSlave.y });
        continue;
      }
      break;
    }
  }

  // ── Behavior ────────────────────────────────────
  _updateBehavior(dt, game) {
    // 운치굴에 강제로 갇힌 새끼 (가족 모드): "테에엥" 울음 + 성격 변환 시도
    if (this._stuckInUnci && this.stage >= 2 && this.stage <= 3 && !this.slaveOf) {
      const owner = game.getEntity(this._stuckOwnerId);
      const ownerHouse = owner ? game.getEntity(owner.houseId) : null;
      if (!ownerHouse) {
        this._stuckInUnci = false;
      } else {
        // 운치굴 안으로 강제 유지
        if (Utils.distance(this, { x: ownerHouse.unciX, y: ownerHouse.unciY }) > CONFIG.UNCI_RADIUS) {
          this._setTarget(ownerHouse.unciX, ownerHouse.unciY, true);
        } else {
          this._setState('idle');
        }
        // 울음 + 행복 감소
        this.happiness = Math.max(0, this.happiness - 2 * dt);
        this._cryCD = (this._cryCD ?? 0) - dt;
        if (this._cryCD <= 0) {
          this._cryCD = Utils.random(1.2, 2.5);
          game.addParticle(this.x, this.y - 22, '테에엥!', '#cc6666', 1500);
          // 성격 변환 시도 (울 때마다)
          if (this.personality === CONFIG.PERSONALITY_BUNCHUNG && Math.random() < 0.10) {
            this.personality = CONFIG.PERSONALITY_NORMAL;
            game.addParticle(this.x, this.y - 32, '분충→보통', '#ffe066', 2000);
          } else if (this.personality === CONFIG.PERSONALITY_NORMAL && Math.random() < 0.02) {
            this.personality = CONFIG.PERSONALITY_CONCEPT;
            game.addParticle(this.x, this.y - 32, '보통→개념', '#aaffaa', 2000);
          }
        }
        return;
      }
    }

    // 9명 초과 자식: 집에 도착하면 운치굴에 들어가 독라화 (조직/부모 끊김)
    if (this._destinedAsSlave) {
      const destHouse = game.getEntity(this._destinedHouseId);
      if (!destHouse) { this._destinedAsSlave = false; }
      else {
        const dHome = Utils.distance(this, { x: destHouse.cx, y: destHouse.cy });
        if (dHome > 60) {
          this._setState('going_home');
          this._setTarget(destHouse.cx, destHouse.cy, true);
          return;
        }
        // 집 도착 — 운치굴이 있으면 독라화, 없으면 대기
        if (destHouse.hasUnci) {
          this.slaveOf  = destHouse.ownerId ?? this._destinedHouseId;
          this.wasSlave = true;
          this.parentId = null;
          this.familyId = this.id;
          this.generation = 0;
          this.houseId = destHouse.id;
          this.x = destHouse.unciX + Utils.random(-15, 15);
          this.y = destHouse.unciY + Utils.random(-15, 15);
          this._destinedAsSlave = false;
          game.addParticle(this.x, this.y - 22, '⛓ 가족 초과 → 독라', '#cc6666', 2200);
          if (game.logEvent) game.logEvent(`⛓ 가족 9명 초과 → ${this.label} 독라`, '#cc6666', { x: this.x, y: this.y });
        }
        return;
      }
    }

    // 슬레이브 행동
    if (this.slaveOf !== null) {
      this._behaveAsSlave(dt, game);
      return;
    }

    // 가족 모드 — 플레이어가 부여한 명령 우선 처리
    if (CONFIG.GAME_MODE === 'family' && this._command
        && this.familyId === game.playerFamilyId) {
      if (this._runPlayerCommand(dt, game)) return;
    }

    // 행동 잠금: 한 번 결정한 행동은 변수(피격/위협/배고픔/페이즈)가 생기기 전까지 유지
    const nowSec = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    // 잠금 해제 트리거 자동 감지
    if (this._lockedAction) {
      if (this.counterAttackTimer > 0 && this.lastAttackerId) this._breakActionLock();  // 피격
      else if (this.hp < this.maxHp * 0.4) this._breakActionLock();                       // 체력 위급
      else if (this.satiation <= 0 && !this._lockedAction.startsWith('eat'))
              this._breakActionLock();                                                    // 아사 임계
      else if ((this._lockPhase ?? game.dayPhase) !== game.dayPhase) this._breakActionLock(); // 페이즈 변경
    }
    if (this._lockedAction && (this._lockedUntil ?? 0) > nowSec) {
      const a = this._lockedAction;
      if (a === 'going_to_unci' && this.house && this.house.hasUnci) {
        this._setState('going_to_unci');
        this._setTarget(this.house.unciX, this.house.unciY, true);
        if (Utils.distance(this, { x: this.house.unciX, y: this.house.unciY }) < CONFIG.UNCI_RADIUS * 1.4) {
          this._breakActionLock();
        }
        return;
      }
      if (a === 'going_home' && this.house) {
        this._setState('going_home');
        this._setTarget(this.house.cx, this.house.cy, true);
        if (this.house.isNear(this.x, this.y, 50)) this._breakActionLock();
        return;
      }
      if (a === 'seeking_target' && this._lockedTarget) {
        const t = this._lockedTarget;
        // 표적이 사라졌거나 죽었으면 해제
        if (t.entityId) {
          const ent = game.getEntity(t.entityId);
          if (!ent || ent.dead || ent.collected) { this._breakActionLock(); }
          else {
            this._setState(this._lockedSubState ?? 'seeking_item');
            this._setTarget(ent.x, ent.y, true);
            if (Utils.distance(this, ent) < 18) this._breakActionLock();
            return;
          }
        } else {
          this._setState(this._lockedSubState ?? 'moving');
          this._setTarget(t.x, t.y, true);
          if (Utils.distance(this, t) < 18) this._breakActionLock();
          return;
        }
      }
    }

    // 운치굴이 있고 배변 욕구가 있으면 모든 단계가 운치굴로 이동 — goingToUnci 동안 다른 행동 전부 차단
    const myH = this.house;
    if (this.goingToUnci && myH && myH.hasUnci && !this.fleeing && this.state !== 'sleeping') {
      this._setState('going_to_unci');
      this._setTarget(myH.unciX, myH.unciY, true);
      const d = Utils.distance(this, { x: myH.unciX, y: myH.unciY });
      if (d > CONFIG.UNCI_RADIUS * 1.4) {
        this._lockAction('going_to_unci');
      }
      return;  // goingToUnci 동안은 항상 차단 — 다른 결정으로 빠져나가지 않음
    }

    // 역병 감염 + 진행 완료: 모든 실장석 무차별 공격
    if (this._plagueInfected && (this._plagueTimer ?? 30) <= 0 && (this._plagueStage ?? 0) > 0) {
      const anyTarget = game.findNearestSiljangsuk(this.x, this.y, 300,
        s => !s.dead && s.id !== this.id);
      if (anyTarget && this.attackCooldown <= 0) {
        this._setState('attacking');
        this._setTarget(anyTarget.x, anyTarget.y, true);
        if (Utils.distance(this, anyTarget) < 30) {
          const dmg = Math.ceil((2 + this.stage * 2) * 1.2); // 1.2배 공격력
          this.applyAttack(anyTarget, dmg, game);
          this.attackCooldown = 1.0;
          // 피격된 실장석도 즉시 감염
          if (!anyTarget._plagueInfected) {
            anyTarget._plagueInfected = true;
            anyTarget._plagueTimer = 0;
            anyTarget._plagueStage = 0;
          }
        }
        return;
      }
    }

    // 수면 중이면 공격받기 전까지(counterAttackTimer > 0) 행동 중단
    if (this.state === 'sleeping' && this.counterAttackTimer <= 0) {
      // 밤이면 계속 잠, 낮이 되면 자동 해제됨
      if (game.isNight) return;
      // 낮이 되면 수면 해제
      this._setState('idle');
    }

    // ── 수풀/나무에 숨었는지 매 틱 갱신 (새끼만) ─────────
    const wasHidden = this.hidden;
    this.hidden = false;
    let hidingBush = null;
    if (this.stage < 4 && (this.fleeing || this.state === 'fleeing')) {
      // 1) 수풀 (smalltree) — 가까운 거리
      for (const b of (game.world?.bushes || [])) {
        if (Utils.distance(this, b) < b.r + 4) {
          this.hidden = true;
          hidingBush = { x: b.x, y: b.y, r: b.r };
          break;
        }
      }
      // 2) 나무 (tree) — 캐노피 안에 들어가면 숨음
      if (!this.hidden) {
        for (const t of (game.world?.trees || [])) {
          if (Utils.distance(this, t) < t.r) {
            this.hidden = true;
            hidingBush = { x: t.x, y: t.y, r: t.r };
            break;
          }
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
    // 수풀 숨기 타이머 — 30초 후 다른 수풀로 이동
    if (this.hidden) {
      this._bushHideTimer += dt;
      if (this._bushHideTimer >= 30) {
        this._bushHideTimer = 0;
        const currentBush = hidingBush;
        let bestBush = null, bestDist = 0;
        for (const b of (game.world?.bushes || [])) {
          if (currentBush && Utils.distance(b, currentBush) < 50) continue; // 현재 수풀 제외
          const d = Utils.distance(this, b);
          if (d > bestDist && d < 500) { bestDist = d; bestBush = b; }
        }
        if (bestBush) {
          this._setState('fleeing');
          this._setTarget(bestBush.x, bestBush.y);
          this.hidden = false;
        }
      }
    } else {
      this._bushHideTimer = 0;
    }

    // ── 하루 1회 물 마시기 (독라/1단계 새끼 제외, 아침/낮에만) ─
    if (!game.isNight && this.lastWaterDayKey !== game.dayIndex
        && this.satiationFreezeTimer <= 0
        && !this.slaveOf && this.stage !== 1) {
      const w = game.world?.findNearestWater
        ? game.world.findNearestWater(this.x, this.y) : null;
      if (w) {
        const d = Utils.distance(this, w);
        if (d < (w.r ?? 30) + this.size) {        // 가장자리만 닿아도 OK
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

    // ── 운치 섭취 의도 지속 — 한번 시작하면 가득 찰 때까지 무조건 유지 ──
    if (this._eatingUnci) {
      if (this.isFull) {
        this._eatingUnci = false;       // 가득 차면 해제
      } else {
        const unciHouse = this._findNearestUnci(game);
        if (!unciHouse) {
          this._eatingUnci = false;     // 운치 고갈 → 해제
        } else {
          this._setState('eating_unci');
          this._setTarget(unciHouse.unciX, unciHouse.unciY, true); // force lock
          if (Utils.distance(this, { x: unciHouse.unciX, y: unciHouse.unciY }) < CONFIG.UNCI_RADIUS) {
            const eat = Math.min(unciHouse.unciAmount, 6 * dt);
            unciHouse.unciAmount = Math.max(0, unciHouse.unciAmount - eat);
            this.satiation = Math.min(this.maxSat, this.satiation + eat * 1.5);
            this.happiness = Math.max(0, this.happiness - 2.0 * dt);   // 큰 폭 행복 감소
            this._eatParticleCd -= dt;
            if (this._eatParticleCd <= 0) {
              this._eatParticleCd = 1.5;
              game.addParticle(this.x, this.y - 14, '운치 섭취…', '#aa7700', 900);
            }
          }
          return;
        }
      }
    }

    // ── 술래잡기 놀이 진행 ─────────────────────────
    if (this._tagPlay) {
      const group = (this._tagPlay.group || [])
        .map(id => game.getEntity(id))
        .filter(m => m && !m.dead && m.id !== this.id);
      if (group.length === 0) { this._tagPlay = null; }
      else if (this._tagPlay.role === 'tagger') {
        // 술래는 startDelay 동안 그 자리에서 두리번거림 (도주자가 먼저 달리도록)
        if (this._tagPlay.startDelay > 0) {
          this._setState('playing');
          this._setTarget(this.x, this.y, true);
          if (!this._tagPlay._readyParticle) {
            this._tagPlay._readyParticle = true;
            game.addParticle(this.x, this.y - 18, '준비…', '#ffe066', 600);
          }
          return;
        }
        let best = null, bd = Infinity;
        for (const m of group) {
          const d = Utils.distance(this, m);
          if (d < bd) { bd = d; best = m; }
        }
        if (best) {
          this._setState('playing');
          this._setTarget(best.x, best.y, true);
          if (bd < 18) {
            // 역할 swap — 잡힌 자는 술래가 되고 0.5초 대기
            this._tagPlay.role = 'runner';
            this._tagPlay.startDelay = 0;
            if (best._tagPlay) {
              best._tagPlay.role = 'tagger';
              best._tagPlay.startDelay = 0.5;
              best._tagPlay.swapAt = 1.7;
              best._tagPlay._readyParticle = false;
            }
            game.addParticle(best.x, best.y - 16, '잡았다!', '#ffccaa', 1200);
          }
          return;
        }
      } else {
        // runner — 술래로부터 도주
        const tagger = group.find(m => m._tagPlay && m._tagPlay.role === 'tagger');
        if (tagger) {
          this._setState('playing');
          const dx = this.x - tagger.x, dy = this.y - tagger.y;
          const n  = Utils.normalize(dx, dy);
          this._setTarget(this.x + n.x * 60, this.y + n.y * 60, true);
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
          this._stakeoutTarget2 = null;
          this._stakeoutPickT = 0;
        } else {
          // 수풀/나무 내부까지 랜덤 위치로 진입하면서 탐색
          //   매 1.5초마다 새 랜덤 표적 (수풀 안쪽 0 ~ r 거리)
          this._stakeoutPickT = (this._stakeoutPickT ?? 0) - dt;
          if (this._stakeoutPickT <= 0 || !this._stakeoutTarget2) {
            this._stakeoutPickT = 1.5;
            const ang = Math.random() * Math.PI * 2;
            const radius = Math.random() * sb.r * 0.9;       // 내부 어디든
            this._stakeoutTarget2 = {
              x: sb.x + Math.cos(ang) * radius,
              y: sb.y + Math.sin(ang) * radius,
            };
          }
          this._setState('stakeout');
          this._setTarget(this._stakeoutTarget2.x, this._stakeoutTarget2.y);
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
      // 도주 우선: 이미 도주 중이면 반격 시도 안 하고 집으로 도주
      if (this.fleeing && this.fleeTimer > 0) {
        const h = this.house;
        if (h) {
          this._setTarget(h.cx, h.cy, true);
          this._setState('fleeing');
        }
        return;
      }
      // 공격자 탐색 (실장석 or 인간/고양이)
      let atk = game.siljangsukList.find(s => s.id === this.lastAttackerId && !s.dead);
      if (!atk) atk = (game.humans || []).find(h => h.id === this.lastAttackerId && !h.done) ?? null;

      if (atk) {
        const atkStage    = atk.stage ?? 5;
        const isHuman     = (atk.type === 1 || atk.type === 2 || atk.type === 4);
        // 한밤중 인간 공격 → 무조건 도주 + 특수 대사
        if (game.isNight && isHuman) {
          this._speech = (this.stage === 4) ? '자들은 도망치는데스!!' : '일가실각인테챠아앗!';
          this._speechTimer = 1.8;
          const h = this.house;
          const fx = h ? h.cx : atk.x, fy = h ? h.cy : atk.y;
          this._fleeFrom_raw(fx, fy);
          this.fleeTimer = 60;
          return;
        }
        const disadvantaged = atkStage > this.stage && this.hp < this.maxHp * 0.5;
        if (!disadvantaged) {
          // 표적이 적의 집 안에 있으면 집을 공격
          const eh = this._targetInsideEnemyHouse && this._targetInsideEnemyHouse(atk, game);
          if (eh) {
            this._setState('attacking');
            this._setTarget(eh.cx, eh.cy, true);
            if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
              eh.takeDamage(4 + this.stage * 2);
              this.attackCooldown = 1.4;
              game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1000);
              if (eh.hp <= 0) game.destroyHouse(eh);
            }
            return;
          }
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
          if (this.isChild) {
            // 부모가 살아있으면 부모에게 달려감
            const parent = this.parentId ? game.getEntity(this.parentId) : null;
            if (parent && !parent.dead && Utils.distance(this, parent) < 600) {
              this._setState('fleeing');
              this._setTarget(parent.x, parent.y, true);
              this.fleeing = true; this.fleeTimer = 5;
            } else {
              this._fleeToHouse(game);
            }
          }
          else this._fleeFrom_raw(atk.x, atk.y);
          return;
        }
      } else {
        // 공격자가 이미 사라짐
        this.lastAttackerId    = null;
        this.counterAttackTimer = 0;
      }
    }

    // HP < 50% + 주변 위협 감지 → 도주 (객체 생존 최우선)
    if (this.hp < this.maxHp * 0.5 && this.stage >= 2) {
      const thr = this._findNearestThreat(game);
      if (thr) {
        if (this.isChild) { this._fleeToHouse(game); }
        else { this._fleeFrom_raw(thr.x, thr.y); }
        return;
      }
    }

    // ── 전투/전쟁: 객체 생존 다음, 모든 행동보다 우선 ─────────
    if (this.stage === 4 && (this.raidTarget !== null || this.defendAgainst !== null)) {
      if (this._doWarBehavior(game)) return;
    }

    // ── 탈주 독라 (전 단계 공통): 음식/운치 섭취, 입양 요구, 활동 ──
    if (this.fugitive) {
      // 1) 배고프면 바닥 운치 우선 섭취
      if (this.isHungry && game.floorUnci && game.floorUnci.length > 0) {
        let bu = null, bd = 500;
        for (const u of game.floorUnci) {
          const d = Utils.distance(this, u);
          if (d < bd) { bd = d; bu = u; }
        }
        if (bu) {
          this._setState('seeking_food');
          this._setTarget(bu.x, bu.y, true);
          if (bd < 14) {
            const eat = Math.min(bu.amount, 4 * dt);
            bu.amount -= eat;
            this.satiation = Math.min(this.maxSat, this.satiation + eat);
            if (bu.amount <= 0) game.floorUnci = game.floorUnci.filter(u => u !== bu);
          }
          return;
        }
      }

      // 2) 10% 확률로 성체에게 입양 요구 (8초 쿨다운)
      this._fugitiveAdoptCD = (this._fugitiveAdoptCD ?? 0) - dt;
      if (this._fugitiveAdoptCD <= 0) {
        this._fugitiveAdoptCD = 8;
        if (Math.random() < 0.10) {
          const adult = game.findNearestSiljangsuk(this.x, this.y, 300,
            s => !s.dead && s.stage === 4 && !s.slaveOf && !s.wasSlave && s.id !== this.id);
          if (adult) {
            this._setState('seeking_water');
            this._setTarget(adult.x, adult.y, true);
            if (Utils.distance(this, adult) < 28) {
              this._speech = '구해주세요!'; this._speechTimer = 2;
              game.addParticle(this.x, this.y - 22, '구해주세요!', '#ffaaaa', 1500);
              adult._fugitiveAdoptionRequest(this, game);
              this._fugitiveAdoptCD = 20;
            }
            return;
          }
        }
      }
    }

    // ── 탈주 독라(fugitive) 새끼 — 낮엔 수풀에 숨고, 밤에 활동 ─────
    if (this.fugitive && this.stage < 4) {
      if (!game.isNight) {
        // 1단계 탈출 새끼: 수풀 숨기 대신 가장 가까운 실장석 따라가기
        if (this.stage === 1) {
          // 주변에 음식/운치/실장석이 없으면 랜덤 방향으로 이동
          const nearItem = game.findNearestItem?.(this.x, this.y, 300,
            i => i.isFood && i.isFood(), this);
          if (nearItem) {
            this._setState('seeking_food');
            this._setTarget(nearItem.x, nearItem.y, true);
            if (Utils.distance(this, nearItem) < 14) this._pickUp(nearItem, game);
            return;
          }
          const nearest = game.findNearestSiljangsuk(this.x, this.y, 400,
            s => !s.dead && s.id !== this.id);
          if (nearest) {
            this._setState('seeking_item');
            this._setTarget(nearest.x, nearest.y, true);
            return;
          }
          // 아무것도 없음 → 랜덤 방향으로 길게 이동
          this._randomDirTimer = (this._randomDirTimer ?? 0) - dt;
          if (this._randomDirTimer <= 0) {
            this._randomDirTimer = Utils.random(6, 12);
            const ang = Math.random() * Math.PI * 2;
            this._setTarget(
              Utils.clamp(this.x + Math.cos(ang) * 400, 20, CONFIG.WORLD_WIDTH - 20),
              Utils.clamp(this.y + Math.sin(ang) * 400, 20, CONFIG.WORLD_HEIGHT - 20),
              true);
          }
          return;
        }
        // 물가 근처 수풀 우선 (탈주 독라는 물가에 살기를 선호)
        const ws = game.world?.findNearestWater?.(this.x, this.y)
                ?? game.world?.waterSpots?.[0] ?? null;
        let bestBush = null, bd = Infinity;
        for (const b of (game.world?.bushes || [])) {
          if (ws && Utils.distance(b, ws) > 200) continue;
          const d = Utils.distance(this, b);
          if (d < bd) { bd = d; bestBush = b; }
        }
        // 물가 근처 수풀이 없으면 그냥 가장 가까운 수풀
        if (!bestBush) {
          bd = Infinity;
          for (const b of (game.world?.bushes || [])) {
            const d = Utils.distance(this, b);
            if (d < bd) { bd = d; bestBush = b; }
          }
        }
        if (bestBush) {
          this._setState('fleeing');
          this._setTarget(bestBush.x, bestBush.y);
          this.fleeing = true; this.fleeTimer = 1;
          return;
        }
      } else {
        // 밤: 자유로운 활동 — 바닥 음식/운치 우선 섭취 후 wander
        // 바닥 음식
        const food = game.findNearestItem?.(this.x, this.y, 400, i => i.isFood(), this);
        if (food) {
          this._setTarget(food.x, food.y, true);
          if (Utils.distance(this, food) < 14) this._pickUp(food, game);
          return;
        }
        // 바닥 운치
        if (game.floorUnci && game.floorUnci.length > 0) {
          let best = null, bd = Infinity;
          for (const u of game.floorUnci) {
            const d = Utils.distance(this, u);
            if (d < bd) { bd = d; best = u; }
          }
          if (best) {
            this._setTarget(best.x, best.y, true);
            if (bd < 20) {
              this.satiation = Math.min(this.maxSat, this.satiation + best.amount * 0.6);
              best.amount = 0; best.life = 0;
            }
            return;
          }
        }
        // 그냥 돌아다님
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
          this.wanderTimer = Utils.random(2, 5);
          this._setTarget(this.x + Utils.random(-150, 150), this.y + Utils.random(-150, 150));
        }
        return;
      }
    }

    // ── 일반인/애호파 발견 → 텟츙♥ (확률) / 개념은 인간 회피 ─────
    this._techunCD = (this._techunCD ?? 0) - dt;
    const lovable = game.findNearestHuman?.(this.x, this.y, 200, h =>
      h.type === 1 || h.type === 4);
    if (this._techunCD <= 0 && lovable && !this.slaveOf) {
      this._techunCD = 12;
      let chance = 0;
      if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) chance = 0.5;
      else if (this.personality === CONFIG.PERSONALITY_NORMAL) chance = 0.25;
      if (Math.random() < chance) {
        this._speech = '텟츙♥';
        this._speechTimer = 1.8;
        game.addParticle(this.x, this.y - 22, '❤', '#ff66aa', 1500);
        game.addParticle(this.x + 10, this.y - 16, '❤', '#ff66aa', 1500);
      }
    }
    // 개념은 인간을 가급적 피해다님 (단, 떨어진 음식은 주우러)
    if (this.personality === CONFIG.PERSONALITY_CONCEPT && !this.slaveOf) {
      const anyHuman = game.findNearestHuman?.(this.x, this.y, 180, h =>
        h.type === 0 || h.type === 1 || h.type === 2 || h.type === 4);
      if (anyHuman) {
        // 떨어진 음식이 가까이 있으면 그게 우선
        const food = game.findNearestItem?.(this.x, this.y, 250, i => i.isFood(), this);
        const foodCloser = food && Utils.distance(this, food) < Utils.distance(this, anyHuman) * 0.9;
        if (!foodCloser) {
          this._fleeFrom_raw(anyHuman.x, anyHuman.y);
          return;
        }
      }
    }

    // ── 콘페이토/도돈파/코로리 발견 → 모든 우선순위 무시하고 획득 (생존 제외) ──
    if (!this.slaveOf) {
      const special = game.findNearestItem(this.x, this.y, 900,
        i => i.type === 'confetto' || i.type === 'dodonpa' || i.type === 'korori', this);
      if (special) {
        this._claimItem(special);
        this._setState('seeking_confetto');
        this._setTarget(special.x, special.y, true);
        if (Utils.distance(this, special) < 14) this._pickUp(special, game);
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
        const pBun = this.personality === CONFIG.PERSONALITY_BUNCHUNG;
        const pCon = this.personality === CONFIG.PERSONALITY_CONCEPT;

        // 2-a. 공통: 700px 내 바닥 음식 탐색 (타겟 캐싱으로 왔다갔다 방지)
        {
          // 캐싱된 타겟이 아직 유효한지 확인
          let cachedFood = this._seekingFoodId
            ? game.items.find(i => i.id === this._seekingFoodId && !i.collected) : null;
          if (!cachedFood) {
            cachedFood = game.findNearestItem?.(this.x, this.y, 700, i => i.isFood(), this) ?? null;
            this._seekingFoodId = cachedFood ? cachedFood.id : null;
          }
          if (cachedFood) {
            this._claimItem(cachedFood);
            this._setState('seeking_food');
            this._setTarget(cachedFood.x, cachedFood.y);
            if (Utils.distance(this, cachedFood) < 14) {
              this._seekingFoodId = null;
              this._pickUp(cachedFood, game);
            }
            return;
          } else {
            this._seekingFoodId = null;
          }
        }

        // 2-a'. 분충: 바닥 음식이 없으면 다른 실장석 공격
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

        // 2-b. 개념: 1500px 내 바닥 음식 적극 탐색 (타겟 캐싱)
        if (pCon) {
          let cachedFarFood = this._seekingFoodId
            ? game.items.find(i => i.id === this._seekingFoodId && !i.collected) : null;
          if (!cachedFarFood) {
            cachedFarFood = game.findNearestItem(this.x, this.y, 1500, i => i.isFood(), this) ?? null;
            this._seekingFoodId = cachedFarFood ? cachedFarFood.id : null;
          }
          if (cachedFarFood) {
            this._claimItem(cachedFarFood);
            this._setState('seeking_food');
            this._setTarget(cachedFarFood.x, cachedFarFood.y);
            if (Utils.distance(this, cachedFarFood) < 14) {
              this._seekingFoodId = null;
              this._pickUp(cachedFarFood, game);
            }
            return;
          } else {
            this._seekingFoodId = null;
          }
        }

        // 2-b'. 노예 처형 / 자식 잡아먹기 (stage 4 한정)
        const myHouse = this.house;
        if (myHouse && this.stage === 4) {
          const mySlave = game.siljangsukList.find(s =>
            !s.dead && s.slaveOf === this.id && s.stage <= 2);
          if (mySlave) {
            mySlave.markedForExecution = true;
            this._setState('attacking');
            this._setTarget(mySlave.x, mySlave.y, true);
            if (Utils.distance(this, mySlave) < 30 && this.attackCooldown <= 0) {
              mySlave._die(game, '노예처형');
              this.satiation = Math.min(this.maxSat, this.satiation + 50);
              this.attackCooldown = 1.5;
            }
            return;
          }
          const houseHasFood = myHouse.foodReserves > 0;
          if (!houseHasFood) {
            const myKids = game.siljangsukList.filter(s =>
              !s.dead && s.parentId === this.id && s.stage <= 2 && !s.slaveOf);
            if (myKids.length > 0) {
              const victim = myKids[Math.floor(Math.random() * myKids.length)];
              this._setState('attacking');
              this._setTarget(victim.x, victim.y, true);
              if (Utils.distance(this, victim) < 30 && this.attackCooldown <= 0) {
                const siblings = game.siljangsukList.filter(s =>
                  !s.dead && s.houseId === this.houseId && s.stage < 4 && s.id !== victim.id);
                for (const sib of siblings) {
                  sib.happiness = Math.max(0, sib.happiness - 30);
                }
                victim._die(game, `${this.label}에게 잡아먹힘`);
                this.satiation = Math.min(this.maxSat, this.satiation + 60);
                this.attackCooldown = 1.5;
                if (game.logEvent) game.logEvent(`🥩 ${this.label}가 굶주려 ${victim.label}를 잡아먹음`, '#ff4444', { x: this.x, y: this.y });
              }
              return;
            }
          }
        }

        // 2-c. 운치
        const unciHouse = this._findNearestUnci(game);
        const houseHasFood2 = myHouse && (myHouse.foodReserves > 0);
        if (houseHasFood2) {
          const hh = this.house;
          if (hh) {
            this._setState('going_home');
            this._setTarget(hh.cx, hh.cy);
            return;
          }
        }
        if (unciHouse && !this.isFull) {
          this._eatingUnci = true;
          return;
        }

        // 최후 수단: 밤이면 수면, 낮이면 약자 공격
        if (game.isNight) {
          this._setState('sleeping');
          return;
        }
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
        this._lockAction('going_home');
        return;
      }
    }

    // Night → sleep (전쟁 중이면 귀가 안 함)
    const isOrphanChild = !this.slaveOf && this.parentId === null && this.stage < 4 && !this.houseId;
    if (game.isNight && !atWar && !this.fugitive && !isOrphanChild) {
      const h = this.house;
      // 집이 있고 가까이 있으면 자기 집에서 취침
      if (h && h.isNear(this.x, this.y, 40)) {
        if (this.state !== 'sleeping' && Math.random() < 0.5) this._say('sleep');
        this._setState('sleeping');
        return;
      }
      // 집이 있지만 멀리 있으면 귀가 (이동거리 800 이내일 때만)
      if (h && Utils.distance(this, { x: h.cx, y: h.cy }) < 800) {
        this._setState('going_home');
        this._setTarget(h.cx, h.cy);
        return;
      }
      // 집 없음 또는 너무 멀음 → 그 자리 노숙 (수면중, 회복 X)
      this._setState('sleeping');
      this._setTarget(this.x, this.y, true);
      return;
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

  // 프니프니 시전 (1초). 같은 가족 또는 고아끼리 / 운치굴 구더기.
  _doPniepnie(baby, game, dt) {
    if (!baby || baby.dead) return false;
    // 가족 일치 또는 고아끼리(부모/주인 없음) 허용
    let myFam = this.familyId;
    if (this.slaveOf) {
      const m = game.getEntity(this.slaveOf);
      if (m) myFam = m.familyId;
    }
    const familyMatch = baby.familyId === myFam;
    const bothOrphan  = (this.stage === 1) && !this.parentId && !this.slaveOf
                     && !baby.parentId && !baby.slaveOf;
    if (!familyMatch && !bothOrphan) return false;

    // 가족 내 중복 방지 — 이미 다른 가족원이 같은 아기를 점유했으면 양보
    if (this._isClaimedByFamily(baby, 'pniepnie', game)) return false;
    this._claimTargetK(baby, 'pniepnie');

    this._setState('giving_pniepnie');
    this._setTarget(baby.x, baby.y, true);
    if (Utils.distance(this, baby) >= 18) return true;
    // 시전 1초
    this._pniepnieCastTimer = (this._pniepnieCastTimer ?? 0) + dt;
    if (this._pniepnieCastTimer < 1) return true;
    // 완료
    this._pniepnieCastTimer = 0;
    baby.pniepnieTimer = 0;
    baby._sinceLastPniepnie = 0;     // 구더기 HP 감소 타이머 리셋
    baby._grubDecayCD = 0;
    baby._gotPniepnieAt = (game.dayTime ?? 0);
    baby.happiness = 100;            // 행복 100으로 회복
    // 즉시 운치 발사 (구더기 전용 — 바닥에 떨어뜨림)
    if (baby.stage === 1) {
      const dayLen = (CONFIG.DAY_LENGTH ?? 155) + (CONFIG.NIGHT_LENGTH ?? 40);
      const house = baby.house;
      if (house && house.hasUnci && Utils.distance(baby, { x: house.unciX, y: house.unciY }) < CONFIG.UNCI_RADIUS * 1.5) {
        house.addUnci(3);
      } else {
        game.floorUnci.push({ x: baby.x, y: baby.y, amount: 5, life: dayLen });
      }
      game.addParticle(baby.x, baby.y - 12, '💩', '#aa7700', 1000);
    } else {
      baby.defecateTimer = CONFIG.UNCI_DEFECATE_INTERVAL;
    }
    game.addParticle(baby.x, baby.y - 18, '프니프니!', '#ffaaff', 1500);
    this.pniepnieCooldown = 6;
    return true;
  }

  _behaveStage1(dt, game) {
    // 구더기끼리 프니프니 — 고아 구더기 / 운치굴 독라 구더기는 다른 구더기에게 프니프니 제공
    if (!this._sinceLastPniepnie || this._sinceLastPniepnie < 30) {
      // 본인이 곤란하지 않으면 다른 구더기 도와주기
      const needy = game.findNearestSiljangsuk(this.x, this.y, 200, s =>
        !s.dead && s.stage === 1 && s.id !== this.id
        && (s._sinceLastPniepnie ?? 0) > 40);
      if (needy) {
        // 운치굴 독라 구더기는 운치굴 안의 다른 구더기를 우선
        let target = needy;
        if (this.slaveOf) {
          const myMaster = game.getEntity(this.slaveOf);
          const myMH = myMaster ? game.getEntity(myMaster.houseId) : null;
          if (myMH) {
            const sameUnci = game.findNearestSiljangsuk(this.x, this.y, 100, s =>
              !s.dead && s.stage === 1 && s.id !== this.id
              && Utils.distance(s, { x: myMH.unciX, y: myMH.unciY }) < CONFIG.UNCI_RADIUS * 1.5
              && (s._sinceLastPniepnie ?? 0) > 30);
            if (sameUnci) target = sameUnci;
          }
        }
        if (this._doPniepnie(target, game, dt)) return;
      }
    }

    // 구더기 — 운치를 가장 좋아함 (모든 것에 앞서)
    if (game.floorUnci && game.floorUnci.length > 0) {
      let bu = null, bd = 400;
      for (const u of game.floorUnci) {
        const d = Utils.distance(this, u);
        if (d < bd) { bd = d; bu = u; }
      }
      if (bu) {
        this._setState('seeking_food');
        this._setTarget(bu.x, bu.y, true);
        if (bd < 14) {
          const eat = Math.min(bu.amount, 5 * dt);
          bu.amount -= eat;
          this.satiation = Math.min(this.maxSat, this.satiation + eat);
          if (bu.amount <= 0) game.floorUnci = game.floorUnci.filter(u => u !== bu);
        }
        return;
      }
    }
    const isOrphan = !this.houseId && !this.parentId && !this.slaveOf;
    if (isOrphan) {
      // 고아 구더기: 음식 우선순위 — 고기(food_good) > 일반 음식 > 바닥 운치
      const meat = game.findNearestItem?.(this.x, this.y, 300,
        i => i.type === 'food_good', this);
      if (meat) {
        this._setState('seeking_food');
        this._setTarget(meat.x, meat.y, true);
        if (Utils.distance(this, meat) < 14) this._pickUp && this._pickUp(meat, game);
        return;
      }
      const anyFood = game.findNearestItem?.(this.x, this.y, 250,
        i => i.isFood && i.isFood(), this);
      if (anyFood) {
        this._setState('seeking_food');
        this._setTarget(anyFood.x, anyFood.y, true);
        if (Utils.distance(this, anyFood) < 14) this._pickUp && this._pickUp(anyFood, game);
        return;
      }
      // 바닥 운치
      if (game.floorUnci && game.floorUnci.length > 0) {
        let best = null, bd = 250;
        for (const u of game.floorUnci) {
          const d = Utils.distance(this, u);
          if (d < bd) { bd = d; best = u; }
        }
        if (best) {
          this._setState('seeking_food');
          this._setTarget(best.x, best.y, true);
          if (Utils.distance(this, best) < 14) {
            const eat = Math.min(best.amount, 4 * dt);
            best.amount -= eat;
            this.satiation = Math.min(this.maxSat, this.satiation + eat);
            if (best.amount <= 0) {
              game.floorUnci = game.floorUnci.filter(u => u !== best);
            }
          }
          return;
        }
      }
      // 주변에 음식 없음 → 가장 가까운 운치굴 있는 집으로 이동
      let bestU = null, bdU = Infinity;
      for (const oh of game.houses) {
        if (!oh.hasUnci) continue;
        const d = Utils.distance(this, { x: oh.unciX, y: oh.unciY });
        if (d < bdU) { bdU = d; bestU = oh; }
      }
      if (bestU) {
        this._setState('seeking_food');
        this._setTarget(bestU.unciX, bestU.unciY, true);
        return;
      }
      // 그도 없으면 가장 가까운 실장석 따라가기
      const nearest = game.findNearestSiljangsuk(this.x, this.y, 400,
        s => !s.dead && s.id !== this.id);
      if (nearest) {
        this._setState('seeking_item');
        this._setTarget(nearest.x, nearest.y, true);
        if (Utils.distance(this, nearest) < 30) {
          if (Math.random() < 0.03) {
            this._speech = '프니프니를 요구하는레후';
            this._speechTimer = 2;
          }
        }
        return;
      }
      this._wander(dt, game, 80);
      return;
    }
    // 집에 있는 구더기: 100px 내 바닥 운치 적극 먹기
    const h = this.house;
    if (h && game.floorUnci && game.floorUnci.length > 0) {
      let best = null, bd = 100;
      for (const u of game.floorUnci) {
        if (Utils.distance(u, { x: h.cx, y: h.cy }) > 100) continue;
        const d = Utils.distance(this, u);
        if (d < bd) { bd = d; best = u; }
      }
      if (best) {
        this._setState('seeking_food');
        this._setTarget(best.x, best.y, true);
        if (Utils.distance(this, best) < 14) {
          const eat = Math.min(best.amount, 4 * dt);
          best.amount -= eat;
          this.satiation = Math.min(this.maxSat, this.satiation + eat);
          if (best.amount <= 0) {
            game.floorUnci = game.floorUnci.filter(u => u !== best);
          }
        }
        return;
      }
    }
    // Stay near house / unci
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

    // ── 새끼: 부모로부터 800px 이상 떨어지면 부모로 도주 / 너무 멀면 수풀 은신 ──
    if (this._tryReturnToParentOrHide(dt, game)) return;

    // ── 고아/탈출 독라 판정 ──────────────────────────────────────
    const isOrphanFree = !this.slaveOf && (this.parentId === null || this.fugitive) && !this.houseId;

    // 고아/탈출 독라: 하루마다 빈집 검사 → 1000px 내면 입주, 아니면 분수대로
    if (isOrphanFree) {
      if (this._tryOrphanDailyResettle(game)) return;
      if (this._behaveOrphanAtFountain(dt, game)) return;
    }

    // 집이 없으면 빈집 찾기 (고아가 아닌 경우만)
    if (!h && !isOrphanFree) {
      const vac = this._findVacantHouse(game);
      if (vac) {
        if (Utils.distance(this, { x: vac.cx, y: vac.cy }) < 50) {
          vac.vacant  = false;
          this.houseId = vac.id;
          if (!vac.ownerId) vac.ownerId = this.id;
          h = vac;
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집으로 이주`, '#aaccff', { x: this.x, y: this.y });
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

    // Flee from non-family adults (고아끼리는 서로 위협으로 보지 않음)
    const threat = game.findNearestSiljangsuk(this.x, this.y, 120,
      s => s.isAdult && s.familyId !== this.familyId && !s.dead
        && !(isOrphanFree && !s.slaveOf && (s.parentId === null || s.fugitive) && !s.houseId));
    if (threat) { this._fleeToHouse(game); return; }

    // Give pniepnie to stage 1 sibling (가족 우선, 없으면 위급한 타가족 새끼도 돌봄)
    if (this.pniepnieCooldown <= 0) {
      // 가족 새끼만 프니프니 (다른 가족은 무시)
      const baby = game.findNearestSiljangsuk(this.x, this.y, 200,
        s => s.stage === 1 && s.familyId === this.familyId && s.pniepnieTimer > 8
          && !this._isClaimedByFamily(s, 'pniepnie', game));
      if (baby) {
        if (this._doPniepnie(baby, game, dt)) return;
      }
    }

    // ── 고아 구더기 운반 (stage 2: 600px 적극, 최대 1마리, 공격 X) — 운치굴 있어야 함 ──
    if (!isOrphanFree && h && h.hasUnci) {
      const maxCarryBaby = 1;
      if (!this._carriedBabies) this._carriedBabies = [];
      if (this._carriedBabies.length > 0) {
        this._setState('carrying_item');
        this._setTarget(h.unciX, h.unciY);
        for (const bid of this._carriedBabies) {
          const baby2 = game.getEntity(bid);
          if (baby2 && !baby2.dead) {
            baby2.x = this.x; baby2.y = this.y;
            baby2.targetX = this.x; baby2.targetY = this.y;
          }
        }
        if (Utils.distance(this, { x: h.unciX, y: h.unciY }) < 30) {
          for (const bid of this._carriedBabies) {
            const baby2 = game.getEntity(bid);
            if (baby2 && !baby2.dead) {
              baby2.beingCarried = false;
              baby2.houseId = h.id;
              baby2.slaveOf = this.id;
              baby2.x = h.unciX + Utils.random(-15, 15);
              baby2.y = h.unciY + Utils.random(-15, 15);
            }
          }
          this._carriedBabies = [];
        }
        return;
      }
      if (this._carriedBabies.length < maxCarryBaby) {
        const orphanBaby = game.findNearestSiljangsuk(this.x, this.y, 600,
          s => !s.dead && s.stage === 1 && !s.slaveOf && !s.parentId && !s.houseId
            && !s.beingCarried
            && !this._carriedBabies.includes(s.id)
            && !this._isClaimedByFamily(s, 'carry', game));
        if (orphanBaby) {
          this._claimTargetK(orphanBaby, 'carry');
          this._setState('seeking_item');
          this._setTarget(orphanBaby.x, orphanBaby.y);
          if (Utils.distance(this, orphanBaby) < 20) {
            orphanBaby.beingCarried = true;
            this._carriedBabies.push(orphanBaby.id);
          }
          return;
        }
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

    if (this._cleanupFloorUnci(game, h)) return;
    // 한가할 때: 잡았다! 놀이 또는 수풀 채집
    if (this._tryIdleChildActivity(dt, game)) return;
    this._wander(dt, game, 90);
  }

  _behaveStage3(dt, game) {
    let h = this.house;

    // ── 새끼: 부모로부터 800px 이상 떨어지면 부모로 도주 / 너무 멀면 수풀 은신 ──
    if (this._tryReturnToParentOrHide(dt, game)) return;

    // ── 고아/탈출 독라 판정 ──────────────────────────────────────
    const isOrphanFree = !this.slaveOf && (this.parentId === null || this.fugitive) && !this.houseId;

    // 고아/탈출 독라: 하루마다 빈집 검사 → 1000px 내면 입주, 아니면 분수대로
    if (isOrphanFree) {
      if (this._tryOrphanDailyResettle(game)) return;
      if (this._behaveOrphanAtFountain(dt, game)) return;
    }

    // 집이 없으면 빈집 이주 (고아가 아닌 경우만)
    if (!h && !isOrphanFree) {
      const vac = this._findVacantHouse(game);
      if (vac) {
        if (Utils.distance(this, { x: vac.cx, y: vac.cy }) < 50) {
          vac.vacant  = false;
          this.houseId = vac.id;
          if (!vac.ownerId) vac.ownerId = this.id;
          h = vac;
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집으로 이주`, '#aaccff', { x: this.x, y: this.y });
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
          // 50% 확률로 술래잡기 놀이
          const tagMode = players.length >= 2 && Math.random() < 0.5;
          if (tagMode) {
            const taggerIdx = Math.floor(Math.random() * players.length);
            for (let i = 0; i < players.length; i++) {
              const p = players[i];
              p.happiness    = Math.min(100, p.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
              p.hp           = Math.max(1, p.hp - Utils.random(0.3, 1.5));
              p.playCooldown = 25;
              const isTagger = (i === taggerIdx);
              p._tagPlay = {
                role: isTagger ? 'tagger' : 'runner',
                startDelay: isTagger ? 0.5 : 0,  // 술래는 0.5초 대기 후 추격
                swapAt: 1.7, ttl: 5, group: players.map(x => x.id),
              };
              p._orbit = null;
            }
            game.addParticle(midX, midY - 22, `🏃 술래잡기! (${players.length}명)`, '#ffccaa', 1800);
          } else {
            for (let i = 0; i < players.length; i++) {
              const p = players[i];
              p.happiness    = Math.min(100, p.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
              p.hp           = Math.max(1, p.hp - Utils.random(0.5, 2));
              p.playCooldown = 25;
              const a = (i / N) * Math.PI * 2;
              p._orbit = { cx: midX, cy: midY, angle: a, radius: 24, ttl: 2.8, speed: 4 };
            }
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
      s => s.isAdult && s.familyId !== this.familyId && !s.dead
        && !(isOrphanFree && !s.slaveOf && (s.parentId === null || s.fugitive) && !s.houseId));
    if (threat) { this._fleeToHouse(game); return; }

    // Pniepnie for stage 1 — 같은 가족만
    if (this.pniepnieCooldown <= 0) {
      const baby = game.findNearestSiljangsuk(this.x, this.y, 200,
        s => s.stage === 1 && s.familyId === this.familyId && s.pniepnieTimer > 8
          && !this._isClaimedByFamily(s, 'pniepnie', game));
      if (baby) {
        if (this._doPniepnie(baby, game, dt)) return;
      }
    }

    // ── 고아 구더기 운반 (stage 3: 600px 적극, 최대 2마리) — 운치굴 있어야 함 ──
    if (!isOrphanFree && h && h.hasUnci) {
      const maxCarryBaby3 = 2;
      if (!this._carriedBabies) this._carriedBabies = [];
      if (this._carriedBabies.length > 0) {
        this._setState('carrying_item');
        this._setTarget(h.unciX, h.unciY);
        for (const bid of this._carriedBabies) {
          const baby2 = game.getEntity(bid);
          if (baby2 && !baby2.dead) {
            baby2.x = this.x; baby2.y = this.y;
            baby2.targetX = this.x; baby2.targetY = this.y;
          }
        }
        if (Utils.distance(this, { x: h.unciX, y: h.unciY }) < 30) {
          for (const bid of this._carriedBabies) {
            const baby2 = game.getEntity(bid);
            if (baby2 && !baby2.dead) {
              baby2.beingCarried = false;
              baby2.houseId = h.id;
              baby2.slaveOf = this.id;
              baby2.x = h.unciX + Utils.random(-15, 15);
              baby2.y = h.unciY + Utils.random(-15, 15);
            }
          }
          this._carriedBabies = [];
        }
        return;
      }
      if (this._carriedBabies.length < maxCarryBaby3) {
        const orphanBaby = game.findNearestSiljangsuk(this.x, this.y, 600,
          s => !s.dead && s.stage === 1 && !s.slaveOf && !s.parentId && !s.houseId
            && !s.beingCarried
            && !this._carriedBabies.includes(s.id)
            && !this._isClaimedByFamily(s, 'carry', game));
        if (orphanBaby) {
          this._claimTargetK(orphanBaby, 'carry');
          this._setState('seeking_item');
          this._setTarget(orphanBaby.x, orphanBaby.y);
          if (Utils.distance(this, orphanBaby) < 20) {
            orphanBaby.beingCarried = true;
            this._carriedBabies.push(orphanBaby.id);
          }
          return;
        }
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

    if (this._cleanupFloorUnci(game, h)) return;
    if (this._tryIdleChildActivity(dt, game)) return;
    this._wander(dt, game, 140);
  }

  _behaveStage4(dt, game) {
    let h = this.house;

    // ── 아침 수돗가 → 물 마시고 10% 소풍 선언 ──
    if (this._needDrink && !this._drankToday && game.dayPhase === 'morning') {
      const tap = this._findNearestWaterTap(game);
      if (tap) {
        const dTap = Utils.distance(this, tap);
        if (dTap > 30) {
          this._setState('seeking_water');
          this._setTarget(tap.x, tap.y, true);
          this._lockAction('seeking_target', { target: { x: tap.x, y: tap.y }, subState: 'seeking_water' });
          return;
        }
        // 물 마시기 완료 — 락 즉시 해제 (오버슈트 방지)
        this._needDrink = false;
        this._drankToday = true;
        this._breakActionLock();
        this.happiness = Math.min(100, this.happiness + 2);
        game.addParticle(this.x, this.y - 22, '💧 꿀꺽', '#66ccff', 1500);
        // 소풍 판정 — 10%
        if (h && h.hasUnci !== undefined && Math.random() < 0.10) {
          this._picnicToday = true;
          this._speech = '소풍가는데스';
          this._speechTimer = 3;
          game.addParticle(this.x, this.y - 32, '🧺 소풍!', '#ffe066', 2500);
          if (game.logEvent) game.logEvent(`🧺 ${this.label}가 가족과 소풍 선언`, '#ffe066', { x: this.x, y: this.y });
        }
        return;
      }
    }

    // ── 노예 처형: 표식된 노예가 본인 소유 + 같은 집이면 직접 죽이러 감 ──
    const markedSlave = game.siljangsukList.find(s =>
      !s.dead && s.markedForExecution && s.slaveOf === this.id);
    if (markedSlave) {
      this._setState('attacking');
      this._setTarget(markedSlave.x, markedSlave.y);
      if (Utils.distance(this, markedSlave) < 30 && this.attackCooldown <= 0) {
        markedSlave._die(game, '노예처형');
        this.satiation = Math.min(this.maxSat, this.satiation + 50);
        this.attackCooldown = 1.5;
        if (game.logEvent) game.logEvent(`⛓ ${this.label}가 노예 ${markedSlave.label} 처형`, '#cc6666', { x: this.x, y: this.y });
      }
      return;
    }

    // ── 분충 성체: 낮에 고아/탈주 독라 사냥 (수풀에 숨으면 못 봄)
    // 1단계 구더기는 공격 안 함 (운반만)
    if (this.personality === CONFIG.PERSONALITY_BUNCHUNG && !game.isNight && !this.slaveOf) {
      const prey = game.findNearestSiljangsuk(this.x, this.y, 500, s => {
        if (s.dead || s.id === this.id) return false;
        if (s.stage >= 4 || s.stage === 1) return false;
        if (s._stealth) return false;
        if (s._isOrphanSlave) return false;
        if (this._isHiddenInBush(s, game)) return false;
        if (s.familyId === this.familyId) return false;     // 같은 가족 제외
        const isOrphan = !s.slaveOf && (s.parentId === null || s.fugitive) && !s.houseId;
        const isFugitiveSlave = s.wasSlave && !s.slaveOf;
        const isVulnerable    = s._orphanVulnerable;        // 부모 잃은 새끼 (집은 유지)
        return isOrphan || isFugitiveSlave || isVulnerable;
      });
      if (prey) {
        // 표적이 다른 가족 집 안에 숨었으면 집을 공격
        const eh = this._targetInsideEnemyHouse(prey, game);
        if (eh) {
          this._setState('attacking');
          this._setTarget(eh.cx, eh.cy, true);
          if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
            eh.takeDamage(6);
            this.attackCooldown = 1.2;
            game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
            if (eh.hp <= 0) game.destroyHouse(eh);
          }
          return;
        }
        this._setState('attacking');
        this._setTarget(prey.x, prey.y, true);
        if (Utils.distance(this, prey) < 28 && this.attackCooldown <= 0) {
          const dmg = 3 + this.stage * 2;
          this.applyAttack(prey, dmg, game);
          this.attackCooldown = 1.2;
          if (prey.hp <= 0) {
            this.satiation = Math.min(this.maxSat, this.satiation + 25);
          }
        }
        return;
      }
    }

    // ── 탈주 독라 추격 — 성체는 90% 확률로 적극 공격 ──
    if (!this.slaveOf && this.stage === 4) {
      // 개체별 결정: 한 번 결정한 90/10은 게임 내내 유지 (오실레이션 방지)
      if (this._dokraHuntDecision === undefined) {
        this._dokraHuntDecision = Math.random() < 0.90 ? 'hunt' : 'ignore';
      }
    }
    if (!this.slaveOf && this._dokraHuntDecision !== 'ignore') {
      const outsideDokra = game.findNearestSiljangsuk(this.x, this.y, 500, s => {
        if (s.dead || s.id === this.id) return false;
        if (s.stage >= 4) return false;
        if (s._stealth) return false;
        if (s._isOrphanSlave) return false;
        if (this.stage >= 4 && this._isHiddenInBush(s, game)) return false;
        if (!s.slaveOf && !s.wasSlave && !s.fugitive) return false;
        if (s.slaveOf) {
          const m = game.getEntity(s.slaveOf);
          const mh = m ? game.getEntity(m.houseId) : null;
          if (mh && Utils.distance(s, { x: mh.unciX, y: mh.unciY }) <= CONFIG.UNCI_RADIUS) return false;
        }
        return true;
      });
      if (outsideDokra) {
        // 표적이 다른 가족 집 안에 숨었으면 집을 공격
        const eh = this._targetInsideEnemyHouse(outsideDokra, game);
        if (eh) {
          this._setState('attacking');
          this._setTarget(eh.cx, eh.cy, true);
          if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
            eh.takeDamage(6);
            this.attackCooldown = 1.2;
            game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
            if (eh.hp <= 0) game.destroyHouse(eh);
          }
          return;
        }
        this._setState('attacking');
        this._setTarget(outsideDokra.x, outsideDokra.y);
        if (Utils.distance(this, outsideDokra) < 28 && this.attackCooldown <= 0) {
          // 원주인 집 찾기
          const origMasterId = outsideDokra.slaveOf ?? outsideDokra._origMasterId ?? null;
          const origMaster   = origMasterId ? game.getEntity(origMasterId) : null;
          const origHouse    = origMaster ? game.getEntity(origMaster.houseId) : null;
          const distFromHome = origHouse
            ? Utils.distance(outsideDokra, { x: origHouse.cx, y: origHouse.cy })
            : Infinity;

          // 전투 패배 새끼 독라 (_childDefeatFlee): 본인 집에 80% 운치굴 / 없으면 잡아먹힘
          if (outsideDokra._childDefeatFlee && outsideDokra.stage <= 3) {
            const myH = this.house;
            if (myH && myH.hasUnci && Math.random() < 0.80) {
              outsideDokra.slaveOf = this.id;
              outsideDokra.fugitive = false;
              outsideDokra.wasSlave = true;
              outsideDokra.houseId = myH.id;
              outsideDokra._childDefeatFlee = false;
              outsideDokra.x = myH.unciX + Utils.random(-15, 15);
              outsideDokra.y = myH.unciY + Utils.random(-15, 15);
              outsideDokra._escapeBlockUntilDay = (game.dayIndex ?? 0) + 3;
              game.addParticle(outsideDokra.x, outsideDokra.y - 20, '⛓ 운치굴', '#cc6666', 2000);
              if (game.logEvent) game.logEvent(`⛓ 패배 새끼 운치굴 노예화`, '#cc6666', { x: this.x, y: this.y });
            } else {
              // 운치굴 없거나 20% → 잡아먹힘
              outsideDokra.hp = 0;
              outsideDokra._die(game, `${this.label}에게 잡아먹힘`);
              this.satiation = Math.min(this.maxSat, this.satiation + 25);
              if (game.logEvent) game.logEvent(`🍖 ${this.label}가 패배 새끼 포식`, '#cc4444', { x: this.x, y: this.y });
            }
            this.attackCooldown = 1.2;
            return;
          }
          if (origHouse && origHouse.hasUnci && distFromHome <= 800) {
            // 800px 이내 → 100% 운치굴로 복귀, 3일간 탈주 시도 금지
            outsideDokra.slaveOf = origMaster.id;
            outsideDokra.fugitive = false;
            outsideDokra.wasSlave = true;
            outsideDokra.houseId = origHouse.id;
            outsideDokra.x = origHouse.unciX + Utils.random(-20, 20);
            outsideDokra.y = origHouse.unciY + Utils.random(-20, 20);
            outsideDokra._escapeBlockUntilDay = (game.dayIndex ?? 0) + 3;
            game.addParticle(outsideDokra.x, outsideDokra.y - 20, '⛓ 운치굴 복귀', '#cc6666', 2000);
            if (game.logEvent) game.logEvent(`⛓ ${this.label}가 탈주 독라 운치굴로 복귀`, '#cc6666', { x: this.x, y: this.y });
          } else {
            // 멀리 도망간 탈주 독라 → 고아 독라 (세대 0, 부모 없음)
            outsideDokra.slaveOf  = null;
            outsideDokra.fugitive = false;
            outsideDokra.parentId = null;
            outsideDokra.familyId = outsideDokra.id;  // 독립 가족
            outsideDokra.generation = 0;
            outsideDokra.houseId = null;
            outsideDokra.wasSlave = true;
            outsideDokra._isOrphanSlave = true;   // 더 이상 추격 안 당함
            outsideDokra._origMasterId  = null;
            game.addParticle(outsideDokra.x, outsideDokra.y - 20, '고아 독라', '#aaaaaa', 2000);
            if (game.logEvent) game.logEvent(`👤 탈주 독라가 고아가 됨`, '#aaaaaa', { x: outsideDokra.x, y: outsideDokra.y });
          }
          this.attackCooldown = 1.2;
        }
        return;
      }
    }

    // ── 저녁 모임: 집에 있을 때 가끔 대사 / 임신 중이면 태교 ────────────
    if (game.dayPhase === 'evening' && h && h.isNear(this.x, this.y, 100)) {
      if (Math.random() < 0.003) this._say('evening');
    }

    // ── 태교/자식과의 놀이: 3일치 음식이 모여야 가능
    //   가족 인원 × 일일소비량(≈8) × 3일 — 그 미만이면 놀지 않고 먹이 수집에 전념
    const familyHere = h ? game.siljangsukList.filter(s =>
      !s.dead && s.houseId === h.id && !s.slaveOf).length : 1;
    const needReserve = familyHere * 8 * 3;
    if (this.pregnant && h && h.foodReserves >= needReserve) {
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
          if (game.logEvent) game.logEvent(`🏠 ${this.label}가 빈집을 점유`, '#aaccff', { x: this.x, y: this.y });
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
          game.addParticle(enemy.x, enemy.y - 14, `-${dmg}(습격-DEPRECATED)`, '#ff2222', 1000);
        }
        return;
      }
      // 적 집 공격 (DEPRECATED — 위 _doWarBehavior에서 처리)
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

    // ── 구더기 거래 시도 (성체간) ──
    if (this._tryTrade(game)) return;

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
          if (game.logEvent) game.logEvent(`🍱 ${this.label}(개념)이 ${hungry.label}에게 음식 나눔`, '#aaffaa', { x: this.x, y: this.y });
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
          if (game.logEvent) game.logEvent(`⚔️ 성체가 다툼을 일으킨 새끼를 처형함`, '#ff6666', { x: this.x, y: this.y });
        }
        return;
      }
    }

    // Build house
    if (!h && this.paperCount >= CONFIG.HOUSE_BUILD_COST) {
      this._buildHouse(game);
      return;
    }

    // 배변 욕구: 운치굴이 있으면 거기로, 없으면 집에서 600px+ 떨어진 곳으로
    if (this.goingToUnci && h) {
      if (h.hasUnci) {
        this._setState('going_to_unci');
        this._setTarget(h.unciX, h.unciY);
        return;
      }
      // 운치굴 없음 → 집에서 600px 밖으로 이동
      const dx = this.x - h.cx, dy = this.y - h.cy;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 650) {
        const targetX = h.cx + (dx / d) * 700;
        const targetY = h.cy + (dy / d) * 700;
        this._setState('going_to_unci');
        this._setTarget(
          Utils.clamp(targetX, 30, CONFIG.WORLD_WIDTH - 30),
          Utils.clamp(targetY, 30, CONFIG.WORLD_HEIGHT - 30),
          true);
        return;
      }
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

    // Deposit / Collect 결정 — 한 번 결정하면 카운트가 바뀔 때까지 유지 (왔다갔다 방지)
    if (this.carriedItems.length > 0 && h) {
      const isFullCarry = this.carriedItems.length >= this.maxCarry;
      // 들고 있는 상태에서 모드 결정 — 들고 있는 동안 유지
      // _depositMode === undefined 면 첫 결정
      if (this._depositMode === undefined || this._depositMode === null) {
        if (isFullCarry) {
          this._depositMode = true;
        } else {
          const moreNearby = game.findNearestItem(this.x, this.y, 450, null, this);
          const hasMoreToPick = moreNearby && !this._hasCloserCompetitor(moreNearby, game);
          this._depositMode = !hasMoreToPick;
        }
      }
      // 가득 차면 무조건 deposit (자식이 1마리 더 들어왔는데 갈팡질팡 방지)
      if (isFullCarry) this._depositMode = true;

      if (this._depositMode) {
        this._setState('carrying_item');
        this._setTarget(h.cx, h.cy);
        if (h.isNear(this.x, this.y, 40)) {
          this._depositAll(game);
          this._depositMode = null;     // 비웠으니 다음 결정 재계산
        }
        return;
      }
      // 수집 모드 — 다음 아이템 줍기 (아래 'Collect any item' 블록으로 진행)
    } else if (this.carriedItems.length === 0 && this._depositMode) {
      this._depositMode = null;          // 비워졌으면 모드 리셋
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

    // ── 고아 구더기 운반 (stage 4: 200px, 최대 8마리) — 운치굴 있어야 함 ──
    if (h && h.hasUnci) {
      const maxCarryBaby4 = 8;
      if (!this._carriedBabies) this._carriedBabies = [];
      if (this._carriedBabies.length > 0) {
        this._setState('carrying_item');
        this._setTarget(h.unciX, h.unciY);
        for (const bid of this._carriedBabies) {
          const baby2 = game.getEntity(bid);
          if (baby2 && !baby2.dead) {
            baby2.x = this.x; baby2.y = this.y;
            baby2.targetX = this.x; baby2.targetY = this.y;
          }
        }
        if (Utils.distance(this, { x: h.unciX, y: h.unciY }) < 30) {
          for (const bid of this._carriedBabies) {
            const baby2 = game.getEntity(bid);
            if (baby2 && !baby2.dead) {
              baby2.beingCarried = false;
              baby2.houseId = h.id;
              baby2.slaveOf = this.id;
              baby2.x = h.unciX + Utils.random(-15, 15);
              baby2.y = h.unciY + Utils.random(-15, 15);
            }
          }
          this._carriedBabies = [];
        }
        return;
      }
      // 성체: 200px 내 1단계 고아 발견 시 50% 운반 / 50% 무시 (공격 X)
      if (this._carriedBabies.length < maxCarryBaby4) {
        const orphanBaby = game.findNearestSiljangsuk(this.x, this.y, 200,
          s => !s.dead && s.stage === 1 && !s.slaveOf && !s.parentId && !s.houseId
            && !s.beingCarried
            && !this._carriedBabies.includes(s.id)
            && (s._adultIgnoreId !== this.id)
            && !this._isClaimedByFamily(s, 'carry', game));
        if (orphanBaby) {
          if (orphanBaby._adultDecision !== this.id) {
            orphanBaby._adultDecision = this.id;
            if (Math.random() < 0.5) {
              orphanBaby._adultIgnoreId = this.id;
            }
          }
          if (orphanBaby._adultIgnoreId !== this.id) {
            this._claimTargetK(orphanBaby, 'carry');
            this._setState('seeking_item');
            this._setTarget(orphanBaby.x, orphanBaby.y);
            if (Utils.distance(this, orphanBaby) < 20) {
              orphanBaby.beingCarried = true;
              this._carriedBabies.push(orphanBaby.id);
            }
            return;
          }
        }
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
      // 집 안에 숨었으면 집을 공격
      const eh = this._targetInsideEnemyHouse(enemy, game);
      if (eh) {
        this._setState('attacking');
        this._setTarget(eh.cx, eh.cy, true);
        if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
          eh.takeDamage(7);
          this.attackCooldown = 1.5;
          game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
          if (eh.hp <= 0) game.destroyHouse(eh);
        }
        return;
      }
      this._setState('attacking');
      this._setTarget(enemy.x, enemy.y);
      if (Utils.distance(this, enemy) < 26) {
        const dmg = (this.nailBoost ? 15 : 7) + this.stage * 2;
        this.applyAttack(enemy, dmg, game);
        this.attackCooldown = 1.8;
      }
      return;
    }

    // 탈주 독라 최우선 사냥 (모든 성격 공통)
    let target = game.findNearestSiljangsuk(this.x, this.y, 350, s =>
      !s.dead && s.fugitive && !s.hidden && s.id !== this.id);
    if (!target) target = game.findNearestSiljangsuk(this.x, this.y, 220, s => {
      if (s.dead || s.id === this.id) return false;
      if (s.hidden) return false;
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
    // 이미 본인이 짓고 있는 건축 현장이 있으면 중복 건축 차단
    if ((game.constructions || []).some(c => c.ownerId === this.id)) return;

    // 후보지 평가는 한 번만 — 이후 그 위치로 이동
    // 이미 결정된 위치가 있으면 그곳으로 이동
    if (this._chosenBuildSpot) {
      const sp = this._chosenBuildSpot;
      const d = Utils.distance(this, { x: sp.x + CONFIG.HOUSE_WIDTH/2, y: sp.y + CONFIG.HOUSE_HEIGHT/2 });
      if (d > 50) {
        // 아직 도착 안 함 — 그 위치로 이동
        this._setState('going_to_build');
        this._setTarget(sp.x + CONFIG.HOUSE_WIDTH/2, sp.y + CONFIG.HOUSE_HEIGHT/2, true);
        return;
      }
      // 도착함 — 건축 개시
      game.constructions = game.constructions ?? [];
      game.constructions.push({
        x: sp.x, y: sp.y, w: CONFIG.HOUSE_WIDTH, h: CONFIG.HOUSE_HEIGHT,
        ownerId: this.id, progress: 0, duration: CONFIG.BUILD_DURATION,
      });
      this.paperCount = 0;
      this.carriedItems = this.carriedItems.filter(i => !i.isPaper());
      this._chosenBuildSpot = null;
      game.addParticle(sp.x + CONFIG.HOUSE_WIDTH/2, sp.y - 8, '🔨 건축 시작', '#ffe066', 2000);
      if (game.logEvent) game.logEvent(`🔨 ${this.label}가 집을 짓기 시작`, '#ffcc66', { x: this.x, y: this.y });
      return;
    }

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

    // 위치만 결정 — 실제 건축은 이 위치로 이동한 뒤 다음 _buildHouse 호출 때
    this._chosenBuildSpot = { x: hx, y: hy };
    this._setState('going_to_build');
    this._setTarget(hx + CONFIG.HOUSE_WIDTH/2, hy + CONFIG.HOUSE_HEIGHT/2, true);
    game.addParticle(hx + CONFIG.HOUSE_WIDTH/2, hy - 8, '🚧 건축지 선정', '#ffcc66', 2000);
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
    // 최소 간격 144px 미만은 매우 강한 페널티 (사실상 후보지에서 배제)
    if (minHouseDist < CONFIG.HOUSE_MIN_SPACING) score -= 10000;
    else if (minHouseDist < 280)                 score -= (280 - minHouseDist) * 3;
    else                                         score += Math.min(minHouseDist, 800) * 0.25;

    // 진행 중인 건축 현장과도 간격 유지
    for (const c of (game.constructions || [])) {
      const ccx = c.x + c.w / 2, ccy = c.y + c.h / 2;
      if (Utils.distance(spot, { x: ccx, y: ccy }) < CONFIG.HOUSE_MIN_SPACING) score -= 10000;
    }
    // 쓰레기통/수돗가/분수대로부터 200px 이상
    for (const tc of (game.trashCans || [])) {
      if (Utils.distance(spot, tc) < CONFIG.HOUSE_FACILITY_MIN) score -= 10000;
    }
    for (const w of (game.world?.waterSpots || [])) {
      if (Utils.distance(spot, w) < CONFIG.HOUSE_FACILITY_MIN) score -= 10000;
    }

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
    // 다른 실장석이 노리던 아이템을 가로챈 경우
    if (item.claimedBy && item.claimedBy !== this.id) {
      const claimer = game.getEntity(item.claimedBy);
      if (claimer && !claimer.dead && claimer.addRelation) {
        // 콘페이토는 특히 큰 분노 — 관계 -30, 분충은 즉시 공격 표식
        if (item.type === 'confetto') {
          claimer.addRelation(this.id, -30);
          game.addParticle(claimer.x, claimer.y - 22, '내 콘페이토!!', '#ff2222', 2200);
          if (claimer.personality === CONFIG.PERSONALITY_BUNCHUNG) {
            claimer.lastAttackerId    = this.id;
            claimer.counterAttackTimer = 8;
          }
        } else {
          claimer.addRelation(this.id, -1);
          game.addParticle(claimer.x, claimer.y - 18, '내 거였는데…', '#ffaa44', 1500);
        }
      }
    }
    // 콘페이토/코로리/도돈파 — 구분 못 하고 줍는 즉시 섭취
    if (item.type === 'confetto' || item.type === 'korori' || item.type === 'dodonpa') {
      this._eat(item);
      item.collected = true;
      item.carriedBy = null;
      item.claimedBy = null;
      return;
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
        const leafCount = Utils.randomInt(3, 8);
        h.addLeaf();
        h.leafStock = (h.leafStock ?? 0) + leafCount;
      } else if (item.isPaper()) {
        // 폐지: HP 손상 있으면 수선(5씩), 아니면 비축
        if (h.hp < h.maxHp) h.repairWithPaper(1);
        h.paperStock = (h.paperStock ?? 0) + 1;
      } else if (item.isTarp()) {
        // 방수포: HP 손상 있으면 수선(30), 아니면 비축
        if (h.hp < h.maxHp) h.repairWithTarp(1);
        else h.tarpStock = (h.tarpStock ?? 0) + 1;
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
  // 자실장(2/3단계): 집 근처 절대 사수. 단 부모가 소풍 선언하면 부모를 따라 다님.
  _tryReturnToParentOrHide(dt, game) {
    if (this.stage < 2 || this.stage > 3) return false;
    if (this.slaveOf) return false;
    if (this.fugitive) return false;
    const h = this.house;
    const parent = this.parentId ? game.getEntity(this.parentId) : null;

    // 부모가 오늘 소풍 중 → 부모 주변에서 뿔뿔이 흩어져 불규칙 배회
    if (parent && !parent.dead && parent._picnicToday) {
      const dp = Utils.distance(this, parent);
      // 너무 멀어지면(250px 초과) 부모 쪽으로 슬쩍 끌어당김
      if (dp > 250) {
        this._setState('going_home');
        this._setTarget(parent.x, parent.y, true);
        return true;
      }
      // 250px 안에서는 부모와 무관하게 짧고 잦은 wander — 흩어진 느낌
      this.wanderTimer = (this.wanderTimer ?? 0) - dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = Utils.random(0.8, 1.8);   // 더 잦게
        // 멤버마다 위상 오프셋으로 다른 방향 선호 (뭉치지 않게)
        if (this._picnicPhase === undefined) {
          this._picnicPhase = Math.random() * Math.PI * 2;
        }
        const baseAng = this._picnicPhase + Utils.random(-1.2, 1.2);
        const r = Utils.random(80, 220);             // 부모로부터 멀리 흩어짐
        this._setTarget(
          Utils.clamp(parent.x + Math.cos(baseAng) * r, 20, CONFIG.WORLD_WIDTH - 20),
          Utils.clamp(parent.y + Math.sin(baseAng) * r, 20, CONFIG.WORLD_HEIGHT - 20),
          true);
        // 위상도 천천히 변동 → 시간이 지나면 방향 바뀜
        this._picnicPhase += Utils.random(-0.4, 0.4);
      }
      this._setState('idle');
      return false; // 일반 행동(아이템 줍기 등) 계속 진행
    }
    // 소풍 종료 시 위상 리셋
    if (parent && !parent._picnicToday && this._picnicPhase !== undefined) {
      this._picnicPhase = undefined;
    }

    // 평소: 집 근처 120px 절대 사수
    if (h) {
      const dHome = Utils.distance(this, { x: h.cx, y: h.cy });
      if (dHome <= 120) return false;
      this._setState('going_home');
      this._setTarget(h.cx, h.cy);
      return true;
    }
    // 집 없음 — 부모 곁
    if (parent && !parent.dead) {
      const dp = Utils.distance(this, parent);
      if (dp > 200) {
        this._setState('going_home');
        this._setTarget(parent.x, parent.y, true);
        return true;
      }
    }
    return false;
  }

  // ── 한가할 때 자식 활동 — 괴롭히기/잡았다! 놀이/수풀 채집 ──
  // 반환 true: 이번 틱 행동 점유
  _tryIdleChildActivity(dt, game) {
    if (this.stage < 2 || this.stage > 3) return false;
    if (this.fleeing || this.counterAttackTimer > 0) return false;

    // 0-a) 부모 있는 새끼: 수풀에 숨은 탈주 독라 새끼 괴롭히기 (한 대 치고 도망)
    if (this.parentId && !this.slaveOf) {
      this._harassCD = (this._harassCD ?? 0) - dt;
      if (this._harassCD <= 0) {
        this._harassCD = Utils.random(3, 6);     // 빈도 2배 이상으로 증가
        const bushes = game.world?.bushes || [];
        for (const b of bushes) {
          if (Utils.distance(this, b) > 350) continue;
          const hidden = game.siljangsukList.find(s =>
            !s.dead && s !== this && s.wasSlave && !s.slaveOf
            && s.stage <= 3 && Utils.distance(s, b) < (b.r ?? 16));
          if (hidden) {
            this._setState('attacking');
            this._setTarget(hidden.x, hidden.y, true);
            if (Utils.distance(this, hidden) < 22) {
              this._exposeFromBush(hidden, game);
              const parent = game.getEntity(this.parentId);
              if (parent && !parent.dead) {
                this._setTarget(parent.x, parent.y, true);
              }
              this._speech = '에엣!'; this._speechTimer = 1.2;
            }
            return true;
          }
        }
      }
    }

    // 0) 잡았다! 진행 중
    if (this._tagTimer && this._tagTimer > 0) {
      this._tagTimer -= dt;
      const partner = game.getEntity(this._tagPartnerId);
      if (!partner || partner.dead) { this._tagTimer = 0; this._tagPartnerId = null; }
      else {
        this._setState('playing');
        this._setTarget(partner.x, partner.y, true);
        // 가까이 다가가면 "잡았다!" 외치고 관계 향상 (1번만)
        if (!this._tagShouted && Utils.distance(this, partner) < 24) {
          this._tagShouted = true;
          this._speech = '잡았다!'; this._speechTimer = 1.2;
          game.addParticle(this.x, this.y - 22, '잡았다!', '#ffe066', 1200);
          this.addRelation && this.addRelation(partner.id, +5);
          partner.addRelation && partner.addRelation(this.id, +5);
          this.happiness = Math.min(100, this.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
          partner.happiness = Math.min(100, partner.happiness + CONFIG.HAPPINESS_PLAY_GAIN);
        }
        if (this._tagTimer <= 0) { this._tagPartnerId = null; this._tagShouted = false; }
        return true;
      }
    }

    // 1) 다른 새끼와 잡았다! 놀이 시도 — 같은 가족 우선, 없으면 다른 가족도
    this._playCD = (this._playCD ?? 0) - dt;
    if (this._playCD <= 0 && Math.random() < 0.25) {
      this._playCD = 30;
      // 적대 관계가 아닌 가까운 새끼 찾기
      let partner = game.findNearestSiljangsuk(this.x, this.y, 200, s =>
        !s.dead && s.id !== this.id && s.stage >= 1 && s.stage <= 3
        && !s.slaveOf && !s._stuckInUnci
        && !s.fleeing && (s.counterAttackTimer ?? 0) <= 0
        && (this.getRelation ? this.getRelation(s.id) > -30 : true));
      if (partner) {
        this._tagTimer = 3;
        this._tagShouted = false;
        this._tagPartnerId = partner.id;
        partner._tagTimer = 3;
        partner._tagShouted = false;
        partner._tagPartnerId = this.id;
        partner._playCD = 30;     // 상대도 30초 쿨다운
        this._setState('playing');
        return true;
      }
    }

    // 2) 수풀 채집 — 한가할 때 가장 가까운 수풀로 가서 낙엽/음식 찾기
    this._bushCD = (this._bushCD ?? 0) - dt;
    if (this._bushCD <= 0 && this.carriedItems.length < this.maxCarry) {
      this._bushCD = Utils.random(4, 8);
      const bushes = game.world?.bushes || [];
      let bestBush = null, bd = Infinity;
      for (const b of bushes) {
        const d = Utils.distance(this, b);
        if (d < 350 && d < bd) { bd = d; bestBush = b; }
      }
      if (bestBush) {
        // 수풀 안 작은 반경
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * ((bestBush.r ?? 16) * 0.8);
        this._setState('seeking_item');
        this._setTarget(bestBush.x + Math.cos(a) * r, bestBush.y + Math.sin(a) * r, true);
        // 수풀 근처에서 채집 트리거 (드물게 낙엽/음식 스폰)
        if (Utils.distance(this, bestBush) < (bestBush.r ?? 16) + 8) {
          if (Math.random() < 0.3) {
            const type = Math.random() < 0.25 ? randomFoodType() : 'leaf';
            game.spawnItem && game.spawnItem(type,
              bestBush.x + Utils.random(-12, 12),
              bestBush.y + Utils.random(-12, 12));
          }
        }
        return true;
      }
    }

    return false;
  }

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

  // ── 가족 모드 플레이어 명령 실행 ─────────────────
  // 반환 true: 명령으로 이번 틱 행동 종료. false: 명령 종료/무효 → 일반 AI 진행.
  _runPlayerCommand(dt, game) {
    const cmd = this._command;
    if (!cmd) return false;

    // 일을 하는 동안 행복 감소
    if (cmd.type === 'gather_trash' || cmd.type === 'gather_bush'
        || cmd.type === 'build' || cmd.type === 'put_in_unci') {
      this.happiness = Math.max(0, this.happiness - 1.0 * dt);
    }

    switch (cmd.type) {
      case 'move': {
        this._setState('moving');
        this._setTarget(cmd.x, cmd.y, true);
        if (Utils.distance(this, { x: cmd.x, y: cmd.y }) < 18) {
          this._command = null;     // 도착 → 명령 종료
          return false;
        }
        return true;
      }

      case 'gather_trash': {
        if (this.stage !== 4) { this._command = null; return false; }
        // 쓰레기통 주변 배회 + 근처 음식/폐지 픽업
        this._setState('working');
        // maxCarry 까지 차지 않았으면 근처 아이템 픽업
        if (this.carriedItems.length < this.maxCarry) {
          const item = game.findNearestItem(this.x, this.y, 180,
            i => i.isFood && (i.isFood() || i.isPaper()), this);
          if (item) {
            this._claimItem && this._claimItem(item);
            this._setTarget(item.x, item.y, true);
            if (Utils.distance(this, item) < 14) this._pickUp(item, game);
            return true;
          }
          // 아이템 없으면 쓰레기통 주변 배회 (필요하면 스폰 트리거 효과)
          this.wanderTimer = (this.wanderTimer ?? 0) - dt;
          if (this.wanderTimer <= 0) {
            this.wanderTimer = Utils.random(2, 4);
            const a = Math.random() * Math.PI * 2;
            const r = Utils.random(50, 90);
            this._setTarget(cmd.x + Math.cos(a) * r, cmd.y + Math.sin(a) * r, true);
          }
          // 가끔 쓰레기통에서 아이템 발견 (음식/폐지)
          this._gatherTick = (this._gatherTick ?? 0) + dt;
          if (this._gatherTick >= 3) {
            this._gatherTick = 0;
            if (Utils.distance(this, { x: cmd.x, y: cmd.y }) < 80) {
              // 쓰레기통은 음식/폐지 풍부
              const r = Math.random();
              const type = r < 0.55 ? randomFoodType() : 'paper';
              if (game.spawnItem) game.spawnItem(type,
                cmd.x + Utils.random(-30, 30),
                cmd.y + Utils.random(-30, 30));
            }
          }
          return true;
        }
        // 가득 찼으면 집으로 가서 비축
        const h = this.house;
        if (h) {
          this._setState('carrying_item');
          this._setTarget(h.cx, h.cy, true);
          if (h.isNear(this.x, this.y, 40)) this._depositAll(game);
        }
        return true;
      }

      case 'gather_bush': {
        if (this.stage !== 4) { this._command = null; return false; }
        this._setState('working');
        if (this.carriedItems.length < this.maxCarry) {
          const item = game.findNearestItem(this.x, this.y, 150,
            i => i.isFood && (i.isFood() || i.type === 'leaf'), this);
          if (item) {
            this._claimItem && this._claimItem(item);
            this._setTarget(item.x, item.y, true);
            if (Utils.distance(this, item) < 14) this._pickUp(item, game);
            return true;
          }
          this.wanderTimer = (this.wanderTimer ?? 0) - dt;
          if (this.wanderTimer <= 0) {
            this.wanderTimer = Utils.random(2, 4);
            const a = Math.random() * Math.PI * 2;
            const r = Utils.random(30, 60);
            this._setTarget(cmd.x + Math.cos(a) * r, cmd.y + Math.sin(a) * r, true);
          }
          // 수풀에서 채집 — 낙엽 위주, 음식은 적게
          this._gatherTick = (this._gatherTick ?? 0) + dt;
          if (this._gatherTick >= 4) {
            this._gatherTick = 0;
            if (Utils.distance(this, { x: cmd.x, y: cmd.y }) < 60) {
              const r = Math.random();
              const type = r < 0.20 ? randomFoodType() : 'leaf';
              if (game.spawnItem) game.spawnItem(type,
                cmd.x + Utils.random(-20, 20),
                cmd.y + Utils.random(-20, 20));
            }
          }
          return true;
        }
        const h = this.house;
        if (h) {
          this._setState('carrying_item');
          this._setTarget(h.cx, h.cy, true);
          if (h.isNear(this.x, this.y, 40)) this._depositAll(game);
        }
        return true;
      }

      case 'pniepnie': {
        if (this.stage < 2 || this.stage > 3) { this._command = null; return false; }
        const baby = game.findNearestSiljangsuk(this.x, this.y, 800,
          s => !s.dead && s.stage === 1 && s.familyId === this.familyId
            && (s.pniepnieTimer ?? 0) > 30
            && !this._isClaimedByFamily(s, 'pniepnie', game));
        if (!baby) {
          // 할 일 없음 — 집 근처 대기
          const h = this.house;
          if (h && !h.isNear(this.x, this.y, 80)) {
            this._setTarget(h.cx, h.cy, true);
          }
          return true;
        }
        this._setState('giving_pniepnie');
        this._setTarget(baby.x, baby.y, true);
        if (Utils.distance(this, baby) < 18) {
          baby.pniepnieTimer = 0;
          baby.happiness = Math.min(100, baby.happiness + CONFIG.HAPPINESS_PNIEPNIE_GAIN);
          game.addParticle(baby.x, baby.y - 18, '프니프니!', '#ffaaff', 1500);
        }
        return true;
      }

      case 'put_in_unci': {
        const baby = game.getEntity(cmd.babyId);
        const target = game.getEntity(cmd.houseId);
        if (!baby || baby.dead || !target) { this._command = null; return false; }
        // 운치굴 위치로 끌고 감
        this._setState('moving');
        this._setTarget(baby.x, baby.y, true);
        if (Utils.distance(this, baby) < 22) {
          // 운치굴로 이동
          baby.x = target.unciX + Utils.random(-12, 12);
          baby.y = target.unciY + Utils.random(-12, 12);
          baby.houseId = target.id;
          baby._stuckInUnci = true;
          baby._stuckOwnerId = target.ownerId ?? this.id;
          game.addParticle(baby.x, baby.y - 20, '테에엥!', '#cc6666', 2000);
          this._command = null;
          return false;
        }
        return true;
      }

      case 'build': {
        // Phase 7 에서 구현 예정
        return false;
      }
    }
    this._command = null;
    return false;
  }

  _behaveAsSlave(dt, game) {
    const master = game.getEntity(this.slaveOf);
    if (!master || master.dead) { this.slaveOf = null; return; }

    // 운치굴 밖으로 나오면 자동 탈주 독라 처리 (출산 직후/탈주금지 기간 제외)
    const masterHouseChk = game.getEntity(master.houseId);
    const escapeBlocked = (this._escapeBlockUntilDay ?? -1) > (game.dayIndex ?? 0);
    if (masterHouseChk && masterHouseChk.hasUnci
        && !this.satiationFreezeTimer && !escapeBlocked) {
      const dOut = Utils.distance(this, { x: masterHouseChk.unciX, y: masterHouseChk.unciY });
      if (dOut > CONFIG.UNCI_RADIUS * 2.5) {
        this._origMasterId = this.slaveOf;
        this.slaveOf  = null;
        this.fugitive = true;
        this.wasSlave = true;
        this.houseId  = null;
        this.parentId = null;
        this.familyId = this.id;        // 독립 가족 (조직 없음)
        this.generation = 0;
        game.addParticle(this.x, this.y - 22, '🏃 탈주!', '#ff8844', 1800);
        if (game.logEvent) game.logEvent(`🏃 운치굴 이탈 → 탈주 독라`, '#ff8844', { x: this.x, y: this.y });
        return;
      }
    }
    const masterHouse = game.getEntity(master.houseId);

    // 3단계 노예: 주인 가족의 1단계 새끼 프니프니
    if (this.stage === 3 && this.pniepnieCooldown <= 0) {
      const baby = game.findNearestSiljangsuk(this.x, this.y, 200,
        s => s.stage === 1 && !s.dead && s.familyId === master.familyId);
      if (baby) {
        if (this._doPniepnie(baby, game, dt)) return;
      }
    }

    // 운치굴 근처에서 자유 이동
    if (masterHouse) {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = Utils.random(1.5, 4);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (CONFIG.UNCI_RADIUS * 0.9);  // 운치굴 내부 자유롭게
        this._setTarget(masterHouse.unciX + Math.cos(angle) * r, masterHouse.unciY + Math.sin(angle) * r);
      }
      if (Utils.distance(this, { x: masterHouse.unciX, y: masterHouse.unciY }) > CONFIG.UNCI_RADIUS) {
        this._setTarget(masterHouse.unciX, masterHouse.unciY);
      }
      // 노예 탈출 시도 — 밤에만, 평생 3번 기회, 복귀 직후 3일간 금지
      if (this.stage <= 3 && game.isNight
          && (this._escapeBlockUntilDay ?? -1) <= (game.dayIndex ?? 0)) {
        if (this._escapeAttempts === undefined) this._escapeAttempts = 0;
        if (this._escapeAttempts < 3) {
          // 밤마다 1회만 시도 (dayIndex 추적)
          if (this._lastEscapeDay !== game.dayIndex) {
            this._lastEscapeDay = game.dayIndex;
            this._escapeAttempts++;
            // 단계별 탈출 성공 확률
            const successChance = [0, 0.10, 0.30, 0.50][this.stage] ?? 0;
            if (Math.random() < successChance) {
              this._origMasterId = this.slaveOf;  // 원주인 기억
              this.slaveOf = null;
              this.fugitive = true;
              this.wasSlave = true;
              this.houseId  = null;
              this._stealth = true;   // 들키지 않음 표식 (다음날 아침까지)
              // 밤에 멀리 도주
              const ang = Math.random() * Math.PI * 2;
              this._setTarget(
                Utils.clamp(this.x + Math.cos(ang) * 800, 20, CONFIG.WORLD_WIDTH - 20),
                Utils.clamp(this.y + Math.sin(ang) * 800, 20, CONFIG.WORLD_HEIGHT - 20),
                true);
              if (game.logEvent) game.logEvent(`🏃 탈주 독라 발생 (밤)`, '#ff8844', { x: this.x, y: this.y });
              return;
            }
          }
        }
      }

      // 밤에 운치굴 내 노예: 잠으로 HP 회복
      if (game.isNight) {
        this._setState('sleeping');
        if (this.hp < this.maxHp) {
          this.hp = Math.min(this.maxHp, this.hp + CONFIG.HP_REGEN_PER_SEC * dt * 0.8);
        }
        return;
      }
    }
    this._setState('idle');
  }

  // 거래 시도 — 본인 가족 구더기(stage 1) 잉여 + 식량 부족 →
  //   다른 가족 성체에게 가서 구더기를 음식/폐지/낙엽과 교환
  _tryTrade(game) {
    if (this.stage !== 4 || this.slaveOf) return false;
    this._tradeCooldown = (this._tradeCooldown ?? 0) - 0.016;
    if (this._tradeCooldown > 0) return false;

    const h = this.house;
    if (!h) return false;

    // 본인 가족 구더기(stage 1, 노예 아님) 수
    const myMaggots = game.siljangsukList.filter(s =>
      !s.dead && s.familyId === this.familyId && s.stage === 1 && !s.slaveOf);
    if (myMaggots.length < 4) return false;            // 4마리 이상 있어야 거래 시도

    // 식량 부족 (3일치 미만)
    const familyHere = game.siljangsukList.filter(s =>
      !s.dead && s.houseId === h.id && !s.slaveOf).length;
    const needFood = familyHere * 8 * 3;
    if (h.foodReserves >= needFood) return false;

    // 매수자 후보 — 다른 가족 성체 + 충분한 식량/폐지/낙엽
    const buyer = game.findNearestSiljangsuk(this.x, this.y, 500, s =>
      !s.dead && s.stage === 4 && s.familyId !== this.familyId && !s.slaveOf && s.house);
    if (!buyer) { this._tradeCooldown = 8; return false; }
    const bh = buyer.house;
    if (!bh) { this._tradeCooldown = 8; return false; }

    // 매수자 능력 — 셋 중 하나 충족
    const hasFood  = bh.foodReserves >= 60;
    const hasPaper = (bh.paperStock ?? 0) >= 15;
    const hasLeaf  = (bh.leafStock  ?? 0) >= 30;
    if (!hasFood && !hasPaper && !hasLeaf) { this._tradeCooldown = 8; return false; }

    // 거래 자리로 이동 후 처리
    const d = Utils.distance(this, buyer);
    if (d > 40) {
      this._setState('trading');
      this._setTarget(buyer.x, buyer.y);
      return true;
    }

    // 거래 성사 — 구더기 N마리 (1~min(10, 잉여)) 매수자 가족으로 이관
    const maggotN  = Math.min(10, Math.max(1, myMaggots.length - 3));
    const traded   = myMaggots.slice(0, maggotN);
    for (const m of traded) {
      m.parentId = buyer.id;
      m.familyId = buyer.familyId;
      m.houseId  = bh.id;
      m.parentLabelSnapshot = buyer.label;
    }
    // 보상 분배 — 우선 음식, 부족하면 폐지, 그 다음 낙엽
    let detail = '';
    let need = maggotN;
    if (hasFood) {
      const give = Math.min(need * Utils.randomInt(30, 50), bh.foodReserves);
      bh.foodReserves -= give;
      h.foodReserves  += give;
      detail += `🍱+${Math.floor(give)} `;
      need = 0;
    }
    if (need > 0 && hasPaper) {
      const give = Math.min(need * 5, bh.paperStock);
      bh.paperStock -= give; h.paperStock = (h.paperStock ?? 0) + give;
      detail += `📄+${give} `;
      need = 0;
    }
    if (need > 0 && hasLeaf) {
      const give = Math.min(need * 15, bh.leafStock);
      bh.leafStock -= give; h.leafStock = (h.leafStock ?? 0) + give;
      detail += `🍂+${give} `;
    }
    this._tradeCooldown = 30;
    buyer._tradeCooldown = 30;
    this.happiness  = Math.min(100, this.happiness  + 4);
    buyer.happiness = Math.min(100, buyer.happiness + 4);
    this.addRelation(buyer.id, +20);
    buyer.addRelation(this.id, +20);
    game.addParticle((this.x + buyer.x) / 2, (this.y + buyer.y) / 2 - 24, `🤝 거래! 구더기 ${maggotN}`, '#ffe066', 2400);
    if (game.logEvent) game.logEvent(
      `🤝 ${this.label} ↔ ${buyer.label} 거래 (구더기 ${maggotN} → ${detail.trim()})`,
      '#ffe066',
      { x: (this.x + buyer.x) / 2, y: (this.y + buyer.y) / 2 });
    return true;
  }

  // 전쟁 행동 (raidTarget 또는 defendAgainst 활성) — true 반환 시 다른 행동 차단
  _doWarBehavior(game) {
    const enemyFam = this.raidTarget ?? this.defendAgainst;
    if (enemyFam === null) return false;

    // HP < 50% 시 성격별 행동
    if (this.hp < this.maxHp * 0.5) {
      if (this._warDecision === undefined) {
        const r = Math.random();
        if (this.personality === CONFIG.PERSONALITY_BUNCHUNG) {
          this._warDecision = 'fight';  // 100% 죽을 때까지 싸움
        } else if (this.personality === CONFIG.PERSONALITY_NORMAL) {
          this._warDecision = r < 0.5 ? 'flee' : 'fight';
        } else {
          this._warDecision = r < 0.8 ? 'flee' : 'fight';
        }
      }
      if (this._warDecision === 'flee') {
        // 모든 명령에 우선해 도주 — 집으로
        const h = this.house;
        if (h) {
          this._setTarget(h.cx, h.cy, true);
          this._setState('fleeing');
          this.fleeing = true; this.fleeTimer = 30;
        }
        return true;
      }
    }

    if (Math.random() < 0.005) this._say('raid');

    // 적 성원 우선
    const enemy = game.findNearestSiljangsuk(this.x, this.y, 2500,
      s => !s.dead && s.familyId === enemyFam && !s.slaveOf);
    if (enemy) {
      const eh = this._targetInsideEnemyHouse(enemy, game);
      if (eh) {
        this._setState('attacking');
        this._setTarget(eh.cx, eh.cy, true);
        if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
          eh.takeDamage(16);     // 전쟁 중 집 공격 2배
          this.attackCooldown = 1.2;
          game.addParticle(eh.cx, eh.cy - 10, '💢 집 공격!', '#ff6644', 1200);
          if (eh.hp <= 0) game.destroyHouse(eh);
        }
        return true;
      }
      this._setState('attacking');
      this._setTarget(enemy.x, enemy.y, true);
      if (Utils.distance(this, enemy) < 28 && this.attackCooldown <= 0) {
        const dmg = (this.nailBoost ? 18 : 10) + this.stage * 2;
        this.applyAttack(enemy, dmg, game);
        this.attackCooldown = 1.5;
      }
      return true;
    }

    // 적 집 진군 — 전쟁 중에 더 적극적으로 부숨
    for (const eh of game.houses) {
      if (eh.vacant) continue;
      const owner = game.getEntity(eh.ownerId);
      if (owner && owner.familyId === enemyFam) {
        this._setState('attacking');
        this._setTarget(eh.cx, eh.cy, true);
        if (Utils.distance(this, { x: eh.cx, y: eh.cy }) < 55 && this.attackCooldown <= 0) {
          eh.takeDamage(16);
          this.attackCooldown = 1.2;
          if (eh.hp <= 0) game.destroyHouse(eh);
        }
        return true;
      }
    }
    return false;
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

  // 집 주변 500px 이내 바닥 운치 청소 — true 반환 시 행동 차지
  //   새끼들이 운치를 집 운치굴로 옮김 (낮은 우선순위)
  _cleanupFloorUnci(game, h) {
    if (!h || !game.floorUnci || game.floorUnci.length === 0) return false;
    if (this.stage >= 4 || this.slaveOf) return false;
    // 본인 집 500px 안에 있는 운치 찾기 — 같은 가족이 이미 청소 중이면 제외
    let target = null, bestD = Infinity;
    for (const u of game.floorUnci) {
      if (u.amount <= 0) continue;
      if (Utils.distance(u, { x: h.cx, y: h.cy }) > 500) continue;
      if (this._isClaimedByFamily(u, 'unci', game)) continue;
      const d = Utils.distance(this, u);
      if (d < bestD) { bestD = d; target = u; }
    }
    if (!target) return false;
    this._claimTargetK(target, 'unci');
    // 이미 운치를 들고 있으면 → 집 운치굴로 운반
    if (this._carryingUnci > 0) {
      const ux = h.unciX, uy = h.unciY;
      if (Utils.distance(this, { x: ux, y: uy }) < CONFIG.UNCI_RADIUS) {
        h.addUnci(this._carryingUnci);
        game.addParticle(this.x, this.y - 14, '🧹', '#88aa44', 1000);
        this._carryingUnci = 0;
        return true;
      }
      this._setState('cleaning');
      this._setTarget(ux, uy);
      return true;
    }
    // 바닥 운치 픽업
    if (bestD < 22) {
      const pick = Math.min(target.amount, 5);
      target.amount -= pick;
      if (target.amount <= 0) target.life = 0;
      this._carryingUnci = (this._carryingUnci ?? 0) + pick;
      return true;
    }
    this._setState('cleaning');
    this._setTarget(target.x, target.y);
    return true;
  }

  // 빈집(vacant) 중 가장 가까운 것
  // 현재 수풀에서 다른 수풀로 도망 — 없으면 위협 반대 방향으로 무조건 이동
  _fleeToAnotherBush(game, currentBush, threat = null) {
    const bushes = game.world?.bushes || [];
    let best = null, bd = Infinity;
    const now = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    for (const b of bushes) {
      if (b === currentBush) continue;
      if (b._exposedUntil && b._exposedUntil > now) continue;  // 봉인된 수풀 제외
      const d = Utils.distance(this, b);
      if (d < bd && d < 600) { bd = d; best = b; }
    }
    if (best) {
      this._setState('fleeing');
      this._setTarget(best.x, best.y, true);
      this.fleeing = true; this.fleeTimer = 4;
      game.addParticle(this.x, this.y - 22, '도망!', '#ff8844', 1500);
      return;
    }
    // 수풀이 없거나 모두 봉인 → 위협 반대 방향으로 무조건 이동
    let fx = this.x, fy = this.y;
    if (threat) { fx = threat.x; fy = threat.y; }
    else if (currentBush) { fx = currentBush.x; fy = currentBush.y; }
    const dx = this.x - fx, dy = this.y - fy;
    const dlen = Math.hypot(dx, dy) || 1;
    this._setState('fleeing');
    this._setTarget(
      Utils.clamp(this.x + (dx / dlen) * 500, 20, CONFIG.WORLD_WIDTH - 20),
      Utils.clamp(this.y + (dy / dlen) * 500, 20, CONFIG.WORLD_HEIGHT - 20),
      true);
    this.fleeing = true; this.fleeTimer = 6;
    game.addParticle(this.x, this.y - 22, '도망!', '#ff8844', 1500);
  }

  // 가장 가까운 수돗가 (없으면 분수대/연못)
  _findNearestWaterTap(game) {
    const spots = game.world?.waterSpots || [];
    let best = null, bd = Infinity;
    for (const w of spots) {
      if (w.type !== 'tap') continue;
      const d = Utils.distance(this, w);
      if (d < bd) { bd = d; best = w; }
    }
    if (best) return best;
    // 폴백
    for (const w of spots) {
      const d = Utils.distance(this, w);
      if (d < bd) { bd = d; best = w; }
    }
    return best;
  }

  // 표적이 수풀 안에 숨어있는지 — 5초간 발각된 수풀은 은신 불가
  _isHiddenInBush(target, game) {
    const bushes = game.world?.bushes;
    if (!bushes) return false;
    const now = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    for (const b of bushes) {
      const r = (b.r ?? 16);
      if (Utils.distance(target, b) < r) {
        if (b._exposedUntil && b._exposedUntil > now) continue;  // 발각된 수풀은 무효
        return true;
      }
    }
    return false;
  }

  // 수풀에 숨은 표적을 발각: 즉시 데미지 + 다른 수풀로 이동 + 5초간 수풀 봉인
  _exposeFromBush(target, game) {
    const bushes = game.world?.bushes || [];
    const now = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    let exposedBush = null;
    for (const b of bushes) {
      const r = (b.r ?? 16);
      if (Utils.distance(target, b) < r) { exposedBush = b; break; }
    }
    if (exposedBush) {
      exposedBush._exposedUntil = now + 30;
    }
    // 즉시 데미지
    this.applyAttack(target, 3, game);
    // 다른 수풀로 도망 (없으면 나(공격자) 반대 방향)
    if (target._fleeToAnotherBush) target._fleeToAnotherBush(game, exposedBush, this);
  }

  _findVacantHouse(game) {
    let best = null, bestD = Infinity;
    for (const h of game.houses) {
      if (!h.vacant) continue;
      const d = Utils.distance(this, { x: h.cx, y: h.cy });
      if (d < bestD) { bestD = d; best = h; }
    }
    return best;
  }

  // 고아: 하루마다 1000px 내 빈집 찾기 → 있으면 그쪽으로, 입주.
  // 반환 true: 이번 틱 점유
  _tryOrphanDailyResettle(game) {
    const day = game.dayIndex ?? 0;
    if (this._orphanCheckDay === day && this._orphanGoal) {
      // 이미 오늘 체크 완료 — 목표로 이동
      const g = this._orphanGoal;
      if (g.type === 'house') {
        const vac = game.getEntity(g.id);
        if (vac && vac.vacant) {
          if (Utils.distance(this, { x: vac.cx, y: vac.cy }) < 50) {
            vac.vacant = false;
            this.houseId = vac.id;
            if (!vac.ownerId) vac.ownerId = this.id;
            this.fugitive = false;
            this._orphanGoal = null;
            if (game.logEvent) game.logEvent(`🏠 고아 ${this.label}가 빈집 입주`, '#aaffaa', { x: this.x, y: this.y });
            return false; // 자유 행동으로
          }
          this._setState('going_home');
          this._setTarget(vac.cx, vac.cy);
          return true;
        }
        // 집이 사라졌으면 재검사
        this._orphanGoal = null;
      }
    }
    if (this._orphanCheckDay !== day) {
      this._orphanCheckDay = day;
      // 1000px 내 빈집
      let bestHouse = null, bd = 1000;
      for (const h of game.houses) {
        if (!h.vacant) continue;
        const d = Utils.distance(this, { x: h.cx, y: h.cy });
        if (d < bd) { bd = d; bestHouse = h; }
      }
      if (bestHouse) {
        this._orphanGoal = { type: 'house', id: bestHouse.id };
      } else {
        // 가장 가까운 분수대(fountain)
        let bestF = null, bestFD = Infinity;
        for (const w of (game.world?.waterSpots || [])) {
          if (w.type !== 'fountain') continue;
          const d = Utils.distance(this, w);
          if (d < bestFD) { bestFD = d; bestF = w; }
        }
        if (bestF) this._orphanGoal = { type: 'fountain', x: bestF.x, y: bestF.y };
      }
    }
    return false;
  }

  // 분수대 근처 고아 활동: 음식 수집 + 가끔 입양 요구
  _behaveOrphanAtFountain(dt, game) {
    const g = this._orphanGoal;
    if (!g || g.type !== 'fountain') return false;
    const d = Utils.distance(this, g);
    if (d > 60) {
      this._setState('seeking_water');
      this._setTarget(g.x, g.y);
      return true;
    }
    // 도착 — 활동
    // (1) 바닥 음식 채집
    const food = game.findNearestItem?.(this.x, this.y, 300, i => i.isFood && i.isFood(), this);
    if (food) {
      this._setState('seeking_food');
      this._setTarget(food.x, food.y, true);
      if (Utils.distance(this, food) < 14) this._pickUp && this._pickUp(food, game);
      return true;
    }
    // (2) 10% 확률 입양 요구 (5초 쿨다운)
    this._adoptCD = (this._adoptCD ?? 0) - dt;
    if (this._adoptCD <= 0) {
      this._adoptCD = 5;
      if (Math.random() < 0.10) {
        const adult = game.findNearestSiljangsuk(this.x, this.y, 250, s =>
          !s.dead && s.stage === 4 && !s.slaveOf && s.id !== this.id);
        if (adult) {
          this._setState('seeking_water');
          this._setTarget(adult.x, adult.y, true);
          if (Utils.distance(this, adult) < 28) {
            this._speech = '입양해주세요!'; this._speechTimer = 1.8;
            game.addParticle(this.x, this.y - 22, '입양해주세요!', '#ffaaff', 1500);
            adult._adoptionRequest(this, game);
            this._adoptCD = 12;
          }
          return true;
        }
      }
    }
    // 아무것도 못 찾으면 분수대 근처 배회
    this._wander(dt, game, 40);
    return true;
  }

  // 입양 요구 응답 (성격별)
  _adoptionRequest(orphan, game) {
    if (this.dead || orphan.dead) return;
    const myKids = game.siljangsukList.filter(s =>
      !s.dead && s.parentId === this.id && s.stage <= 3 && !s.slaveOf).length;
    const hasHouse = !!this.house;
    const r = Math.random();

    if (this.personality === CONFIG.PERSONALITY_CONCEPT) {
      if (myKids <= 3) {
        if (r < 0.70) return this._adoptOrphan(orphan, game);
        return this._enslaveOrphan(orphan, game);
      }
      return; // 거절
    }
    if (this.personality === CONFIG.PERSONALITY_NORMAL) {
      if (myKids <= 3 && hasHouse) {
        if (r < 0.50) return this._adoptOrphan(orphan, game);
        return this._enslaveOrphan(orphan, game);
      }
      return;
    }
    // 분충
    if (!hasHouse) {
      return this._eatOrphan(orphan, game);
    }
    if (r < 0.50) return this._eatOrphan(orphan, game);
    return this._enslaveOrphan(orphan, game);
  }

  _adoptOrphan(orphan, game) {
    orphan.parentId = this.id;
    orphan.familyId = this.familyId;
    orphan.houseId  = this.houseId;
    orphan.fugitive = false;
    orphan._orphanGoal = null;
    game.addParticle(orphan.x, orphan.y - 22, '🤝 입양됨', '#aaffaa', 2000);
    if (game.logEvent) game.logEvent(`🤝 ${this.label}가 ${orphan.label} 입양`, '#aaffaa', { x: this.x, y: this.y });
  }

  // 탈주 독라의 입양 요구 응답:
  //   운치굴 있음 → 100% 운치굴로 데려감 (성향 무관)
  //   운치굴 없음 → 개념: 무시 / 보통+분충: 잡아먹음
  _fugitiveAdoptionRequest(fugitive, game) {
    if (this.dead || fugitive.dead) return;
    const h = this.house;
    if (h && h.hasUnci) {
      // 운치굴로 강제 데려가기 — 즉시 노예화
      fugitive.slaveOf  = this.id;
      fugitive.fugitive = false;
      fugitive.wasSlave = true;
      fugitive.houseId  = h.id;
      fugitive.parentId = null;
      fugitive.x = h.unciX + Utils.random(-15, 15);
      fugitive.y = h.unciY + Utils.random(-15, 15);
      fugitive._escapeBlockUntilDay = (game.dayIndex ?? 0) + 3;
      game.addParticle(fugitive.x, fugitive.y - 20, '⛓ 운치굴', '#cc6666', 1800);
      if (game.logEvent) game.logEvent(`⛓ 탈주 독라가 ${this.label}의 운치굴에 갇힘`, '#cc6666', { x: this.x, y: this.y });
      return;
    }
    // 운치굴 없음
    if (this.personality === CONFIG.PERSONALITY_CONCEPT) {
      // 무시
      game.addParticle(this.x, this.y - 22, '...', '#aaaaaa', 1200);
      return;
    }
    // 보통/분충: 잡아먹음
    const dmg = 30;
    fugitive.hp = 0;
    fugitive._die(game, `${this.label}에게 잡아먹힘`);
    this.satiation = Math.min(this.maxSat, this.satiation + 30);
    game.addParticle(this.x, this.y - 22, '🍖 잡아먹음', '#cc4444', 1800);
    if (game.logEvent) game.logEvent(`🍖 ${this.label}가 탈주 독라 포식`, '#cc4444', { x: this.x, y: this.y });
  }

  _enslaveOrphan(orphan, game) {
    const h = this.house;
    if (!h || !h.hasUnci) {
      // 운치굴이 없으면 노예화 불가 → 입양 대신
      this._adoptOrphan(orphan, game);
      return;
    }
    orphan.slaveOf = this.id;
    orphan.wasSlave = true;
    orphan.houseId  = this.houseId;
    orphan.fugitive = false;
    orphan._orphanGoal = null;
    game.addParticle(orphan.x, orphan.y - 22, '⛓ 노예화', '#cc6666', 2000);
    if (game.logEvent) game.logEvent(`⛓ ${this.label}가 ${orphan.label} 노예화`, '#cc6666', { x: this.x, y: this.y });
  }

  _eatOrphan(orphan, game) {
    // 주변 고아들 도주
    const others = game.siljangsukList.filter(s =>
      !s.dead && s.id !== orphan.id && s.stage <= 3
      && !s.slaveOf && (s.parentId === null || s.fugitive) && !s.houseId
      && Utils.distance(s, orphan) < 250);
    for (const o of others) {
      o.fleeing = true; o.fleeTimer = 6;
      const ang = Math.atan2(o.y - orphan.y, o.x - orphan.x);
      o.targetX = Utils.clamp(o.x + Math.cos(ang) * 400, 20, CONFIG.WORLD_WIDTH - 20);
      o.targetY = Utils.clamp(o.y + Math.sin(ang) * 400, 20, CONFIG.WORLD_HEIGHT - 20);
      game.addParticle(o.x, o.y - 22, '도망!', '#ff8844', 1500);
    }
    orphan._die(game, `${this.label}에게 잡아먹힘`);
    this.satiation = Math.min(this.maxSat, this.satiation + 30);
    if (game.logEvent) game.logEvent(`🍖 ${this.label}가 ${orphan.label} 포식`, '#cc4444', { x: this.x, y: this.y });
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
    // 집이 있으면 집으로 도망 (우선)
    const h = this.house;
    if (h) {
      this._setTarget(h.cx, h.cy, true);
      this.fleeing   = true;
      this.fleeTimer = (this.stage === 4) ? 999 : 3;
      this._setState('fleeing');
      return;
    }
    // 집 없으면 반대 방향으로 도주
    const dx = this.x - fx, dy = this.y - fy;
    const n  = Utils.normalize(dx, dy);
    this._setTarget(
      Utils.clamp(this.x + n.x * 250, 20, CONFIG.WORLD_WIDTH  - 20),
      Utils.clamp(this.y + n.y * 250, 20, CONFIG.WORLD_HEIGHT - 20),
      true
    );
    this.fleeing   = true;
    this.fleeTimer = (this.stage === 4) ? 999 : 3;
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

  // ── 가족 내 목표 점유(claim) ─────────────────────────
  // target: 대상 객체. kind: 'unci' | 'pniepnie' | 'carry' (구더기 운반)
  // 같은 가족 다른 멤버가 8초 안에 claim 했으면 본인은 양보 (true 반환=차단)
  _isClaimedByFamily(target, kind, game) {
    if (!target) return false;
    const key = `_claim_${kind}_id`;
    const tKey = `_claim_${kind}_t`;
    const claimer = target[key];
    if (!claimer || claimer === this.id) return false;
    const now = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    const since = now - (target[tKey] ?? 0);
    if (since > 8) return false;
    const ent = game.getEntity ? game.getEntity(claimer) : null;
    if (!ent || ent.dead) return false;
    return ent.familyId === this.familyId;
  }
  _claimTargetK(target, kind) {
    if (!target) return;
    const now = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    target[`_claim_${kind}_id`] = this.id;
    target[`_claim_${kind}_t`]  = now;
  }

  // 행동 잠금 헬퍼 — 한 번 정한 행동은 변수가 생길 때까지 유지
  _lockAction(name, opts = {}) {
    const nowSec = (typeof performance !== 'undefined') ? performance.now() / 1000 : 0;
    this._lockedAction   = name;
    this._lockedUntil    = nowSec + (opts.duration ?? 30);   // 기본 30초 (사실상 변수 대기)
    this._lockedTarget   = opts.target ?? null;
    this._lockedSubState = opts.subState ?? null;
    this._lockPhase      = opts.phase ?? (typeof Game !== 'undefined' ? Game.dayPhase : null);
  }
  _breakActionLock() {
    this._lockedAction = null;
    this._lockedUntil = 0;
    this._lockedTarget = null;
    this._lockedSubState = null;
    this._lockPhase = null;
  }

  _setTarget(x, y, force = false) {
    const now = performance.now();
    if (this.targetX !== undefined) {
      const newD = Math.hypot(x - this.targetX, y - this.targetY);
      // 1) 노이즈 — 동일 위치 갱신은 무시
      if (newD < 8) return;
      const distToCurrent = Math.hypot(this.x - this.targetX, this.y - this.targetY);
      const reached = distToCurrent < 25;
      const since = (now - (this._lastTargetT ?? 0)) / 1000;

      if (!reached) {
        // 2) 비-force: 도달 전엔 3초간 변경 거부
        if (!force && since < 3) return;
        // 3) force 라도 0.4초 안에 30~200px 사이의 작은 변경은 거부 (진동 방지)
        //    200px 이상 큰 변경은 우선순위 변경으로 보고 허용
        if (force && since < 0.4 && newD >= 30 && newD < 200) return;
      }
    }
    this.targetX = x; this.targetY = y;
    this._lastTargetT = now;
  }
  _setState(s)      { if (this.state !== s) { this.state = s; this.stateTimer = 0; } }

  _move(dt) {
    if (this.state === 'sleeping') { return; }
    // 출산 중 (로딩) 에는 움직이지 않음
    if (this._birthState === 'loading' || this.state === 'giving_birth') return;

    if (this.fleeing) {
      this.fleeTimer -= dt;
      // 성체: 밤이 되면 도주 해제
      if (this.stage === 4 && Game.isNight) {
        this.fleeing = false; this.fleeTimer = 0;
      }
      if (this.fleeTimer <= 0) { this.fleeing = false; }
    }

    // 우회 웨이포인트: 막혔을 때 설정된 임시 목표 (144px 측면)
    let tx = this.targetX, ty = this.targetY;
    if (this._detourUntil && this._detourUntil > (typeof performance !== 'undefined' ? performance.now()/1000 : 0)
        && this._detourTarget) {
      tx = this._detourTarget.x; ty = this._detourTarget.y;
      // 도착하면 우회 종료
      if (Utils.distance(this, this._detourTarget) < 20) {
        this._detourTarget = null; this._detourUntil = 0;
      }
    }
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d > 4) {
      const s = this.speed;
      let nx = this.x + (dx / d) * s * dt;
      let ny = this.y + (dy / d) * s * dt;

      // 막힘 누적 시간 충분히 길면 모든 충돌 통과 (게임 정지 방지)
      const canPassThrough = this._stuckTime > CONFIG.STUCK_BYPASS_TIME
                          && !(this.state === 'attacking');

      let blocked = false;
      let blockerX = 0, blockerY = 0;
      if (!canPassThrough) {
        for (const h of Game.houses) {
          if (h.vacant) continue;
          if (h.ownerId === this.id) continue;
          const owner = Game.getEntity(h.ownerId);
          if (owner && owner.familyId === this.familyId) continue;
          if (Utils.distance({ x: nx, y: ny }, { x: h.cx, y: h.cy }) < CONFIG.HOUSE_COLLIDE_RADIUS) {
            nx = this.x; ny = this.y; blocked = true;
            blockerX = h.cx; blockerY = h.cy;
            break;
          }
        }
      }

      // 막혔으면 — 짧은 막힘은 측면 슬라이드, 누적되면 144px 우회 웨이포인트 설정
      if (blocked) {
        const perpX = -dy / d, perpY = dx / d;
        const side  = this._sideBias ?? (Math.random() < 0.5 ? 1 : -1);
        this._sideBias = side;
        nx = this.x + perpX * side * s * dt;
        ny = this.y + perpY * side * s * dt;
        // 누적 막힘 0.7초 이상이면 144px 우회 웨이포인트 설정
        if (this._stuckTime > 0.7 && !this._detourTarget) {
          const wpx = Utils.clamp(this.x + perpX * side * 144, 20, CONFIG.WORLD_WIDTH - 20);
          const wpy = Utils.clamp(this.y + perpY * side * 144, 20, CONFIG.WORLD_HEIGHT - 20);
          this._detourTarget = { x: wpx, y: wpy };
          this._detourUntil = (performance?.now() ?? 0) / 1000 + 3;
          this._stuckTime = 0;
        }
      } else {
        this._sideBias = null;
      }
      this.x = nx; this.y = ny;

      const moved = Math.hypot(this.x - this._lastMoveX, this.y - this._lastMoveY);
      if (moved < 0.5) this._stuckTime += dt;
      else             this._stuckTime = 0;
      this._lastMoveX = this.x;
      this._lastMoveY = this.y;
    }
    this.x = Utils.clamp(this.x, 8, CONFIG.WORLD_WIDTH  - 8);
    this.y = Utils.clamp(this.y, 8, CONFIG.WORLD_HEIGHT - 8);

    // 소풍 중 충돌 없음 — 자연스럽게 뿔뿔이 흩어진 느낌
  }

  // 소풍 모드 판정 — 자신이 소풍 선언 부모거나, 소풍 선언 부모의 자식
  _isOnPicnic() {
    if (this._picnicToday) return true;
    if (this.parentId == null || this.slaveOf) return false;
    const p = Game.getEntity(this.parentId);
    return !!(p && !p.dead && p._picnicToday);
  }

  // ── 이동 방향 계산 (스프라이트 행 결정용) ───────────
  _getDirection() {
    // 출산 로딩 중에는 화면 정면을 봄
    if (this._birthFacingFront) return 'front';
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
      // 독라(노예/탈주독라)는 사망 후에도 노예 이미지 유지
      let img;
      if ((this.slaveOf !== null || this.wasSlave) && Images.getSlave) {
        img = Images.getSlave(this.stage);
      } else {
        img = Images.get(this.stage);
      }
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
    if ((this.slaveOf !== null || this.wasSlave) && Images.getSlave) {
      img = Images.getSlave(this.stage);
    } else if (this.stage === 4 && this.pregnant && Images.getPregnant && Images.getPregnant()) {
      img = Images.getPregnant();
    } else {
      img = Images.get(this.stage);
    }
    const bob = img ? 0 : Math.sin(this.animTimer * 3) * 1.5;

    // 공격 애니메이션: 0~50% 뒤로 크게 물러남 → 50~100% 앞으로 돌진 (충돌 느낌)
    let atkOffsetX = 0, atkOffsetY = 0;
    if (this.attackAnimTimer > 0) {
      const t = 1 - this.attackAnimTimer / 0.35;
      let phase;
      if (t < 0.5) {
        // 뒤로 — sin 커브로 부드럽게 -1.0 까지
        phase = -Math.sin((t / 0.5) * Math.PI * 0.5) * 1.0;
      } else {
        // 앞으로 — 빠르게 +0.8 까지 돌진
        const f = (t - 0.5) / 0.5;
        phase = (1 - Math.pow(1 - f, 2)) * 0.8;
      }
      const dx = this.targetX - this.x, dy = this.targetY - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;
      atkOffsetX = (dx / d) * phase * 22;
      atkOffsetY = (dy / d) * phase * 22;
    }

    // 점프 모션 (운치굴 새끼 노예)
    let jumpY = 0;
    if (this._jumpAnim && this._jumpAnim > 0) {
      const t = 1 - this._jumpAnim / 0.6;     // 0 → 1
      jumpY = -Math.sin(t * Math.PI) * 14;     // 위로 14px 점프
    }

    ctx.save();
    ctx.translate(this.x + atkOffsetX, this.y + bob + atkOffsetY + jumpY);
    // 수풀에 숨어있는 새끼는 반투명
    if (this.stage <= 3 && !this.slaveOf
        && typeof Game !== 'undefined' && Game.world && this._isHiddenInBush
        && this._isHiddenInBush(this, Game)) {
      ctx.globalAlpha = 0.45;
    }
    // 수면 중에는 옆으로 누워있는 모습 (90도 회전)
    if (this.state === 'sleeping') ctx.rotate(Math.PI / 2);

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

    // 머리 위에는 사용자가 명명한 이름만 표시 — 단순 번호 / 노예 / 탈주독라 / 구더기 숨김
    if (!this.slaveOf && !this.wasSlave && this.stage !== 1) {
      const txt = this.label;
      if (txt && !txt.startsWith('#') && !txt.startsWith('독라') && !txt.startsWith('탈주독라') && !txt.startsWith('구더기')) {
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

    // 말풍선 — 수면(누워있음) 여부와 무관하게 항상 정방향으로 표시
    if (this._speech && this._speechTimer > 0) {
      ctx.save();
      // 수면 중(90도 회전)이면 반대 방향으로 회전해 정방향 복원
      if (this.state === 'sleeping') ctx.rotate(-Math.PI / 2);
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
      attacking: '공격 중', fleeing: '도주 중', going_home: '귀가 중', sleeping: '수면 중', cleaning: '운치 청소',
      giving_pniepnie: '프니프니 중', needs_pniepnie: '돌봄 필요', happy_circuit: '행복회로!',
      giving_birth: '출산 중',
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
