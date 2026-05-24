/* ================================================================
   望舒塔罗 v2 — app.js
   核心逻辑：页面切换、抽牌流程、解读展示、PWA注册
   ================================================================ */

// ==================== 全局状态 ====================
const state = {
  userName: '',
  userYear: null,
  userMonth: null,
  userDay: null,
  userHour: null,
  userGender: null,
  question: '',
  spreadType: 'single',   // 'single' | 'three' | 'celtic'
  drawnCards: [],          // [{card, orientation, position}]
  currentStep: 'welcome',
  isFlipped: [],
  shuffleCount: 0
};

const SPREAD_NAMES = {
  single: '单张指引',
  three: '三牌阵·过去现在未来',
  celtic: '凯尔特十字·十牌全盘'
};
const SPREAD_COUNTS = { single:1, three:3, celtic:10 };
const CELTIC_POSITIONS = [
  '现状','挑战','过去','未来','理想','近未来',
  '自我','环境','希望/恐惧','最终结果'
];

// ==================== 页面切换 ====================
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-'+id);
  if (el) {
    el.classList.add('active');
    state.currentStep = id;
    window.scrollTo({ top:0, behavior:'smooth' });
  }
}
const goStep = (id) => showSection(id);
window.goStep = goStep;

// ==================== 欢迎页 ====================
function initWelcome() {
  // 星空Canvas已在index.html中初始化
}

// ==================== 个人资料页 ====================
function updateDayOptions() {
  const monthSel = document.getElementById('input-month');
  const daySel = document.getElementById('input-day');
  const m = parseInt(monthSel.value);
  if (!m) { daySel.innerHTML = '<option value="">选择</option>'; return; }
  const daysInMonth = [31, (state.userYear && isLeap(state.userYear)?29:28), 31,30,31,30,31,31,30,31,30,31][m-1];
  let html = '<option value="">选择</option>';
  for (let d=1;d<=daysInMonth;d++) html += `<option value="${d}">${d}</option>`;
  daySel.innerHTML = html;
}
function isLeap(y) { return (y%4===0&&y%100!==0)||(y%400===0); }
window.updateDayOptions = updateDayOptions;

function submitProfile() {
  state.userName = document.getElementById('input-name').value.trim();
  state.userYear = parseInt(document.getElementById('input-year').value) || null;
  state.userMonth = parseInt(document.getElementById('input-month').value) || null;
  state.userDay = parseInt(document.getElementById('input-day').value) || null;
  state.userHour = document.getElementById('input-hour').value;
  state.userGender = document.getElementById('input-gender').value;
  state.question = document.getElementById('input-question').value.trim();
  
  // 计算星座（前端备用）
  if (state.userMonth && state.userDay) {
    state.userZodiac = getZodiac(state.userMonth, state.userDay);
  }
  
  showSection('spread');
}
window.submitProfile = submitProfile;

// ==================== 牌阵选择 ====================
function selectSpread(type) {
  state.spreadType = type;
  document.querySelectorAll('.spread-card').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById('spread-'+type);
  if (el) el.classList.add('selected');
}
window.selectSpread = selectSpread;

// ==================== 洗牌 & 抽牌（仪式感升级 v2.1） ====================

// 望舒的温柔台词库（按场景随机挑一句）
const WANGSHU_LINES = {
  shuffleStart: [
    '深呼吸一下，把心里那个问题轻轻地默念给我听...',
    '别急，先安静下来，让月光把你的心安抚平整...',
    '把眼睛闭上一会儿吧，我陪你把那件事想透...',
  ],
  shuffling: [
    '🌙 我在替你洗牌，让命运重新排列...',
    '✨ 月亮在旋转，星星在低语，等一等...',
    '🔮 牌正在感应你心里那道光...',
  ],
  pickPhase: {
    1: '从下面铺开的牌里，凭直觉选一张就好',
    3: '凭直觉，挑三张牌——按你心里冒出来的顺序',
    10: '深呼吸，依次选出十张牌——别想，跟着感觉走',
  },
  picking: [
    '嗯，这一张是你的',
    '好，下一张...',
    '心里冒出来的就是对的',
    '继续，别犹豫',
    '这一张也来自你心里',
    '快了，再选一张',
    '感觉对的就好',
    '别多想，跟着直觉',
    '快好了，最后几张',
    '完成啦，让我看看牌面',
  ],
  beforeReveal: [
    '所有的牌都在你面前了。深呼吸一下，准备好我们一起翻开它们好吗？',
    '牌已经选完，现在它们在等你亲手揭开——你也可以让我一次帮你全部翻开。',
  ],
  revealing: [
    '✨ 翻开了，让我看看月光给你带来什么...',
    '🌙 命运在牌面上展开了...',
  ],
};

