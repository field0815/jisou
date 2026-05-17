// ── UI Manager ──────────────────────────────────────────
class UI {
  constructor() {
    this.selectedMenu = -1;
    this.selectedCategory = -1;  // 선택된 상위 메뉴
    this.selectedEntity = null;
    this.announcements = [];
    this.showHelp = false;
    this.showTribes = false;
    this.selectedTribeId = null;
    this.viewingUnci = false;

    // 로그 패널 — 호버 시 확장, 스크롤 오프셋
    this._logHover = false;
    this._logScroll = 0;
    this._logArea = null;        // { x, y, w, h }
    this._logRowAreas = [];      // [{ x, y, w, h, pos }]

    // 상태창 드래그 위치 (null이면 기본 좌측 하단)
    this._statPanelPos = null;
    this._statDrag = null;
    this._statHeaderArea = null;

    // 다중 선택
    this._marquee = null;           // { x0, y0, x1, y1 } 월드좌표
    this._selectedIds = new Set();
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
    this._drawTribePanel(ctx, canvas, game);
    this._drawHelp(ctx, canvas);
    this._drawAddSpeechBtn(ctx, canvas);
    for (const a of this.announcements) a.draw(ctx, canvas);
  }

  // ── 이벤트 로그 (영구 + 호버 시 확장 + 클릭 시 위치 이동) ──
  _drawEventLog(ctx, canvas, game) {
    const events = game.events || [];
    if (events.length === 0) {
      this._logArea = null;
      this._logRowAreas = [];
      return;
    }

    // 호버 판정 — 메뉴바 위 + 화면 좌측 영역
    const menuTop  = canvas.height - 84 - 26;
    const lineH    = 18;
    const baseW    = 360;
    const baseLines = this._logHover ? 18 : 6;
    const totalLines = Math.min(events.length, baseLines);

    // 표시할 슬라이스 (스크롤 적용)
    const maxScroll = Math.max(0, events.length - baseLines);
    this._logScroll = Math.max(0, Math.min(this._logScroll, maxScroll));
    const start = events.length - baseLines - this._logScroll;
    const visible = events.slice(Math.max(0, start), events.length - this._logScroll);

    const areaY = menuTop - totalLines * lineH + 2;
    this._logArea = { x: 8, y: areaY, w: baseW, h: totalLines * lineH + 6 };
    this._logRowAreas = [];

    ctx.save();
    ctx.font      = '12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';

    // 호버 시 배경
    if (this._logHover) {
      ctx.fillStyle = 'rgba(10,8,5,0.9)';
      ctx.strokeStyle = 'rgba(255,220,80,0.5)';
      ctx.lineWidth = 1;
      Utils.roundRect(ctx, this._logArea.x, this._logArea.y, this._logArea.w, this._logArea.h, 6);
      ctx.fill(); ctx.stroke();
    }

    for (let i = 0; i < visible.length; i++) {
      const ev  = visible[i];
      const idx = visible.length - 1 - i;
      const y   = menuTop - idx * lineH;

      let alpha = 1;
      if (ev.time < 0.25) alpha = ev.time / 0.25;

      // 위치 정보 있으면 작은 표시 + 클릭 가능 영역
      const hasPos = !!ev.pos;
      const rowX = 12, rowY = y - 13, rowW = baseW - 24, rowH = 16;
      this._logRowAreas.push({ x: rowX, y: rowY, w: rowW, h: rowH, pos: ev.pos });

      if (!this._logHover) {
        const tw = ctx.measureText(ev.text).width;
        ctx.globalAlpha = alpha * 0.75;
        ctx.fillStyle   = 'rgba(10,8,5,0.85)';
        Utils.roundRect(ctx, 12, y - 13, tw + 16, 18, 4);
        ctx.fill();
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = hasPos ? '#ffe066' : ev.color;
      if (hasPos) ctx.fillText('📍', 20, y);
      ctx.fillStyle = ev.color;
      ctx.fillText(ev.text, hasPos ? 36 : 20, y);
    }
    if (this._logHover && events.length > baseLines) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle   = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.fillText(`◀ ▶ 휠 스크롤 · 총 ${events.length}건 (${this._logScroll}건 위)`, this._logArea.x + 8, this._logArea.y + this._logArea.h + 12);
    }
    ctx.restore();
  }

  // 마우스가 로그 위에 있는지 갱신 (game._draw 시 호출됨)
  updateLogHover(mx, my) {
    if (!this._logArea) { this._logHover = false; return; }
    const a = this._logArea;
    this._logHover = (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h);
  }

