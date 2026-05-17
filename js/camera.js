class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
    this._tx = 0;
    this._ty = 0;
    this._tz = 1.0;
    this.followEntity = null; // 추적할 entity
  }

  update(dt, keys) {
    // 카메라 추적 모드
    if (this.followEntity && !this.followEntity.dead && !this.followEntity.done) {
      const tx = this.followEntity.x - this.canvas.width / (2 * this._tz);
      const ty = this.followEntity.y - this.canvas.height / (2 * this._tz);
      this._tx = tx; this._ty = ty;
    }

    const speed = CONFIG.CAMERA_SPEED / this._tz;

    if (keys['KeyW'] || keys['ArrowUp'])    this._ty -= speed * dt;
    if (keys['KeyS'] || keys['ArrowDown'])  this._ty += speed * dt;
    if (keys['KeyA'] || keys['ArrowLeft'])  this._tx -= speed * dt;
    if (keys['KeyD'] || keys['ArrowRight']) this._tx += speed * dt;

    const vw = this.canvas.width / this._tz;
    const vh = this.canvas.height / this._tz;
    const BORDER_EXT = 1200;
    this._tx = Utils.clamp(this._tx, -BORDER_EXT, Math.max(0, CONFIG.WORLD_WIDTH - vw + BORDER_EXT));
    this._ty = Utils.clamp(this._ty, -BORDER_EXT, Math.max(0, CONFIG.WORLD_HEIGHT - vh + BORDER_EXT));

    this.x    = Utils.lerp(this.x,    this._tx, 0.12);
    this.y    = Utils.lerp(this.y,    this._ty, 0.12);
    this.zoom = Utils.lerp(this.zoom, this._tz,  0.12);
  }

  onScroll(delta, mouseX, mouseY) {
    const factor = delta > 0 ? 0.88 : 1.14;
    const newZ = Utils.clamp(this._tz * factor, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);

    // Zoom toward mouse position
    const wx = mouseX / this._tz + this._tx;
    const wy = mouseY / this._tz + this._ty;
    this._tz = newZ;
    this._tx = wx - mouseX / newZ;
    this._ty = wy - mouseY / newZ;
  }

  apply(ctx) {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx) { ctx.restore(); }

  screenToWorld(sx, sy) {
    return { x: sx / this.zoom + this.x, y: sy / this.zoom + this.y };
  }

  isVisible(x, y, margin = 60) {
    const sx = (x - this.x) * this.zoom;
    const sy = (y - this.y) * this.zoom;
    return sx > -margin && sx < this.canvas.width + margin &&
           sy > -margin && sy < this.canvas.height + margin;
  }

  centerOn(x, y) {
    this._tx = x - this.canvas.width / (2 * this._tz);
    this._ty = y - this.canvas.height / (2 * this._tz);
    this.x = this._tx;
    this.y = this._ty;
  }
}
