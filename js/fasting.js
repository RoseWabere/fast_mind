// ════════════════════════════════
// fasting.js — Timer, clock, fast records, quotes
// Updated window: 14:00–18:00, added muscle‑sparing movement
// ════════════════════════════════

const QUOTES = [
  {text:"Every time you feel hungry outside your window, your insulin is dropping. That is the fat burning you wanted.",author:"Dr. Jason Fung"},
  {text:"The craving will pass in 20 minutes whether you feed it or not. Only one of those options changes your body.",author:"Fast Mind"},
  {text:"You are not hungry. You are bored, stressed, or habitual. Drink water and wait.",author:"Fast Mind"},
  {text:"Your body is eating itself right now — the old damaged cells, the stored fat. Do not interrupt this.",author:"Autophagy principle"},
  {text:"Insulin is the fat storage hormone. Every time you eat outside the window, you flood your body with it.",author:"Dr. Eric Berg"},
  {text:"The discomfort of hunger is not an emergency. It is a signal that you are winning.",author:"Fast Mind"},
  {text:"You have eaten enough today. Your future self is asking you to stop right now.",author:"Fast Mind"},
  {text:"Hunger is not an emergency. It is a feeling. Feelings pass.",author:"Fast Mind"},
  {text:"Every meal you skip outside your window is a meal your body eats from your fat stores instead.",author:"Fast Mind"},
  {text:"The woman who wins is the one who shows up on days she doesn't feel like it.",author:"Fast Mind"},
  {text:"Discipline is just doing the same thing on bad days that you do on good days.",author:"Fast Mind"},
  {text:"Your hunger hormones are lying to you. They spike, then they drop. You just have to outlast the spike.",author:"Dr. Mindy Pelz"},
  {text:"Fasting is not punishment. It is the most ancient form of healing the human body has.",author:"Fast Mind"},
  {text:"Sleep is the most underrated fat loss tool. Every hour of poor sleep raises your hunger hormones the next day.",author:"Dr. Matthew Walker"},
  {text:"You are not giving something up. You are choosing something better.",author:"Fast Mind"}
];
let allQuotes = [...QUOTES];
let qIdx = 0;

function showQ(){
  const q = allQuotes[qIdx % allQuotes.length];
  const el = document.getElementById('q-text'); const au = document.getElementById('q-auth');
  if(el) el.textContent = q.text;
  if(au) au.textContent = '— ' + (q.author||'');
}
function nextQ(){ qIdx = (qIdx + 1) % allQuotes.length; showQ(); }

function updateClock(){
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  // NEW TIMES: open 14:00, close 18:00
  const openMin = 14*60, closeMin = 18*60, nowMin = h*60 + m;
  const isOpen = nowMin >= openMin && nowMin < closeMin;
  const fastDur = 24*60 - (closeMin - openMin); // 20h fast

  let state, countdown, pct, ringColor;

  if(isOpen){
    state = 'EATING WINDOW OPEN';
    const remaining = closeMin - nowMin;
    const elapsed = nowMin - openMin;
    const windowLen = closeMin - openMin;
    pct = Math.round((elapsed / windowLen) * 100);
    const rs = remaining * 60 - s;
    countdown = fmt(Math.floor(rs/3600)) + ':' + fmt(Math.floor((rs%3600)/60)) + ':' + fmt(rs%60);
    ringColor = '#7eb89a';
  } else {
    state = 'FASTING';
    let elapsed, total;
    if(nowMin < openMin){ elapsed = (24*60 - closeMin) + nowMin; }
    else { elapsed = nowMin - closeMin; }
    total = fastDur;
    pct = Math.min(100, Math.round((elapsed / total) * 100));
    const remaining = total - elapsed;
    const rs = remaining * 60 - s;
    const absRs = Math.abs(rs);
    countdown = (rs < 0 ? '+' : '') + fmt(Math.floor(absRs/3600)) + ':' + fmt(Math.floor((absRs%3600)/60)) + ':' + fmt(absRs%60);
    ringColor = '#c8b89a';
  }

  const circ = 477.5;
  const offset = circ - (pct / 100) * circ;
  const ring = document.getElementById('ring');
  if(ring){ ring.style.strokeDashoffset = offset; ring.style.stroke = ringColor; }

  const stLbl = document.getElementById('st-lbl'); if(stLbl) stLbl.textContent = state;
  const cd = document.getElementById('countdown'); if(cd) cd.textContent = countdown;
  const rp = document.getElementById('ring-pct'); if(rp) rp.textContent = pct + '%';
  const rl = document.getElementById('ring-lbl'); if(rl) rl.textContent = isOpen ? 'of window' : 'of fast';
  const wl = document.getElementById('win-lbl');
  if(wl) wl.textContent = isOpen ? `Window closes at 18:00` : `Window opens at 14:00`;

  const rc = document.getElementById('real-clock');
  if(rc) rc.textContent = fmt(h)+':'+fmt(m)+':'+fmt(s);
  const td = document.getElementById('today-date');
  if(td) td.textContent = now.toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'}).toUpperCase();
}
function fmt(n){ return String(n).padStart(2,'0'); }

