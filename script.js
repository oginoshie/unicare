'use strict';

// ── 1. 定数・メッセージ設定 ──
const MESSAGES = {
  water: ['力が満ちていく...', '水は少しずつ、こまめにね', 'うるおう〜〜', '寝る前, 起きた後が\n脱水しやすいらしいよ'],
  stretch: ['う〜ん、のび〜〜〜', 'すとれっちぱわーーー', '気持ちがいいねえ', '伸びる時は\n20〜30秒キープがいいよ'],
  sun: [
    '太陽の光、15分浴びると気分変わるって',
    '光合成〜〜〜〜',
    'ウニは言った、「光あれ」',
    'ウニ、目がないのに光を感じる',
  ],
  auto: {
    cheer: [
      '今日もここにいるよ',
      'ちょっとだけ、動いてみよう',
      'ぼくもゆっくり育つから',
      'うまくいかない日も、ちゃんと数えてるよ',
    ],
    chat: ['水、飲んだ？', 'ぼくのトゲ、今日どうかな', '外、どんな天気だった？', '今日のごはん、おいしかった？'],
    tips: [
      '水は少しずつ\nこまめに飲むのがいいらしいよ',
      '背中、丸まってない？',
      '4秒吸って6秒吐くと\nリラックスできるって',
    ],
    trivia: ['ウニの体は約70〜75％が水！', 'ウニのDNA, ヒトの遺伝子と似てるとか...', '昔は夏、現在では春の季語だよ'],
    rest: [
      '無理しなくていい日もある',
      '寝ることも、立派なケアだよ',
      '自分を解放してあげられるのは\n自分しかいないよね',
    ],
  },
};

// ── 2. ステート管理 ──
const state = {
  water: 0,
  stretch: { morning: false, noon: false, night: false },
  sun: 0,
  sleep: { bed: '', wake: '', isSleeping: false },
  goals: { water: 2000, sleep: 7.0 },
  celebrated: { water: false, sleep: false },
  isVibrating: 0,
  lastActionTime: Date.now(),
  currentGoalType: '',
  urchinCount: parseInt(localStorage.getItem('unicare_total_urchin')) || 0,
  lastDate: localStorage.getItem('unicare_last_date') || '',
  isDonCalculated: JSON.parse(localStorage.getItem('unicare_don_calculated')) || { water: 0, sun: 0, sleep: false },
  history: JSON.parse(localStorage.getItem('unicare_history')) || {},
};

// ── 3. ユーティリティ ──
function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function updateUrchinCount(plus) {
  state.urchinCount = Math.max(0, state.urchinCount + plus);
  localStorage.setItem('unicare_total_urchin', state.urchinCount);
  const countDisplay = document.getElementById('donCount');
  if (countDisplay) countDisplay.textContent = state.urchinCount;
}

