'use strict';
let pendingRestore = null, fileReadSequence = 0;
const recoveryKey = 'ashward-before-restore';
function backupStatus(message) { $('backupStatus').textContent = message; }
function refreshRecovery() {
  try { $('undoRestore').hidden = !localStorage.getItem(recoveryKey); }
  catch { $('undoRestore').hidden = true; }
}
function showRestore(data, recovery = false) {
  if (running) { paused = true; $('pause').textContent = '계속하기'; hud(); }
  pendingRestore = { ...data, recovery };
  const p = data.progress, count = mainRoster.filter(i => p.owned[i]).length;
  $('restoreSummary').textContent = `일반 영웅 ${count}/${mainRoster.length}명 · 골드 ${p.gold.toLocaleString()} · 소환석 ${p.stones.toLocaleString()} · 최고 ${p.best}장`;
  const date = new Date(data.createdAt);
  $('restoreDate').textContent = Number.isNaN(date.getTime()) ? '날짜 정보 없음' : '백업 시각: ' + date.toLocaleString('ko-KR');
  $('restoreTitle').textContent = recovery ? '복원 전 기록으로 돌아갈까요?' : '이 기록을 불러올까요?';
  if (!$('restoreDialog').open) $('restoreDialog').showModal();
}
$('exportSave').onclick = () => {
  try {
    const content = JSON.stringify(BackupCodec.create(save, artNames), null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ASHWARD-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    backupStatus('백업 다운로드를 시작했습니다. 파일 앱에 저장한 뒤 다른 기기에서도 불러올 수 있어요.');
  } catch (e) { backupStatus('백업 실패: ' + e.message); }
};
$('importSave').onclick = () => $('backupFile').click();
$('backupFile').onchange = async () => {
  const file = $('backupFile').files[0], sequence = ++fileReadSequence;
  $('backupFile').value = '';
  if (!file) return;
  try {
    if (file.size > 65536) throw Error('백업 파일은 64KB 이하여야 합니다.');
    const data = BackupCodec.parse(await file.text(), artNames);
    if (sequence !== fileReadSequence) return;
    showRestore(data);
  } catch (e) { if (sequence === fileReadSequence) backupStatus('불러오기 실패: ' + e.message + ' 현재 기록은 유지됩니다.'); }
};
$('cancelRestore').onclick = () => $('restoreDialog').close();
$('restoreDialog').onclose = () => { pendingRestore = null; };
$('confirmRestore').onclick = () => {
  if (!pendingRestore) return;
  const next = pendingRestore.progress, undo = pendingRestore.recovery;
  // Commit storage first. Never replace the live collection when storage fails.
  try {
    if (!undo) localStorage.setItem(recoveryKey, JSON.stringify(BackupCodec.create(save, artNames)));
    localStorage.setItem('ashward-v1', JSON.stringify(next));
  } catch {
    backupStatus('저장 공간에 기록할 수 없어 복원을 취소했습니다. 현재 기록은 유지됩니다.');
    $('restoreDialog').close(); refreshRecovery(); return;
  }
  save = next; selected = 0; reset(); roster(); switchView('collection');
  if ($('heroDetail').open) $('heroDetail').close();
  if ($('summonResult').open) $('summonResult').close();
  if (undo) { try { localStorage.removeItem(recoveryKey); } catch {} }
  $('restoreDialog').close(); refreshRecovery();
  backupStatus(undo ? '복원 이전 기록으로 돌아왔습니다.' : '기록을 불러왔습니다. 필요하면 복원 전 기록으로 되돌릴 수 있어요.');
  toast('수집·육성 기록 복원 완료');
};
$('undoRestore').onclick = () => {
  try { showRestore(BackupCodec.parse(localStorage.getItem(recoveryKey), artNames), true); }
  catch (e) { backupStatus('이전 기록을 읽을 수 없습니다: ' + e.message); }
};
refreshRecovery();