function renderFastLog(){
  const el = document.getElementById('fast-log-list'); if(!el) return;
  const recent = [...APP.fastLog].reverse().slice(0, 30);
  if(!recent.length){ el.innerHTML = '<div class="empty">No fast events logged yet.</div>'; return; }
  const colors = {fast:'var(--grn)', eat:'var(--acc)', slip:'var(--red)', note:'var(--t3)'};
  el.innerHTML = recent.map(e => {
    const d = new Date(e.ts);
    const timeStr = d.toLocaleString('en-KE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<div class="log-item">
      <div class="log-dot" style="background:${colors[e.type]||'var(--t3)'}"></div>
      <div><div class="log-meta">${timeStr}</div><div class="log-text">${e.type}${e.note ? ' · '+e.note : ''}</div></div>
    </div>`;
  }).join('');
}

function renderFastRecords(){
  const el = document.getElementById('ft-records-list'); if(!el) return;
  const fasts = APP.fastLog.filter(e => e.type === 'fast').reverse().slice(0, 10);
  if(!fasts.length){ el.innerHTML = '<div class="empty">No fasts logged yet.</div>'; return; }
  el.innerHTML = fasts.map(e => {
    const d = new Date(e.ts);
    const dateStr = d.toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'});
    return `<div class="log-item"><div class="log-dot" style="background:var(--grn)"></div>
      <div><div class="log-meta">${dateStr}</div><div class="log-text">Fast logged${e.note ? ' · '+e.note : ''}</div></div></div>`;
  }).join('');
}

function renderWeeks(){
  const el = document.getElementById('weeks-list'); if(!el) return;
  const weeks = [
    {n:'1–2', title:'Insulin reset', focus:'Eliminate wheat and sugar completely. Win the 20h fasting window every day.', what:'20:4 fasting (eat 14:00–18:00). Protein-first at every meal. Morning brew daily. ACV before first meal. Skipping + abs + squats + chest pulls 5 days.', expect:'Cravings peak around day 3–5 then drop dramatically. Energy dips then stabilises. Scale may not move — insulin is dropping, glycogen depleting. This is working.'},
    {n:'3–4', title:'Metabolic shift', focus:'Your body is learning to use fat as fuel. This is where the real change begins.', what:'20:4 → try 22:2 two days per week. Remove rice from dinner. Add resistance training Mon/Wed/Fri/Sat. Cold sweet potato and peanuts as your snack.', expect:'Fat oxidation increases. Energy more stable. Sleep often improves week 3–4. Some visible change in face and waist.'},
    {n:'5–8', title:'Body recomposition', focus:'Muscle is being built. Fat is being burned. These run simultaneously on this protocol.', what:'Stay consistent with 20:4 or 22:2. Increase dumbbell weight when sets feel easy. Add ndengu, omena, gizzards for protein variety.', expect:'Visible body change. Clothes fit differently before the scale changes significantly. This is lean mass replacing fat mass.'},
    {n:'9–12', title:'Consolidation and new baseline', focus:'You are building a sustainable version of this lifestyle, not finishing a programme.', what:'Introduce one OMAD day per week if you want to accelerate. Continue resistance training. Plan your next 12 weeks.', expect:'Significant body transformation if you have been consistent. Your baseline insulin is lower. Fat storage is harder. This is the new normal.'}
  ];
  el.innerHTML = weeks.map(w => `
    <div class="week-item" onclick="this.classList.toggle('open')">
      <div class="week-num">WEEK ${w.n}</div>
      <div class="week-title">${w.title}</div>
      <div class="week-detail">
        <p><strong>Focus:</strong> ${w.focus}</p>
        <p style="margin-top:8px"><strong>What to do:</strong> ${w.what}</p>
        <p style="margin-top:8px"><strong>What to expect:</strong> ${w.expect}</p>
      </div>
    </div>`).join('');
}

function renderQuotes(){
  const el = document.getElementById('quotes-list'); if(!el) return;
  el.innerHTML = [...QUOTES, ...(APP.customQuotes||[])].map((q,i) => `
    <div class="q-card" style="margin:0 0 8px">
      <div class="q-text">${q.text}</div>
      <div class="q-auth">— ${q.author||''}</div>
    </div>`).join('');
}

function scheduleNotifs(){}