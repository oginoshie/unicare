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
      '昨日より、たった1mmでいい',
      '焦らなくていい\nぼくもゆっくり育つから',
      '今日のぶんは、今日でじゅうぶん',
      'うまくいかない日も、ちゃんと数えてるよ',
      'なんか調子でないなってときは\n大抵なにかが足りないだけなんだ',
    ],
    chat: [
      '水、飲んだ？',
      'ぼくのトゲ、今日どうかな',
      '外、どんな天気だった？',
      'ちょっと伸びしてみて\nぼくも伸びるから',
      '今日のごはん、おいしかった？',
    ],
    tips: [
      '水は少しずつ\nこまめに飲むのがいいらしいよ',
      '背中、丸まってない？\nぼくのトゲみたいに伸ばして',
      '4秒吸って6秒吐くと\nリラックスできるって',
      '深呼吸、3回やると落ち着くらしい',
      '寝る前のスマホ、少し早めに置いてみて',
      'ストレッチは朝より夜のほうが\n筋肉が伸びやすいみたい',
      'ナトリウムもだいじだよ〜',
      '野菜は80〜95％\nご飯は60％くらい水なんだって',
      'ヒト、呼吸と皮膚の蒸発だけで\n約1L水を失ってるんだってね',
      'ヒト、1日1万回呼吸して\nワンルームの空気くらいを体に通しているんだって',
      '息をする時は\n吸うより吐くことを意識するといいよ',
      'ストレッチってね、筋肉を伸ばすというより\n体の神経システムを整える作業なんだって',
    ],
    trivia: [
      '2025年に、ウニは全身脳だと言われたよ\nヒトの脳は体重の2〜3%しかない\nぼくらの勝ちだね？',
      '棘皮動物の中で、海藻を食べるのは\nウニだけなんだよ',
      'ウニは俳句の季語にもなってるよ\n昔は夏、現在では春',
      'ウニには消化液がないんだ\nバクテリアに消化を任せているよ',
      'トゲが生えそろうには、4〜5年必要なんだ\n体づくりは年単位で考えるべきだね',
      '100歳以上生きてる仲間もいるらしいよ',
      'ヒトの体は約60%が水だけど\nウニの体は70〜75％!',
      'ウニのDNA, ヒトの遺伝子と似てるとか...',
    ],
    rest: [
      '無理しなくていい日もある',
      '寝ることも、立派なケアだよ',
      '今日のウニ、見て\nちゃんと育ってるから',
      '無理はしなければしないほうがいいんだよ',
      '自分を解放してあげられるのは\n自分しかいないよね',
      '能力がないなんて決めて\nトゲを引っ込めてしまってはダメだ',
      '外側ではなく\n内側に何があるのかが大事なんだ',
      'いつかできることはすべて、今日もできる',
    ],
  },
};