function pickLine(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 切换 ritual-area 上方的提示语
function setRitualPrompt(text, sub) {
  const p = document.getElementById('ritual-prompt');
  const s = document.getElementById('ritual-sub');
  if (p) {
    p.style.opacity = '0';
    setTimeout(() => { p.textContent = text; p.style.opacity = '1'; }, 220);
  }
  if (s !== undefined && s) {
    if (sub === null || sub === undefined) {
      s.style.display = 'none';
    } else {
      s.style.display = 'block';
      s.textContent = sub;
    }
  }
}

// 渲染抽牌进度点
function renderDrawProgress(total, done) {
  const el = document.getElementById('draw-progress');
  if (!el) return;
  if (total <= 1) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  let html = '';
  for (let i = 0; i < total; i++) {
    html += `<div class="dot ${i < done ? 'done' : ''}"></div>`;
  }
  el.innerHTML = html;
}

// 阶段一：洗牌动画
function startShuffle() {
  const cluster = document.getElementById('deck-cluster');
  const fan = document.getElementById('fan-deck');
  const fanCounter = document.getElementById('fan-counter');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnDraw = document.getElementById('btn-draw');
  const drawnArea = document.getElementById('drawn-area');

  // 初始化界面
  if (cluster) { cluster.style.display = 'flex'; cluster.classList.add('shuffling'); }
  if (fan) fan.style.display = 'none';
  if (fanCounter) fanCounter.style.display = 'none';
  if (drawnArea) drawnArea.style.display = 'none';
  document.getElementById('btn-reveal').style.display = 'none';

  setRitualPrompt(pickLine(WANGSHU_LINES.shuffling), null);

  btnShuffle.style.display = 'none';
  btnDraw.style.display = 'none';

  state.shuffleCount++;

  // 1.8秒后停止洗牌，进入"准备抽牌"状态
  setTimeout(() => {
    if (cluster) cluster.classList.remove('shuffling');
    setRitualPrompt('🌙 牌洗好了', '准备好的话，就开始抽牌吧');
    btnDraw.style.display = 'inline-flex';
    btnShuffle.style.display = 'inline-flex';
    btnShuffle.textContent = '🔄 再洗一次';
  }, 1800);
}
window.startShuffle = startShuffle;

// 阶段二：进入"扇形铺开 + 用户挑牌"
function enterPickPhase() {
  const cluster = document.getElementById('deck-cluster');
  const fan = document.getElementById('fan-deck');
  const fanCounter = document.getElementById('fan-counter');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnDraw = document.getElementById('btn-draw');

  if (cluster) cluster.style.display = 'none';
  if (fan) fan.style.display = 'flex';
  if (fanCounter) fanCounter.style.display = 'block';

  btnShuffle.style.display = 'none';
  btnDraw.style.display = 'none';

  const count = SPREAD_COUNTS[state.spreadType];
  setRitualPrompt(WANGSHU_LINES.pickPhase[count] || '从牌阵里选出你的牌', '点击牌面选择，已选出的牌会飞到上方');

  // 渲染扇形牌堆（22张 = 大阿卡纳数量做扇形够用）
  renderFanDeck();
  renderDrawProgress(count, 0);

  // 重置抽牌状态
  state.drawnCards = [];
  state.isFlipped = [];
  state.pickedIndices = new Set();

  // 服务端洗的牌序（实际抽的牌从这里取）
  state.serverDeck = shuffleDeck([...FULL_DECK]);
  state.serverOrientations = state.serverDeck.map(() => Math.random() < 0.65 ? 'up' : 'rev');

  // 准备抽出区域
  document.getElementById('drawn-area').style.display = 'block';
  document.getElementById('drawn-cards-container').innerHTML = '';
}
window.enterPickPhase = enterPickPhase;

// 渲染扇形牌堆（视觉用，22张）
function renderFanDeck() {
  const fan = document.getElementById('fan-deck');
  if (!fan) return;
  const N = 22;
  const spread = 90; // 总角度
  const radius = 180;
  let html = '';
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);  // 0..1
    const angle = -spread/2 + spread * t;  // -45..+45 度
    const x = Math.sin(angle * Math.PI / 180) * radius;
    const y = -Math.cos(angle * Math.PI / 180) * 30;
    const tf = `translate(${x}px,${y}px) rotate(${angle}deg)`;
    html += `<div class="fan-card" data-idx="${i}" style="--fan-tf:${tf};transform:${tf};z-index:${i};" onclick="pickFanCard(${i})"></div>`;
  }
  fan.innerHTML = html;
}

// 用户从扇形里挑牌
function pickFanCard(fanIdx) {
  const count = SPREAD_COUNTS[state.spreadType];
  if (state.drawnCards.length >= count) return;
  if (state.pickedIndices.has(fanIdx)) return;

  state.pickedIndices.add(fanIdx);

  // 标记 fan-card 为已选
  const fanEl = document.querySelector(`.fan-card[data-idx="${fanIdx}"]`);
  if (fanEl) fanEl.classList.add('picked');

  // 从 server 牌序里取下一张作为这一次的牌
  const serverIdx = state.drawnCards.length;
  const card = state.serverDeck[serverIdx];
  const orientation = state.serverOrientations[serverIdx];
  state.drawnCards.push({ card, orientation, position: serverIdx });
  state.isFlipped.push(false);

  // 渲染抽出的牌（从牌堆飞出动效）
  appendDrawnCard(serverIdx);

  // 更新进度 + 提示语
  renderDrawProgress(count, state.drawnCards.length);
  const lines = WANGSHU_LINES.picking;
  const idx = Math.min(state.drawnCards.length - 1, lines.length - 1);
  showToast(lines[idx]);

  // 全部抽完
  if (state.drawnCards.length >= count) {
    setTimeout(() => {
      // 隐藏扇形和进度
      document.getElementById('fan-deck').style.display = 'none';
      document.getElementById('fan-counter').style.display = 'none';
      document.getElementById('draw-progress').style.display = 'none';
      setRitualPrompt('🌙 全部选完了', null);

      // 显示望舒气泡
      showWangshuBubble(pickLine(WANGSHU_LINES.beforeReveal));

      // 单张直接翻
      if (count === 1) {
        setTimeout(() => revealAll(), 800);
      } else {
        document.getElementById('btn-reveal').style.display = 'inline-flex';
      }
    }, 600);
  } else {
    // 更新计数器
    const counter = document.getElementById('fan-counter');
    if (counter) counter.innerHTML = `已选 <strong>${state.drawnCards.length}</strong> / ${count}`;
  }
}
window.pickFanCard = pickFanCard;

