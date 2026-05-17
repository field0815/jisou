// 꽃가루 구름 – 공원을 떠돌며 4단계 실장석에 닿으면 임신시킴
class PollenCloud {
  constructor() {
    this.id = genId();
    this.x = Utils.random(150, CONFIG.WORLD_WIDTH  - 150);
    this.y = Utils.random(150, CONFIG.WORLD_HEIGHT - 150);

    const angle  = Math.random() * Math.PI * 2;
    const spd    = CONFIG.POLLEN_SPEED;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;

    this.lifetime  = Utils.random(60, 120);
    this.animTimer = 0;
    this.done      = false;
  }

  update(dt, game) {
    if (this.done) return;
    this.animTimer += dt;
    this.lifetime  -= dt;
    if (this.lifetime <= 0) { this.done = true; return; }

    // 이동
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 벽 반사
    if (this.x < 80)                        { this.vx =  Math.abs(this.vx); }
    if (this.x > CONFIG.WORLD_WIDTH  - 80)  { this.vx = -Math.abs(this.vx); }
    if (this.y < 80)                        { this.vy =  Math.abs(this.vy); }
    if (this.y > CONFIG.WORLD_HEIGHT - 80)  { this.vy = -Math.abs(this.vy); }

    // 방향 미세 변화
    this.vx += Utils.random(-8, 8);
    this.vy += Utils.random(-8, 8);
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > CONFIG.POLLEN_SPEED * 1.8) {
      this.vx *= CONFIG.POLLEN_SPEED / spd;
      this.vy *= CONFIG.POLLEN_SPEED / spd;
    }

    // stage4 실장석 쪽으로 끌림
    const nearStage4 = game.siljangsukList.find(s => !s.dead && s.stage === 4 && !s.pregnant);
    if (nearStage4) {
      const dx = nearStage4.x - this.x;
      const dy = nearStage4.y - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d > 50 && d < 800) {
        this.vx += (dx / d) * 8;
        this.vy += (dy / d) * 8;
      }
    }

    // 4단계 실장석 접촉 → 임신 (3일 불임 기간 존중)
    for (const s of game.siljangsukList) {
      if (s.dead || s.stage !== 4 || s.pregnant) continue;
      if (game.dayIndex < (s._fertileAfterDay ?? 0)) continue;
      if (Utils.distance(this, s) < 36) {
        s.pregnant       = true;
        s.pregnancyTimer = 0;
        game.addParticle(s.x, s.y - 24, '꽃가루! 임신!', '#ffaaff', 2200);
        this.done = true;
        break;
      }
    }
  }

  draw(ctx, camera) {
    if (this.done) return;
    if (!camera.isVisible(this.x, this.y, 30)) return;

    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(this.animTimer * 3) * 0.2;

    // 중심 원
    ctx.fillStyle   = '#ffee44';
    ctx.strokeStyle = '#e8aa00';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 주변 작은 입자 6개
    ctx.fillStyle = '#ffe066';
    for (let i = 0; i < 6; i++) {
      const a  = (i / 6) * Math.PI * 2 + this.animTimer * 0.8;
      const px = this.x + Math.cos(a) * 10;
      const py = this.y + Math.sin(a) * 10;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    ctx.fillStyle  = '#996600';
    ctx.font       = '9px sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText('꽃가루', this.x, this.y - 14);

    ctx.restore();
  }
}
