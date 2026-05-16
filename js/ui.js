// ── UI Manager ──────────────────────────────────────────
class UI {
  constructor() {
    this.selectedMenu = -1;  // index into MENU_ITEMS
    this.selectedEntity = null;
    this.announcements = [];
    this.showHelp = false;
    this.viewingUnci = false;
  }

  announce(text) {
    this.announcements.push(new AnnouncementBanner(text));
  }

  update(dt) {
    this.announcements = this.announcements.filter(a => { a.update(dt); return !a.done; });
  }

  draw(ctx, canvas, game) {
    this._drawDayNightBar(ctx, canvas, game);
    this._drawBottomBar(ctx, canvas, game);
    this._drawStatPanel(ctx, canvas, game);
    this._drawPopCount(ctx, canvas, game);
    this._drawEventLog(ctx, canvas, game);
    this._drawHelp(ctx, canvas);
    for (const a of this.announcements) a.draw(ctx, canvas);
  }

  // ── 이벤트 로그 (메뉴바 위쪽) ───────────────────────────
  _drawEventLog(ctx, canvas, game) {
    const events = game.events || [];
    if (events.length === 0) return;

    const menuTop = canvas.height - 84 - 26;   // 메뉴바 위쪽
    const lineH   = 18;
    const maxLines = 6;
    const visible = events.slice(-maxLines);

    ctx.save();
    ctx.font      = '12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';

    for (let i = 0; i < visible.length; i++) {
      const ev = visible[i];
      const idx = visible.length - 1 - i;        // 최신 = 가장 아래
      const y   = menuTop - idx * lineH;

      // 페이드 (마지막 2초)
      let alpha = 1;
      if (ev.time > 7)      alpha = Math.max(0, 1 - (ev.time - 7) / 2);
      else if (ev.time < 0.25) alpha = ev.time / 0.25;
      if (alpha <= 0) continue;

      const tw = ctx.measureText(ev.text).width;
      ctx.globalAlpha = alpha * 0.75;
      ctx.fillStyle   = 'rgba(10,8,5,0.85)';
      Utils.roundRect(ctx, 12, y - 13, tw + 16, 18, 4);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = ev.color;
      ctx.fillText(ev.text, 20, y);
    }
    ctx.restore();
  }

