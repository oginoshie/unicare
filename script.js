'use strict';

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
};

// --- Utility ---
function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function updateUrchinCount(plus) {
  state.urchinCount += plus;
  localStorage.setItem('unicare_total_urchin', state.urchinCount);
}

function checkNewDay() {
  const now = new Date();
  const today = getTodayKey(now);

  if (state.lastDate && state.lastDate !== today) {
    state.water = 0;
    state.sun = 0;
    state.stretch = { morning: false, noon: false, night: false };
    state.celebrated = { water: false, sleep: false };

    if (now.getDay() === 1) {
      state.urchinCount = 0;
      localStorage.setItem('unicare_total_urchin', 0);
      speak('月曜日だ！新しい丼を溜めよう');
    }
    updateUI();
    initCalendar();
  }
  state.lastDate = today;
  localStorage.setItem('unicare_last_date', today);
}

function saveData() {
  checkNewDay();
  const hasActivity =
    state.water > 0 ||
    state.sun > 0 ||
    Object.values(state.stretch).some((v) => v) ||
    (state.sleep.bed && state.sleep.wake);
  if (hasActivity) localStorage.setItem(`unicare_${state.lastDate}`, 'true');
}

function initCalendar() {
  const strip = document.getElementById('calendarStrip');
  if (!strip) return;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const now = new Date();
  strip.innerHTML = '';
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    const card = document.createElement('div');
    card.className = 'date-card';
    if (i === 0) card.classList.add('active');
    if (d.getDay() === 6) card.classList.add('sat');
    if (d.getDay() === 0) card.classList.add('sun');
    let inner = `<span class="day">${days[d.getDay()]}</span><span class="date">${d.getDate()}</span>`;
    if (localStorage.getItem(`unicare_${getTodayKey(d)}`)) inner += `<div class="status-dot"></div>`;
    card.innerHTML = inner;
    strip.appendChild(card);
  }
}

// --- Effects ---
function celebrate() {
  const container = document.getElementById('sparkleContainer');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'sparkle-particle';
      const startX = 40 + Math.random() * 20;
      s.style.left = startX + (Math.random() - 0.5) * 40 + '%';
      s.style.bottom = '20%';
      const colors = ['#F2A93B', '#FFD700', '#fff', '#70c7d4'];
      s.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }, i * 40);
  }
}

// --- Urchin Logic ---
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
      const startAngle = Math.PI + 0.2;
      const endAngle = Math.PI * 2 - 0.2;
      const angle = startAngle + (endAngle - startAngle) * (i / 15);
      spikes.push({ angle: angle, phase: Math.random() * Math.PI * 2 });
    }
    canvas.onclick = () => {
      state.isVibrating = 30;
      speak('んふふ、くすぐったい');
    };
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sleepText = document.getElementById('valSleep')?.textContent || '0.0';
    const sleepHours = sleepText === '0.0' ? 0 : parseFloat(sleepText);
    const stretchCount = Object.values(state.stretch).filter(Boolean).length;

    const baseRadius = 32 + Math.min(sleepHours, 10) * 3.5;
    const bodyH = state.sleep.isSleeping ? baseRadius * 0.6 : baseRadius * 0.85;
    const spikeLen = 22 + stretchCount * 14;
    const spikeWidth = 4 + Math.min(sleepHours, 10) * 0.8;

    const marginBottom = 20 + (state.sleep.isSleeping ? 0 : 10);
    let cx = canvas.width / 2;
    let cy = canvas.height - marginBottom;

    const time = Date.now() * (state.isVibrating > 0 ? 0.02 : 0.003);
    if (state.isVibrating > 0) {
      cx += (Math.random() - 0.5) * 1.2;
      cy += (Math.random() - 0.5) * 1.2;
      state.isVibrating--;
    }

    ctx.fillStyle = '#3D3250';
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseRadius, bodyH, 0, Math.PI, 0);
    ctx.fill();

    spikes.forEach((s) => {
      const angle = s.angle + Math.sin(time + s.phase) * 0.05;
      const len = state.sleep.isSleeping ? spikeLen * 0.4 : spikeLen;
      const startX = cx + Math.cos(angle) * (baseRadius * 0.7);
      const startY = cy + Math.sin(angle) * (bodyH * 0.7);
      const ex = cx + Math.cos(angle) * (baseRadius + len);
      const ey = cy + Math.sin(angle) * (bodyH + len);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = '#3D3250';
      ctx.lineWidth = spikeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  return { init };
})();

// --- Action Handlers ---
function speak(text) {
  const el = document.getElementById('urchinSpeech');
  if (el) el.textContent = text;
  state.lastActionTime = Date.now();
}
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addWater(amt) {
  state.water += amt;
  updateUrchinCount(1);
  speak(getRandom(MESSAGES.water));
  updateUI();
}
function setWater(val) {
  state.water = parseInt(val);
  updateUI();
}
function resetWater() {
  state.water = 0;
  speak('のど、乾いたなあ〜');
  updateUI();
}

function toggleStretch(id) {
  state.stretch[id] = !state.stretch[id];
  if (state.stretch[id]) {
    updateUrchinCount(1);
    speak(getRandom(MESSAGES.stretch));
  }
  updateUI();
}

function addSun() {
  state.sun += 1;
  updateUrchinCount(1);
  speak(getRandom(MESSAGES.sun));
  updateUI();
}
function resetSun() {
  state.sun = 0;
  speak('また明日、太陽浴びよう');
  updateUI();
}

function startSleep() {
  state.sleep.isSleeping = true;
  speak('おやすみ…いい夢見てね');
  updateUI();
}
function endSleep() {
  state.sleep.isSleeping = false;
  updateUrchinCount(3);
  speak('おはよう！よく眠れた？');
  updateUI();
}

