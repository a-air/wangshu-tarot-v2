/* ================================================================
   望舒塔罗 v2 — cards.js
   78张牌数据 + SVG生成函数
   ================================================================ */

// ==================== 大阿卡纳 ====================
const MAJOR_ARCANA = [
  {id:0,name:"愚人",en:"The Fool",up:"新的开始、纯真、自由、冒险",rev:"犹豫不决、鲁莽、缺乏计划",
   love:"一段新鲜缘分的开始，别想太多，跟着感觉走",career:"换个方向试试看，不要怕从头开始",wealth:"可能有意外的小收获"},
  {id:1,name:"魔术师",en:"The Magician",up:"创造力、行动力、掌控局面",rev:"计划不周、才能没发挥出来",
   love:"主动一点会赢，你的魅力正在线",career:"现在是你发光的时候，资源都在你手上",wealth:"能把想法变成钱"},
  {id:2,name:"女祭司",en:"The High Priestess",up:"直觉、等待、内在智慧",rev:"秘密、与直觉失联",
   love:"有些事还不到揭晓的时候，耐心等等",career:"相信直觉，先观察再行动",wealth:"隐藏的机会，别急着出手"},
  {id:3,name:"女皇",en:"The Empress",up:"丰盛、滋养、创造力",rev:"创造力卡住了、太依赖别人",
   love:"感情甜蜜期，适合表达爱意",career:"创意爆发，艺术类工作特别顺",wealth:"财运不错，享受生活的同时也有收获"},
  {id:4,name:"皇帝",en:"The Emperor",up:"权威、秩序、领导力",rev:"控制欲太强、僵化",
   love:"稳定可靠的关系，但别太强势",career:"升职掌权的好时机",wealth:"财务结构稳定，适合做规划"},
  {id:5,name:"教皇",en:"The Hierophant",up:"传统、导师、精神指引",rev:"打破常规、挑战权威",
   love:"可能会得到长辈认可的关系",career:"找前辈请教，按规矩来能成",wealth:"保守理财比较合适"},
  {id:6,name:"恋人",en:"The Lovers",up:"真爱、和谐、重要选择",rev:"关系不和谐、选择困难",
   love:"命中注定的缘分来了，但要你真心选",career:"面临重要的岔路口",wealth:"合伙或联名的事有利"},
  {id:7,name:"战车",en:"The Chariot",up:"胜利、决心、勇往直前",rev:"失控、方向不对",
   love:"主动追求能成功",career:"全力冲刺的时候到了",wealth:"果断出手能赚到"},
  {id:8,name:"力量",en:"Strength",up:"内在力量、温柔驯服",rev:"自我怀疑、软弱",
   love:"用温柔化解矛盾，别硬来",career:"以柔克刚比硬碰硬管用",wealth:"克制冲动消费"},
  {id:9,name:"隐者",en:"The Hermit",up:"独处、内省、智慧",rev:"孤独、逃避",
   love:"需要一个人静一静想清楚",career:"埋头钻研的时候，别急",wealth:"谨慎理财，不宜大动作"},
  {id:10,name:"命运之轮",en:"Wheel of Fortune",up:"转折、好运、时机到了",rev:"倒霉期、抗拒改变",
   love:"命运的转折带来新缘分",career:"好运在转动，抓住机会",wealth:"财运在变好，等着"},
  {id:11,name:"正义",en:"Justice",up:"公平、因果、真相",rev:"不公平、逃避责任",
   love:"付出多少得到多少，公平得很",career:"合同签约有利，法律事务顺利",wealth:"收支会平衡"},
  {id:12,name:"倒吊人",en:"The Hanged Man",up:"换角度看、牺牲、等待",rev:"拖延、白白等待",
   love:"为爱等待是值得的",career:"换个角度会发现新路",wealth:"暂时牺牲换长远回报"},
  {id:13,name:"死神",en:"Death",up:"结束、重生、蜕变",rev:"抗拒改变、停滞",
   love:"旧的不去新的不来",career:"必须放下旧模式才有出路",wealth:"旧的财务方式要改了"},
  {id:14,name:"节制",en:"Temperance",up:"平衡、调和、耐心",rev:"失衡、走极端",
   love:"需要双方慢慢磨合",career:"工作生活要找平衡",wealth:"稳健规划，不贪不急"},
  {id:15,name:"恶魔",en:"The Devil",up:"束缚、执念、物质欲望",rev:"挣脱、觉醒",
   love:"小心不健康的依赖关系",career:"你是不是被钱或工作绑架了？",wealth:"对钱的执念要审视"},
  {id:16,name:"高塔",en:"The Tower",up:"剧变、崩塌、真相",rev:"逃避改变",
   love:"真相可能突然炸出来",career:"旧体系崩塌是重建的机会",wealth:"意外的财务冲击，也是重新开始"},
  {id:17,name:"星星",en:"The Star",up:"希望、疗愈、灵感",rev:"绝望、失去信心",
   love:"伤会好的，新的希望在等你",career:"灵感爆棚，做创意特别棒",wealth:"财务状况在好转"},
  {id:18,name:"月亮",en:"The Moon",up:"迷惑、恐惧、看不清",rev:"真相浮出",
   love:"感情里有些事情你还没看清",career:"信息不全别做重大决定",wealth:"有隐藏风险，小心点"},
  {id:19,name:"太阳",en:"The Sun",up:"成功、快乐、温暖、最好的牌",rev:"暂时阴霾、太乐观",
   love:"感情阳光灿烂！",career:"如日中天，成果被认可",wealth:"财运最好的时候"},
  {id:20,name:"审判",en:"Judgement",up:"觉醒、召唤、清算",rev:"自我怀疑、拒绝面对",
   love:"旧情复燃还是彻底翻篇？",career:"重要的评估和跃升机会",wealth:"过去的投资该收网了"},
  {id:21,name:"世界",en:"The World",up:"圆满、完成、大成",rev:"未完成、差一点",
   love:"感情修成正果",career:"重要里程碑达成",wealth:"财务目标实现"}
];