// ── 2. ステート管理 ──
const state = {
  water: 0,
  stretch: { morning: false, noon: false, night: false },
  sun: 0,
  sleep: {
    bedTimeObj: localStorage.getItem('unicare_bed_time_obj')
      ? new Date(localStorage.getItem('unicare_bed_time_obj'))
      : null,
    isSleeping: JSON.parse(localStorage.getItem('unicare_is_sleeping')) || false,
  },
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

// datetime-local(YYYY-MM-DDTHH:mm)形式の文字列を生成
function toLocalISO(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
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
  const valSleepElem = document.getElementById('valSleep');
  state.history[today] = {
    water: state.water,
    sun: state.sun,
    stretch: state.stretch,
    sleep: valSleepElem ? valSleepElem.textContent : '0.0',
    urchinsToday: state.isDonCalculated.water + state.isDonCalculated.sun + (state.isDonCalculated.sleep ? 3 : 0),
  };
  localStorage.setItem('unicare_history', JSON.stringify(state.history));
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

function setWater(val) {
  state.water = parseInt(val);
  const newGrains = Math.floor(state.water / 200);
  if (newGrains !== state.isDonCalculated.water) {
    updateUrchinCount(newGrains - state.isDonCalculated.water);
    state.isDonCalculated.water = newGrains;
    localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
  }
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

/** 睡眠開始（おやすみボタン） */
function startSleep() {
  const now = new Date();
  state.sleep.bedTimeObj = now;
  state.sleep.isSleeping = true;

  localStorage.setItem('unicare_bed_time_obj', now.toISOString());
  localStorage.setItem('unicare_is_sleeping', true);

  const inputBed = document.getElementById('timeBed');
  if (inputBed) inputBed.value = toLocalISO(now);

  speak('おやすみ…いい夢見てね');
  updateUI();
}

/** 起床（起きた！ボタン） */
function endSleep() {
  const storedBed = localStorage.getItem('unicare_bed_time_obj');
  if (!storedBed) {
    speak('「おやすみ」が押されてないみたい');
    return;
  }

  const bedDate = new Date(storedBed);
  const now = new Date();
  const diffMs = now - bedDate;
  const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

  state.sleep.isSleeping = false;
  localStorage.setItem('unicare_is_sleeping', false);

  const inputWake = document.getElementById('timeWake');
  if (inputWake) inputWake.value = toLocalISO(now);

  const valSleepElem = document.getElementById('valSleep');
  if (valSleepElem) valSleepElem.textContent = diffHours.toFixed(1).replace('.0', '');

  // 達成判定
  if (diffHours >= state.goals.sleep && !state.isDonCalculated.sleep) {
    updateUrchinCount(3);
    state.isDonCalculated.sleep = true;
    localStorage.setItem('unicare_don_calculated', JSON.stringify(state.isDonCalculated));
    createSparkle();
    speak('おはよう！目標達成だね、えらい！');
  } else {
    speak(`おはよう！<br>${diffHours.toFixed(1)}時間眠れたんだね。`);
  }
  updateUI();
}

/** 手入力（input変更時）の計算ロジック */
function updateSleepTime() {
  const bedVal = document.getElementById('timeBed')?.value;
  const wakeVal = document.getElementById('timeWake')?.value;
  if (bedVal && wakeVal) {
    const bedDate = new Date(bedVal);
    const wakeDate = new Date(wakeVal);
    const diffMs = wakeDate - bedDate;
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

    const valSleepElem = document.getElementById('valSleep');
    if (valSleepElem) valSleepElem.textContent = diffHours.toFixed(1).replace('.0', '');

    state.sleep.bedTimeObj = bedDate;
    localStorage.setItem('unicare_bed_time_obj', bedDate.toISOString());
  }
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
  if (fill) fill.style.height = `${Math.min((state.water / state.goals.water) * 85, 100)}%`;
  if (valSunEl) valSunEl.textContent = state.sun;
  if (bg) bg.style.filter = `brightness(${Math.min(100 + state.sun * 2, 115)}%)`;

  if (state.water >= state.goals.water && !state.celebrated.water) {
    celebrate();
    createSparkle();
    state.celebrated.water = true;
    speak('目標達成！<br>ウニが潤いで満たされたよ');
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
      dot.style = 'width:5px;height:5px;background:var(--color-accent);border-radius:50%;margin-top:4px;';
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
    const valSleepElem = document.getElementById('valSleep');
    const sleepH = valSleepElem ? parseFloat(valSleepElem.textContent || 0) : 0;
    const stretchC = Object.values(state.stretch).filter(Boolean).length;
    const baseR = 32 + Math.min(sleepH, 10) * 3.5;
    const bodyH = state.sleep.isSleeping ? baseR * 0.6 : baseR * 0.85;
    const spikeL = 22 + stretchC * 14;
    const cx = canvas.width / 2;
    let cy = canvas.height - (20 + (state.sleep.isSleeping ? 0 : 10));
    const time = Date.now() * (state.isVibrating > 0 ? 0.02 : 0.003);
    if (state.isVibrating > 0) {
      cx += (Math.random() - 0.5) * 2;
      cy += (Math.random() - 0.5) * 2;
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
  if (!container) return;
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

function createSparkle() {
  const container = document.getElementById('sparkleContainer');
  if (!container) return;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const flare = document.createElement('div');
      flare.className = 'sparkle-flare';
      const size = 60 + i * 40 + 'px';
      flare.style.width = size;
      flare.style.height = size;
      flare.style.left = '50%';
      flare.style.top = '70%';
      container.appendChild(flare);
      setTimeout(() => flare.remove(), 1000);
    }, i * 150);
  }
  const sparkleCount = 60;
  for (let i = 0; i < sparkleCount; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 150;
    const tx = Math.cos(angle) * dist + 'px';
    const ty = Math.sin(angle) * dist + 'px';
    s.style.setProperty('--tx', tx);
    s.style.setProperty('--ty', ty);
    const size = 8 + Math.random() * 12 + 'px';
    s.style.width = size;
    s.style.height = size;
    s.style.background = getRandom(['#FFF', '#FFF9E0', '#FEFDF5']);
    s.style.animationDelay = Math.random() * 0.3 + 's';
    s.style.left = '50%';
    s.style.top = '70%';
    container.appendChild(s);
    setTimeout(() => s.remove(), 1800);
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

function openModal(type) {
  state.currentGoalType = type;
  const title = document.getElementById('modalTitle');
  const input = document.getElementById('modalInput');
  if (title) title.textContent = type === 'water' ? '水分目標 (ml)' : '睡眠目標 (時間)';
  if (input) input.value = state.goals[type];
  document.getElementById('goalModal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('goalModal').style.display = 'none';
}
function saveGoal() {
  const input = document.getElementById('modalInput');
  if (input) {
    state.goals[state.currentGoalType] = parseFloat(input.value);
    updateUI();
  }
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

window.onload = () => {
  document.addEventListener('touchstart', function () {}, true);
  checkNewDay();
  const slider = document.getElementById('waterSlider');
  if (slider) slider.oninput = (e) => setWater(e.target.value);
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
