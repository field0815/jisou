// PNG 이미지 로더 – images/ 폴더에 stage1.png ~ stage4.png 를 넣으면 자동 적용
const Images = {
  _imgs: {},

  load() {
    for (let i = 1; i <= 4; i++) {
      const key = `stage${i}`;
      const img = new Image();
      img.onload  = () => { this._imgs[key] = img; };
      img.onerror = () => {};   // 파일 없으면 폴백(원형) 사용
      img.src = `images/${key}.png`;
    }
    // 노예 전용 스프라이트
    for (const n of [3, 4]) {
      const key = `slave${n}`;
      const img = new Image();
      img.onload  = () => { this._imgs[key] = img; };
      img.onerror = () => {};
      img.src = `images/${key}.png`;
    }
  },

  // 해당 단계 이미지가 로드됐으면 반환, 아니면 null
  get(stage) {
    return this._imgs[`stage${stage}`] ?? null;
  },

  // 노예 전용 이미지 (stage 3 → slave3.png, stage 4 → slave4.png)
  getSlave(stage) {
    if (stage === 3 || stage === 4) {
      return this._imgs[`slave${stage}`] ?? this.get(stage);
    }
    return this.get(stage);
  },
};
