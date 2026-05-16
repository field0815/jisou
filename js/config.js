const CONFIG = {
  WORLD_WIDTH: 5000,
  WORLD_HEIGHT: 4000,

  ZOOM_MIN: 0.25,
  ZOOM_MAX: 2.5,
  CAMERA_SPEED: 350,

  // 하루 = 90초: 아침 10s + 낮 50s + 저녁 10s + 밤 20s
  DAY_LENGTH:     70,   // 아침+낮+저녁 (= 전체 - 밤)
  NIGHT_LENGTH:   20,
  MORNING_LENGTH: 10,
  EVENING_LENGTH: 10,
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

  SATIATION_LOSS_PER_SEC: 0.12,
  HUNGER_THRESHOLD: 0.3,
  FULL_THRESHOLD: 0.7,

  HAPPINESS_HUNGRY_LOSS:    0.15,
  HAPPINESS_FULL_GAIN:      0.08,
  HAPPINESS_PNIEPNIE_GAIN:  18,
  HAPPINESS_HAS_CHILD_GAIN: 0.05,   // 살아있는 자식이 있으면 (성체 기준)
  HAPPINESS_NO_HOUSE_LOSS:  0.06,   // 성체인데 집이 없으면
  HAPPINESS_DEFECATE_GAIN:  5,      // 운치굴에서 배변하면 (이벤트)
  HAPPINESS_CHILD_DEATH:    15,     // 자식이 죽으면 (이벤트, 부모 happiness -=)

  PNIEPNIE_TIMEOUT: 80,

  PREGNANCY_DURATION: 60,
  PREGNANCY_CHANCE_PER_SEC: 0.004, // 약 250초당 1회 자동 임신 시도 (꽃가루는 추가 가속)
  BIRTH_MIN: 5,
  BIRTH_MAX: 12,

  // stage 4 도달 후 이 시간이 지나면 부모 집을 떠나 자기 집을 지음
  STAGE4_MOVEOUT_TIME: 90,         // 90초 ≈ 1일

  HOUSE_WIDTH: 90,
  HOUSE_HEIGHT: 70,
  HOUSE_BUILD_COST: 5,
  HOUSE_BASE_HP: 100,
  HOUSE_MAX_HP: 200,
  UNCI_RADIUS: 28,
  UNCI_DIST: 95,

  UNCI_ZONE_DECAY: 0.05,
  UNCI_COMFORT_PENALTY: 0.3,

  MENU_TIER1: 10,
  MENU_TIER2: 40,
  MENU_TIER3: 100,

  HUMAN_SPAWN_INTERVAL_DAY: 90,

  PERSONALITY_BUNCHUNG: 0,
  PERSONALITY_NORMAL: 1,
  PERSONALITY_CONCEPT: 2,

  POLLEN_SPAWN_INTERVAL: 50,
  POLLEN_MAX: 6,
  POLLEN_SPEED: 40,

  UNCI_DEFECATE_INTERVAL: 30,   // 배변 주기(초)
};
