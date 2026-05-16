const Utils = {
  random(min, max) { return Math.random() * (max - min) + min; },
  randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  distance(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  normalize(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: 0, y: 0 };
    return { x: dx / len, y: dy / len };
  },

  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  lerp(a, b, t) { return a + (b - a) * t; },

  randomPersonality() {
    const r = Math.random();
    if (r < 0.3) return CONFIG.PERSONALITY_BUNCHUNG;
    if (r < 0.7) return CONFIG.PERSONALITY_NORMAL;
    return CONFIG.PERSONALITY_CONCEPT;
  },

  personalityName(p) {
    return ['분충', '보통', '개념'][p] ?? '?';
  },

  // Draw a rounded rectangle
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },
};

let _nextId = 0;
function genId() { return ++_nextId; }