// 在抽出区追加一张牌（带飞入动效）
function appendDrawnCard(i) {
  const container = document.getElementById('drawn-cards-container');
  const item = state.drawnCards[i];
  const count = state.drawnCards.length;
  const totalCount = SPREAD_COUNTS[state.spreadType];

  const wrap = document.createElement('div');
  wrap.className = 'drawn-card fly-in';
  wrap.dataset.index = i;
  if (item.orientation === 'rev') wrap.classList.add('is-rev');

  // 飞入起点偏移
  const flyX = (i % 2 === 0 ? -1 : 1) * (Math.random() * 60 + 20);
  const flyRot = (Math.random() * 30 - 15);
  wrap.style.setProperty('--fly-x', flyX + 'px');
  wrap.style.setProperty('--fly-rot', flyRot + 'deg');

  const posLabel = getPositionLabel(i);
  wrap.innerHTML = `
    <div class="card-inner" id="card-inner-${i}">
      <div class="front">${getCardSVG(item.card)}</div>
      <div class="back">
        <div style="text-align:center;">
          <div style="font-size:18px;opacity:0.5;">🌙</div>
          <div style="font-size:9px;margin-top:4px;opacity:0.4;letter-spacing:1px;">点击翻开</div>
        </div>
      </div>
    </div>
    ${totalCount > 1 ? `<div class="position-label">${posLabel}</div>` : ''}
    <div class="flip-hint">点击翻开</div>
  `;

  wrap.addEventListener('click', () => flipCard(i));
  container.appendChild(wrap);
}

// 兼容老接口（保留以防别处调用）
function drawCards() { enterPickPhase(); }
window.drawCards = drawCards;

function renderDrawnCards() {
  // 兼容旧调用：完整重渲（很少触发）
  const container = document.getElementById('drawn-cards-container');
  container.innerHTML = '';
  state.drawnCards.forEach((_, i) => appendDrawnCard(i));
}

function getPositionLabel(i) {
  if (state.spreadType === 'three') {
    return ['过去','现在','未来'][i];
  }
  if (state.spreadType === 'celtic') {
    return CELTIC_POSITIONS[i] || `位置${i+1}`;
  }
  return '';
}

function flipCard(index) {
  if (state.isFlipped[index]) return;
  state.isFlipped[index] = true;
  const el = document.getElementById(`card-inner-${index}`);
  if (!el) return;
  const wrap = el.parentElement;
  wrap.classList.add('flipping');
  setTimeout(() => wrap.classList.add('flipped'), 50);
  setTimeout(() => wrap.classList.remove('flipping'), 900);

  // 全部翻开 → 自动进入解读
  if (state.isFlipped.every(Boolean)) {
    setTimeout(() => showReading(), 1200);
  }
}
window.flipCard = flipCard;

function revealAll() {
  showToast(pickLine(WANGSHU_LINES.revealing));
  state.drawnCards.forEach((_, i) => {
    setTimeout(() => flipCard(i), i * 250);
  });
  document.getElementById('btn-reveal').style.display = 'none';
}
window.revealAll = revealAll;

// 望舒气泡（在抽牌区上方插入）
function showWangshuBubble(text) {
  const ritual = document.getElementById('ritual-area');
  if (!ritual) return;
  // 移除旧气泡
  const old = ritual.parentElement.querySelector('.wangshu-bubble');
  if (old) old.remove();

  const bubble = document.createElement('div');
  bubble.className = 'wangshu-bubble';
  bubble.innerHTML = `
    <div class="ws-avatar">🌙</div>
    <div class="ws-content">
      <div class="ws-name">望舒</div>
      <div class="ws-text">${text}</div>
    </div>
  `;
  ritual.parentElement.insertBefore(bubble, ritual.nextSibling);
}

// ==================== 解读展示 ====================

// 后端API地址：
// - 同源部署（推荐）：FastAPI 直接挂载前端，API_BASE 留空走相对路径
// - 跨源调试：把 API_BASE 改成 'http://localhost:8000'
// - 后端没起来时自动 fallback 到前端模板解读
const API_BASE = (location.protocol === 'file:') ? 'http://localhost:8000' : '';

