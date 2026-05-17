// PNG 이미지 로더 – images/ 폴더에 stage1.png ~ stage4.png 를 넣으면 자동 적용
const Images = {
  _imgs: {},

  // 월드 배경에 영향을 주는 이미지가 로드되면 캐시 무효화
  _BG_KEYS: new Set(['tile', 'smalltree', 'tree', 'watergen1', 'watergen2', 'watergen3']),
  _onImageLoaded(key, img) {
    this._imgs[key] = img;
    if (this._BG_KEYS.has(key) && typeof Game !== 'undefined' && Game.world) {
      Game.world._bgDirty = true;
    }
  },

  load() {
    // 실장석 단계 (4)
    for (let i = 1; i <= 4; i++) {
      const key = `stage${i}`;
      const img = new Image();
      img.onload  = () => this._onImageLoaded(key, img);
      img.onerror = () => {};
      img.src = `images/${key}.png`;
    }
    // 노예 (1~4)
    for (const n of [1, 2, 3, 4]) {
      const key = `slave${n}`;
      const img = new Image();
      img.onload  = () => this._onImageLoaded(key, img);
      img.onerror = () => {};
      img.src = `images/${key}.png`;
    }
    // 개별 단일 이미지
    const singles = ['house', 'poo_cave', 'stage4_pregnant'];
    const singleKeyMap = { house: 'house', poo_cave: 'poo_cave', stage4_pregnant: 'stage4_pregnant' };
    for (const file of singles) {
      const img = new Image();
      img.onload  = () => this._onImageLoaded(singleKeyMap[file], img);
      img.onerror = () => {};
      img.src = `images/${file}.png`;
    }
    // 월드 타일 + 인간/쓰레기통 (배경 캐시 영향)
    const extras = ['tile', 'smalltree', 'tree', 'watergen1', 'watergen2', 'watergen3',
                    'human_attack', 'human_love', 'trashbox'];
    for (const key of extras) {
      const img = new Image();
      img.onload  = () => this._onImageLoaded(key, img);
      img.onerror = () => {};
      img.src = `images/${key}.png`;
    }
  },

  getHouse()    { return this._imgs.house           ?? null; },
  getPooCave()  { return this._imgs.poo_cave        ?? null; },
  getPregnant() { return this._imgs.stage4_pregnant ?? null; },
  getTile()     { return this._imgs.tile      ?? null; },
  getSmallTree(){ return this._imgs.smalltree ?? null; },
  getTree()     { return this._imgs.tree      ?? null; },
  getWatergen1(){ return this._imgs.watergen1 ?? null; }, // 분수대
  getWatergen2(){ return this._imgs.watergen2 ?? null; }, // 수돗가
  getWatergen3(){ return this._imgs.watergen3 ?? null; }, // 연못 (맵 우측상단)
  getHumanAttack(){ return this._imgs.human_attack ?? null; }, // 애호파(공급형)
  getHumanLove()  { return this._imgs.human_love   ?? null; }, // 학대파(공격형)
  getTrashbox()   { return this._imgs.trashbox     ?? null; },

  // 해당 단계 이미지가 로드됐으면 반환, 아니면 null
  get(stage) {
    return this._imgs[`stage${stage}`] ?? null;
  },

  // 노예 전용 이미지 (1~4단계)
  getSlave(stage) {
    if (stage >= 1 && stage <= 4) {
      return this._imgs[`slave${stage}`] ?? this.get(stage);
    }
    return this.get(stage);
  },
};