function updateSleepTime() {
  state.sleep.bed = document.getElementById('timeBed')?.value || '';
  state.sleep.wake = document.getElementById('timeWake')?.value || '';
  updateUI();
}

function openModal(type) {
  state.currentGoalType = type;
  const title = document.getElementById('modalTitle');
  const input = document.getElementById('modalInput');
  const modal = document.getElementById('goalModal');
  if (title) title.textContent = type === 'water' ? '水分目標 (ml)' : '睡眠目標 (時間)';
  if (input) input.value = state.goals[type];
  if (modal) modal.style.display = 'flex';
}
function closeModal() {
  const modal = document.getElementById('goalModal');
  if (modal) modal.style.display = 'none';
}
function saveGoal() {
  const val = document.getElementById('modalInput')?.value;
  state.goals[state.currentGoalType] = parseFloat(val);
  updateUI();
  closeModal();
}

// --- UI Update ---
function updateUI() {
  const valWaterEl = document.getElementById('valWater');
  const goalWaterEl = document.getElementById('goalWater');
  const slider = document.getElementById('waterSlider');
  const fill = document.getElementById('waterFill');
  const valSunEl = document.getElementById('valSun');
  const bg = document.getElementById('aquariumBG');

  if (valWaterEl) valWaterEl.textContent = state.water;
  if (goalWaterEl) goalWaterEl.textContent = state.goals.water;
  if (slider) slider.value = state.water;
  if (fill) fill.style.height = `${Math.min((state.water / state.goals.water) * 80, 100)}%`;
  if (valSunEl) valSunEl.textContent = state.sun;
  if (bg) bg.style.filter = `brightness(${Math.min(100 + state.sun * 2, 115)}%)`;

  const valSleepElem = document.getElementById('valSleep');
  if (valSleepElem) {
    if (!state.sleep.bed || !state.sleep.wake) {
      valSleepElem.textContent = '0.0';
    } else {
      const [bh, bm] = state.sleep.bed.split(':').map(Number);
      const [wh, wm] = state.sleep.wake.split(':').map(Number);
      let diff = wh * 60 + wm - (bh * 60 + bm);
      if (diff <= 0) diff += 1440;
      valSleepElem.textContent = (diff / 60).toFixed(1);
    }
  }

  const currentSleep = parseFloat(valSleepElem?.textContent || '0');
  const isWaterDone = state.water >= state.goals.water;
  const isSleepDone = currentSleep >= state.goals.sleep;
  const canvas = document.getElementById('urchinCanvas');

  if (isWaterDone || isSleepDone) {
    canvas?.classList.add('glow-active');
    if (isWaterDone && !state.celebrated.water) {
      speak('水分目標達成！\n体がキラキラしてきたよ✨');
      celebrate();
      state.celebrated.water = true;
    }
    if (isSleepDone && !state.celebrated.sleep) {
      speak('睡眠目標達成！\n今日はとっても元気だよ✨');
      celebrate();
      state.celebrated.sleep = true;
    }
  } else {
    canvas?.classList.remove('glow-active');
    if (!isWaterDone) state.celebrated.water = false;
    if (!isSleepDone) state.celebrated.sleep = false;
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

let bTimer;
function startBubbles(count) {
  if (bTimer) clearInterval(bTimer);
  if (count === 0) return;
  bTimer = setInterval(
    () => {
      const container = document.getElementById('bubbleContainer');
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

// --- Auto Chat ---
setInterval(() => {
  if (state.sleep.isSleeping) {
    speak('すー…すー…');
    return;
  }
  if (Date.now() - state.lastActionTime > 5000) {
    const cats = Object.keys(MESSAGES.auto);
    const cat = getRandom(cats);
    speak(getRandom(MESSAGES.auto[cat]));
  }
}, 7000);

// --- ウニ丼演出 ---
function handleUndonClick() {
  setTimeout(() => {
    showUndon();
  }, 200);
}

function showUndon() {
  const modal = document.getElementById('undonModal');
  const rainArea = document.getElementById('urchinRainArea');
  const stamp = document.getElementById('tokumoriStamp');
  const countDisplay = document.getElementById('donCount');

  if (!modal || !rainArea) return;

  rainArea.innerHTML = '';
  modal.style.display = 'flex';
  if (countDisplay) countDisplay.textContent = state.urchinCount;

  const displayCount = Math.min(state.urchinCount, 150);
  for (let i = 0; i < displayCount; i++) {
    setTimeout(() => {
      const grain = document.createElement('div');
      grain.className = 'urchin-grain';
      const x = 30 + Math.random() * 120;
      const y = 30 + Math.random() * 30;
      const r = (Math.random() - 0.5) * 60;
      grain.style.left = `${x}px`;
      grain.style.top = `${y}px`;
      grain.style.setProperty('--r', `${r}deg`);
      grain.style.animation = `dropGrain 0.4s ease-out forwards`;
      rainArea.appendChild(grain);
    }, i * 30);
  }

  let rank = '並盛';
  if (state.urchinCount >= 61) rank = '特盛';
  else if (state.urchinCount >= 21) rank = '大盛';

  if (stamp) {
    stamp.textContent = rank;
    stamp.classList.remove('show');
    setTimeout(
      () => {
        stamp.classList.add('show');
      },
      displayCount * 30 + 500,
    );
  }
}

function closeUndon() {
  const modal = document.getElementById('undonModal');
  if (modal) modal.style.display = 'none';
}

// --- 起動時の初期化 ---
window.onload = () => {
  checkNewDay();
  URCHIN.init();
  initCalendar();
  updateUI();
};