function speak(text) {
  const el = document.getElementById('urchinSpeech');
  if (el) el.innerHTML = text.replace(/\n/g, '<br>');
  state.lastActionTime = Date.now();
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── 4. 日付変更 & 保存処理 ──
function checkNewDay() {
  const now = new Date();
  const today = getTodayKey(now);
  if (state.lastDate && state.lastDate !== today) {
    saveData();
    state.water = 0;
    state.sun = 0;
    state.stretch = { morning: false, noon: false, night: false };
    state.celebrated = { water: false, sleep: false };
    state.isDonCalculated = { water: 0, sun: 0, sleep: false };
    localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
    if (now.getDay() === 1) {
      state.urchinCount = 0;
      updateUrchinCount(0);
      speak('月曜日だ！新しい丼を溜めよう');
    }
    updateUI();
    initCalendar();
  }
  state.lastDate = today;
  localStorage.setItem('unicare_last_date', today);
}

function saveData() {
  const today = state.lastDate || getTodayKey();
  state.history[today] = {
    water: state.water,
    sun: state.sun,
    stretch: state.stretch,
    sleep: document.getElementById('valSleep')?.textContent || '0.0',
    urchinsToday: state.isDonCalculated.water + state.isDonCalculated.sun + (state.isDonCalculated.sleep ? 3 : 0),
  };
  localStorage.setItem('unicare_history', JSON.stringify(state.history));
  if (state.history[today].urchinsToday > 0) {
    localStorage.setItem(`unicare_${today}`, 'true');
  }
}

// ── 5. アクションハンドラ ──
function addWater(amt) {
  state.water += amt;
  const newGrains = Math.floor(state.water / 200);
  if (newGrains > state.isDonCalculated.water) {
    updateUrchinCount(newGrains - state.isDonCalculated.water);
    state.isDonCalculated.water = newGrains;
    localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
  }
  speak(getRandom(MESSAGES.water));
  updateUI();
}

function resetWater() {
  updateUrchinCount(-state.isDonCalculated.water);
  state.water = 0;
  state.isDonCalculated.water = 0;
  localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
  speak('のど、乾いたなあ〜');
  updateUI();
}

function addSun() {
  state.sun += 1;
  state.isDonCalculated.sun += 1;
  updateUrchinCount(1);
  localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
  speak(getRandom(MESSAGES.sun));
  updateUI();
}

function resetSun() {
  updateUrchinCount(-state.isDonCalculated.sun);
  state.sun = 0;
  state.isDonCalculated.sun = 0;
  localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
  speak('また明日、太陽浴びよう');
  updateUI();
}

function toggleStretch(id) {
  state.stretch[id] = !state.stretch[id];
  if (state.stretch[id]) {
    updateUrchinCount(1);
    speak(getRandom(MESSAGES.stretch));
  } else {
    updateUrchinCount(-1);
  }
  updateUI();
}

function startSleep() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('timeBed').value = timeStr;
  state.sleep.bed = timeStr;
  state.sleep.isSleeping = true;
  speak('おやすみ…いい夢見てね');
  updateUI();
}

function endSleep() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('timeWake').value = timeStr;
  state.sleep.wake = timeStr;
  state.sleep.isSleeping = false;
  updateUI();
  const currentSleep = parseFloat(document.getElementById('valSleep').textContent);
  if (currentSleep >= state.goals.sleep && !state.isDonCalculated.sleep) {
    updateUrchinCount(3);
    state.isDonCalculated.sleep = true;
    localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
    speak('おはよう！目標達成だね、えらい！');
  } else {
    speak('おはよう！よく眠れた？');
  }
}

function updateSleepTime() {
  state.sleep.bed = document.getElementById('timeBed')?.value || '';
  state.sleep.wake = document.getElementById('timeWake')?.value || '';
  updateUI();
}

// ── 6. UI 更新 ──
function updateUI() {
  const valWaterEl = document.getElementById('valWater');
  const goalWaterEl = document.getElementById('goalWater');
  const slider = document.getElementById('waterSlider');
  const fill = document.getElementById('waterFill');
  const valSunEl = document.getElementById('valSun');
  const bg = document.getElementById('aquariumBG');

  if (valWaterEl) valWaterEl.textContent = state.water;
  if (goalWaterEl) goalWaterEl.textContent = state.goals.water;
  if (slider) {
    slider.max = state.goals.water;
    slider.value = state.water;
  }
  if (fill) fill.style.height = `${Math.min((state.water / state.goals.water) * 80, 100)}%`;
  if (valSunEl) valSunEl.textContent = state.sun;
  if (bg) bg.style.filter = `brightness(${Math.min(100 + state.sun * 2, 115)}%)`;

  const valSleepElem = document.getElementById('valSleep');
  let currentSleep = 0;
  if (valSleepElem) {
    if (!state.sleep.bed || !state.sleep.wake) {
      valSleepElem.textContent = '0.0';
    } else {
      const [bh, bm] = state.sleep.bed.split(':').map(Number);
      const [wh, wm] = state.sleep.wake.split(':').map(Number);
      let diff = wh * 60 + wm - (bh * 60 + bm);
      if (diff < 0) diff += 1440;
      if (diff < 5 || (diff > 1435 && state.sleep.isSleeping)) currentSleep = 0;
      else currentSleep = diff / 60;
      valSleepElem.textContent = currentSleep.toFixed(1).replace('.0', '');
    }
  }

  const isWaterDone = state.water >= state.goals.water;
  if (isWaterDone && !state.celebrated.water) {
    celebrate();
    state.celebrated.water = true;
  }

  ['Morning', 'Noon', 'Night'].forEach((k) => {
    const b = document.getElementById('btn' + k);
    if (b) {
      if (state.stretch[k.toLowerCase()]) b.classList.add('is-active');
      else b.classList.remove('is-active');
    }
  });
  startBubbles(state.sun);
  saveData();
}

