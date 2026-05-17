const ITEM_TYPES = {
  food_bad:   { label: '맛없는 음식', color: '#c87010', shape: 'star',   foodVal: [12,15],   happy: -1  },
  food_normal:{ label: '그냥그런 음식', color: '#e8920a', shape: 'circle', foodVal: [8,13],  happy: 0   },
  food_good:  { label: '맛있는 음식', color: '#ff6060', shape: 'heart',  foodVal: [8,10], happy: 2  },
  paper:      { label: '폐지',       color: '#d8d8b0', shape: 'rect',   foodVal: [0,0],   happy: 0   },
  leaf:       { label: '낙엽',       color: '#88c038', shape: 'leaf',   foodVal: [0,0],   happy: 0   },
  pollen:     { label: '꽃가루',     color: '#ffee44', shape: 'circle', foodVal: [0,0],   happy: 0   },
  confetto:   { label: '콘페이토',   color: '#ff99cc', shape: 'star',   foodVal: [5,10],  happy: 20  },
  nail:       { label: '대못',       color: '#888888', shape: 'cross',  foodVal: [0,0],   happy: 0   },
  tarp:       { label: '방수포',     color: '#4488aa', shape: 'rect',   foodVal: [0,0],   happy: 0   },
  dodonpa:    { label: '도돈파',     color: '#aa55cc', shape: 'star',   foodVal: [0,0],   happy: -30 },
  korori:     { label: '코로리',     color: '#222222', shape: 'cross',  foodVal: [0,0],   happy: 0   },
};

class Item {
  constructor(type, x, y) {
    this.id = genId();
    this.type = type;
    this.x = x;
    this.y = y;
    this.collected = false;
    this.carriedBy = null;

    const def = ITEM_TYPES[type] || ITEM_TYPES.food_normal;
    this.label = def.label;
    this.color = def.color;
    this._shape = def.shape;
    const [fmin, fmax] = def.foodVal;
    this.foodValue = fmin === fmax ? fmin : Utils.randomInt(fmin, fmax);
    this.claimedBy = null;
    this.happinessEffect = def.happy;
  }

  isFood() { return ['food_bad','food_normal','food_good','confetto','dodonpa','korori'].includes(this.type); }
  isDodonpa() { return this.type === 'dodonpa'; }
  isKorori()  { return this.type === 'korori'; }
  isPaper() { return this.type === 'paper'; }
  isLeaf()  { return this.type === 'leaf'; }
  isPollen(){ return this.type === 'pollen'; }
  isNail()  { return this.type === 'nail'; }
  isTarp()  { return this.type === 'tarp'; }

  draw(ctx, camera) {
    if (this.collected) return;
    if (!camera.isVisible(this.x, this.y, 30)) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    this._drawShape(ctx);
    ctx.restore();
  }

  _drawShape(ctx) {
    const c = this.color;
    ctx.fillStyle = c;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;

    switch (this._shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      case 'rect':
        ctx.fillRect(-7, -5, 14, 10);
        ctx.strokeRect(-7, -5, 14, 10);
        break;
      case 'star':
        drawStar(ctx, 0, 0, 5, 7, 4);
        ctx.fill(); ctx.stroke();
        break;
      case 'leaf':
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      case 'heart':
        drawHeart(ctx, 0, 0, 7);
        ctx.fill(); ctx.stroke();
        break;
      case 'cross':
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillRect(-2, -6, 4, 12);
        break;
    }
  }
}

function drawStar(ctx, cx, cy, r1, r2, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r2 : r1;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawHeart(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.7);
  ctx.bezierCurveTo(cx - size, cy, cx - size, cy - size * 0.7, cx, cy - size * 0.3);
  ctx.bezierCurveTo(cx + size, cy - size * 0.7, cx + size, cy, cx, cy + size * 0.7);
  ctx.closePath();
}

// Random food type weighted by tier
function randomFoodType() {
  const r = Math.random();
  if (r < 0.35) return 'food_bad';
  if (r < 0.80) return 'food_normal';
  return 'food_good';
}
