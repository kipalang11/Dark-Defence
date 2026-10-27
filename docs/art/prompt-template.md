# 잿빛 성채 · ASHWARD — 이미지 생성 프롬프트 템플릿

GPT(ChatGPT 이미지 생성), Gemini, Grok에 **그대로 붙여 넣는 영어 프롬프트**입니다.
`[대괄호]` 칸만 [characters.md](characters.md)의 설정 시트 양식에 맞춰 채우면 됩니다. 기준은 [style-guide.md](style-guide.md)입니다.

## 사용법

1. [characters.md](characters.md) 맨 아래의 양식으로 새 영웅 설정을 먼저 정합니다.
2. 아래 **기본 템플릿**을 복사해 `[대괄호]`를 영어로 채웁니다. 대괄호는 지우고 내용만 남깁니다.
3. 가능하면 **기존 일러스트 1~2장을 함께 첨부**합니다(GPT·Gemini·Grok 모두 이미지 첨부 가능). 같은 클래스나 비슷한 분위기의 영웅을 고르세요. 첨부할 때는 템플릿 맨 앞에 아래 「참고 이미지 문장」을 붙입니다.
4. 비율을 **세로 2:3**으로 맞춥니다.
   - GPT: 세로(portrait) 비율을 고르거나 문장 안의 `1024x1536`을 그대로 둡니다.
   - Gemini·Grok: 비율 선택 메뉴가 있으면 2:3(없으면 3:4처럼 2:3에 가장 가까운 세로 비율)을 고릅니다. 남는 부분은 반입 단계에서 잘라 냅니다. 9:16처럼 너무 길쭉한 비율은 가로 해상도가 모자라고 많이 잘려 나가니 피합니다.