// ── 7. カレンダー & 演出 ──
function initCalendar() {
  const strip = document.getElementById('calendarStrip');
  if (!strip) return;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const now = new Date();
  strip.innerHTML = '';
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    const key = getTodayKey(d);
    const card = document.createElement('div');
    card.className = 'date-card' + (i === 0 ? ' active' : '');
    if (d.getDay() === 6) card.classList.add('sat');
    if (d.getDay() === 0) card.classList.add('sun');
    card.innerHTML = `<span class="day">${days[d.getDay()]}</span><span class="date">${d.getDate()}</span>`;
    if (state.history[key] && state.history[key].urchinsToday > 0) {
      const dot = document.createElement('div');
      dot.style = 'width:4px;height:4px;background:var(--color-accent);border-radius:50%;margin-top:2px;';
      card.appendChild(dot);
    }
    card.onclick = () => {
      const data = state.history[key];
      if (data)
        speak(
          `${key} の記録：<br>水 ${data.water}ml / 睡眠 ${data.sleep}h<br>ウニ丼に ${data.urchinsToday}粒 貯めたよ！`,
        );
      else speak(key + ' の記録はないみたい');
    };
    strip.appendChild(card);
  }
}

const URCHIN = (() => {
  let canvas,
    ctx,
    spikes = [];
  function init() {
    canvas = document.getElementById('urchinCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    for (let i = 0; i < 16; i++) {
      const angle = Math.PI + 0.2 + (Math.PI * 2 - 0.4 - Math.PI) * (i / 15);
      spikes.push({ angle, phase: Math.random() * Math.PI * 2 });
    }
    canvas.onclick = () => {
      state.isVibrating = 30;
      speak('んふふ、くすぐったい');
    };
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sleepH = parseFloat(document.getElementById('valSleep')?.textContent || 0);
    const stretchC = Object.values(state.stretch).filter(Boolean).length;
    const baseR = 32 + Math.min(sleepH, 10) * 3.5;
    const bodyH = state.sleep.isSleeping ? baseR * 0.6 : baseR * 0.85;
    const spikeL = 22 + stretchC * 14;
    const cx = canvas.width / 2;
    let cy = canvas.height - (20 + (state.sleep.isSleeping ? 0 : 10));
    const time = Date.now() * (state.isVibrating > 0 ? 0.02 : 0.003);
    if (state.isVibrating > 0) {
      cx += (Math.random() - 0.5) * 1.2;
      cy += (Math.random() - 0.5) * 1.2;
      state.isVibrating--;
    }
    ctx.fillStyle = '#3D3250';
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR, bodyH, 0, Math.PI, 0);
    ctx.fill();
    spikes.forEach((s) => {
      const angle = s.angle + Math.sin(time + s.phase) * 0.05;
      const len = state.sleep.isSleeping ? spikeL * 0.4 : spikeL;
      const startX = cx + Math.cos(angle) * (baseR * 0.7);
      const startY = cy + Math.sin(angle) * (bodyH * 0.7);
      const ex = cx + Math.cos(angle) * (baseR + len);
      const ey = cy + Math.sin(angle) * (bodyH + len);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = '#3D3250';
      ctx.lineWidth = 4 + Math.min(sleepH, 10) * 0.8;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  return { init };
})();

function celebrate() {
  const container = document.getElementById('aquariumBG');
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'bubble-particle';
      s.style.left = Math.random() * 100 + '%';
      s.style.background = getRandom(['#F2A93B', '#FFF', '#70c7d4']);
      s.style.width = s.style.height = '6px';
      container.appendChild(s);
      setTimeout(() => s.remove(), 2000);
    }, i * 50);
  }
}

