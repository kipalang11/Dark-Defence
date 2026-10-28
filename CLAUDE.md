# 잿빛 성채 · ASHWARD — 작업 안내

빌드 도구 없이 GitHub Pages(정적 호스팅)에서 그대로 실행되는 HTML 디펜스·영웅 수집 게임입니다.
원래 12MB짜리 `index.html` 한 파일이었으며, 화면과 동작을 바꾸지 않은 채 이미지·CSS·JS·수치 데이터로 나눴습니다.

> `CLAUDE.md`와 `AGENTS.md`는 같은 내용입니다. 한쪽을 고치면 다른 쪽도 똑같이 고치세요.

## 실행

```bash
python3 -m http.server 8000   # 저장소 루트에서 실행
# 브라우저에서 http://localhost:8000/
```

- `data/*.json`을 `fetch`로 읽으므로 **`index.html`을 더블클릭(file://)해서 열면 실행되지 않습니다.** 이때는 화면 위쪽에 안내 문구가 나옵니다.
- GitHub Pages는 저장소 루트의 `index.html`을 그대로 서비스합니다. `.nojekyll`은 Jekyll 처리를 끄기 위한 빈 파일입니다.
- GitHub Pages는 경로의 대소문자를 구분합니다. 파일명은 모두 소문자로 둡니다.

## 폴더 구조

```
index.html              HTML 마크업만 있음. css/*.css를 순서대로 link하고 js/boot.js 하나만 불러옴
.nojekyll
assets/<id>.webp        영웅 전신 일러스트 28장 (도감 카드·상세·소환 결과·인트로)
assets/portraits/<id>.webp  전투 아이콘·캔버스용 전신 초상 25장 (kael, raven, born은 없음 → 전신 일러스트를 잘라 씀)
assets/incoming/        새 영웅 원본 이미지를 올리는 곳 (게임이 읽지 않음, 아래 '새 영웅 반입 절차')
docs/art/               캐릭터 아트 가이드: style-guide.md(화풍·구도·클래스 규칙), characters.md(영웅 설정 시트), prompt-template.md(이미지 생성 프롬프트)
css/
  base.css              기본 레이아웃, 버튼, 대화상자, 모바일 기본 규칙
  collection.css        인트로, 탭, 도감 갤러리, 영웅 상세, 소환 결과, toast
  backup.css            기록 보관함(백업/복원) 패널과 복원 대화상자
  hero-classes.css      전신 일러스트 표시, 클래스 배지, 배치 안내
  battle.css            전투 화면(전체 화면 고정), 하단 영웅 도크, 골드 바
data/
  heroes.json           영웅 28명의 수치 (배열 순서 = 저장 인덱스, 아래 규칙 참고)
  hero-classes.json     클래스 8종의 이름과 배치 위치(melee=길 위, ranged=길 밖)
  stories.json          영웅별 칭호·소속·대사·이야기·스킬 설명 (heroes.json과 같은 순서)
  stages.json           스테이지 목록, 웨이브 수, 적·보스 수치, 승리 보상
  balance.json          시작 재화, 선물 수량, 마나, 성채 생명, 성채의 빛, 강화·각성 배율, 소환 확정 주기, 전투 보정값
  battlefield.json      격자 크기(56px × 15열 × 10행)와 바위 칸 위치
js/
  boot.js               data/*.json을 모두 읽어 window.ASHWARD_DATA(동결 객체)로 만든 뒤 아래 스크립트를 순서대로 실행
                        (data·JS·CSS를 cache:'no-cache'로 받아 배포 직후에도 새 파일이 바로 반영됨. boot.js 자체를 고치면 index.html의 boot.js?v=N을 올림)
  config.js             BALANCE(=balance.json), STAGES(=stages.json) 단축 상수
  assets.js             fullArtUrl(i), portraitUrl(i) — 영웅 인덱스 → 이미지 경로
  battlefield.js        Battlefield: 격자 칸, 길(road), 3개 차선 경로, 좌표 변환
  heroes.js             types(영웅 배열), artNames, legacyRoster/mainRoster/newRoster, portraits(캔버스용 Image), rangeAt, placementLabel
  save.js               save 객체 로드·이전(마이그레이션), persist() — localStorage 'ashward-v1'
  battle-render.js      캔버스 그리기: line, drawRange, draw
  battle.js             $ 헬퍼, 전투 상태, 스테이지 선택, 웨이브·적·영웅 시뮬레이션(step), 배치 입력, HUD, 게임 루프 시작
  collection.js         stories, 도감 렌더링, 필터, 영웅 상세, 강화·각성·즐겨찾기, 소환, 탭 전환, toast
  backup-codec.js       BackupCodec: 백업 JSON 생성·검증·파싱 (Node에서도 require 가능)
  backup-ui.js          백업 파일 저장/불러오기, 복원 확인, 복원 전 기록으로 되돌리기
tests/check.js          Node로 돌리는 정적 검사 (의존성 없음)
```

## 스크립트 구조 (중요)

- 모든 JS는 **모듈이 아닌 일반 스크립트**입니다. 최상위 `const`/`let`/`function`이 파일 사이에서 공유됩니다
  (예: `battle.js`의 `$`, `units`, `running`을 `collection.js`, `backup-ui.js`가 그대로 씀).
- 실행 순서는 `js/boot.js`의 `scripts` 배열이 정합니다:
  `config → assets → battlefield → heroes → save → battle-render → battle → collection → backup-codec → backup-ui`
- 파일 최상위에서 **바로 실행되는 코드**는 앞 파일에서 정의된 것만 쓸 수 있습니다. 함수 안에서는 뒤 파일의 것도 써도 됩니다
  (호출 시점에 이미 로드되어 있기 때문). 기존 코드의 `typeof renderCollection==='function'`, `typeof toast==='function'` 검사는 이 순서 때문에 있으니 지우지 마세요.
- 새 JS 파일을 추가하면 `js/boot.js`의 `scripts`에 넣어야 실행됩니다. 새 data 파일은 `dataFiles`에 넣고 `ASHWARD_DATA.<키>`로 읽습니다.
- `ASHWARD_DATA`는 `Object.freeze`로 동결되어 있습니다. 실행 중 바꿔야 하는 값은 복사해서 쓰세요(`heroes.js`가 `types`를 만드는 방식 참고).
- `battlefield.js`, `backup-codec.js` 끝의 `module.exports` 줄은 Node 검사용이니 유지합니다.

## 작업 규칙

### 절대 바꾸지 말 것 (기존 플레이어 기록이 깨짐)
1. **localStorage 키**: `ashward-v1`(진행 기록), `ashward-before-restore`(복원 전 기록). 이름·저장 형태(`save` 객체의 필드: gold, stones, summons, best, levels, owned, shards, awaken, favorites, version=3)를 바꾸지 않습니다.
2. **백업 형식**: `{ format: 'ashward-backup', formatVersion: 1, createdAt, heroIds, progress }`. `js/backup-codec.js`는 수정하지 않는 것을 원칙으로 합니다.
3. **영웅 순서**: `data/heroes.json`의 배열 순서가 곧 `save.levels[i]`, `save.owned[i]` 등의 인덱스이고, `id` 목록이 백업의 `heroIds`입니다.
   - 기존 영웅의 순서를 바꾸거나, 중간에 끼워 넣거나, 삭제하거나, `id`를 바꾸면 안 됩니다.
   - 새 영웅은 **배열 맨 끝에만** 추가하고, `data/stories.json` 끝에도 같은 `id`로 추가하고, `assets/<id>.webp`(필요하면 `assets/portraits/<id>.webp`)를 넣습니다.
   - 인덱스 0·1(카엘·실바)은 기본 지급 영웅으로 코드와 백업 검증에 고정되어 있습니다.
4. 각성 최대치 5는 `js/save.js`, `js/collection.js`, `js/backup-codec.js`의 검증에 함께 묶여 있으므로 data로 옮기지 않았습니다. 바꾸면 백업 호환성이 깨집니다.

### 빌드·배포
- 빌드 도구, 번들러, npm 패키지, 트랜스파일러를 도입하지 않습니다. 브라우저가 그대로 읽는 파일만 둡니다.
- 외부 CDN에 의존하지 않습니다. 모든 리소스는 저장소 안 상대 경로로 참조합니다.
- 이미지는 `assets/`에 파일로 둡니다. base64로 HTML/JS에 다시 넣지 않습니다.

### 수치 조정
- 게임 수치는 `data/*.json`만 고칩니다. JS에 숫자를 새로 하드코딩하지 말고 `BALANCE`, `STAGES`, `types`에서 읽습니다.
- 수치가 **문장 안에 직접 적힌 곳**은 data를 바꿔도 자동으로 바뀌지 않으니 함께 고칩니다:
  - `index.html`: `＋ 골드 10,000`, `골드 +10,000`, `소환석 +10` 버튼, `5회마다 미보유 영웅 확정`, 도감 필터의 `일반 영웅 26명`·`신규 영웅 · 16명`·`기존 영웅 · 2명`, 첫 표시값 `2 / 26`, 플레이 안내 대화상자(웨이브 6개, 각성 5%·125% 등)
  - `data/stories.json`의 `description`(예: 공격력 70%, 0.42초)
  - `js/collection.js` 상세 화면의 `각성마다 … +5% (5단계에서 최대 +25%)`
- 영웅 `range`는 실제 적용 사거리입니다. 근접 클래스는 이미 짧은 값으로 들어가 있습니다.
- 스테이지의 `difficulty`는 적 체력·적 공격력 배수, `goldReward`는 승리 골드, `id`는 '최고 클리어 n장' 기록값입니다. 스테이지를 추가하면 선택 목록은 자동으로 생깁니다.
- `data/battlefield.json`의 격자 크기를 바꾸면 `js/battlefield.js`의 `road()`·차선 좌표와 `js/battle-render.js`의 840×560/56px 값도 함께 고쳐야 합니다. 바위 위치(`obstacles`, "열,행")만 바꾸는 것은 안전합니다.

### 여러 에이전트가 나눠 작업할 때
- 영역별로 파일을 나눠 맡습니다. 같은 파일을 동시에 고치지 않습니다.
  | 영역 | 담당 파일 |
  |---|---|
  | 밸런스·스테이지 | `data/balance.json`, `data/stages.json`, `data/battlefield.json` |
  | 영웅 추가·수치·이야기 | `data/heroes.json`, `data/hero-classes.json`, `data/stories.json`, `assets/` |
  | 전투 로직·그리기 | `js/battle.js`, `js/battle-render.js`, `js/battlefield.js`, `css/battle.css` |
  | 도감·소환·상세 | `js/collection.js`, `js/heroes.js`, `css/collection.css`, `css/hero-classes.css` |
  | 저장·백업 | `js/save.js`, `js/backup-ui.js`, `css/backup.css` (`js/backup-codec.js`는 원칙적으로 수정 금지) |
  | 공통·마크업 | `index.html`, `js/boot.js`, `js/config.js`, `css/base.css` — 변경 시 다른 영역에 알림 |
- 전역 이름(`save`, `types`, `units`, `$`, `notice`, `toast`, `roster`, `hud` 등)을 바꾸거나 지울 때는 저장소 전체를 검색해 다른 파일의 사용처를 확인합니다.
- 기존 코드는 한 줄에 여러 문장을 이어 쓰는 압축된 스타일입니다. 고치는 부분은 주변 스타일에 맞추고, 무관한 줄을 재포맷하지 않습니다(다른 에이전트와 충돌이 커짐).
- 화면 문구는 한국어입니다.

## 새 영웅 반입 절차 (`assets/incoming/`)
사용자가 `assets/incoming/`에 그림 파일(png·jpg·webp, 파일 이름은 아무거나)을 올리면 대장이 아래 순서로 처리합니다. 한 영웅의 반입은 나누지 않고 대장이 직접 합니다.
**사용자는 그림만 올립니다. 이름·컨셉·수치는 대장이 그림을 보고 정하며, 작업 전에 묻지 않습니다.** 사용자가 설정 일부를 함께 주었다면 그것을 우선합니다.
그림 기준은 `docs/art/style-guide.md`, 설정 양식은 `docs/art/characters.md` 맨 아래에 있습니다. 이미지 처리에는 Pillow(`python3 -c "import PIL"`)를 씁니다. Pillow는 작업 도구일 뿐이며 저장소에 넣지 않습니다.

1. **접수**: `assets/incoming/`에서 `README.md`를 뺀 이미지 파일을 찾습니다. 파일 하나가 영웅 한 명입니다. 여러 장이면 올라온 순서대로 하나씩 처리하고 PR 하나로 묶습니다. 같은 인물을 다시 그린 것으로 보이는 그림이 여러 장이면 가장 나은 한 장만 쓰고, 보고할 때 그 사실을 밝힙니다.
2. **그림 확인**: 원본을 Read로 직접 보고 `docs/art/style-guide.md` 10장 점검표로 확인합니다. 원본 가로가 768px보다 작거나, 발·머리가 잘렸거나, 글자·서명이 있으면 이것만은 사용자에게 알리고 다시 생성할지 묻습니다. 미성년자로 보이는 그림은 반입하지 않습니다.
3. **설정 정하기**: 그림을 보고 아래를 정한 뒤 `docs/art/characters.md` 양식으로 정리합니다.
   - **클래스**: 무기와 자세로 정합니다(`docs/art/style-guide.md` 7장). 장검·방패를 들고 버티는 자세 → 수호자, 원소가 깃든 검·도끼 → 전사, 쌍단검 → 암살자, 창 → 창기사, 활·석궁 → 궁수, 원소 구체·보주 지팡이·책·카드 → 마법사, 날 없는 지팡이·부드러운 빛 → 치유사, 문장 지팡이·깃발 → 지원가. 어느 쪽인지 애매하면 기존 영웅 수가 적은 클래스를 고릅니다. 기존 8개 클래스 안에서만 고릅니다.
   - **이름과 id**: 이름은 판타지 느낌의 한국어 2~4글자로 짓습니다. 기존 영웅과 같거나 비슷하게 들리면 안 됩니다. id는 이름을 영어 소문자(a-z)로 옮긴 것으로 하고, 기존 id와 겹치지 않게 합니다. **id는 머지 후에는 바꿀 수 없습니다**(저장 기록과 백업에 쓰임). 이름·이야기·수치는 나중에 바꿀 수 있습니다.
   - **칭호·소속·역할·성격**: 그림의 색, 소품, 배경에서 따옵니다. 소속은 배경과 맞으면 기존 소속을 쓰고, 아니면 새로 만듭니다. 역할은 `<수식어> <직업> · <특성>` 형식입니다(예: `화염 검사 · 근접 범위`). 나이는 25~45세 성인으로 합니다. 대사 한 줄과 이야기 2~3문장은 기존 `stories.json`의 말투에 맞춥니다.
   - **스킬과 수치**: 같은 클래스 기존 영웅들의 중간값 근처로 정합니다. 스킬 효과는 기존 클래스 전용 필드(6단계 목록)를 조합해서만 만듭니다. 게임 코드를 고쳐야 하는 새 효과는 만들지 않습니다. `icon`은 기존 기호 중에서, `color`는 스타일 가이드 6장 기준의 파스텔 톤으로 고릅니다.
   - 정한 설정은 보고와 PR 본문에 표로 적어, 사용자가 머지 전에 바꿔 달라고 할 수 있게 합니다.
4. **크기 통일·WebP 변환** → `assets/<id>.webp` (784×1168, 품질 90)
   ```bash
   python3 - "<원본 파일 경로>" <id> <<'EOF'
   import sys
   from PIL import Image, ImageOps
   src, i = sys.argv[1], sys.argv[2]
   im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
   im = ImageOps.fit(im, (784, 1168), Image.LANCZOS, centering=(0.5, 0.0))
   im.save(f'assets/{i}.webp', 'WEBP', quality=90, method=6)
   EOF
   ```
   비율이 2:3이 아니면 넘치는 부분을 잘라 냅니다. `centering=(0.5, 0.0)`은 위쪽(머리)을 살리고 아래와 양옆을 자르는 설정입니다. 결과를 Read로 보고 발이 잘렸으면 두 번째 값을 0.3~0.5로 올려 다시 만듭니다.
5. **전투용 초상 자르기** → `assets/portraits/<id>.webp` (300×300, 축소 없이 1:1로 자름)
   ```bash
   python3 - <id> <x> <y> <<'EOF'
   import sys
   from PIL import Image
   i, x, y = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
   Image.open(f'assets/{i}.webp').crop((x, y, x + 300, y + 300)).save(f'assets/portraits/{i}.webp', 'WEBP', quality=90, method=6)
   EOF
   ```
   `x` = 얼굴 중심의 가로 좌표 − 150(0~484), `y` = 머리 꼭대기 − 20(0~868)입니다. 잘린 결과를 Read로 보고, 얼굴이 가운데 있고 머리 위가 잘리지 않을 때까지 조정합니다(전투에서는 지름 52px 원으로 다시 잘림).
6. **`data/heroes.json` 맨 끝에 추가**: 같은 클래스 기존 영웅의 항목을 본떠 `id, name, role, icon, color, cost, range, dmg, rate, hp`와 클래스 전용 필드(`block`, `heal`, `aura`, `auraRange`, `splash`, `splashFactor`, `slow`, `leech`, `poison`)를 채웁니다. 나머지는 `classId`, `gender`, `"legacy": false`, `"newHero": true`, `"fullBodyPortrait": true`로 둡니다. 기존 항목은 건드리지 말고, 아래처럼 파일을 다시 쓰면 기존 형식(들여쓰기 2칸, 한글 그대로, 끝 줄바꿈)이 유지됩니다.
   ```bash
   python3 - <<'EOF'
   import json
   f = 'data/heroes.json'; d = json.load(open(f, encoding='utf-8'))
   d.append({ ... })  # 새 영웅 항목
   open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
   EOF
   ```
7. **`data/stories.json` 맨 끝에 추가**: 같은 `id`로 `title, faction, quote, story, skill, description`을 채웁니다. 방법은 6과 같습니다. `story`에는 성인 나이를 적고, `description`의 숫자는 6에서 넣은 수치와 맞춥니다.
8. **문장에 직접 적힌 수 고치기** (`index.html`): `일반 영웅 N명`과 `2 / N`의 N, `신규 영웅 · N명`의 N을 새 영웅 수만큼 늘립니다(`heroes.json`에서 legacy가 아닌 영웅 수, newHero 영웅 수와 같아야 함).
9. **기록 고정과 문서**: `tests/check.js`의 `LOCKED_ORDER` 끝에 새 id를 추가합니다. `docs/art/characters.md`의 표와 설정 시트에도 새 영웅을 추가합니다. 영웅 수가 적힌 문장도 고칩니다: 이 파일의 폴더 구조(`영웅 전신 일러스트 N장`, `전신 초상 N장`, `영웅 N명`), `docs/art/characters.md` 첫 문단(`N번(인덱스 N)부터`). 새 그림이 스타일 가이드와 다르면 `docs/art/style-guide.md` 9장에 적습니다. `CLAUDE.md`와 `AGENTS.md`는 똑같이 유지합니다.
10. **원본 정리**: `git rm -f --ignore-unmatch "<원본 파일 경로>"; rm -f "<원본 파일 경로>"`로 원본을 지웁니다. 원본은 커밋에 남기지 않습니다(`assets/incoming/README.md`는 남김).
11. **확인**: `node tests/check.js`를 통과시킵니다. 브라우저에서 도감 카드·영웅 상세·소환 결과에 그림이 나오는지, 전투 하단 도크 썸네일과 맵의 원형 아이콘에 얼굴이 가운데 보이는지 확인합니다. 그다음 '대장 운영 규칙'의 검수·보고를 이어서 합니다.

## 대장 운영 규칙
사용자가 일을 시키면 대장(메인 에이전트)은 아래 순서를 지킵니다.

1. **접수**: 요청을 한국어 3줄 이내로 다시 정리합니다. 애매한 점이 있으면 작업 전에 먼저 묻습니다. 단, 새 영웅 반입은 위 절차대로 이름·컨셉을 묻지 않고 대장이 정합니다.
2. **판단**: 한 영역 안의 작은 수정은 대장이 직접 합니다. 서로 다른 영역의 작업이 2개 이상일 때만 위 '여러 에이전트가 나눠 작업할 때'의 영역별 담당 파일 표 기준으로 하위 에이전트에게 나눠 동시에 진행합니다.
   - 같은 파일을 두 에이전트가 동시에 고치지 않습니다.
   - 전역 변수를 함께 쓰는 작업은 나누지 않습니다.
3. **검수**: 작업이 끝나면 작업에 참여하지 않은 별도의 하위 에이전트가 변경 내용을 검토합니다. `node tests/check.js`를 통과시키고, 화면이 바뀌는 작업은 브라우저로 띄워 확인합니다.
4. **보고**: 바뀐 내용과, 사용자가 게임에서 직접 확인할 것 3가지 이내를 한국어로 짧게 보고하고, PR 하나로 올립니다.

## 변경 후 확인
1. `node tests/check.js` — 영웅 순서 고정, data 형식, 이미지 존재, 백업 왕복, 저장 키 이름을 검사합니다. 모두 통과해야 합니다.
2. `python3 -m http.server`로 띄워 브라우저에서 확인: 콘솔 오류 없음, 도감 → 소환 → 영웅 상세 → 전투 배치 → 전투 시작 → 백업 저장/불러오기.
3. 저장 관련 코드를 건드렸다면 변경 전에 만든 백업 파일과 기존 localStorage 기록이 그대로 불러와지는지 확인합니다.