  // 로그 영역 위에서 휠 스크롤
  handleLogWheel(mx, my, deltaY) {
    if (!this._logArea) return false;
    const a = this._logArea;
    if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) {
      this._logScroll += (deltaY > 0 ? -1 : 1); // 위로 스크롤 = 과거 보기
      return true;
    }
    return false;
  }

  // 로그 클릭 → 위치로 이동 (있으면)
  handleLogClick(sx, sy, game) {
    if (!this._logRowAreas) return false;
    for (const r of this._logRowAreas) {
      if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h && r.pos) {
        game.camera.centerOn(r.pos.x, r.pos.y);
        return true;
      }
    }
    return false;
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
    const dayN = (game.dayIndex ?? 0) + 1;
    const label = `${phaseEmoji[game.dayPhase] ?? '☀️'} ${min}:${String(sec).padStart(2,'0')} · ${dayN}일차`;
    ctx.fillText(label, canvas.width / 2, by + bh + 16);
  }

  // ── Population count ────────────────────────────────────
  _drawPopCount(ctx, canvas, game) {
    const alive  = game.siljangsukList.filter(s => !s.dead && !s.slaveOf).length;
    const slaves = game.siljangsukList.filter(s => !s.dead &&  s.slaveOf).length;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    Utils.roundRect(ctx, 10, 10, 180, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`실장석: ${alive}마리 (노예 ${slaves})`, 18, 29);
  }

  // ── Bottom menu bar ─────────────────────────────────────
  _drawBottomBar(ctx, canvas, game) {
    const alive = game.siljangsukList.filter(s => !s.dead).length;
    const catW = 100, catH = 36, catGap = 6;
    const totalCatW = MENU_CATEGORIES.length * (catW + catGap) - catGap;
    const startX = canvas.width / 2 - totalCatW / 2;
    const catY = canvas.height - catH - 10;

    // 상위 메뉴 배경
    ctx.fillStyle = 'rgba(20,15,10,0.8)';
    Utils.roundRect(ctx, startX - 10, catY - 6, totalCatW + 20, catH + 12, 8);
    ctx.fill();

    this._catBtnAreas = [];
    MENU_CATEGORIES.forEach((cat, ci) => {
      const bx = startX + ci * (catW + catGap);
      const sel = this.selectedCategory === ci;
      ctx.fillStyle = sel ? 'rgba(255,220,80,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = sel ? '#ffe066' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = sel ? 2 : 1;
      Utils.roundRect(ctx, bx, catY, catW, catH, 6);
      ctx.fill(); ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(cat.icon, bx + 18, catY + catH * 0.65);
      ctx.font = 'bold 10px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#ddd';
      ctx.fillText(cat.label, bx + catW / 2 + 4, catY + catH - 6);
      this._catBtnAreas.push({ x: bx, y: catY, w: catW, h: catH, catIdx: ci });
    });

    // 선택된 카테고리의 하위 메뉴
    if (this.selectedCategory < 0) {
      this._menuItemsStartX = undefined;
      this._menuNoneBtn = null;
      return;
    }
    const cat = MENU_CATEGORIES[this.selectedCategory];
    const items = cat.items.filter(m => alive >= m.unlock || game.cheatUnlockAll);
    const iw = 64, ih = 64, gap = 5;
    const totalItemW = items.length * (iw + gap) - gap;
    const itemStartX = canvas.width / 2 - totalItemW / 2;
    const itemBaseY = catY - ih - 12;

    ctx.fillStyle = 'rgba(20,15,10,0.75)';
    Utils.roundRect(ctx, itemStartX - 8, itemBaseY - 6, totalItemW + 16, ih + 12, 8);
    ctx.fill();

    items.forEach((item, i) => {
      const x = itemStartX + i * (iw + gap);
      const y = itemBaseY;
      const sel = this.selectedMenu === i;
      ctx.fillStyle = sel ? 'rgba(255,220,80,0.3)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = sel ? '#ffe066' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = sel ? 2.5 : 1;
      Utils.roundRect(ctx, x, y, iw, ih, 8);
      ctx.fill(); ctx.stroke();
      ctx.font = `${iw * 0.42}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(item.icon, x + iw / 2, y + ih * 0.54);
      ctx.fillStyle = '#ddd';
      ctx.font = '9px "Noto Sans KR", sans-serif';
      ctx.fillText(item.label, x + iw / 2, y + ih - 7);
      // 숫자 단축키
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 4, y + 13);
    });

    // 버튼 영역 저장 (기존 코드 호환용)
    this._menuNoneBtn = null;
    this._menuItemsStartX = itemStartX;
    this._menuItemW = iw;
    this._menuItemH = ih;
    this._menuItemGap = gap;
    this._menuBaseY = itemBaseY;
    this._menuItemCount = items.length;
    this._menuCurrentItems = items;
  }

  // ── 조직 패널 (왼쪽 위, T 키 토글) ──────────────────────
  _drawTribePanel(ctx, canvas, game) {
    // 토글 버튼 (인구 카운터 아래)
    const tbx = 10, tby = 44, tbw = 80, tbh = 22;
    ctx.fillStyle = this.showTribes ? 'rgba(255,220,80,0.5)' : 'rgba(0,0,0,0.55)';
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1;
    Utils.roundRect(ctx, tbx, tby, tbw, tbh, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 11px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏛 조직 (T)', tbx + tbw / 2, tby + 15);
    this._tribeBtnArea = { x: tbx, y: tby, w: tbw, h: tbh };

    if (!this.showTribes) { this._tribeRowAreas = []; return; }

    // 조직 그룹화
    const tribes = new Map();   // familyId → { members, adults, boss, houseCount }
    for (const s of game.siljangsukList) {
      if (s.dead || s.slaveOf) continue;
      if (!tribes.has(s.familyId)) tribes.set(s.familyId, { members: 0, adults: 0, fam: s.familyId });
      const t = tribes.get(s.familyId);
      t.members++;
      if (s.stage === 4) t.adults++;
    }

    const px = 10, py = 74, pw = 280;
    const rowH = 56;
    const ph = Math.min(canvas.height - py - 40, 40 + tribes.size * rowH);

    ctx.fillStyle = 'rgba(10,8,5,0.88)';
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1.5;
    Utils.roundRect(ctx, px, py, pw, ph, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('조직 목록 (클릭→영역 강조)', px + 10, py + 18);

    this._tribeRowAreas = [];
    let i = 0;
    for (const [fam, info] of tribes) {
      const ry = py + 30 + i * rowH;
      if (ry + rowH > py + ph) break;

      const boss = game.getTribeBoss(fam);
      const selected = this.selectedTribeId === fam;
      ctx.fillStyle = selected ? 'rgba(255,220,80,0.25)' : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = selected ? '#ffe066' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = selected ? 2 : 1;
      Utils.roundRect(ctx, px + 6, ry, pw - 12, rowH - 4, 5);
      ctx.fill(); ctx.stroke();

      const name = game.tribeLabel(fam);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "Noto Sans KR", sans-serif';
      ctx.fillText(`${name}`, px + 12, ry + 15);

      ctx.fillStyle = '#bbb';
      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillText(`보스: ${boss?.label ?? '?'} · 인원 ${info.members} (성체 ${info.adults})`, px + 12, ry + 30);

      // 최고 적대 조직
      let hostile = null, hMax = 0;
      for (const [other] of tribes) {
        if (other === fam) continue;
        const v = game.getHostility(fam, other);
        if (v > hMax) { hMax = v; hostile = other; }
      }
      if (hostile !== null) {
        ctx.fillStyle = '#ff8888';
        ctx.fillText(`⚔ vs ${game.tribeLabel(hostile)} (${hMax})`, px + 12, ry + 45);
      } else {
        ctx.fillStyle = '#88cc88';
        ctx.fillText('평화 상태', px + 12, ry + 45);
      }

      this._tribeRowAreas.push({ x: px + 6, y: ry, w: pw - 12, h: rowH - 4, familyId: fam });
      i++;
    }

    // 선택된 조직 영역 강조 (월드 좌표) — game._draw 에서 따로
  }

  // ── Entity status panel ─────────────────────────────────
  _drawStatPanel(ctx, canvas, game) {
    const ent = this.selectedEntity;
    if (!ent || ent.dead || ent.done) { this.selectedEntity = null; return; }

    const pw = 260, ph = 310;
    let px = 14, py = canvas.height - ph - 120;
    if (this._statPanelPos) {
      px = Utils.clamp(this._statPanelPos.x, 0, canvas.width  - pw);
      py = Utils.clamp(this._statPanelPos.y, 0, canvas.height - ph);
    }
    // 헤더(상단 28px)를 드래그 핸들로 등록
    this._statHeaderArea = { x: px, y: py, w: pw, h: 28 };

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

      // ── 카메라 추적 버튼 (이름변경 버튼 왼쪽) ───────────────────
      const camBtnW = 26, camBtnH = 20;
      const camBtnX = px + pw - 56 - 10 - camBtnW - 4, camBtnY = py + 8;
      const isTracking = (game.camera.followEntity === ent);
      ctx.fillStyle   = isTracking ? 'rgba(80,200,80,0.4)' : 'rgba(60,80,180,0.25)';
      ctx.strokeStyle = isTracking ? '#88ff88' : '#8899ff';
      ctx.lineWidth   = 1;
      Utils.roundRect(ctx, camBtnX, camBtnY, camBtnW, camBtnH, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = isTracking ? '#aaffaa' : '#aabbff';
      ctx.font      = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷', camBtnX + camBtnW / 2, camBtnY + 15);
      this._camTrackBtn = { x: camBtnX, y: camBtnY, w: camBtnW, h: camBtnH, target: ent };

      const lines = [
        ['번호',  `#${ent.serialNo ?? '?'}`],
        ['조직',  `${game.tribeLabel(ent.familyId)}` + (ent.raidTarget ? ' (습격 중)' : ent.defendAgainst ? ' (방어 중)' : '')],
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
      const title = this.viewingUnci ? '💩 운치굴' : (ent.label ?? '🏠 집');
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
        // ── 1) 통계 라인 (HP, 안락함, 비축, 운치) ──
        const hpRatio = ent.hp / ent.maxHp;
        const lines = [
          ['HP',       `${Math.floor(ent.hp)} / ${ent.maxHp}`],
          ['안락함',   `${Math.floor(ent.comfort)}%`],
          ['비축 식량', `${Math.floor(ent.foodReserves)}`],
          ['운치',     `${Math.floor(ent.unciAmount)} / 100`],
        ];
        ctx.font = '12px "Noto Sans KR", sans-serif';
        let curY = py + 44;
        lines.forEach(([k, v], i) => {
          const ly = curY + i * 22;
          ctx.fillStyle = '#aaa';
          ctx.textAlign = 'left';
          ctx.fillText(`${k}`, px + 12, ly);
          ctx.fillStyle = '#eee';
          ctx.fillText(v, px + 90, ly);
          if (k === 'HP' || k === '안락함') {
            const bw = 70, bh = 6, bxb = px + pw - bw - 12, by2 = ly - 9;
            ctx.fillStyle = '#333';
            ctx.fillRect(bxb, by2, bw, bh);
            const ratio = k === 'HP' ? hpRatio : (ent.comfort / 100);
            ctx.fillStyle = k === 'HP'
              ? (hpRatio > 0.6 ? '#44cc44' : hpRatio > 0.3 ? '#cccc44' : '#cc4444')
              : '#66ccff';
            ctx.fillRect(bxb, by2, bw * ratio, bh);
          }
        });
        curY += lines.length * 22 + 6;

        // ── 2) 구성원 / 독라 목록 (통계 아래에 별도) ──
        const residents = game.siljangsukList.filter(s =>
          !s.dead && s.houseId === ent.id && !s.slaveOf);
        const slaves    = game.siljangsukList.filter(s => {
          if (s.dead || !s.slaveOf) return false;
          const m = game.getEntity(s.slaveOf);
          return m && m.houseId === ent.id;
        });
        ctx.font = '10px "Noto Sans KR", sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.textAlign = 'left';
        ctx.fillText(`구성원 ${residents.length}명`, px + 12, curY);
        curY += 12;
        for (const r of residents.slice(0, 5)) {
          ctx.fillStyle = '#eee';
          ctx.fillText(`· ${r.label}`, px + 18, curY);
          curY += 11;
        }
        if (residents.length > 5) {
          ctx.fillStyle = '#888';
          ctx.fillText(`· …+${residents.length - 5}`, px + 18, curY);
          curY += 11;
        }
        if (slaves.length) {
          ctx.fillStyle = '#aa7777';
          ctx.fillText(`독라 ${slaves.length}명`, px + 12, curY);
          curY += 12;
          for (const sl of slaves.slice(0, 3)) {
            ctx.fillStyle = '#cc9999';
            ctx.fillText(`· ${sl.label}`, px + 18, curY); curY += 11;
          }
          if (slaves.length > 3) {
            ctx.fillStyle = '#886666';
            ctx.fillText(`· …+${slaves.length - 3}`, px + 18, curY); curY += 11;
          }
        }
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
      'Space: 일시정지  H: 도움말  T: 조직패널',
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
    // 실장석 클릭 시 대사 출력
    if (picked && picked._say) picked._say('idle');
    return picked;
  }

  // 조직 패널 토글 버튼 / 행 클릭
  handleTribePanelClick(sx, sy, game) {
    if (this._tribeBtnArea) {
      const b = this._tribeBtnArea;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
        this.showTribes = !this.showTribes;
        return true;
      }
    }
    if (this.showTribes && this._tribeRowAreas) {
      const now = performance.now();
      for (const r of this._tribeRowAreas) {
        if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) {
          // 더블클릭 감지 — 같은 row 350ms 이내
          const lastT = this._tribeRowLastClickT ?? 0;
          const lastId = this._tribeRowLastClickId;
          if (lastId === r.familyId && (now - lastT) < 350) {
            const boss = game.getTribeBoss(r.familyId);
            if (boss) game.camera.centerOn(boss.x, boss.y);
            this._tribeRowLastClickT = 0;
          } else {
            this.selectedTribeId = (this.selectedTribeId === r.familyId) ? null : r.familyId;
            this._tribeRowLastClickT = now;
            this._tribeRowLastClickId = r.familyId;
          }
          return true;
        }
      }
    }
    return false;
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

  handleCamTrackClick(screenX, screenY, game) {
    if (!this._camTrackBtn) return false;
    const b = this._camTrackBtn;
    if (screenX >= b.x && screenX <= b.x + b.w &&
        screenY >= b.y && screenY <= b.y + b.h) {
      const target = b.target;
      if (target && !target.dead) {
        if (game.camera.followEntity === target) {
          game.camera.followEntity = null; // 토글
          game.addParticle(target.x, target.y - 20, '추적 해제', '#aaaaaa', 1200);
        } else {
          game.camera.followEntity = target;
          game.addParticle(target.x, target.y - 20, '📷 추적 중', '#88ff88', 1500);
        }
      }
      return true;
    }
    return false;
  }

  _drawAddSpeechBtn(ctx, canvas) {
    const bw = 80, bh = 28;
    const bx = canvas.width - bw - 10, by = 82;
    ctx.fillStyle = 'rgba(80,60,120,0.7)';
    ctx.strokeStyle = '#aa88ff';
    ctx.lineWidth = 1;
    Utils.roundRect(ctx, bx, by, bw, bh, 6);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ddbbff';
    ctx.font = 'bold 11px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💬 대사추가', bx + bw / 2, by + 18);
    this._addSpeechBtn = { x: bx, y: by, w: bw, h: bh };
  }
}