let bTimer;
function startBubbles(count) {
  if (bTimer) clearInterval(bTimer);
  if (count === 0) return;
  bTimer = setInterval(
    () => {
      const container = document.getElementById('aquariumBG');
      if (!container) return;
      const b = document.createElement('div');
      b.className = 'bubble-particle';
      const s = 4 + Math.random() * 8;
      b.style.width = b.style.height = s + 'px';
      b.style.left = 10 + Math.random() * 80 + '%';
      b.style.bottom = '-20px';
      b.style.animationDuration = 3 + Math.random() * 2 + 's';
      container.appendChild(b);
      setTimeout(() => b.remove(), 5000);
    },
    Math.max(3000 * Math.pow(0.7, count), 250),
  );
}

// ── 8. モーダル操作 ──
function openModal(type) {
  state.currentGoalType = type;
  document.getElementById('modalTitle').textContent = type === 'water' ? '水分目標 (ml)' : '睡眠目標 (時間)';
  document.getElementById('modalInput').value = state.goals[type];
  document.getElementById('goalModal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('goalModal').style.display = 'none';
}
function saveGoal() {
  state.goals[state.currentGoalType] = parseFloat(document.getElementById('modalInput').value);
  updateUI();
  closeModal();
}

function showUndon() {
  const modal = document.getElementById('undonModal');
  const rainArea = document.getElementById('urchinRainArea');
  const stamp = document.getElementById('tokumoriStamp');
  if (!modal || !rainArea) return;
  rainArea.innerHTML = '';
  modal.style.display = 'flex';
  document.getElementById('donCount').textContent = state.urchinCount;
  const displayCount = Math.min(state.urchinCount, 150);
  for (let i = 0; i < displayCount; i++) {
    setTimeout(() => {
      const grain = document.createElement('div');
      grain.className = 'urchin-grain';
      grain.style.left = 30 + Math.random() * 120 + 'px';
      grain.style.top = 30 + Math.random() * 30 + 'px';
      grain.style.setProperty('--r', `${(Math.random() - 0.5) * 60}deg`);
      grain.style.animation = `dropGrain 0.4s ease-out forwards`;
      rainArea.appendChild(grain);
    }, i * 30);
  }
  let rank = state.urchinCount >= 61 ? '特盛' : state.urchinCount >= 21 ? '大盛' : '並盛';
  if (stamp) {
    stamp.textContent = rank;
    stamp.classList.remove('show');
    setTimeout(() => stamp.classList.add('show'), displayCount * 30 + 500);
  }
}
function closeUndon() {
  document.getElementById('undonModal').style.display = 'none';
}

// ── 9. オートチャット ──
setInterval(() => {
  if (state.sleep.isSleeping) {
    speak('すー…すー…');
    return;
  }
  if (Date.now() - state.lastActionTime > 8000) {
    const cats = Object.keys(MESSAGES.auto);
    speak(getRandom(MESSAGES.auto[getRandom(cats)]));
  }
}, 10000);

// ── 10. 起動初期化 ──
window.onload = () => {
  document.addEventListener('touchstart', function () {}, true);
  checkNewDay();
  const slider = document.getElementById('waterSlider');
  if (slider) {
    slider.oninput = (e) => {
      state.water = parseInt(e.target.value);
      updateUI();
    };
  }
  const undonBtn = document.querySelector('.btn-undon');
  if (undonBtn) undonBtn.onclick = showUndon;
  URCHIN.init();
  initCalendar();
  updateUI();
  document.querySelectorAll('.info-icon').forEach((icon) => {
    icon.onclick = (e) => {
      e.stopPropagation();
      icon.classList.toggle('is-visible');
    };
  });
  document.onclick = () => {
    document.querySelectorAll('.info-icon').forEach((i) => i.classList.remove('is-visible'));
  };
};
