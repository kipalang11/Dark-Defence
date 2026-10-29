'use strict';
// Static checks for data/, assets/ and save compatibility. Run: node tests/check.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = file => fs.existsSync(path.join(root, file));
let failures = 0;
function check(name, fn) {
  try { fn(); console.log('ok   ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + '\n     ' + e.message); }
}

const heroes = read('data/heroes.json'), classes = read('data/hero-classes.json');
const stories = read('data/stories.json'), stages = read('data/stages.json');
read('data/balance.json'); read('data/battlefield.json');

// Hero order is the index used by localStorage 'ashward-v1' and backup heroIds. Only appending is allowed.
const LOCKED_ORDER = ['kael', 'silva', 'ignis', 'lumia', 'raven', 'born', 'serena', 'nisha', 'vellad', 'aria', 'frost', 'mirea', 'nox', 'astrid', 'briar', 'astra', 'morwen', 'zephyra', 'pyra', 'aurelia', 'leona', 'nerissa', 'solara', 'glacia', 'karin', 'arachne', 'elaine', 'lyra'];

check('영웅 순서가 기존 저장 인덱스와 같음 (뒤에 추가만 허용)', () => {
  assert.deepStrictEqual(heroes.slice(0, LOCKED_ORDER.length).map(h => h.id), LOCKED_ORDER);
});
check('영웅 id 중복 없음, 소문자 파일명 규칙', () => {
  assert.strictEqual(new Set(heroes.map(h => h.id)).size, heroes.length);
  heroes.forEach(h => assert.match(h.id, /^[a-z]+$/, h.id));
});
check('stories.json이 heroes.json과 같은 순서', () => {
  assert.deepStrictEqual(stories.map(s => s.id), heroes.map(h => h.id));
  stories.forEach(s => ['title', 'faction', 'quote', 'story', 'skill', 'description'].forEach(k => assert.strictEqual(typeof s[k], 'string', s.id + '.' + k)));
});
check('영웅 수치와 클래스가 유효함', () => {
  heroes.forEach(h => {
    assert.ok(classes[h.classId], h.id + ' classId ' + h.classId);
    ['cost', 'range', 'dmg', 'rate', 'hp'].forEach(k => assert.ok(Number.isFinite(h[k]) && h[k] > 0, h.id + '.' + k));
    assert.ok(['male', 'female'].includes(h.gender), h.id + '.gender');
    ['legacy', 'newHero', 'fullBodyPortrait'].forEach(k => assert.strictEqual(typeof h[k], 'boolean', h.id + '.' + k));
  });
  Object.values(classes).forEach(c => assert.ok(['melee', 'ranged'].includes(c.deployment)));
  assert.ok(!heroes[0].legacy && !heroes[1].legacy, '카엘·실바는 기본 지급 영웅');
});
check('영웅마다 고유한 ability.type이 있고 수치가 숫자임', () => {
  const types = heroes.map(h => { assert.ok(h.ability && typeof h.ability.type === 'string', h.id + '.ability'); return h.ability.type; });
  assert.strictEqual(new Set(types).size, heroes.length, '능력 type 중복: ' + types.filter((x, i) => types.indexOf(x) !== i));
  heroes.forEach(h => Object.entries(h.ability).forEach(([k, v]) => { if (k !== 'type') assert.ok(Number.isFinite(v) && v >= 0, h.id + '.ability.' + k); }));
  heroes.forEach(h => ['slow', 'splash', 'splashFactor', 'leech', 'aura', 'auraRange', 'poison'].forEach(k => assert.ok(!(k in h), h.id + ' 옛 필드 ' + k)));
});
check('battle 코드가 처리하는 능력 type과 heroes.json이 일치함', () => {
  const src = fs.readFileSync(path.join(root, 'js/abilities.js'), 'utf8');
  heroes.forEach(h => assert.ok(src.includes("'" + h.ability.type + "'"), h.id + ' type ' + h.ability.type + ' 구현 없음'));
});
check('모든 영웅 이미지 파일이 있음', () => {
  heroes.forEach(h => {
    assert.ok(exists('assets/' + h.id + '.webp'), 'assets/' + h.id + '.webp');
    if (h.fullBodyPortrait) assert.ok(exists('assets/portraits/' + h.id + '.webp'), 'assets/portraits/' + h.id + '.webp');
  });
});
check('클래스 아이콘 SVG·제목 글꼴·장식 파일이 있음', () => {
  Object.keys(classes).forEach(id => assert.ok(exists('assets/icons/' + id + '.svg'), 'assets/icons/' + id + '.svg'));
  ['assets/fonts/title-hangul.woff2', 'assets/fonts/title-latin.woff2', 'assets/ornaments/corner.svg'].forEach(f => assert.ok(exists(f), f));
});
check('스테이지 id 중복 없음', () => {
  assert.strictEqual(new Set(stages.stages.map(s => s.id)).size, stages.stages.length);
  stages.stages.forEach(s => assert.ok(Number.isInteger(s.id) && s.id > 0 && s.difficulty > 0 && s.goldReward >= 0, s.name));
});
check('boot.js가 불러오는 파일이 모두 있음', () => {
  const boot = fs.readFileSync(path.join(root, 'js/boot.js'), 'utf8');
  const files = [...boot.matchAll(/'((?:js|data)\/[^']+)'/g)].map(m => m[1]);
  assert.ok(files.length > 10);
  files.forEach(f => assert.ok(exists(f), f));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  [...html.matchAll(/(?:href|src)="([^"?]+)/g)].forEach(m => assert.ok(exists(m[1]), m[1]));
});
check('Battlefield 격자', () => {
  const Battlefield = require('../js/battlefield.js');
  assert.strictEqual(Battlefield.cells.length, Battlefield.cols * Battlefield.rows);
  assert.strictEqual(Battlefield.lanes.length, 3);
});
check('백업 형식 왕복 (ashward-backup v1)', () => {
  const BackupCodec = require('../js/backup-codec.js');
  const ids = heroes.map(h => h.id), n = ids.length;
  const progress = { version: 3, gold: 1500, stones: 10, summons: 0, best: 0, levels: Array(n).fill(1), owned: ids.map((_, i) => i < 2), shards: Array(n).fill(0), awaken: Array(n).fill(0), favorites: [] };
  const backup = BackupCodec.create(progress, ids);
  assert.strictEqual(backup.format, 'ashward-backup');
  assert.strictEqual(backup.formatVersion, 1);
  assert.deepStrictEqual(BackupCodec.parse(JSON.stringify(backup), ids).progress, progress);
  // A backup made before newer heroes were appended must still load.
  const old = BackupCodec.create({ ...progress, levels: progress.levels.slice(0, 12), owned: progress.owned.slice(0, 12), shards: progress.shards.slice(0, 12), awaken: progress.awaken.slice(0, 12) }, ids.slice(0, 12));
  assert.strictEqual(BackupCodec.parse(JSON.stringify(old), ids).progress.levels.length, n);
});
check('저장 키 이름 유지', () => {
  const src = f => fs.readFileSync(path.join(root, f), 'utf8');
  assert.ok(src('js/save.js').includes("localStorage.getItem('ashward-v1')"));
  assert.ok(src('js/save.js').includes("localStorage.setItem('ashward-v1'"));
  assert.ok(src('js/backup-ui.js').includes("const recoveryKey = 'ashward-before-restore'"));
});

if (failures) { console.log('\n' + failures + '개 검사 실패'); process.exit(1); }
console.log('\n모든 검사 통과');
