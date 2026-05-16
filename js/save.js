const SAVE_KEY = 'futaba_park_save';

const SaveLoad = {
  save(game) {
    try {
      const data = {
        version: 2,
        dayTime: game.dayTime,
        totalSpawned: game.totalSpawned,
        prevUnlock: game.prevUnlock,

        siljangsukList: game.siljangsukList.filter(s => !s.dead).map(s => ({
          id: s.id,
          x: s.x, y: s.y,
          stage: s.stage,
          parentId: s.parentId,
          familyId: s.familyId,
          siblingIds: s.siblingIds,
          personality: s.personality,
          hp: s.hp, maxHp: s.maxHp,
          satiation: s.satiation, maxSat: s.maxSat,
          happiness: s.happiness,
          houseId: s.houseId,
          paperCount: s.paperCount,
          pregnant: s.pregnant,
          pregnancyTimer: s.pregnancyTimer,
          pniepnieTimer: s.pniepnieTimer,
          nailBoost: s.nailBoost,
          slaveOf:   s.slaveOf,
        })),

        houses: game.houses.map(h => ({
          id: h.id,
          x: h.x, y: h.y,
          hp: h.hp, maxHp: h.maxHp,
          comfort: h.comfort,
          ownerId: h.ownerId,
          unciX: h.unciX, unciY: h.unciY,
          foodReserves: h.foodReserves,
          unciAmount:   h.unciAmount,
        })),

        items: game.items.filter(i => !i.collected).map(i => ({
          id: i.id,
          type: i.type,
          x: i.x, y: i.y,
          foodValue: i.foodValue,
          happinessEffect: i.happinessEffect,
        })),
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  load(game) {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version < 2) return false;

      // Clear current state
      game.siljangsukList = [];
      game.houses         = [];
      game.items          = [];
      game.humans         = [];
      game.entities       = new Map();

      game.dayTime      = data.dayTime      ?? 0;
      game.totalSpawned = data.totalSpawned ?? 0;
      game.prevUnlock   = data.prevUnlock   ?? 0;

      // Houses first (siljangsuk reference them)
      for (const hd of data.houses) {
        const h = new House(hd.x, hd.y, hd.ownerId);
        _reassignId(h, hd.id);
        h.hp = hd.hp; h.maxHp = hd.maxHp;
        h.comfort      = hd.comfort;
        h.unciX        = hd.unciX;       h.unciY       = hd.unciY;
        h.foodReserves = hd.foodReserves ?? 0;
        h.unciAmount   = hd.unciAmount   ?? 0;
        game.houses.push(h);
        game.entities.set(h.id, h);
      }

      // Siljangsuk
      for (const sd of data.siljangsukList) {
        const s = new Siljangsuk(sd.x, sd.y, sd.stage, sd.parentId, sd.personality, sd.familyId);
        _reassignId(s, sd.id);
        s.siblingIds      = sd.siblingIds   ?? [];
        s.hp              = sd.hp;
        s.maxHp           = sd.maxHp;
        s.satiation       = sd.satiation;
        s.maxSat          = sd.maxSat;
        s.happiness       = sd.happiness;
        s.houseId         = sd.houseId;
        s.paperCount      = sd.paperCount   ?? 0;
        s.pregnant        = sd.pregnant     ?? false;
        s.pregnancyTimer  = sd.pregnancyTimer ?? 0;
        s.pniepnieTimer   = sd.pniepnieTimer ?? 0;
        s.nailBoost       = sd.nailBoost    ?? false;
        s.slaveOf         = sd.slaveOf      ?? null;
        game.siljangsukList.push(s);
        game.entities.set(s.id, s);
      }

      // Items
      for (const id2 of data.items) {
        const item = new Item(id2.type, id2.x, id2.y);
        _reassignId(item, id2.id);
        item.foodValue        = id2.foodValue;
        item.happinessEffect  = id2.happinessEffect;
        game.items.push(item);
        game.entities.set(item.id, item);
      }

      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  },
};

function _reassignId(obj, id) {
  obj.id = id;
  if (id > _nextId) _nextId = id;
}