  // ── Day/Night bar ───────────────────────────────────────
  _drawDayNightBar(ctx, canvas, game) {
    const bw = 200, bh = 14, bx = canvas.width / 2 - bw / 2, by = 10;
    const ratio = game.dayTime / (CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    Utils.roundRect(ctx, bx - 4, by - 4, bw + 8, bh + 8, 6);
    ctx.fill();

    // Bar gradient (day blue → night dark)
    const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    grad.addColorStop(0,   '#87ceeb');
    grad.addColorStop(CONFIG.DAY_LENGTH / (CONFIG.DAY_LENGTH + CONFIG.NIGHT_LENGTH), '#f0a040');
    grad.addColorStop(1,   '#1a1a3e');
    ctx.fillStyle = grad;
    Utils.roundRect(ctx, bx, by, bw, bh, 4);
    ctx.fill();

    // Cursor
    ctx.fillStyle = '#fff';
    const cx2 = bx + ratio * bw;
    ctx.fillRect(cx2 - 2, by - 2, 4, bh + 4);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const min  = Math.floor(game.dayTime / 60);
    const sec  = Math.floor(game.dayTime % 60);
    const phaseEmoji = { morning: '🌅 아침', day: '☀️ 낮', evening: '🌆 저녁', night: '🌙 밤' };
    const label = `${phaseEmoji[game.dayPhase] ?? '☀️'} ${min}:${String(sec).padStart(2,'0')}`;
    ctx.fillText(label, canvas.width / 2, by + bh + 16);
  }

  // ── Population count ────────────────────────────────────
  _drawPopCount(ctx, canvas, game) {
    const alive = game.siljangsukList.filter(s => !s.dead).length;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    Utils.roundRect(ctx, 10, 10, 130, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`실장석: ${alive}마리`, 18, 29);
  }

  // ── Bottom menu bar ─────────────────────────────────────
  _drawBottomBar(ctx, canvas, game) {
    const alive  = game.siljangsukList.filter(s => !s.dead).length;
    const items  = MENU_ITEMS.filter(m => alive >= m.unlock || game.cheatUnlockAll);
    const iw = 68, ih = 68, gap = 6;

    // "없음" 버튼 포함해서 전체 너비 계산
    const noneW = 52;
    const totalW = noneW + gap + items.length * (iw + gap) - gap;
    const startX = canvas.width / 2 - totalW / 2;
    const baseY  = canvas.height - ih - 16;

    // Background
    ctx.fillStyle = 'rgba(20,15,10,0.75)';
    Utils.roundRect(ctx, startX - 12, baseY - 10, totalW + 24, ih + 20, 12);
    ctx.fill();

    // "없음" 버튼
    const noneSelected = this.selectedMenu === -1;
    ctx.fillStyle = noneSelected ? 'rgba(180,100,100,0.4)' : 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = noneSelected ? '#ff8888' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = noneSelected ? 2 : 1;
    Utils.roundRect(ctx, startX, baseY + (ih - 52) / 2, noneW, 52, 7);
    ctx.fill(); ctx.stroke();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', startX + noneW / 2, baseY + (ih - 52) / 2 + 30);
    ctx.fillStyle = '#bbb';
    ctx.font = '10px sans-serif';
    ctx.fillText('없음', startX + noneW / 2, baseY + (ih - 52) / 2 + 48);

    const itemsStartX = startX + noneW + gap;

    items.forEach((item, i) => {
      const x = itemsStartX + i * (iw + gap);
      const y = baseY;
      const sel = this.selectedMenu === i;

      ctx.fillStyle = sel ? 'rgba(255,220,80,0.3)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = sel ? '#ffe066' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = sel ? 2.5 : 1;
      Utils.roundRect(ctx, x, y, iw, ih, 8);
      ctx.fill(); ctx.stroke();

      ctx.font = `${iw * 0.42}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, x + iw / 2, y + ih * 0.54);

      ctx.fillStyle = '#ddd';
      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillText(item.label, x + iw / 2, y + ih - 8);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 4, y + 13);
    });

    // 버튼 영역 저장 (클릭 처리용)
    this._menuNoneBtn = { x: startX, y: baseY + (ih - 52) / 2, w: noneW, h: 52 };
    this._menuItemsStartX = itemsStartX;
    this._menuItemW = iw;
    this._menuItemH = ih;
    this._menuItemGap = gap;
    this._menuBaseY = baseY;
    this._menuItemCount = items.length;
  }

  // ── Entity status panel ─────────────────────────────────
  _drawStatPanel(ctx, canvas, game) {
    const ent = this.selectedEntity;
    if (!ent || ent.dead || ent.done) { this.selectedEntity = null; return; }

    const pw = 250, ph = 260;
    const px = 14, py = canvas.height - ph - 120;

    ctx.fillStyle = 'rgba(10,8,5,0.82)';
    ctx.strokeStyle = 'rgba(255,220,100,0.4)';
    ctx.lineWidth = 1.5;
    Utils.roundRect(ctx, px, py, pw, ph, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';

    if (ent instanceof Siljangsuk) {
      const info = ent.getStatusText();
      const headerText = `${info.label} · ${info.stage} (${info.personality})`;
      ctx.fillText(headerText, px + 12, py + 22);

      // ── 이름변경 버튼 (헤더 우측) ───────────────────
      const rbW = 56, rbH = 20;
      const rbX = px + pw - rbW - 10, rbY = py + 8;
      ctx.fillStyle   = 'rgba(120,180,255,0.25)';
      ctx.strokeStyle = '#88bbff';
      ctx.lineWidth   = 1;
      Utils.roundRect(ctx, rbX, rbY, rbW, rbH, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#cfe3ff';
      ctx.font      = 'bold 10px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✏️ 이름', rbX + rbW / 2, rbY + 14);
      this._renameBtn = { x: rbX, y: rbY, w: rbW, h: rbH, target: ent };

      const lines = [
        ['HP',    info.hp],
        ['포만',  info.satiation],
        ['행복',  info.happiness],
        ['상태',  info.state],
        ['아이템', `${info.items}개`],
        ['임신',  info.pregnant],
        ['신분',  info.slave],
      ];
      ctx.font = '12px "Noto Sans KR", sans-serif';
      lines.forEach(([k, v], i) => {
        const ly = py + 44 + i * 26;
        ctx.fillStyle = '#aaa';
        ctx.fillText(`${k}:`, px + 12, ly);
        ctx.fillStyle = '#eee';
        ctx.fillText(v, px + 72, ly);

        // Satiation bar
        if (k === '포만') {
          const bw = 80, bh = 6, bx = px + 155, by2 = ly - 8;
          ctx.fillStyle = '#333';
          ctx.fillRect(bx, by2, bw, bh);
          ctx.fillStyle = '#44aaff';
          ctx.fillRect(bx, by2, bw * ent.satRatio, bh);
        }
      });

      // Pniepnie button for stage 1
      if (ent.stage === 1) {
        const bx = px + 12, by2 = py + ph - 42;
        ctx.fillStyle = 'rgba(255,170,255,0.3)';
        ctx.strokeStyle = '#ffaaff';
        ctx.lineWidth = 1.5;
        Utils.roundRect(ctx, bx, by2, pw - 24, 30, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffaaff';
        ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🤲 프니프니 해주기', px + pw / 2, by2 + 20);
        this._pniepnieBtn = { x: bx, y: by2, w: pw - 24, h: 30, target: ent };
      } else {
        this._pniepnieBtn = null;
      }

    } else {
      this._renameBtn = null;
    }
    if (ent instanceof House) {
      const title = this.viewingUnci ? '💩 운치굴' : '🏠 집';
      ctx.fillText(title, px + 12, py + 22);

      if (this.viewingUnci) {
        const lines = [
          ['운치량',  `${Math.floor(ent.unciAmount)} / 100`],
          ['안락함 영향', ent.unciAmount > 30 ? '심각' : ent.unciAmount > 10 ? '보통' : '양호'],
        ];
        ctx.font = '12px "Noto Sans KR", sans-serif';
        lines.forEach(([k, v], i) => {
          const ly = py + 44 + i * 26;
          ctx.fillStyle = '#aaa';
          ctx.fillText(`${k}:`, px + 12, ly);
          ctx.fillStyle = ent.unciAmount > 50 ? '#ff6644' : '#eee';
          ctx.fillText(v, px + 100, ly);
        });
        // 운치 바
        const bw = pw - 24, bh = 8, by2 = py + 100;
        ctx.fillStyle = '#333';
        ctx.fillRect(px + 12, by2, bw, bh);
        const ratio = ent.unciAmount / 100;
        ctx.fillStyle = ratio > 0.6 ? '#cc4400' : ratio > 0.3 ? '#aa7700' : '#887700';
        ctx.fillRect(px + 12, by2, bw * ratio, bh);
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('※ 1단계 새끼는 운치굴에서 운치를 식량으로 소비', px + 12, by2 + 22);
      } else {
        const hpRatio = ent.hp / ent.maxHp;
        const lines = [
          ['HP',     `${Math.floor(ent.hp)} / ${ent.maxHp}`],
          ['안락함',  `${Math.floor(ent.comfort)}%`],
          ['비축 식량', `${Math.floor(ent.foodReserves)}`],
          ['운치',   `${Math.floor(ent.unciAmount)} / 100`],
        ];
        ctx.font = '12px "Noto Sans KR", sans-serif';
        lines.forEach(([k, v], i) => {
          const ly = py + 44 + i * 26;
          ctx.fillStyle = '#aaa';
          ctx.fillText(`${k}:`, px + 12, ly);
          ctx.fillStyle = '#eee';
          ctx.fillText(v, px + 80, ly);
          if (k === 'HP') {
            const bw = 68, bh = 5, bxb = px + 170, by2 = ly - 8;
            ctx.fillStyle = '#333';
            ctx.fillRect(bxb, by2, bw, bh);
            ctx.fillStyle = hpRatio > 0.6 ? '#44cc44' : hpRatio > 0.3 ? '#cccc44' : '#cc4444';
            ctx.fillRect(bxb, by2, bw * hpRatio, bh);
          }
          if (k === '안락함') {
            const bw = 68, bh = 5, bxb = px + 170, by2 = ly - 8;
            ctx.fillStyle = '#333';
            ctx.fillRect(bxb, by2, bw, bh);
            ctx.fillStyle = '#66ccff';
            ctx.fillRect(bxb, by2, bw * (ent.comfort / 100), bh);
          }
        });
      }
    } else if (ent instanceof Human) {
      ctx.fillText(ent.label, px + 12, py + 22);
    }
  }

  // ── Help overlay ────────────────────────────────────────
  _drawHelp(ctx, canvas) {
    // Help 버튼은 배속 버튼 왼쪽에 배치 (배속 버튼: 우상단 ~196px)
    const helpBtnX = canvas.width - 230;
    if (!this.showHelp) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      Utils.roundRect(ctx, helpBtnX, 10, 32, 22, 5);
      ctx.fill();
      ctx.fillStyle = '#ccc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', helpBtnX + 16, 25);
      this._helpBtnArea = { x: helpBtnX, y: 10, w: 32, h: 22 };
      return;
    }
    this._helpBtnArea = { x: helpBtnX, y: 10, w: 32, h: 22 };

    ctx.fillStyle = 'rgba(10,8,5,0.88)';
    Utils.roundRect(ctx, canvas.width - 260, 10, 250, 220, 10);
    ctx.fill();

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('조작법', canvas.width - 248, 30);
    const helps = [
      'WASD / 화살표: 카메라 이동',
      '마우스 휠: 확대/축소',
      '1~7: 아이템 선택 / 없음버튼: 해제',
      '클릭(맵): 선택 아이템 배치',
      '클릭(실장석/집/인간): 상태 확인',
      '1단계 패널 → 프니프니 버튼',
      'F5: 저장  F9: 불러오기',
      'Space: 일시정지  H: 도움말',
      '배속 버튼(우상단): 1×/2×/4×/8×',
    ];
    ctx.fillStyle = '#ccc';
    ctx.font = '11px "Noto Sans KR", sans-serif';
    helps.forEach((t, i) => ctx.fillText(t, canvas.width - 248, 52 + i * 20));
  }

  // ── Click handling ──────────────────────────────────────
  handleClick(wx, wy, game) {
    // Pniepnie button
    if (this._pniepnieBtn) {
      const b = this._pniepnieBtn;
      // Note: button is in screen coords, wx/wy are world coords – handled in game.js
    }

    // Select entity
    const PICK_RADIUS = 22;
    let picked = null;

    for (const s of game.siljangsukList) {
      if (!s.dead && Utils.distance({ x: wx, y: wy }, s) < PICK_RADIUS) {
        picked = s; break;
      }
    }
    if (!picked) {
      for (const h of game.houses) {
        if (wx >= h.x && wx <= h.x + h.w && wy >= h.y && wy <= h.y + h.h) {
          picked = h; break;
        }
      }
    }
    if (!picked) {
      for (const h of game.humans) {
        if (!h.done && Utils.distance({ x: wx, y: wy }, h) < 30) {
          picked = h; break;
        }
      }
    }

    this.selectedEntity = picked;
    return picked;
  }

  handleRenameClick(screenX, screenY, game) {
    if (!this._renameBtn) return false;
    const b = this._renameBtn;
    if (screenX >= b.x && screenX <= b.x + b.w &&
        screenY >= b.y && screenY <= b.y + b.h) {
      const target = b.target;
      if (target && !target.dead) {
        const cur = target.name ?? '';
        const v   = window.prompt('이름을 입력하세요 (비우면 제거):', cur);
        if (v !== null) {
          const trimmed = v.trim().slice(0, 12);
          target.name = trimmed.length === 0 ? null : trimmed;
          if (target.name) {
            game.addParticle(target.x, target.y - 30, `"${target.name}"`, '#ffe066', 1800);
          }
        }
      }
      return true;
    }
    return false;
  }

  handlePniepnieClick(screenX, screenY, game) {
    if (!this._pniepnieBtn) return false;
    const b = this._pniepnieBtn;
    if (screenX >= b.x && screenX <= b.x + b.w &&
        screenY >= b.y && screenY <= b.y + b.h) {
      const target = b.target;
      if (target && !target.dead && target.stage === 1) {
        target.pniepnieTimer = 0;
        target.happiness = Math.min(100, target.happiness + CONFIG.HAPPINESS_PNIEPNIE_GAIN);
        game.addParticle(target.x, target.y - 20, '프니프니!', '#ffaaff', 1500);
      }
      return true;
    }
    return false;
  }
}

// ── Menu item definitions ────────────────────────────────
const MENU_ITEMS = [
  { label: '음식물',   icon: '🍱', type: 'food',    unlock: 0  },
  { label: '폐지',     icon: '📄', type: 'paper',   unlock: 0  },
  { label: '낙엽',     icon: '🍂', type: 'leaf',    unlock: 0  },
  { label: '꽃가루',   icon: '🌸', type: 'pollen',  unlock: CONFIG.MENU_TIER1 },
  { label: '콘페이토', icon: '🍬', type: 'confetto',unlock: CONFIG.MENU_TIER1 },
  { label: '대못',     icon: '🔩', type: 'nail',    unlock: CONFIG.MENU_TIER2 },
  { label: '방수포',   icon: '🏕️', type: 'tarp',    unlock: CONFIG.MENU_TIER2 },
  { label: '공급형 인간', icon: '🧑', type: 'human_1', unlock: 0 },
  { label: '공격형 인간', icon: '👊', type: 'human_2', unlock: 0 },
  { label: '고양이',      icon: '🐱', type: 'cat',     unlock: 0 },
];
