const CONFIG = {
  WORLD_WIDTH: 5000,
  WORLD_HEIGHT: 4000,

  ZOOM_MIN: 0.25,
  ZOOM_MAX: 2.5,
  CAMERA_SPEED: 350,

  // 아침 15s + 낮 120s + 저녁 20s + 밤 40s (전체 195s)
  DAY_LENGTH:     155,  // 아침(15) + 낮(120) + 저녁(20)
  NIGHT_LENGTH:   40,
  MORNING_LENGTH: 15,
  EVENING_LENGTH: 20,
  // 낮 페이즈: DAY_LENGTH - EVENING_LENGTH 부터 DAY_LENGTH 직전까지

  ITEM_SPAWN_INTERVAL: 3.5,
  MAX_ITEMS: 300,

  // [_, stage1, stage2, stage3, stage4]  (stage5 제거)
  STAGE_BASE_HP:  [0, 5,  15, 30, 50],
  STAGE_MAX_HP:   [0, 15, 30, 50, 100], // 각 단계 성장 한도 (다음 단계 기준 or 노쇠사 한도)
  STAGE_SPEED:    [0, 15, 28, 48, 72],
  STAGE_SIZE:     [0, 6,  10, 14, 20],
  STAGE_CAPACITY: [0, 0,  1,  1,  8],

  STAGE4_DEATH_HP: 100,   // 4단계 최대체력이 이에 이르면 노쇠사

  HP_REGEN_PER_SEC: 5,
  HP_HUNGER_LOSS_PER_SEC: 0.3,

  // 하루(90초) 기준: HIGH=8, MID=4, LOW=2 HP 성장
  GROWTH_RATE_LOW:    2 / 90,
  GROWTH_RATE_MID:    4 / 90,
  GROWTH_RATE_HIGH:   8 / 90,

  SATIATION_LOSS_PER_SEC:    0.3,   // 기본 (정지 시)
  SATIATION_LOSS_MOVING:     0.5,   // 이동 시 (대체)
  HUNGER_THRESHOLD: 0.3,
  FULL_THRESHOLD: 0.7,

  HAPPINESS_HUNGRY_LOSS:    0.15,
  HAPPINESS_FULL_GAIN:      0.08,
  HAPPINESS_PNIEPNIE_GAIN:  18,
  HAPPINESS_HAS_CHILD_GAIN: 0.05,   // 살아있는 자식이 있으면 (성체 기준)
  HAPPINESS_NO_HOUSE_LOSS:  0.06,   // 성체인데 집이 없으면
  HAPPINESS_DEFECATE_GAIN:  5,      // 운치굴에서 배변하면 (이벤트)
  HAPPINESS_CHILD_DEATH:    15,     // 자식이 죽으면 (이벤트, 부모 happiness -=)

  PNIEPNIE_TIMEOUT: 240,            // 2일(120s × 2) 안 받으면 사망

  // 충돌 / 단계별 크기 (px)
  STAGE_COLLISION:[0, 2, 6, 12, 24],

  PREGNANCY_DURATION: 60,
  PREGNANCY_CHANCE_PER_SEC: 0.004, // 약 250초당 1회 자동 임신 시도 (꽃가루는 추가 가속)
  BIRTH_MIN: 5,
  BIRTH_MAX: 12,

  // stage 4 도달 후 이 시간이 지나면 부모 집을 떠나 자기 집을 지음
  STAGE4_MOVEOUT_TIME: 90,         // 90초 ≈ 1일

  // 행복 추가 상수
  HAPPINESS_COMBAT_GAIN:  3,       // 공격 시도 1회마다
  HAPPINESS_PLAY_GAIN:    8,       // 놀이 1회
  HAPPINESS_SLAVE_IN_UNCI_GAIN: 0.03, // 노예가 운치굴에 있을 때 같은 집 거주자 (초당)

  // 조직 / 습격
  TRIBE_RAID_MIN_ADULTS:  20,      // 습격 가능 성체 최소 수
  TRIBE_FOOD_THRESHOLD:   5,       // 인당 비축 식량이 이 미만이면 식량 부족
  TRIBE_HOSTILITY_PER_ATTACK: 1,
  TRIBE_RAID_CHECK_INTERVAL:  20,  // 초마다 raid 트리거 체크

  HOUSE_WIDTH: 90,
  HOUSE_HEIGHT: 70,
  HOUSE_BUILD_COST: 5,
  HOUSE_MIN_SPACING: 144,           // 집간 최소 간격(px)
  HOUSE_FACILITY_MIN: 200,          // 쓰레기통/수돗가/분수대로부터 최소 거리
  HOUSE_COLLIDE_RADIUS: 64,         // 집 충돌 반지름 (128px 직경)
  UNCI_COLLIDE_RADIUS: 64,          // 운치굴 충돌 반지름 (128px 직경)
  STUCK_BYPASS_TIME: 2,             // 막힘 감지 후 이 시간(초) 지나면 통과 허용
  HOUSE_DAILY_DECAY: 25,            // 일반 집 하루 HP 소모
  HOUSE_VACANT_DAILY_DECAY: 100,    // 빈집 하루 HP 소모
  HOUSE_BASE_HP: 300,
  HOUSE_MAX_HP: 400,
  UNCI_RADIUS: 28,
  UNCI_DIST: 95,

  UNCI_ZONE_DECAY: 0.05,
  UNCI_COMFORT_PENALTY: 0.3,

  MENU_TIER1: 10,
  MENU_TIER2: 40,
  MENU_TIER3: 100,

  HUMAN_SPAWN_INTERVAL_DAY: 90,

  // 노쇠사: stage 4 도달 후 게임시간 10일 경과 시 사망
  OLDAGE_DAYS: 10,

  // 인간 주기 (며칠마다 자동 등장)
  CAT_SPAWN_DAYS:      3,
  ATTACKER_SPAWN_DAYS: 5,

  // 4대 이상 혈연 제한
  MAX_GENERATION: 4,

  // 건축 시간 (초)
  BUILD_DURATION: 5,

  PERSONALITY_BUNCHUNG: 0,
  PERSONALITY_NORMAL: 1,
  PERSONALITY_CONCEPT: 2,

  POLLEN_SPAWN_INTERVAL: 50,
  POLLEN_MAX: 6,
  POLLEN_SPEED: 40,

  UNCI_DEFECATE_INTERVAL: 30,   // 배변 주기(초)
};
