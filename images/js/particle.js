class Particle {
  constructor(x, y, text, color = '#ffffff', duration = 1500) {
    this.x = x;
    this.y = y;
    this.vy = -55;
    this.text = text;
    this.color = color;
    this.duration = duration;
    this.elapsed = 0;
    this.done = false;
  }

  update(dt) {
    this.elapsed += dt * 1000;
    this.y += this.vy * dt;
    this.vy *= 0.96;
    if (this.elapsed >= this.duration) this.done = true;
  }

  draw(ctx, camera) {
    if (this.done) return;
    if (!camera.isVisible(this.x, this.y, 100)) return;
    const alpha = 1 - this.elapsed / this.duration;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
    ctx.fillStyle = this.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Big announcement particle (공원개발)
class AnnouncementBanner {
  constructor(text) {
    this.text = text;
    this.elapsed = 0;
    this.duration = 3500;
    this.done = false;
  }

  update(dt) {
    this.elapsed += dt * 1000;
    if (this.elapsed >= this.duration) this.done = true;
  }

  draw(ctx, canvas) {
    if (this.done) return;
    const t = this.elapsed / this.duration;
    let alpha;
    if (t < 0.15) alpha = t / 0.15;
    else if (t > 0.75) alpha = 1 - (t - 0.75) / 0.25;
    else alpha = 1;

    const y = canvas.height / 2 - 60 + Math.sin(t * Math.PI) * -20;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 30;
    ctx.font = 'bold 40px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#ffe066';
    ctx.strokeStyle = '#7a5500';
    ctx.lineWidth = 5;
    ctx.textAlign = 'center';
    ctx.strokeText(this.text, canvas.width / 2, y);
    ctx.fillText(this.text, canvas.width / 2, y);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🌟 공원 개발 🌟', canvas.width / 2, y + 40);

    ctx.restore();
  }
}