function showReading() {
  showSection('reading');
  const container = document.getElementById('reading-container');
  container.innerHTML = '';

  // 温暖问候开场
  const name = state.userName || '亲爱的';
  const greetings = [
    `${name}，牌已经全部翻开了。让我慢慢说给你听。`,
    `${name}，月光在牌面上落下了答案。我把它读给你听。`,
    `${name}，这是月亮和星辰一起为你写下的回答——别紧张，我陪你看。`,
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  let infoHTML = `<div class="reading-intro">
    <div class="greeting">🌙 <strong>${greeting}</strong></div>`;

  if (state.question) {
    infoHTML += `<div class="question-quote">「${state.question}」</div>`;
  }

  // 元信息行
  const metaParts = [];
  if (state.userYear && state.userMonth && state.userDay) {
    const zodiac = state.userZodiac || getZodiac(state.userMonth, state.userDay);
    if (zodiac) metaParts.push(`<span class="meta-tag">星座<span class="v">${zodiac}</span></span>`);
  }
  metaParts.push(`<span class="meta-tag">牌阵<span class="v">${SPREAD_NAMES[state.spreadType] || ''}</span></span>`);
  if (metaParts.length) {
    infoHTML += `<div class="meta-line">${metaParts.join('')}</div>`;
  }
  infoHTML += `</div>`;

  // 加载提示（在请求后端时显示）
  infoHTML += `<div class="loading-shimmer" id="reading-loading">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    <span>望舒正在为你解读...</span>
  </div>`;

  container.innerHTML = infoHTML;

  // 先尝试调用后端AI，失败则用前端模板
  tryAIReading(container).catch(() => {
    const loading = document.getElementById('reading-loading');
    if (loading) loading.remove();
    renderFallbackReading(container);
  });
}

async function tryAIReading(container) {
  // 构建请求体（同时提供两种字段名，兼容旧/新后端 schema）
  const body = {
    name: state.userName || '访客',
    // 短字段（后端 ReadingRequest 主字段）
    year: state.userYear,
    month: state.userMonth,
    day: state.userDay,
    hour: state.userHour ? parseInt(state.userHour) : null,
    // 长字段别名（兼容前端早期版本）
    birth_year: state.userYear,
    birth_month: state.userMonth,
    birth_day: state.userDay,
    birth_hour: state.userHour ? parseInt(state.userHour) : null,
    gender: state.userGender || null,
    question: state.question || '',
    spread_type: state.spreadType,
    cards: state.drawnCards.map(item => ({
      id: item.card.id || 0,
      name: item.card.name,
      en: item.card.en || '',
      type: item.card.type || 'major',
      orientation: item.orientation,
      position: item.position
    }))
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const resp = await fetch(`${API_BASE}/api/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) throw new Error('API error');

    const data = await resp.json();
    // 移除加载提示
    const loading = document.getElementById('reading-loading');
    if (loading) loading.remove();
    renderAIReading(container, data);
  } catch (e) {
    clearTimeout(timeout);
    throw e; // 让外层catch处理
  }
}

function renderAIReading(container, data) {
  // 兼容两种格式：
  //   A) 结构化：{ synthesis, card_readings: [{card_name, position, orientation, reading}], bazi, zodiac }
  //   B) 纯文本：{ ai_reading } 或 { reading }
  const cardReadings = data.card_readings || [];
  const synthesis = data.synthesis || data.ai_reading || data.reading || '';
  const bazi = data.bazi;

  // 八字简报（如果后端返回了）
  if (bazi && bazi.day_master && bazi.day_master !== '未知') {
    const baziHTML = `
      <div class="reading-card" style="background:linear-gradient(135deg,rgba(107,92,154,0.08),rgba(200,160,80,0.04));">
        <div class="card-header" style="border-bottom:1px solid rgba(200,160,80,0.15);">
          <div style="font-size:32px;width:48px;text-align:center;">📜</div>
          <div>
            <div class="card-name">你的八字小记</div>
            <div class="card-pos">${bazi.year_pillar} · ${bazi.month_pillar} · ${bazi.day_pillar} · ${bazi.hour_pillar}</div>
          </div>
        </div>
        <div class="reading-section">
          <div class="section-label">日主与喜忌</div>
          <div class="section-text">日主${bazi.day_master}，强弱：${bazi.strength}，喜：${bazi.favorable}</div>
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', baziHTML);
  }

  // 逐张牌：优先用后端返回的 reading，否则用前端 fallback
  state.drawnCards.forEach((item, i) => {
    const { card, orientation } = item;
    const posLabel = getPositionLabel(i);
    const orientationLabel = orientation === 'up' ? '正位' : '逆位';
    const orientationClass = orientation === 'up' ? 'up' : 'rev';

    // 后端的逐牌解读（如果有）
    const aiCard = cardReadings[i];
    const aiReadingText = aiCard ? aiCard.reading : '';

    // 前端 fallback 文案（即使有 AI，也保留"直接回答"作为辅助）
    const directAnswer = state.question ? getDirectAnswer(card, orientation, state.question) : '';
    const meaning = orientation === 'up' ? card.up : card.rev;

    let sectionsHTML = '';
    if (aiReadingText) {
      sectionsHTML += `
        <div class="reading-section">
          <div class="section-label">🌙 望舒为你解读</div>
          <div class="section-text" style="white-space:pre-wrap;">${aiReadingText}</div>
        </div>`;
    } else {
      sectionsHTML += `
        <div class="reading-section">
          <div class="section-label">📜 牌面信息</div>
          <div class="section-text">${meaning}</div>
        </div>`;
    }
    if (state.question && directAnswer && !aiReadingText) {
      sectionsHTML += `
        <div class="reading-section" style="border-left:3px solid var(--gold-dim);padding-left:12px;">
          <div class="section-label">🎯 直接回答</div>
          <div class="section-text" style="font-weight:600;">${directAnswer}</div>
        </div>`;
    }

    const cardHTML = `
      <div class="reading-card">
        <div class="card-header">
          <div class="card-mini">${getCardSVG(card)}</div>
          <div>
            <div class="card-name">${card.name} · ${card.en || ''}</div>
            <div class="card-pos">${posLabel ? posLabel + ' · ' : ''}${orientationLabel}</div>
          </div>
          <span class="card-orientation ${orientationClass}">${orientationLabel}</span>
        </div>
        ${sectionsHTML}
      </div>`;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });

  // 综合解读
  if (synthesis) {
    container.insertAdjacentHTML('beforeend', `
      <div class="synthesis-panel">
        <div class="synthesis-title">🌙 望舒的综合心声</div>
        <div class="synthesis-text" style="white-space:pre-wrap;line-height:1.85;">${synthesis}</div>
        <div style="text-align:center;margin-top:14px;">
          <span class="ai-badge">✨ AI · 望舒亲述</span>
        </div>
      </div>
    `);
  }

  // 触发进入动画
  triggerReadingAnimation(container);
}

function renderFallbackReading(container) {
  // 前端模板解读（后端不可用时的降级方案）

  // 逐张牌展示
  state.drawnCards.forEach((item, i) => {
    const { card, orientation } = item;
    const meaning = orientation === 'up' ? card.up : card.rev;
    const posLabel = getPositionLabel(i);
    const orientationLabel = orientation === 'up' ? '正位' : '逆位';
    const orientationClass = orientation === 'up' ? 'up' : 'rev';

    // 生成针对问题的直接回答
    const directAnswer = getDirectAnswer(card, orientation, state.question);
    const reason = getReason(card, orientation, state.question);
    const advice = getAdvice(card, orientation, state.question);

    const cardHTML = `
      <div class="reading-card">
        <div class="card-header">
          <div class="card-mini">${getCardSVG(card)}</div>
          <div>
            <div class="card-name">${card.name} · ${card.en}</div>
            <div class="card-pos">${posLabel ? posLabel + ' · ' : ''}${orientationLabel}</div>
          </div>
          <span class="card-orientation ${orientationClass}">${orientationLabel}</span>
        </div>
        <div class="reading-section">
          <div class="section-label">📜 牌面信息</div>
          <div class="section-text">${meaning}</div>
        </div>
        ${state.question ? `
        <div class="reading-section" style="border-left:3px solid var(--gold-dim);padding-left:12px;">
          <div class="section-label">🎯 直接回答</div>
          <div class="section-text" style="font-weight:600;">${directAnswer}</div>
        </div>
        <div class="reading-section">
          <div class="section-label">💡 原因</div>
          <div class="section-text">${reason}</div>
        </div>
        <div class="reading-section">
          <div class="section-label">⚡ 建议</div>
          <div class="section-text">${advice}</div>
        </div>` : ''}
      </div>`;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });

  // 综合解读——直接给结论
  const synthesis = generateDirectSynthesis();
  container.insertAdjacentHTML('beforeend', `
    <div class="synthesis-panel">
      <div class="synthesis-title">🌙 望舒的综合结论</div>
      <div class="synthesis-text" style="white-space:pre-wrap;line-height:1.8;">${synthesis}</div>
    </div>
  `);

  // 触发进入动画
  triggerReadingAnimation(container);
}

function triggerReadingAnimation(container) {
  setTimeout(() => {
    container.querySelectorAll('.reading-card,.synthesis-panel').forEach((el,i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }, 100);
}

// ==================== 直接回答逻辑 ====================

function getDirectAnswer(card, orientation, question) {
  if (!question) return orientation === 'up' ? card.up : card.rev;

  const q = question.toLowerCase();
  const isUp = orientation === 'up';

  // 判断问题类型
  const isAboutLove = /感情|爱|恋|婚|对象|分手|复合|暧昧|在一起/.test(q);
  const isAboutWork = /工作|事业|求职|离职|升职|跳槽|创业|项目|合作|面试/.test(q);
  const isAboutMoney = /钱|财|投资|收入|还钱|借钱|买房|股票/.test(q);
  const isAboutDecision = /该不该|能不能|行不行|成不成|要不要|可不可以|是否|会不会|值得/.test(q);

  // 大阿卡纳的关键判断
  if (card.type === 'major') {
    const majorAnswers = {
      0: { up: '可以大胆尝试，但别太冲动', rev: '现在不是行动的好时机，准备不足' },
      1: { up: '能成！你手上的资源足够', rev: '方向有问题，先停下来想清楚' },
      2: { up: '先等等，答案还没到揭晓的时候', rev: '你在忽视直觉，别自欺欺人' },
      3: { up: '会顺利，值得期待', rev: '付出太多回报太少，该调整了' },
      4: { up: '按规矩来能成，别想走捷径', rev: '你控制欲太强，让人想跑' },
      5: { up: '找前辈指点，按传统路径走', rev: '别被条条框框限制，该打破常规了' },
      6: { up: '值得选择，真心投入就有好结果', rev: '选择困难会害你错过机会' },
      7: { up: '全力冲！能赢', rev: '方向偏了，越努力越远' },
      8: { up: '以柔克刚，温柔比你想象的有力量', rev: '你在自我怀疑，其实你比你想的强' },
      9: { up: '别急，先想清楚再行动', rev: '你在逃避，躲着不解决问题' },
      10: { up: '好运来了，抓住！转折就在眼前', rev: '倒霉期还没过，别硬撑' },
      11: { up: '公道自在人心，付出会有回报', rev: '不公平的待遇要先处理，不能忍' },
      12: { up: '换个角度看，答案就不一样了', rev: '你在白等，该行动了' },
      13: { up: '旧的不去新的不来，必须先结束', rev: '你抗拒改变，但不变更惨' },
      14: { up: '别急，慢慢来反而更快', rev: '你走极端了，需要找平衡' },
      15: { up: '你被什么东西绑住了，先挣脱再说', rev: '你正在觉醒，这是个好信号' },
      16: { up: '会有剧变，但崩塌之后是重建', rev: '你在逃避必要的改变' },
      17: { up: '希望还在，别放弃', rev: '你太悲观了，事情没你想的那么糟' },
      18: { up: '信息不全，别急着下结论', rev: '真相快浮出水面了，做好准备' },
      19: { up: '能成！这是最好的牌，放心去干', rev: '暂时有阴影，但不会太久' },
      20: { up: '到了做决定的时候了，别犹豫', rev: '你在逃避审判，该面对了' },
      21: { up: '圆满收工，事情会画上句号', rev: '还差最后一步，别松懈' }
    };
    const answer = majorAnswers[card.id];
    if (answer) return isUp ? answer.up : answer.rev;
  }

  // 小阿卡纳按花色判断
  const suitAnswers = {
    '权杖': { up: '主动出击能成，别犹豫', rev: '行动方向不对，先调整策略' },
    '圣杯': { up: '跟从内心，情感上会有好的回应', rev: '情绪化会坏事，冷静一点' },
    '宝剑': { up: '理性分析后行动，想清楚再干', rev: '想太多反而不敢动，该决断了' },
    '星币': { up: '稳扎稳打能成，别贪快', rev: '基础不牢，先补短板' }
  };
  const suit = card.suit;
  if (suit && suitAnswers[suit]) {
    return isUp ? suitAnswers[suit].up : suitAnswers[suit].rev;
  }

  return isUp ? card.up : card.rev;
}

function getReason(card, orientation, question) {
  if (!question) return '';
  const isUp = orientation === 'up';

  // 大阿卡纳的原因分析
  if (card.type === 'major') {
    const majorReasons = {
      0: { up: '愚人代表全新的开始和无限可能，你没有包袱，反而能走出新路。', rev: '你还没准备好就出发了，计划不够周全，容易踩坑。' },
      1: { up: '魔术师说明所有条件都已具备，缺的只是你的行动。', rev: '你的才能没有用在正确的地方，或者资源分散了。' },
      2: { up: '女祭司说时机未到，有些事情需要等待才能看清。', rev: '你忽视了自己的直觉，在用理性压制内心的声音。' },
      3: { up: '女皇代表丰盛和滋养，周围的条件在支持你。', rev: '你在过度付出而忽略了自己，能量被消耗了。' },
      4: { up: '皇帝代表秩序和权威，按既定规则行事最有效。', rev: '你太想控制一切，反而失去了灵活性和人情味。' },
      5: { up: '教皇说有前辈和传统可以依靠，不用一个人扛。', rev: '你被旧观念束缚了，该质疑那些"应该"了。' },
      6: { up: '恋人代表真心的选择，内心真正想要的才是对的。', rev: '你在两难中犹豫不决，害怕选错反而什么都错过了。' },
      7: { up: '战车代表意志力和胜利，你的决心就是最大的武器。', rev: '你冲错了方向，意志力用在了不该用的地方。' },
      8: { up: '力量不在硬碰硬，在于以柔克刚，耐心比蛮力更有用。', rev: '你低估了自己，自我怀疑消耗了你的能量。' },
      9: { up: '隐者说现在需要独处和反思，想清楚了再出发。', rev: '你在用独处逃避问题，封闭自己不是解决方式。' },
      10: { up: '命运之轮说运势正在转向有利你的方向，顺势而为。', rev: '当前运势低迷，逆势操作会碰壁。' },
      11: { up: '正义说因果循环，你之前做的努力会有回报。', rev: '不公平的状况还没解决，这不是忍的时候。' },
      12: { up: '倒吊人说换个角度看问题，答案会截然不同。', rev: '你在无谓地等待和牺牲，其实该行动了。' },
      13: { up: '死神说旧的必须结束，新的才能开始，不破不立。', rev: '你在死死抓住过去不放，恐惧改变。' },
      14: { up: '节制说需要平衡和耐心，欲速则不达。', rev: '你走极端了，任何事过犹不及。' },
      15: { up: '恶魔说你被某种执念或欲望绑住了，这才是根本问题。', rev: '你开始意识到自己被困住了，这是挣脱的第一步。' },
      16: { up: '高塔说现有的结构需要崩塌才能重建，是阵痛不是灾难。', rev: '你在抗拒必要的改变，越拖越痛。' },
      17: { up: '星星说希望和疗愈正在到来，黑暗快过去了。', rev: '你被绝望感笼罩，但那只是暂时的情绪。' },
      18: { up: '月亮说你看到的不一定是真相，有信息被隐藏了。', rev: '迷雾正在散去，真相即将浮出。' },
      19: { up: '太阳代表光明和成功，一切都在最好的状态。', rev: '乌云暂时遮住了太阳，但阳光还在。' },
      20: { up: '审判说到了清算和觉醒的时刻，该做决定了。', rev: '你在逃避面对真实的自己。' },
      21: { up: '世界代表圆满和完成，一段旅程即将画上句号。', rev: '还差最后一步，别在终点前放弃。' }
    };
    const reason = majorReasons[card.id];
    if (reason) return isUp ? reason.up : reason.rev;
  }

  // 小阿卡纳
  const suitReasons = {
    '权杖': { up: '权杖代表行动和热情，你的主动和冲劲是关键因素。', rev: '权杖逆位说明行动力受阻，要么方向不对要么动力不足。' },
    '圣杯': { up: '圣杯代表情感和直觉，你的真诚和用心是最大的优势。', rev: '圣杯逆位说明情绪在干扰判断，心太乱了。' },
    '宝剑': { up: '宝剑代表智慧和理性，想清楚了就能找到出路。', rev: '宝剑逆位说明想太多反而乱了阵脚，或者信息有误。' },
    '星币': { up: '星币代表踏实和积累，你的坚持和务实是成功的基石。', rev: '星币逆位说明根基不稳，物质条件或能力还有欠缺。' }
  };
  const suit = card.suit;
  if (suit && suitReasons[suit]) {
    return isUp ? suitReasons[suit].up : suitReasons[suit].rev;
  }

  return isUp ? card.up : card.rev;
}

function getAdvice(card, orientation, question) {
  if (!question) return '';
  const isUp = orientation === 'up';

  if (card.type === 'major') {
    const majorAdvice = {
      0: { up: '放手去做，但给自己留条后路。', rev: '先做计划，磨刀不误砍柴工。' },
      1: { up: '立刻行动，别浪费手上的好牌。', rev: '重新审视方向，别在错的地方使劲。' },
      2: { up: '给事情一点时间，急着要答案反而看不清。', rev: '安静下来听听内心的声音。' },
      3: { up: '享受当下的好状态，同时继续投入。', rev: '先照顾好自己，才能给出更好的。' },
      4: { up: '用规则和纪律去推进，别想当然。', rev: '放一放手，给别人也给自己空间。' },
      5: { up: '找一个你信任的前辈聊一聊。', rev: '试着打破一条你认为"必须"的规则。' },
      6: { up: '遵从内心做选择，不要因为害怕而将就。', rev: '给自己设一个做决定的期限，别再拖了。' },
      7: { up: '认准方向就全力冲，别回头看。', rev: '停下来确认方向对不对，再冲也不迟。' },
      8: { up: '用温柔和耐心去化解，别硬刚。', rev: '回想一下你上次自信的时候，那份力量还在。' },
      9: { up: '给自己一天独处的时间，好好想清楚。', rev: '走出自己的世界，找人聊聊。' },
      10: { up: '顺势而为，好运来了要接住。', rev: '接受当下的不顺，不要和命运较劲。' },
      11: { up: '做正确的事，结果自然会对。', rev: '站出来维护自己的权益，沉默不是金。' },
      12: { up: '试试站在对方的立场想想，答案会不同。', rev: '别再等了，先迈出第一步。' },
      13: { up: '主动结束该结束的，别等它自己烂掉。', rev: '接受改变是唯一的出路，越早越好。' },
      14: { up: '保持节奏，不急不躁地推进。', rev: '找到中间地带，别走极端。' },
      15: { up: '问自己：是什么在绑住我？然后解开它。', rev: '你已经在觉醒的路上了，继续走。' },
      16: { up: '让该崩的崩，崩完你会更清楚要什么。', rev: '与其被动等崩塌，不如主动变革。' },
      17: { up: '相信事情在变好，继续保持希望。', rev: '找一件让你开心的小事，从那里开始。' },
      18: { up: '别在信息不全时做重大决定，再等等。', rev: '真相快来了，做好面对的准备。' },
      19: { up: '大胆去干，这是最好的时机。', rev: '别被一时的阴影吓到，阳光还在。' },
      20: { up: '是时候做个了断了，拖下去对你没好处。', rev: '面对真实的自己，逃避只会让问题更大。' },
      21: { up: '庆祝你的成果，你值得。', rev: '坚持住，最后一步往往最难。' }
    };
    const advice = majorAdvice[card.id];
    if (advice) return isUp ? advice.up : advice.rev;
  }

  const suitAdvice = {
    '权杖': { up: '别想了，先动起来。', rev: '停下来想想，现在的方向对吗？' },
    '圣杯': { up: '跟着感觉走，别压抑自己的心。', rev: '先把情绪处理好了再做决定。' },
    '宝剑': { up: '想清楚逻辑，理性决策。', rev: '别想太多了，有时候直觉比分析靠谱。' },
    '星币': { up: '一步一步来，稳比快重要。', rev: '先把基础打牢，别急着往上冲。' }
  };
  const suit = card.suit;
  if (suit && suitAdvice[suit]) {
    return isUp ? suitAdvice[suit].up : suitAdvice[suit].rev;
  }

  return isUp ? '顺势而为。' : '谨慎行事。';
}

function generateDirectSynthesis() {
  const cards = state.drawnCards;
  const q = state.question || '';

  // 统计正逆位比例
  const upCount = cards.filter(c => c.orientation === 'up').length;
  const revCount = cards.length - upCount;
  const positiveRatio = upCount / cards.length;

  // 判断整体趋势
  let verdict = '';
  let verdictEmoji = '';
  if (positiveRatio >= 0.7) {
    verdict = '看好，成的概率大';
    verdictEmoji = '✅';
  } else if (positiveRatio >= 0.4) {
    verdict = '有变数，需要你主动调整';
    verdictEmoji = '⚡';
  } else {
    verdict = '不太乐观，但不是没救';
    verdictEmoji = '⚠️';
  }

  // 构建综合结论
  let text = `${verdictEmoji} 结论：${verdict}\n`;
  text += `（正位${upCount}张 / 逆位${revCount}张）\n\n`;

  if (state.spreadType === 'single') {
    const c = cards[0];
    const isUp = c.orientation === 'up';
    text += `单张「${c.card.name}」${isUp ? '正位' : '逆位'}：`;
    text += getDirectAnswer(c.card, c.orientation, q) + '\n\n';
    text += `原因：${getReason(c.card, c.orientation, q)}\n\n`;
    text += `建议：${getAdvice(c.card, c.orientation, q)}`;
  } else if (state.spreadType === 'three') {
    const [past, present, future] = cards;
    text += `▸ 过去「${past.card.name}」：${getDirectAnswer(past.card, past.orientation, q)}\n`;
    text += `  → 这说明你之前的经历在这样影响你。\n\n`;
    text += `▸ 现在「${present.card.name}」：${getDirectAnswer(present.card, present.orientation, q)}\n`;
    text += `  → 这是你当前最需要面对的核心问题。\n\n`;
    text += `▸ 未来「${future.card.name}」：${getDirectAnswer(future.card, future.orientation, q)}\n`;
    text += `  → 朝这个方向调整，结果会不同。\n\n`;
    text += `综合来看：`;
    if (future.orientation === 'up') {
      text += `未来牌正位，说明只要你现在做出调整，结果是向好的。`;
    } else {
      text += `未来牌逆位，说明如果你维持现状不变，结果不太理想。关键在于现在就行动。`;
    }
  } else {
    // 凯尔特十字
    text += `十牌全盘解读：\n\n`;
    CELTIC_POSITIONS.forEach((pos, i) => {
      if (i < cards.length) {
        const c = cards[i];
        text += `▸ ${pos}「${c.card.name}」${c.orientation === 'up' ? '正位' : '逆位'}：${getDirectAnswer(c.card, c.orientation, q)}\n`;
      }
    });
    text += `\n整体来看：`;
    if (positiveRatio >= 0.6) {
      text += `牌面正位居多，整体趋势是向好的，但要注意逆位牌指出的隐患。`;
    } else {
      text += `牌面逆位偏多，阻力较大，但逆位也意味着潜力——只要找到问题根源并解决它，局面就能翻转。`;
    }
  }

  if (q) {
    text += `\n\n━━━━━━━━━━━━━━\n\n`;
    text += `关于你问的「${q}」：\n\n`;

    // 看有没有大牌
    const hasMajor = cards.some(c => c.card.type === 'major');
    const majorCards = cards.filter(c => c.card.type === 'major');

    if (majorCards.length > 0) {
      text += `出现了${majorCards.length}张大阿卡纳（`;
      text += majorCards.map(c => c.card.name).join('、');
      text += `），说明这件事对你的人生有重要影响，不是小事。\n\n`;
    }

    if (positiveRatio >= 0.7) {
      text += `牌面整体偏正面，这件事大概率能成。但别因此松懈——正位多说明条件好，不代表不用努力。关键是：${getAdvice(cards[Math.floor(cards.length/2)].card, cards[Math.floor(cards.length/2)].orientation, q)}`;
    } else if (positiveRatio >= 0.4) {
      text += `牌面有正有逆，说明这件事有希望但也不少阻碍。成败的关键在于你现在的选择和行动。最重要的建议：${getAdvice(cards.find(c => c.orientation === 'rev')?.card || cards[0].card, 'rev', q)}`;
    } else {
      text += `牌面逆位偏多，这件事目前不太顺利。但逆位不是死刑——它告诉你问题在哪。解决了根源问题，局面就能扭转。最该注意的：${getReason(cards.find(c => c.orientation === 'rev')?.card || cards[0].card, 'rev', q)}`;
    }
  }

  text += `\n\n——望舒 🌙`;
  return text;
}

// ==================== 重置 ====================
function resetAll() {
  state.drawnCards = [];
  state.isFlipped = [];
  state.shuffleCount = 0;
  showSection('welcome');
}
window.resetAll = resetAll;

// ==================== Toast ====================
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ==================== PWA Service Worker ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  initWelcome();
  
  // 月份变化时更新日期选项
  const monthSel = document.getElementById('input-month');
  if (monthSel) {
    monthSel.addEventListener('change', updateDayOptions);
  }
});