// ==================== 小阿卡纳 ====================
const SUITS = ['权杖','圣杯','宝剑','星币'];
const RANKS = ['一','二','三','四','五','六','七','八','九','十','侍从','骑士','皇后','国王'];

function buildDeck(){
  const deck = [];
  MAJOR_ARCANA.forEach(c => deck.push({...c, type:'major'}));
  const suitThemes = {
    '权杖':{kw:'行动、热情、事业',love:'主动表达你的热情',career:'行动力就是答案',wealth:'积极进取'},
    '圣杯':{kw:'情感、直觉、关系',love:'用心感受对方的心意',career:'跟着内心的热情走',wealth:'心灵满足比钱重要'},
    '宝剑':{kw:'智慧、抉择、沟通',love:'理性沟通解决问题',career:'清晰思考再做决定',wealth:'理性规划'},
    '星币':{kw:'物质、稳定、积累',love:'踏实的承诺比甜言蜜语重要',career:'专注技能提升',wealth:'慢慢积累会看到回报'}
  };
  const rankMean = {
    '一':{up:'新的开始',rev:'机会溜走'},
    '二':{up:'需要选择',rev:'犹豫'},
    '三':{up:'初步成果',rev:'进展慢'},
    '四':{up:'稳固一下',rev:'太死板'},
    '五':{up:'有竞争',rev:'冲突'},
    '六':{up:'恢复平衡',rev:'失衡'},
    '七':{up:'坚持住',rev:'想放弃'},
    '八':{up:'加速前进',rev:'别急'},
    '九':{up:'快到了',rev:'还差一点'},
    '十':{up:'圆满',rev:'负担'},
    '侍从':{up:'新消息',rev:'坏消息'},
    '骑士':{up:'冲！',rev:'太冲动'},
    '皇后':{up:'成熟稳重',rev:'没安全感'},
    '国王':{up:'掌控全局',rev:'管太多'}
  };
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      const rm = rankMean[rank];
      const st = suitThemes[suit];
      deck.push({
        id:deck.length, name:`${suit}${rank}`, en:`${rank} of ${suit}`, type:'minor', suit, rank,
        up:`${st.kw} · ${rm.up}`, rev:`${rm.rev}`,
        love:st.love, career:st.career, wealth:st.wealth
      });
    });
  });
  return deck;
}
const FULL_DECK = buildDeck();

// ==================== 牌面SVG生成 ====================
function cardFrame(accent){
  return `<rect width="130" height="190" rx="14" fill="#1a1a30" stroke="${accent}" stroke-width="1.2"/>
  <rect x="5" y="5" width="120" height="180" rx="10" fill="none" stroke="${accent}" stroke-width="0.35" opacity="0.45"/>
  <circle cx="17" cy="17" r="1.8" fill="${accent}" opacity="0.4"/>
  <circle cx="113" cy="17" r="1.8" fill="${accent}" opacity="0.4"/>
  <circle cx="17" cy="173" r="1.8" fill="${accent}" opacity="0.4"/>
  <circle cx="113" cy="173" r="1.8" fill="${accent}" opacity="0.4"/>`;
}

