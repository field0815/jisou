// BGM Manager — audio/ 폴더에 mp3/ogg 파일을 두면 자동 로드/전환
//   audio/bgm_day.mp3      낮 일반
//   audio/bgm_night.mp3    밤 (없으면 day 유지)
//   audio/bgm_raid.mp3     습격/전쟁 (없으면 day 유지)
const AudioMgr = {
  tracks:  {},
  current: null,
  currentKey: null,
  volume:  0.35,
  muted:   false,
  _started: false,

  load() {
    const list = {
      day:   'bgm/bgm_day.mp3',
      night: 'bgm/bgm_night.mp3',
      raid:  'bgm/bgm_raid.mp3',
    };
    for (const [key, src] of Object.entries(list)) {
      const a = new Audio();
      a.loop = true;
      a.preload = 'auto';
      a.volume = this.volume;
      // 파일이 없거나 디코드 실패해도 조용히 무시
      a.addEventListener('error', () => { this.tracks[key] = null; });
      a.src = src;
      this.tracks[key] = a;
    }
  },

  // 첫 사용자 입력 후에만 호출 (브라우저 autoplay 정책)
  startOnGesture() {
    if (this._started) return;
    this._started = true;
    this.playTrack('day');
  },

  playTrack(key) {
    if (this.muted) { this.currentKey = key; return; }
    const t = this.tracks[key];
    if (!t || t.error) return;
    if (this.current === t) return;
    if (this.current) { try { this.current.pause(); } catch {} }
    this.current    = t;
    this.currentKey = key;
    t.volume = this.volume;
    const p = t.play();
    if (p && p.catch) p.catch(() => {}); // 자동재생 차단 — 무시
  },

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    for (const k in this.tracks) {
      if (this.tracks[k]) this.tracks[k].volume = this.volume;
    }
  },

  // 사용자가 직접 파일을 선택해서 BGM 로드
  //   key: 'day' | 'night' | 'raid'
  //   file: File 객체 (input[type=file] 에서)
  loadFromFile(key, file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.volume = this.volume;
    a.src = url;
    a.addEventListener('error', () => { console.warn('BGM load failed:', file.name); });
    // 이전 트랙 정리
    const prev = this.tracks[key];
    if (prev && prev !== this.current) {
      try { prev.pause(); } catch {}
    }
    this.tracks[key] = a;
    this.trackNames = this.trackNames || {};
    this.trackNames[key] = file.name;
    // 현재 켜야 할 트랙이면 즉시 전환
    if (this._started && this.currentKey === key) {
      this.current = null; // 강제 갱신
      this.playTrack(key);
    } else if (!this._started) {
      // 아직 시작 안 했으면 첫 트랙으로 미리 지정
      this._started = true;
      this.playTrack(key);
    }
  },

  trackName(key) { return (this.trackNames && this.trackNames[key]) || null; },

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.current) {
      try { this.current.pause(); } catch {}
    } else if (!this.muted && this.currentKey) {
      const t = this.tracks[this.currentKey];
      if (t) { this.current = t; const p = t.play(); if (p && p.catch) p.catch(()=>{}); }
    }
  },

  // 게임 상태에 맞춰 트랙 자동 전환
  updateForState(game) {
    if (!this._started || this.muted) return;
    let want = 'day';
    if (game.raidingTribes && game.raidingTribes.size > 0) want = 'raid';
    else if (game.isNight) want = 'night';
    // 해당 트랙이 없으면 day 폴백
    if (!this.tracks[want] || this.tracks[want].error) want = 'day';
    if (this.currentKey !== want) this.playTrack(want);
  },
};
