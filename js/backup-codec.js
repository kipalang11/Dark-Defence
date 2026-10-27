'use strict';
const BackupCodec = (() => {
  function validate(progress, size) {
    if (!progress || typeof progress !== 'object') throw Error('진행 기록이 없습니다.');
    const integer = (n, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n >= min && n <= max;
    for (const key of ['gold', 'stones', 'summons', 'best']) {
      if (!integer(progress[key])) throw Error('올바르지 않은 재화 또는 진행 기록입니다.');
    }
    for (const key of ['levels', 'owned', 'shards', 'awaken']) {
      if (!Array.isArray(progress[key]) || progress[key].length !== size) throw Error('영웅 기록의 수가 맞지 않습니다.');
    }
    if (!progress.levels.every(n => integer(n, 1)) || !progress.shards.every(n => integer(n)) || !progress.awaken.every(n => integer(n, 0, 5))) throw Error('올바르지 않은 성장 기록입니다.');
    if (!progress.owned.every(n => typeof n === 'boolean') || !progress.owned[0] || !progress.owned[1]) throw Error('올바르지 않은 보유 기록입니다.');
    if (!Array.isArray(progress.favorites) || !progress.favorites.every(n => integer(n, 0, size - 1))) throw Error('올바르지 않은 즐겨찾기 기록입니다.');
    return {
      version: 3, gold: progress.gold, stones: progress.stones,
      summons: progress.summons, best: progress.best,
      levels: [...progress.levels], owned: [...progress.owned],
      shards: [...progress.shards], awaken: [...progress.awaken],
      favorites: [...new Set(progress.favorites)]
    };
  }
  function create(progress, heroIds) {
    return { format: 'ashward-backup', formatVersion: 1, createdAt: new Date().toISOString(), heroIds: [...heroIds], progress: validate(progress, heroIds.length) };
  }
  function parse(text, heroIds) {
    if (typeof text !== 'string' || text.length > 65536) throw Error('백업 파일은 64KB 이하여야 합니다.');
    let data;
    try { data = JSON.parse(text); } catch { throw Error('백업 파일을 읽을 수 없습니다. ASHWARD에서 저장한 JSON 파일을 선택하세요.'); }
    if (!data || data.format !== 'ashward-backup' || data.formatVersion !== 1) throw Error('지원하지 않는 백업 형식입니다.');
    if (!Array.isArray(data.heroIds) || data.heroIds.length < 2 || data.heroIds.length > heroIds.length || new Set(data.heroIds).size !== data.heroIds.length || !data.heroIds.every((id, i) => id === heroIds[i])) throw Error('다른 영웅 구성의 백업입니다. 해당 버전에서 먼저 내보내세요.');
    const progress = validate(data.progress, data.heroIds.length);
    // Older backups preserve all original indices; appended heroes start unowned.
    for (let i = data.heroIds.length; i < heroIds.length; i++) {
      progress.levels.push(1); progress.owned.push(false);
      progress.shards.push(0); progress.awaken.push(0);
    }
    return { createdAt: typeof data.createdAt === 'string' ? data.createdAt : '', progress };
  }
  return { create, parse };
})();
if (typeof module !== 'undefined') module.exports = BackupCodec;

