'use strict';
// Loads data/*.json, then runs the game scripts in their original order.
// Scripts are classic (not modules) so top-level const/let are shared between files.
(() => {
  const dataFiles = {
    heroes: 'data/heroes.json',
    heroClasses: 'data/hero-classes.json',
    stories: 'data/stories.json',
    stages: 'data/stages.json',
    balance: 'data/balance.json',
    battlefield: 'data/battlefield.json'
  };
  const scripts = [
    'js/config.js', 'js/assets.js', 'js/battlefield.js', 'js/heroes.js', 'js/save.js',
    'js/battle-render.js', 'js/battle.js', 'js/collection.js',
    'js/backup-codec.js', 'js/backup-ui.js'
  ];
  const deepFreeze = value => {
    if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
    return value;
  };
  const load = ([key, url]) => fetch(url).then(response => {
    if (!response.ok) throw Error(url + ' ' + response.status);
    return response.json();
  }).then(value => [key, value]);
  Promise.all(Object.entries(dataFiles).map(load)).then(entries => {
    window.ASHWARD_DATA = deepFreeze(Object.fromEntries(entries));
    for (const src of scripts) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
    }
  }).catch(error => {
    console.error(error);
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.style.cssText = 'margin:0;padding:12px 16px;background:#5a2a26;color:#fff;font-size:13px';
    message.textContent = '게임 데이터를 불러오지 못했습니다. GitHub Pages나 로컬 서버(python3 -m http.server)에서 열어주세요.';
    document.body.prepend(message);
  });
})();