5. 생성 결과를 [style-guide.md 10장 점검표](style-guide.md#10-새-영웅-그림-점검표)로 확인하고, 통과한 그림을 `assets/incoming/`에 올립니다(png·jpg·webp, 파일 이름은 아무거나). 이름·컨셉·수치는 반입할 때 Claude가 그림을 보고 정합니다.

> 생성기가 노출이 많은 의상을 순화해서 그리기도 합니다. 기존 영웅과 의상 문법(장식 갑옷 + 사슬 + 긴 망토)만 맞으면 괜찮습니다. 프롬프트는 노골적인 표현 없이 '성인, 절제된 표현'을 유지합니다.

---

## 기본 템플릿

```text
Vertical full-body character illustration for a dark high-fantasy collectible hero game, portrait orientation, 2:3 aspect ratio (1024x1536).

SUBJECT: one adult [woman/man] in [her/his] [age]s, [hair color, length and style], [eye color] eyes, [skin tone] skin, [distinctive features], [expression]. A [class description, e.g. "flame swordswoman"] of [faction / homeland].

OUTFIT: ornate fantasy battle attire in [main color] — a sculpted [material] armored top and hip guard engraved with [motif] patterns, linked by fine [gold/silver] body chains with small [motif] charms on the waist, thighs, arms and ankles; [metal] armlets and bracelets; a long flowing [main color] cape that trails to the ground with [torn / sheer / embroidered] edges; [footwear]. Tasteful and non-explicit.

WEAPON: [weapon description], [glow effect if any], held in [her/his] [right/left] hand.

POSE: [pose, e.g. "standing tall with one hand on the hip" / "looking back over the shoulder in a three-quarter back view" / "low crouch with a dagger in each hand"]. The face is clearly visible and turned toward the viewer.

BACKGROUND: [location tied to the faction], [time of day: night / dusk], gothic or ancient ruined stone architecture, [atmospheric particles: embers / snow / rain / star dust / mist], slightly blurred with shallow depth of field and lower contrast than the character.

LIGHTING: strong rim light and backlight from [light source: full moon / fire / lightning / aurora / stained glass], warm key light on the face and upper body so the character stands out from the dark background, glowing effects only on the weapon or spell.

COMPOSITION: full body from above the head to the feet, nothing cropped; the character fills about 90% of the image height; slight low-angle camera looking up; face near the horizontal center and in the upper fifth of the image; single character only.

STYLE: semi-realistic digital painting, highly detailed fantasy splash art, intricate metal filigree and fine chains, glossy skin highlights, richly detailed flowing hair, contrast between shiny metal, matte worn fabric and smooth skin, cinematic and moody color grading, dominant color [main color] with [gold/silver] metal accents.

AVOID: text, letters, logo, watermark, signature, frame or border, multiple characters, cropped feet, cropped head, anime or cel-shaded style, cartoon, chibi, 3D toy render, photograph, extra fingers, deformed hands, broken chains, childlike face or body, explicit nudity.
```

### 참고 이미지 문장 (기존 일러스트를 첨부할 때 맨 앞에 추가)

```text
Match the rendering style, color grading, lighting, level of detail and composition of the attached reference illustrations exactly, but create a completely new character — do not copy the reference character's face, hair, outfit or weapon.
```

### 클래스별 빈칸 예시

| 클래스 | WEAPON 예시 | POSE 예시 |
|---|---|---|
| 수호자 guardian | `a long ornate knightly sword pointed down to the ground, optionally a large heraldic shield` | `standing firm and upright, facing forward, one hand on the sword hilt` |
| 전사 warrior | `a [flaming / lightning-charged / frost-runed] greatsword or axe glowing with [element] energy` (창은 쓰지 않음) | `aggressive wide stance or one knee raised, cape whipping in the wind` |
| 암살자 assassin | `a pair of curved daggers, one in each hand` | `low crouch, three-quarter back view, looking over the shoulder` |
| 창기사 lancer | `a long ornate spear with a cloth ribbon tied below the blade` | `holding the spear horizontally across the body, dynamic stance` |
| 궁수 archer | `an ornate longbow decorated with [vines / feathers]` | `drawing the bowstring` 또는 `bow held at the side, looking back` |
| 마법사 mage | `a glowing [element] orb floating above the raised palm` 또는 `a staff topped with a glowing orb` | `one arm raised casting, long robe flowing on the floor` |
| 치유사 healer | `a staff topped with a [moon / star / blossoming branch]` 또는 `a soft white-gold light orb in the raised hand`, 날붙이 없음 | `gentle open pose, sheer veil drifting` |
| 지원가 support | `a ceremonial staff topped with a round [sun disc / banner / emblem], no blade tip` | `holding the staff high, proud and inspiring` |

### 남성 영웅일 때 바꿀 부분
OUTFIT 칸을 아래로 바꿉니다. 나머지는 같습니다.

```text
OUTFIT: heavy battle-worn [steel] plate armor with [gold/silver] filigree engravings, chainmail, a thick fur-trimmed mantle, leather belts and buckles, a long [main color] cape with torn edges; scratched and weathered metal.
```

---

## 예시: 제피라 `zephyra` (기존 영웅으로 채운 것)

[characters.md의 17번 제피라](characters.md#17-제피라-zephyra) 설정을 그대로 넣은 예시입니다. 새 영웅을 만들 때 채우는 정도의 기준으로 보세요.

```text
Vertical full-body character illustration for a dark high-fantasy collectible hero game, portrait orientation, 2:3 aspect ratio (1024x1536).

SUBJECT: one adult woman in her late 20s, very long flowing teal hair blown by the wind, grey-blue eyes, fair skin, pointed elf ears with silver feather earrings, focused calm expression. An elven mountain archer who guards the messenger roads of the high ridges.

OUTFIT: ornate fantasy battle attire in teal — a sculpted armored top and hip guard woven from teal feathers and thin silver branches, linked by fine silver body chains with small feather charms on the waist, thighs, arms and ankles; silver armlets and feather bracers; a long flowing sheer teal feather cape that trails to the ground; bare feet with silver laces and small feathers wrapped around the ankles and calves. Tasteful and non-explicit.

WEAPON: an ornate silver longbow decorated with teal feathers and silver leaves, the bowstring drawn with an arrow nocked, held in her left hand.

POSE: dynamic archery stance on a rocky summit, one leg forward on the rock, body turned in profile while drawing the bow, head turned so the face is clearly visible to the viewer.

BACKGROUND: jagged snow-covered mountain peaks and ridges above a sea of clouds, overcast pale daylight, drifting mist and wind-blown snow, slightly blurred with shallow depth of field and lower contrast than the character.

LIGHTING: soft cool rim light from the bright cloudy sky behind her, warm key light on the face and upper body so she stands out from the background, subtle sheen on the silver bow and chains.

COMPOSITION: full body from above the head to the feet, nothing cropped; the character fills about 90% of the image height; slight low-angle camera looking up; face near the horizontal center and in the upper fifth of the image; single character only.

STYLE: semi-realistic digital painting, highly detailed fantasy splash art, intricate metal filigree and fine chains, glossy skin highlights, richly detailed flowing hair, contrast between shiny metal, matte worn fabric and smooth skin, cinematic and moody color grading, dominant color teal with silver metal accents.

AVOID: text, letters, logo, watermark, signature, frame or border, multiple characters, cropped feet, cropped head, anime or cel-shaded style, cartoon, chibi, 3D toy render, photograph, extra fingers, deformed hands, broken chains, childlike face or body, explicit nudity.
```

---

## 고쳐서 다시 만들 때 쓰는 짧은 문장

생성 결과가 조금 어긋날 때 같은 대화창에 이어서 보냅니다.

| 문제 | 덧붙일 문장 |
|---|---|
| 발이 잘림 | `Zoom out slightly so the entire body including both feet is visible, with a little empty space above the head.` |
| 배경이 너무 밝거나 인물이 묻힘 | `Make the background darker and less saturated, and brighten the character with stronger rim light so she stands out.` |
| 애니메이션 느낌 | `Render it as a semi-realistic painterly fantasy illustration, not anime, with realistic skin and metal textures.` |
| 얼굴이 안 보임 | `Turn the head toward the viewer so the face is clearly visible.` |
| 손·무기가 어색함 | `Fix the hands: five fingers each, gripping the [weapon] naturally.` |
| 글자·서명이 생김 | `Remove all text, signatures and watermarks.` |
| 기존 영웅과 너무 닮음 | `Change the hair to [new color/style] and the cape to [new color] so she looks clearly different from the reference.` |