// ── Menu item definitions ────────────────────────────────
const MENU_CATEGORIES = [
  {
    label: '아이템 생성',
    icon: '📦',
    items: [
      { label: '음식물',   icon: '🍱', type: 'food',     unlock: 0 },
      { label: '폐지',     icon: '📄', type: 'paper',    unlock: 0 },
      { label: '낙엽',     icon: '🍂', type: 'leaf',     unlock: 0 },
      { label: '꽃가루',   icon: '🌸', type: 'pollen',   unlock: 0 },
      { label: '콘페이토', icon: '🍬', type: 'confetto', unlock: CONFIG.MENU_TIER1 },
      { label: '코로리',   icon: '💀', type: 'korori',   unlock: CONFIG.MENU_TIER2 },
      { label: '도돈파',   icon: '💜', type: 'dodonpa',  unlock: CONFIG.MENU_TIER1 },
      { label: '방수포',   icon: '🏕️', type: 'tarp',     unlock: CONFIG.MENU_TIER2 },
      { label: '대못',     icon: '🔩', type: 'nail',     unlock: CONFIG.MENU_TIER2 },
    ]
  },
  {
    label: '맵 오브젝트',
    icon: '🗺️',
    items: [
      { label: '쓰레기통', icon: '🗑️', type: 'trashcan', unlock: 0 },
      { label: '수돗가',   icon: '🚰', type: 'tap',      unlock: 0 },
      { label: '애호파',   icon: '🧑', type: 'human_1',  unlock: 0 },
      { label: '학대파',   icon: '👊', type: 'human_2',  unlock: 0 },
      { label: '일반인',   icon: '🚶', type: 'human_4',  unlock: 0 },
      { label: '고양이',   icon: '🐱', type: 'cat',      unlock: 0 },
    ]
  },
  {
    label: '관리자 도구',
    icon: '⚙️',
    items: [
      { label: '제거',       icon: '❌', type: 'remove',      unlock: 0 },
      { label: '실장역병',   icon: '🦠', type: 'plague',      unlock: 0 },
      { label: '화염방사기', icon: '🔥', type: 'flamethrower', unlock: 0 },
    ]
  },
];
// 하위호환용 평탄 목록 (기존 코드가 MENU_ITEMS 쓰는 곳을 위해)
const MENU_ITEMS = MENU_CATEGORIES.flatMap(c => c.items);
