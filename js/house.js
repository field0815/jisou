class House {
  constructor(x, y, ownerId) {
    this.id = genId();
    this.x = x;
    this.y = y;
    this.w = CONFIG.HOUSE_WIDTH;
    this.h = CONFIG.HOUSE_HEIGHT;
    this.hp = CONFIG.HOUSE_BASE_HP;
    this.maxHp = CONFIG.HOUSE_BASE_HP;
    this.comfort = 30;
    this.ownerId = ownerId;

    // 식량 비축량 (food value 합산)
    this.foodReserves = 0;

    // 운치 (배설물) – 0~100
    this.unciAmount = 0;

    // 운치굴 위치 (집 주변 랜덤 방향)
    const angle = Math.random() * Math.PI * 2;
    this.unciX = this.cx + Math.cos(angle) * CONFIG.UNCI_DIST;
    this.unciY = this.cy + Math.sin(angle) * CONFIG.UNCI_DIST;

    // 빈집 여부 (모든 거주자 사망/이탈 시 true)
    this.vacant = false;
  }

  // 집 라벨 — 주인의 라벨 또는 '빈집'
  get label() {
    if (this.vacant) return '🏚 빈집';
    const owner = Game.getEntity(this.ownerId);
    if (owner && !owner.dead && owner.label) return `🏠 ${owner.label}의 집`;
    return '🏠 집';
  }

  // 살아있는 거주자 목록 (노예 제외)
  getOccupants() {
    return Game.siljangsukList.filter(s =>
      !s.dead && s.houseId === this.id && !s.slaveOf);
  }
  getOccupantCount() { return this.getOccupants().length; }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  isInside(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }

  isNear(px, py, r = 110) {
    return Utils.distance({ x: px, y: py }, { x: this.cx, y: this.cy }) < r;
  }

  isInUnci(px, py) {
    return Utils.distance({ x: px, y: py }, { x: this.unciX, y: this.unciY }) < CONFIG.UNCI_RADIUS;
  }

  update(dt) {
    // 안락함 자연 감소 (운치는 더이상 영향 없음)
    const comfortLoss = 0.06;
    this.comfort = Math.max(0, this.comfort - comfortLoss * dt);

    // 운치굴 자연 정화 (시간이 지나면 줄어듦)
    if (this.unciAmount > 0) {
      this.unciAmount = Math.max(0, this.unciAmount - CONFIG.UNCI_ZONE_DECAY * dt);
    }

    // _underAttack 타이머
    if (this._underAttack) {
      this._attackCooldownTimer = (this._attackCooldownTimer ?? 0) - dt;
      if (this._attackCooldownTimer <= 0) this._underAttack = false;
    }

    // 빈집 자동 감지 (거주자 0이면 vacant)
    const occ = this.getOccupantCount();
    if (!this.vacant && occ === 0) {
      this.vacant = true;
      this.ownerId = null;
      if (Game.logEvent) Game.logEvent(`🏚 집이 비었음 (빈집)`, '#999999');
    } else if (this.vacant && occ > 0) {
      this.vacant = false;
    }

    // 노예가 운치굴에 있으면 같은 집 거주자들 행복 ↑
    const slavesInUnci = Game.siljangsukList.filter(s =>
      !s.dead && s.slaveOf && this.isInUnci(s.x, s.y));
    if (slavesInUnci.length > 0) {
      const occupants = this.getOccupants();
      const gain = CONFIG.HAPPINESS_SLAVE_IN_UNCI_GAIN * slavesInUnci.length * dt;
      for (const o of occupants) o.happiness = Math.min(100, o.happiness + gain);
    }

    // stage4 이상 노예는 1마리만 — 초과분은 도살(고기로)
    const adultSlavesHere = Game.siljangsukList.filter(s =>
      !s.dead && s.slaveOf && s.stage === 4 && this.isInUnci(s.x, s.y));
    if (adultSlavesHere.length > 1) {
      // 가장 늦게 들어온 것부터 처분 (id 큰 것)
      adultSlavesHere.sort((a, b) => b.id - a.id);
      for (let i = 0; i < adultSlavesHere.length - 1; i++) {
        adultSlavesHere[i]._die(Game, '도살');
      }
    }
  }

  addLeaf() {
    this.comfort = Math.min(100, this.comfort + 6);
  }

  addFood(value) {
    this.foodReserves += value;
  }

  consumeFood(amount) {
    const consumed = Math.min(this.foodReserves, amount);
    this.foodReserves = Math.max(0, this.foodReserves - consumed);
    return consumed;
  }

  addUnci(amount) {
    this.unciAmount = this.unciAmount + amount; // 무한 누적 가능 (캡 없음)
  }

  repair(papers) {
    this.hp = Math.min(this.maxHp, this.hp + papers * 15);
  }

  takeDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    this._underAttack = true;
    this._attackCooldownTimer = 3; // 3초간 under attack
    return this.hp <= 0;
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.cx, this.cy, 120)) return;
    const { x, y, w, h, hp, maxHp, comfort } = this;

    // ── 운치굴 ─────────────────────────────────────
    const unciFill = Math.min(1, this.unciAmount / 60);
    ctx.save();
    ctx.globalAlpha = 0.3 + unciFill * 0.4;
    ctx.fillStyle = `hsl(${30 - unciFill * 20}, 60%, ${40 - unciFill * 15}%)`;
    ctx.beginPath();
    ctx.arc(this.unciX, this.unciY, CONFIG.UNCI_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save();
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#6b3e0a';
    ctx.textAlign = 'center';
    ctx.fillText('운치굴', this.unciX, this.unciY + 3);
    if (this.unciAmount > 20) {
      ctx.fillStyle = '#aa6622';
      ctx.fillText(`💩${Math.floor(this.unciAmount)}`, this.unciX, this.unciY + 14);
    }
    ctx.restore();

    // ── 집 그림자 ─────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 6, y + 8, w, h);

    const hpRatio = hp / maxHp;

    // PNG 가 있으면 우선 사용 (항상 반투명 — 내부에서 무슨 일이 일어나는지 보이게)
    const houseImg = Images.getHouse && Images.getHouse();
    if (houseImg) {
      ctx.save();
      ctx.globalAlpha = this.vacant ? 0.35 : 0.55;
      ctx.drawImage(houseImg, x - 6, y - 12, w + 12, h + 18);
      ctx.restore();
      this._drawHpAndLabel(ctx, hpRatio);
      return;
    }

    // 항상 반투명 — 내부 가시화
    ctx.save();
    ctx.globalAlpha = 0.55;
    // ── 벽 ────────────────────────────────────────
    const wallColor = hpRatio > 0.6 ? '#d4884a' : hpRatio > 0.3 ? '#b86a30' : '#8a4820';
    ctx.fillStyle = wallColor;
    ctx.fillRect(x, y + h * 0.25, w, h * 0.75);

    // ── 지붕 ──────────────────────────────────────
    const roofColor = hpRatio > 0.6 ? '#8b3e0a' : '#5a2806';
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + h * 0.28);
    ctx.lineTo(x + w / 2, y - 10);
    ctx.lineTo(x + w + 8, y + h * 0.28);
    ctx.closePath();
    ctx.fill();

    // ── 문 ────────────────────────────────────────
    ctx.fillStyle = '#5a2a08';
    ctx.fillRect(x + w / 2 - 8, y + h * 0.55, 16, h * 0.45);

    // ── 창문 ──────────────────────────────────────
    const winColor = comfort > 60 ? '#ffe88a' : '#aac8e0';
    ctx.fillStyle = winColor;
    ctx.fillRect(x + 10, y + h * 0.32, 14, 12);
    ctx.fillRect(x + w - 24, y + h * 0.32, 14, 12);
    if (comfort > 60) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ffe88a';
      ctx.beginPath();
      ctx.arc(x + 17, y + h * 0.38, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore(); // 반투명 종료

    // ── HP 바 ─────────────────────────────────────
    const bw = w;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y - 16, bw, 6);
    ctx.fillStyle = hpRatio > 0.6 ? '#44cc44' : hpRatio > 0.3 ? '#cccc44' : '#cc4444';
    ctx.fillRect(x, y - 16, bw * hpRatio, 6);

    // ── 안락함 별 ────────────────────────────────
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ffe066';
    ctx.textAlign = 'left';
    const stars = Math.round(comfort / 20);
    ctx.fillText('★'.repeat(stars), x, y - 20);

    // ── 식량 비축 표시 ─────────────────────────────
    if (this.foodReserves > 0) {
      ctx.fillStyle = '#ff9944';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`🍱${Math.floor(this.foodReserves)}`, x + w, y - 20);
    }
  }

  // PNG 모드용: HP·식량·운치 일부만 그림
  _drawHpAndLabel(ctx, hpRatio) {
    const { x, y, w, comfort } = this;
    const bw = w;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y - 16, bw, 6);
    ctx.fillStyle = hpRatio > 0.6 ? '#44cc44' : hpRatio > 0.3 ? '#cccc44' : '#cc4444';
    ctx.fillRect(x, y - 16, bw * hpRatio, 6);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ffe066';
    ctx.textAlign = 'left';
    const stars = Math.round(comfort / 20);
    ctx.fillText('★'.repeat(stars), x, y - 20);

    if (this.foodReserves > 0) {
      ctx.fillStyle = '#ff9944';
      ctx.textAlign = 'right';
      ctx.fillText(`🍱${Math.floor(this.foodReserves)}`, x + w, y - 20);
    }
  }
}
