// Human / Cat entities
// Type 0 = 무시형 (ignorer – kicks approaching siljangsuk)
// Type 1 = 공급형 (feeder – drops food items)
// Type 2 = 공격형 (attacker – hunts siljangsuk)
// Type 3 = cat (wanders, attacks like type 2 but faster)

const HUMAN_COLORS = ['#5588ee', '#66cc66', '#ee5555', '#ff9944'];
const HUMAN_LABELS = ['방치파', '애호파', '학대파', '고양이'];

class Human {
  constructor(type) {
    this.id   = genId();
    this.type = type; // 0-3

    // Spawn on a random edge
    const side = Utils.randomInt(0, 3);
    const W = CONFIG.WORLD_WIDTH, H = CONFIG.WORLD_HEIGHT;
    if (side === 0) { this.x = Utils.random(0, W); this.y = 0; }
    else if (side === 1) { this.x = W; this.y = Utils.random(0, H); }
    else if (side === 2) { this.x = Utils.random(0, W); this.y = H; }
    else                 { this.x = 0; this.y = Utils.random(0, H); }

    this.targetX  = Utils.random(W * 0.1, W * 0.9);
    this.targetY  = Utils.random(H * 0.1, H * 0.9);
    // 학대파(type 2)는 매우 빠르고 강함, 거의 죽지 않음
    this.speed = type === 3 ? 160 : (type === 2 ? 220 : 95);
    this.hp    = type === 3 ? 30  : (type === 2 ? 500 : 60);
    this.maxHp    = this.hp;
    this.done     = false;
    this.stateTimer = 0;
    this.attackCooldown = 0;
    this.feedCooldown   = 0;
    this.kickCooldown   = 0;

    // How long before they leave
    this.lifetime = type === 1
      ? Utils.random(25, 40)  // feeders leave sooner
      : Utils.random(40, 80);
    this.elapsed  = 0;
  }

  get label() { return HUMAN_LABELS[this.type]; }

  update(dt, game) {
    if (this.done) return;
    this.elapsed        += dt;
    this.attackCooldown  = Math.max(0, this.attackCooldown - dt);
    this.feedCooldown    = Math.max(0, this.feedCooldown - dt);
    this.kickCooldown    = Math.max(0, this.kickCooldown - dt);

    if (this.hp <= 0)               { this.done = true; return; }
    if (this.elapsed >= this.lifetime) { this.done = true; return; }

    switch (this.type) {
      case 0: this._behaviorIgnorer(dt, game);  break;
      case 1: this._behaviorFeeder(dt, game);   break;
      case 2: this._behaviorAttacker(dt, game); break;
      case 3: this._behaviorCat(dt, game);      break;
    }

    this._move(dt);
  }

  _behaviorIgnorer(dt, game) {
    // Kick any siljangsuk that gets too close
    if (this.kickCooldown <= 0) {
      const nearby = game.findNearestSiljangsuk(this.x, this.y, 60, s => !s.dead);
      if (nearby) {
        nearby._fleeFrom(this.x, this.y);
        nearby.happiness = Math.max(0, nearby.happiness - 10);
        game.addParticle(nearby.x, nearby.y - 18, '쫓겨남!', '#ff8800', 1200);
        this.kickCooldown = 3;
      }
    }
    this._wanderAround(dt);
  }

  _behaviorFeeder(dt, game) {
    // Drop food periodically
    if (this.feedCooldown <= 0) {
      const type = Utils.randomChoice(['food_good', 'food_normal', 'confetto']);
      game.spawnItem(type, this.x + Utils.random(-40, 40), this.y + Utils.random(-40, 40));
      game.addParticle(this.x, this.y - 24, '음식 배급!', '#66ee66', 1200);
      this.feedCooldown = Utils.random(3, 6);
    }
    this._wanderAround(dt);
  }