function getMinorSVG(suit, rank){
  const C = {'权杖':'#e8956a','圣杯':'#6bb5e0','宝剑':'#a0c0f0','星币':'#6ecf6e'};
  const c = C[suit];
  const se = {'权杖':'🔥','圣杯':'🏆','宝剑':'⚔️','星币':'⭐'}[suit];
  const dr = {
    '权杖':(x,y,s,A)=>{const z=s||1;return`<rect x="${x-3*z}" y="${y-13*z}" width="${6*z}" height="${22*z}" rx="${2*z}" fill="${c}" opacity="0.8"/><ellipse cx="${x}" cy="${y-16*z}" rx="${5*z}" ry="${6*z}" fill="${c}" opacity="0.35"/>`},
    '圣杯':(x,y,s,A)=>{const z=s||1;const r=8*z;return`<ellipse cx="${x}" cy="${y-4*z}" rx="${r}" ry="${r*0.6}" fill="none" stroke="${c}" stroke-width="${1.3*z}"/><ellipse cx="${x}" cy="${y-6*z}" rx="${r*0.7}" ry="${r*0.3}" fill="${c}" opacity="0.15"/><path d="M${x-r*0.85} ${y-2*z} Q${x-r*0.7} ${y+6*z} ${x-2*z} ${y+9*z} L${x-2.5*z} ${y+14*z} L${x+2.5*z} ${y+14*z} L${x+2*z} ${y+9*z} Q${x+r*0.7} ${y+6*z} ${x+r*0.85} ${y-2*z}" fill="none" stroke="${c}" stroke-width="${1.2*z}"/>`},
    '宝剑':(x,y,s,A)=>{const z=s||1;return`<line x1="${x}" y1="${y-14*z}" x2="${x}" y2="${y+12*z}" stroke="${c}" stroke-width="${1.5*z}"/><line x1="${x-7*z}" y1="${y-4*z}" x2="${x+7*z}" y2="${y-4*z}" stroke="${c}" stroke-width="${1.2*z}"/><circle cx="${x}" cy="${y-2*z}" r="${2*z}" fill="${c}" opacity="0.4"/>`},
    '星币':(x,y,s,A)=>{const z=s||1;return`<circle cx="${x}" cy="${y}" r="${8*z}" fill="none" stroke="${c}" stroke-width="${1.2*z}"/><circle cx="${x}" cy="${y}" r="${4*z}" fill="${c}" opacity="0.25"/><text x="${x}" y="${y+2*z}" font-size="${5*z}" fill="${c}" text-anchor="middle" opacity="0.7">★</text>`}
  };
  const D = dr[suit];
  const R = RANKS.indexOf(rank);

  // 数字牌 (1-10)
  if(R <= 9){
    const positions = [
      [[65,90]],                         // 一
      [[45,85],[85,85]],                // 二
      [[65,70],[45,95],[85,95]],      // 三
      [[45,75],[85,75],[45,105],[85,105]], // 四
      [[40,72],[80,72],[65,88],[40,108],[80,108]], // 五
      [[45,70],[65,70],[85,70],[45,95],[85,95],[65,110]], // 六
      [[40,68],[65,65],[90,68],[40,82],[70,80],[95,82],[50,105]], // 七
      [[40,65],[60,62],[80,62],[95,70],[35,85],[55,83],[75,83],[100,88]], // 八
      [[45,62],[65,62],[85,62],[45,80],[65,80],[85,80],[45,100],[65,100],[85,100]], // 九
      [[45,60],[65,60],[85,60],[45,78],[65,78],[85,78],[45,96],[65,96],[85,96],[65,113]]  // 十
    ];
    const poses = positions[R] || positions[0];
    const ROT = [[0,0,1.8],[0,0,1.5],[0,0,1.2],[0,0,0.9],[0,0,0.8],[0,0,0.75],[0,0,0.7],[0,0,0.65],[0,0,0.6],[0,0,0.55]];
    const sw = (ROT[R]&&ROT[R][2])||0.6;
    let inner = '';
    if(suit==='圣杯' && R<=4){
      // 圣杯 一～五：用精美圣杯图案
      if(R===0){
        inner = `<circle cx="65" cy="90" r="28" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.3"/>${D(65,90,1.8)}<text x="65" y="170" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">${se}</text><text x="65" y="184" font-size="9" fill="#a09888" text-anchor="middle">开始·潜能</text>`;
      } else {
        poses.forEach(p=>{ inner += D(p[0],p[1],sw); });
        inner += `<text x="65" y="174" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">`;
        for(let i=0;i<poses.length;i++) inner += se;
        inner += `</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">`;
        const labels = ['','平衡·抉择','成长·合作','稳定·巩固','竞争·挑战','和谐·分享','反思·坚持','前进·行动','满足·收获','完成·圆满'];
        inner += labels[R]||''; inner += `</text>`;
      }
    } else {
      poses.forEach(p=>{ inner += D(p[0],p[1],sw); });
      // 数字牌底部标签
      const labels = ['开始·潜能','平衡·抉择','成长·合作','稳定·巩固','竞争·挑战','恢复平衡','反思·坚持','加速前进','快到了✨','完成·圆满'];
      inner += `<text x="65" y="174" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">`;
      for(let i=0;i<poses.length;i++) inner += se;
      inner += `</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">${labels[R]||''}</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 190">${cardFrame(c)}${inner}</svg>`;
  }

  // 宫廷牌 (侍从/骑士/皇后/国王)
  const courtSVG = {
    '侍从': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 190">${cardFrame(c)}<text x="65" y="22" font-size="10" fill="${c}" text-anchor="middle" font-weight="bold">${suit}侍从</text><circle cx="65" cy="48" r="10" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="65" cy="48" r="4" fill="${c}" opacity="0.3"/><line x1="65" y1="58" x2="65" y2="85" stroke="${c}" stroke-width="1.8"/><line x1="50" y1="68" x2="80" y2="68" stroke="${c}" stroke-width="1" opacity="0.5"/><line x1="65" y1="85" x2="55" y2="110" stroke="${c}" stroke-width="1.2"/><line x1="65" y1="85" x2="75" y2="110" stroke="${c}" stroke-width="1.2"/>${D(65,125,0.8)}<text x="65" y="172" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">学习·消息</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">新讯息</text></svg>`,
    '骑士': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 190">${cardFrame(c)}<text x="65" y="22" font-size="10" fill="${c}" text-anchor="middle" font-weight="bold">${suit}骑士</text><circle cx="65" cy="45" r="9" fill="none" stroke="${c}" stroke-width="1.2"/><line x1="65" y1="54" x2="65" y2="75" stroke="${c}" stroke-width="1.8"/><line x1="45" y1="62" x2="85" y2="62" stroke="${c}" stroke-width="1.2"/><ellipse cx="65" cy="90" rx="24" ry="12" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/><text x="65" y="94" font-size="6" fill="${c}" text-anchor="middle" opacity="0.5">🐴</text>${D(80,78,1)}<circle cx="50" cy="100" r="6" fill="none" stroke="${c}" stroke-width="1"/><circle cx="80" cy="100" r="6" fill="none" stroke="${c}" stroke-width="1"/><text x="65" y="172" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">行动·冲刺</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">冲！</text></svg>`,
    '皇后': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 190">${cardFrame(c)}<text x="65" y="22" font-size="10" fill="${c}" text-anchor="middle" font-weight="bold">${suit}皇后</text><path d="M50 44 L65 30 L80 44 L76 38 L65 34 L54 38 Z" fill="${c}" opacity="0.6"/><circle cx="65" cy="54" r="10" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="65" cy="54" r="4" fill="${c}" opacity="0.3"/><rect x="45" y="66" width="40" height="30" rx="5" fill="none" stroke="${c}" stroke-width="1.2"/><line x1="65" y1="96" x2="55" y2="118" stroke="${c}" stroke-width="1"/><line x1="65" y1="96" x2="75" y2="118" stroke="${c}" stroke-width="1"/>${D(85,95,0.9)}<text x="65" y="172" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">滋养·成熟</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">👑</text></svg>`,
    '国王': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 190">${cardFrame(c)}<text x="65" y="22" font-size="10" fill="${c}" text-anchor="middle" font-weight="bold">${suit}国王</text><rect x="45" y="35" width="40" height="12" rx="5" fill="${c}" opacity="0.55"/><rect x="50" y="44" width="30" height="6" rx="2" fill="${c}" opacity="0.3"/><circle cx="65" cy="58" r="11" fill="none" stroke="${c}" stroke-width="1.3"/><rect x="48" y="70" width="34" height="28" rx="5" fill="none" stroke="${c}" stroke-width="1.2"/><line x1="65" y1="70" x2="65" y2="58" stroke="${c}" stroke-width="0.8"/><line x1="65" y1="98" x2="55" y2="115" stroke="${c}" stroke-width="1"/><line x1="65" y1="98" x2="75" y2="115" stroke="${c}" stroke-width="1"/>${D(60,90,1)}<text x="65" y="172" font-size="7" fill="${c}" text-anchor="middle" opacity="0.7">掌控·成就</text><text x="65" y="185" font-size="9" fill="#a09888" text-anchor="middle">👑</text></svg>`
  };
  return courtSVG[rank] || courtSVG['侍从'];
}

function getMajorSVG(id){
  const A='#d4a853';
  const F = cardFrame(A);
  const svgs = [
    // 0 愚人
    `<svg viewBox="0 0 130 190">${F}<defs><radialGradient id="fool_sun" cx="50%" cy="50%"><stop offset="0%" stop-color="#f0d78c" stop-opacity="0.6"/><stop offset="100%" stop-color="#f0d78c" stop-opacity="0"/></radialGradient></defs><text x="65" y="20" font-size="9" fill="#f0d78c" text-anchor="middle" font-weight="bold">THE FOOL</text><text x="65" y="34" font-size="7" fill="#d4a853" text-anchor="middle" opacity="0.7">0 · 愚人</text><circle cx="65" cy="55" r="18" fill="url(#fool_sun)"/><circle cx="65" cy="55" r="8" fill="#f0d78c" opacity="0.85"/><path d="M65 120 Q60 95 45 110 L35 145" fill="none" stroke="#e8956a" stroke-width="1.8"/><path d="M65 120 Q70 95 85 110 L95 145" fill="none" stroke="#e8956a" stroke-width="1.8"/><circle cx="65" cy="120" r="10" fill="none" stroke="#e8956a" stroke-width="1.2" opacity="0.5"/><circle cx="65" cy="120" r="4" fill="#e8956a" opacity="0.4"/><text x="65" y="178" font-size="7" fill="#a09888" text-anchor="middle" opacity="0.6">新的开始 · 自由 · 冒险</text></svg>`,
    // 1 魔术师
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">魔术师</text><path d="M55 75 Q65 55 75 75" fill="none" stroke="#f0d78c" stroke-width="2"/><circle cx="65" cy="50" r="6" fill="none" stroke="#f0d78c" stroke-width="1.5"/><rect x="42" y="85" width="46" height="4" rx="2" fill="#e8956a"/><circle cx="55" cy="100" r="5" fill="#6ecf6e" opacity="0.8"/><circle cx="75" cy="100" r="5" fill="#6bb5e0" opacity="0.8"/><line x1="65" y1="95" x2="65" y2="120" stroke="#a0c0f0" stroke-width="1.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">创造力 · 行动</text></svg>`,
    // 2 女祭司
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">女祭司</text><path d="M65 42 Q52 55 65 68 Q78 55 65 42" fill="none" stroke="#6bb5e0" stroke-width="1.8"/><circle cx="65" cy="55" r="12" fill="none" stroke="#6bb5e0" stroke-width="1" opacity="0.5"/><circle cx="65" cy="55" r="3" fill="#f0d78c"/><rect x="40" y="80" width="50" height="25" rx="3" fill="none" stroke="#7b5ea7" stroke-width="1"/><line x1="52" y1="86" x2="52" y2="100" stroke="#7b5ea7" stroke-width="0.5" opacity="0.5"/><line x1="65" y1="86" x2="65" y2="100" stroke="#7b5ea7" stroke-width="0.5" opacity="0.5"/><line x1="78" y1="86" x2="78" y2="100" stroke="#7b5ea7" stroke-width="0.5" opacity="0.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">直觉 · 等待</text></svg>`,
    // 3 女皇
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">女皇</text><circle cx="65" cy="42" r="8" fill="#e892a8" opacity="0.4"/><circle cx="65" cy="42" r="4" fill="#e892a8" opacity="0.7"/><path d="M65 50 L55 42 L75 42 Z" fill="#f0d78c" opacity="0.6"/><path d="M65 50 L40 70 L80 95" fill="none" stroke="#6ecf6e" stroke-width="1.5" opacity="0.5"/><path d="M65 50 L90 70 L50 95" fill="none" stroke="#6ecf6e" stroke-width="1.5" opacity="0.5"/><ellipse cx="65" cy="75" rx="22" ry="12" fill="none" stroke="#f0d78c" stroke-width="0.8" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">丰盛 · 创造</text></svg>`,
    // 4 皇帝
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">皇帝</text><rect x="40" y="38" width="50" height="12" rx="4" fill="#d4a853" opacity="0.6"/><rect x="45" y="48" width="40" height="6" rx="2" fill="#d4a853" opacity="0.3"/><circle cx="65" cy="68" r="14" fill="none" stroke="#e8956a" stroke-width="1.5"/><rect x="46" y="85" width="38" height="30" rx="5" fill="none" stroke="#d4a853" stroke-width="1.2"/><line x1="56" y1="85" x2="56" y2="68" stroke="#d4a853" stroke-width="0.6"/><line x1="74" y1="85" x2="74" y2="68" stroke="#d4a853" stroke-width="0.6"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">权威 · 领导</text></svg>`,
    // 5 教皇
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">教皇</text><circle cx="65" cy="52" r="16" fill="none" stroke="#7b5ea7" stroke-width="1.2"/><path d="M50 60 L65 42 L80 60" fill="none" stroke="#f0d78c" stroke-width="1.5"/><path d="M55 60 L65 50 L75 60" fill="none" stroke="#f0d78c" stroke-width="0.8" opacity="0.5"/><line x1="65" y1="60" x2="65" y2="85" stroke="#7b5ea7" stroke-width="1.5"/><rect x="45" y="85" width="40" height="20" rx="4" fill="none" stroke="#7b5ea7" stroke-width="1"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">传统 · 指引</text></svg>`,
    // 6 恋人
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">恋人</text><circle cx="48" cy="58" r="9" fill="none" stroke="#e892a8" stroke-width="1.2"/><circle cx="82" cy="58" r="9" fill="none" stroke="#e892a8" stroke-width="1.2"/><path d="M48 67 Q48 78 56 82" fill="none" stroke="#e892a8" stroke-width="0.8"/><path d="M82 67 Q82 78 74 82" fill="none" stroke="#e892a8" stroke-width="0.8"/><line x1="57" y1="58" x2="73" y2="58" stroke="#f0d78c" stroke-width="1" opacity="0.5"/><circle cx="65" cy="120" r="18" fill="none" stroke="#f0d78c" stroke-width="0.8" opacity="0.3"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">真爱 · 选择</text></svg>`,
    // 7 战车
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">战车</text><rect x="38" y="48" width="54" height="30" rx="4" fill="none" stroke="#e8956a" stroke-width="1.2"/><circle cx="52" cy="63" r="7" fill="none" stroke="#e8956a" stroke-width="1"/><circle cx="78" cy="63" r="7" fill="none" stroke="#e8956a" stroke-width="1"/><line x1="58" y1="48" x2="58" y2="90" stroke="#f0d78c" stroke-width="1.2"/><line x1="72" y1="48" x2="72" y2="90" stroke="#f0d78c" stroke-width="1.2"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">胜利 · 冲刺</text></svg>`,
    // 8 力量
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">力量</text><circle cx="65" cy="52" r="10" fill="none" stroke="#e892a8" stroke-width="1.5"/><circle cx="65" cy="52" r="3" fill="#e892a8"/><path d="M45 85 Q65 65 85 85" fill="none" stroke="#e892a8" stroke-width="1.5" opacity="0.5"/><path d="M65 60 L65 90" stroke="#e892a8" stroke-width="1.5" opacity="0.4"/><path d="M50 100 Q65 85 80 100" fill="none" stroke="#f0d78c" stroke-width="1"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">温柔 · 力量</text></svg>`,
    // 9 隐者
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">隐者</text><circle cx="65" cy="48" r="8" fill="none" stroke="#7b5ea7" stroke-width="1.2"/><circle cx="65" cy="48" r="3" fill="#f0d78c"/><line x1="65" y1="56" x2="65" y2="90" stroke="#7b5ea7" stroke-width="2"/><line x1="48" y1="70" x2="82" y2="70" stroke="#7b5ea7" stroke-width="1" opacity="0.5"/><circle cx="65" cy="100" r="6" fill="none" stroke="#f0d78c" stroke-width="1"/><path d="M55 115 Q65 100 75 115" fill="none" stroke="#7b5ea7" stroke-width="0.8" opacity="0.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">内省 · 智慧</text></svg>`,
    // 10 命运之轮
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">命运之轮</text><circle cx="65" cy="65" r="24" fill="none" stroke="#f0d78c" stroke-width="1.2" opacity="0.5"/><circle cx="65" cy="65" r="18" fill="none" stroke="#e8956a" stroke-width="0.8" opacity="0.4"/><line x1="65" y1="41" x2="65" y2="89" stroke="#f0d78c" stroke-width="1.5"/><line x1="41" y1="65" x2="89" y2="65" stroke="#f0d78c" stroke-width="1.5"/><line x1="48" y1="48" x2="82" y2="82" stroke="#f0d78c" stroke-width="0.8" opacity="0.4"/><line x1="82" y1="48" x2="48" y2="82" stroke="#f0d78c" stroke-width="0.8" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">转折 · 好运</text></svg>`,
    // 11 正义
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">正义</text><line x1="40" y1="50" x2="90" y2="50" stroke="#6bb5e0" stroke-width="1.5"/><line x1="65" y1="40" x2="65" y2="60" stroke="#6bb5e0" stroke-width="1.5"/><circle cx="65" cy="50" r="6" fill="none" stroke="#f0d78c" stroke-width="1.2"/><rect x="42" y="75" width="46" height="4" rx="2" fill="#e8956a"/><line x1="65" y1="79" x2="65" y2="105" stroke="#a0c0f0" stroke-width="1.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">公平 · 因果</text></svg>`,
    // 12 倒吊人
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">倒吊人</text><circle cx="65" cy="55" r="14" fill="none" stroke="#a09888" stroke-width="1.2"/><circle cx="60" cy="52" r="3" fill="#a09888" opacity="0.5"/><circle cx="73" cy="58" r="2" fill="#a09888" opacity="0.4"/><path d="M45 55 L85 55" stroke="#a09888" stroke-width="0.8" opacity="0.4"/><line x1="65" y1="69" x2="65" y2="100" stroke="#a09888" stroke-width="2"/><line x1="45" y1="70" x2="85" y2="95" stroke="#e892a8" stroke-width="1.2" opacity="0.5"/><circle cx="55" cy="115" r="5" fill="none" stroke="#f0d78c" stroke-width="0.8" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">换角度 · 牺牲</text></svg>`,
    // 13 死神
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">死神</text><circle cx="65" cy="55" r="14" fill="none" stroke="#a09888" stroke-width="1.2"/><circle cx="60" cy="52" r="3" fill="#a09888" opacity="0.5"/><circle cx="73" cy="58" r="2" fill="#a09888" opacity="0.4"/><path d="M50 58 L80 58" stroke="#a09888" stroke-width="0.8" opacity="0.4"/><line x1="65" y1="69" x2="65" y2="100" stroke="#a09888" stroke-width="2"/><path d="M50 105 Q65 90 80 105" fill="none" stroke="#e892a8" stroke-width="1" opacity="0.3"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">结束 · 重生</text></svg>`,
    // 14 节制
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">节制</text><path d="M40 60 Q65 42 90 60" fill="none" stroke="#6ecf6e" stroke-width="1.5"/><path d="M40 60 Q65 78 90 60" fill="none" stroke="#6bb5e0" stroke-width="1.5"/><circle cx="65" cy="60" r="4" fill="#f0d78c" opacity="0.5"/><rect x="45" y="85" width="40" height="20" rx="4" fill="none" stroke="#6ecf6e" stroke-width="1" opacity="0.5"/><line x1="55" y1="90" x2="55" y2="100" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><line x1="65" y1="90" x2="65" y2="100" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><line x1="75" y1="90" x2="75" y2="100" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">平衡 · 调和</text></svg>`,
    // 15 恶魔
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">恶魔</text><circle cx="65" cy="48" r="10" fill="none" stroke="#e892a8" stroke-width="1.5"/><path d="M52 40 L58 52 L48 58" fill="#e892a8" opacity="0.5"/><path d="M78 40 L72 52 L82 58" fill="#e892a8" opacity="0.5"/><line x1="65" y1="58" x2="65" y2="90" stroke="#e892a8" stroke-width="2"/><line x1="45" y1="70" x2="85" y2="70" stroke="#e892a8" stroke-width="1" opacity="0.4"/><line x1="50" y1="100" x2="80" y2="100" stroke="#a09888" stroke-width="1.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">束缚 · 执念</text></svg>`,
    // 16 高塔
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">高塔</text><rect x="42" y="42" width="46" height="40" rx="3" fill="none" stroke="#e8956a" stroke-width="1.2"/><rect x="46" y="47" width="18" height="14" rx="2" fill="none" stroke="#e8956a" stroke-width="0.8" opacity="0.5"/><rect x="66" y="47" width="18" height="14" rx="2" fill="none" stroke="#e8956a" stroke-width="0.8" opacity="0.5"/><line x1="65" y1="82" x2="65" y2="110" stroke="#f0d78c" stroke-width="1.5"/><line x1="50" y1="90" x2="80" y2="105" stroke="#e892a8" stroke-width="1.2" opacity="0.5"/><circle cx="55" cy="115" r="5" fill="none" stroke="#f0d78c" stroke-width="0.8" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">崩塌 · 真相</text></svg>`,
    // 17 星星
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">星星</text><circle cx="65" cy="50" r="6" fill="none" stroke="#6bb5e0" stroke-width="1" opacity="0.5"/><circle cx="65" cy="50" r="12" fill="none" stroke="#6bb5e0" stroke-width="0.6" opacity="0.3"/><circle cx="65" cy="50" r="3" fill="#f0d78c"/><line x1="65" y1="56" x2="50" y2="80" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><line x1="65" y1="56" x2="65" y2="85" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><line x1="65" y1="56" x2="80" y2="80" stroke="#6bb5e0" stroke-width="0.8" opacity="0.5"/><line x1="50" y1="80" x2="42" y2="100" stroke="#6bb5e0" stroke-width="0.7" opacity="0.4"/><line x1="65" y1="85" x2="65" y2="105" stroke="#6bb5e0" stroke-width="0.7" opacity="0.4"/><line x1="80" y1="80" x2="88" y2="100" stroke="#6bb5e0" stroke-width="0.7" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">希望 · 疗愈</text></svg>`,
    // 18 月亮
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">月亮</text><circle cx="65" cy="52" r="18" fill="none" stroke="#6bb5e0" stroke-width="0.8" opacity="0.4"/><path d="M50 58 Q65 48 80 58 Q65 68 50 58" fill="#6bb5e0" opacity="0.15"/><circle cx="65" cy="52" r="4" fill="#6bb5e0" opacity="0.6"/><circle cx="65" cy="95" r="12" fill="none" stroke="#7b5ea7" stroke-width="0.8" opacity="0.4"/><path d="M54 95 Q65 85 76 95 Q65 105 54 95" fill="#7b5ea7" opacity="0.1"/><circle cx="65" cy="95" r="3" fill="#7b5ea7" opacity="0.4"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">迷惑 · 恐惧</text></svg>`,
    // 19 太阳
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">太阳</text><circle cx="65" cy="48" r="16" fill="#f0d78c" opacity="0.12"/><circle cx="65" cy="48" r="8" fill="#f0d78c" opacity="0.35"/><line x1="65" y1="32" x2="65" y2="28" stroke="#f0d78c" stroke-width="1.5"/><line x1="65" y1="64" x2="65" y2="68" stroke="#f0d78c" stroke-width="1.5"/><line x1="49" y1="48" x2="45" y2="48" stroke="#f0d78c" stroke-width="1.5"/><line x1="81" y1="48" x2="85" y2="48" stroke="#f0d78c" stroke-width="1.5"/><line x1="53.7" y1="36.7" x2="50.9" y2="34" stroke="#f0d78c" stroke-width="1"/><line x1="76.3" y1="36.7" x2="79.1" y2="34" stroke="#f0d78c" stroke-width="1"/><line x1="53.7" y1="59.3" x2="50.9" y2="62" stroke="#f0d78c" stroke-width="1"/><line x1="76.3" y1="59.3" x2="79.1" y2="62" stroke="#f0d78c" stroke-width="1"/><circle cx="65" cy="100" r="24" fill="none" stroke="#6ecf6e" stroke-width="0.8" opacity="0.3"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">成功 · 快乐 ☀️</text></svg>`,
    // 20 审判
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">审判</text><circle cx="52" cy="50" r="5" fill="none" stroke="#6bb5e0" stroke-width="1"/><circle cx="78" cy="50" r="5" fill="none" stroke="#6bb5e0" stroke-width="1"/><line x1="52" y1="55" x2="52" y2="65" stroke="#6bb5e0" stroke-width="0.8"/><line x1="78" y1="55" x2="78" y2="65" stroke="#6bb5e0" stroke-width="0.8"/><path d="M45 70 L55 58 L85 58 L75 70" fill="none" stroke="#f0d78c" stroke-width="1.2"/><line x1="55" y1="85" x2="75" y2="85" stroke="#f0d78c" stroke-width="0.8" opacity="0.5"/><circle cx="65" cy="108" r="14" fill="none" stroke="#e892a8" stroke-width="0.8" opacity="0.5"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">觉醒 · 召唤</text></svg>`,
    // 21 世界
    `<svg viewBox="0 0 130 190">${F}<text x="65" y="24" font-size="10" fill="#d4a853" text-anchor="middle" font-weight="bold">世界</text><circle cx="65" cy="65" r="28" fill="none" stroke="#f0d78c" stroke-width="1" opacity="0.4"/><circle cx="65" cy="65" r="20" fill="none" stroke="#e8956a" stroke-width="0.8" opacity="0.3"/><ellipse cx="65" cy="65" rx="38" ry="12" fill="none" stroke="#6ecf6e" stroke-width="0.6" opacity="0.3"/><circle cx="65" cy="65" r="4" fill="#f0d78c" opacity="0.6"/><text x="65" y="170" font-size="8" fill="#a09888" text-anchor="middle">圆满 · 完成 🌍</text></svg>`
  ];
  return svgs[id] || svgs[0];
}

// ==================== 获取牌面SVG（主入口）====================
function getCardSVG(card) {
  if (card.type === 'major') return getMajorSVG(card.id);
  return getMinorSVG(card.suit, card.rank);
}

// ==================== 星座计算（前端备用，优先用后端）====================
function getZodiac(month, day) {
  if (!month || !day) return null;
  // 星座起始日：(月, 日, 星座名) — 从后往前匹配最后一个满足条件的
  const zones = [
    [1,20,'水瓶座'],[2,19,'双鱼座'],[3,21,'白羊座'],
    [4,20,'金牛座'],[5,21,'双子座'],[6,22,'巨蟹座'],
    [7,23,'狮子座'],[8,23,'处女座'],[9,23,'天秤座'],
    [10,24,'天蝎座'],[11,22,'射手座'],[12,22,'摩羯座']
  ];
  for (let i = zones.length - 1; i >= 0; i--) {
    const [m, d, name] = zones[i];
    if (month > m || (month === m && day >= d)) {
      return name;
    }
  }
  // 1月1-19日：摩羯座
  return '摩羯座';
}

// ==================== 洗牌算法 ====================
function shuffleDeck(deck){
  const d = [...deck];
  for(let i=d.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [d[i],d[j]]=[d[j],d[i]];
  }
  return d;
}
