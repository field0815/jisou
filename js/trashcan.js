// 쓰레기통 오브젝트 - 주변에서 음식/폐지 스폰
class TrashCan {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.spawnTimer = Utils.random(5, 15);
  }

  update(dt, game) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Utils.random(8, 20);
      const r = Math.random();
      const type = r < 0.6 ? randomFoodType() : 'paper';
      for (let i = 0; i < 2; i++) {
        game.spawnItem(type,
          this.x + Utils.random(-40, 40),
          this.y + Utils.random(-40, 40));
      }
    }
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, 40)) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    // 쓰레기통 그리기 (간단한 캔 모양)
    ctx.fillStyle = '#558866';
    ctx.fillRect(-10, -18, 20, 22);
    ctx.fillStyle = '#446655';
    ctx.fillRect(-12, -22, 24, 6);
    // 뚜껑
    ctx.fillStyle = '#336644';
    ctx.fillRect(-11, -24, 22, 4);
    // 라인 장식
    ctx.strokeStyle = '#224433';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-8, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(8, 2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#334';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗑', this.x, this.y + 8);
  }
}