  _behaviorAttacker(dt, game) {
    // 학대파: 성체 위주로 공격, 집도 파괴, 반격 불가(반격 무효 처리)
    let target = game.findNearestSiljangsuk(this.x, this.y, 1200, s => !s.dead && !s.hidden && s.stage === 4);
    if (!target) target = game.findNearestSiljangsuk(this.x, this.y, 800, s => !s.dead && !s.hidden);
    if (target) {
      this.targetX = target.x;
      this.targetY = target.y;
      if (Utils.distance(this, target) < 32 && this.attackCooldown <= 0) {
        const dmg = 40;            // 매우 강함
        target.hp = Math.max(0, target.hp - dmg);
        target.hitFlashTimer = 0.35;
        // 반격 불가: lastAttackerId 안 세팅
        game.addParticle(target.x, target.y - 18, `-${dmg}(학대)`, '#ff0000', 1200);
        for (let i = 0; i < 5; i++) {
          game.addParticle(target.x + Utils.random(-8, 8), target.y - 6, '•', '#cc1818', 700);
        }
        this.attackCooldown = 0.6;
      }
      return;
    }
    // 타겟 없으면 집 파괴 시도
    if (game.houses && game.houses.length > 0) {
      let nearestHouse = null, bestD = 1500;
      for (const h of game.houses) {
        const d = Utils.distance(this, { x: h.cx, y: h.cy });
        if (d < bestD) { bestD = d; nearestHouse = h; }
      }
      if (nearestHouse) {
        this.targetX = nearestHouse.cx;
        this.targetY = nearestHouse.cy;
        if (bestD < 55 && this.attackCooldown <= 0) {
          nearestHouse.takeDamage(25);
          this.attackCooldown = 0.8;
          game.addParticle(nearestHouse.cx, nearestHouse.cy, '💥', '#ff0000', 800);
          if (nearestHouse.hp <= 0) game.destroyHouse(nearestHouse);
        }
        return;
      }
    }
    this._wanderAround(dt);
  }

  _behaviorCat(dt, game) {
    // Like attacker but prefers smaller stages
    const target = game.findNearestSiljangsuk(this.x, this.y, 500,
      s => !s.dead && !s.hidden && s.stage <= 3);
    if (target) {
      this.targetX = target.x;
      this.targetY = target.y;
      if (Utils.distance(this, target) < 28 && this.attackCooldown <= 0) {
        const dmg = 10;
        target.hp = Math.max(0, target.hp - dmg);
        // 실장석이 반격 여부를 스스로 판단하게 함
        target.lastAttackerId    = this.id;
        target.counterAttackTimer = 5;
        game.addParticle(target.x, target.y - 18, `-${dmg}`, '#ff6622', 900);
        this.attackCooldown = 0.9;
      }
    } else {
      this._wanderAround(dt);
    }
  }

  _wanderAround(dt) {
    this.stateTimer += dt;
    if (this.stateTimer > Utils.random(5, 12) || Utils.distance(this, { x: this.targetX, y: this.targetY }) < 20) {
      this.stateTimer = 0;
      this.targetX = Utils.clamp(this.x + Utils.random(-300, 300), 30, CONFIG.WORLD_WIDTH - 30);
      this.targetY = Utils.clamp(this.y + Utils.random(-300, 300), 30, CONFIG.WORLD_HEIGHT - 30);
    }
  }

  _move(dt) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d > 5) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    }
    this.x = Utils.clamp(this.x, 0, CONFIG.WORLD_WIDTH);
    this.y = Utils.clamp(this.y, 0, CONFIG.WORLD_HEIGHT);
  }

  draw(ctx, camera) {
    if (this.done) return;
    if (!camera.isVisible(this.x, this.y, 50)) return;

    const isCat = this.type === 3;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (isCat) {
      this._drawCat(ctx);
    } else {
      this._drawHuman(ctx);
    }

    // Label
    ctx.fillStyle = HUMAN_COLORS[this.type];
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(HUMAN_LABELS[this.type], 0, -34);

    ctx.restore();
  }

  _drawHuman(ctx) {
    const c = HUMAN_COLORS[this.type];
    // Body
    ctx.fillStyle = c;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    // Head
    ctx.beginPath(); ctx.arc(0, -22, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Torso
    ctx.fillRect(-7, -14, 14, 18);
    ctx.strokeRect(-7, -14, 14, 18);
    // Legs
    ctx.fillRect(-7, 4, 5, 14);
    ctx.fillRect(2, 4, 5, 14);
    // Arms
    ctx.strokeStyle = c; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-7, -12); ctx.lineTo(-16, 0);
    ctx.moveTo( 7, -12); ctx.lineTo( 16, 0);
    ctx.stroke();
  }

  _drawCat(ctx) {
    const c = HUMAN_COLORS[3];
    ctx.fillStyle = c;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    // Body
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Head
    ctx.beginPath(); ctx.arc(14, -6, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Ears
    ctx.beginPath();
    ctx.moveTo(10, -12); ctx.lineTo(14, -18); ctx.lineTo(18, -12);
    ctx.closePath(); ctx.fill();
    // Tail
    ctx.strokeStyle = c; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-28, -12, -22, -20);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(12, -7, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(17, -7, 2, 0, Math.PI * 2); ctx.fill();
  }
}
