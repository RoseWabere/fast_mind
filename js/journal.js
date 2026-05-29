// ════════════════════════════════
// journal.js — Journal write, entries, eaten meal history
// ════════════════════════════════

let ttsActive = false;
let dictationActive = false;
let recognition = null;

// ── Save journal ──
function saveJournal(){
  const feel = document.getElementById('j-feel')?.value.trim();
  const food = document.getElementById('j-food')?.value.trim();
  const fast = document.getElementById('j-fast')?.value.trim();
  const mind = document.getElementById('j-mind')?.value.trim();
  const carry = document.getElementById('j-carry')?.value.trim();
  if(!feel && !food && !fast && !mind && !carry){ alert('Write something first.'); return; }

  const today = new Date().toISOString().slice(0,10);
  const todayEaten = (APP.mealEatenLog||[]).filter(e => e.date === today);
  const todayEx = (APP.exLog||[]).filter(e => e.ts.slice(0,10) === today);
  const todayComp = computeDayCompliance(today);

  const entry = {
    date: today,
    ts: new Date().toISOString(),
    feel, food, fast, mind, carry,
    mealsEaten: todayEaten.map(e => ({name:e.name, slot:e.slot, comp:e.comp, ts:e.ts})),
    exercise: todayEx.map(e => ({name:e.name, dur:e.dur, intensity:e.intensity})),
    compliance: todayComp
  };

  const existingIdx = APP.journals.findIndex(j => j.date === today);
  if(existingIdx >= 0) APP.journals[existingIdx] = entry;
  else APP.journals.push(entry);

  updateStreak(today, todayComp >= 70 ? 'done' : 'partial');
  saveData();
  renderJournal();
  alert('Journal saved.');
}

function computeDayCompliance(date){
  const eaten = (APP.mealEatenLog||[]).filter(e => e.date === date);
  if(!eaten.length) return 0;
  const scores = {ideal:100, ok:60, avoid:20};
  const avg = eaten.reduce((s, e) => s + (scores[e.comp]||50), 0) / eaten.length;
  return Math.round(avg);
}

// ── Render journal list ──
function renderJournal(){
  const el = document.getElementById('journal-list'); if(!el) return;
  const sorted = [...(APP.journals||[])].reverse().slice(0, 60);
  if(!sorted.length){ el.innerHTML = '<div class="empty">No entries yet. Start writing.</div>'; return; }

  el.innerHTML = sorted.map(e => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'});
    const preview = [e.feel, e.food, e.fast, e.mind, e.carry].filter(Boolean).join(' · ').slice(0,120);
    const compColor = e.compliance >= 80 ? 'var(--grn)' : (e.compliance >= 50 ? 'var(--amb)' : 'var(--red)');
    const mealChips = (e.mealsEaten||[]).slice(0,4).map(m => `<span class="j-meal-chip">${m.name}</span>`).join('');
    const exChips = (e.exercise||[]).map(ex => `<span class="j-meal-chip" style="border-color:var(--blu)">${ex.name}</span>`).join('');

    return `<div class="j-entry" onclick="openJournalEntry('${e.date}')">
      <div class="j-date">${dateStr.toUpperCase()}${e.compliance ? ` <span style="color:${compColor}">· ${e.compliance}% compliance</span>` : ''}</div>
      <div class="j-preview">${preview||'No notes.'}</div>
      ${mealChips || exChips ? `<div class="j-meals-eaten">
        ${mealChips ? `<div class="j-meals-eaten-label">Ate</div>${mealChips}` : ''}
        ${exChips ? `<div class="j-meals-eaten-label" style="margin-top:4px">Exercise</div>${exChips}` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

function openJournalEntry(date){
  const entry = APP.journals.find(j => j.date === date); if(!entry) return;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'});
  const compColor = (entry.compliance||0) >= 80 ? 'var(--grn)' : ((entry.compliance||0) >= 50 ? 'var(--amb)' : 'var(--red)');

  const mealRows = (entry.mealsEaten||[]).map(m => {
    const cc = {ideal:'var(--grn)', ok:'var(--amb)', avoid:'var(--red)'}[m.comp]||'var(--t3)';
    return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:.5px solid var(--b1)">
      <span style="font-size:12px;color:var(--t2)">${m.name}</span>
      <span style="font-size:10px;font-family:var(--mono);color:${cc}">${m.slot||''} · ${m.comp||''}</span>
    </div>`;
  }).join('');

  const exRows = (entry.exercise||[]).map(ex => `
    <div style="padding:4px 0;border-bottom:.5px solid var(--b1)">
      <span style="font-size:12px;color:var(--t2)">${ex.name}${ex.dur ? ' · '+ex.dur+' min' : ''}</span>
    </div>`).join('');

  openModal('log', null);
  document.getElementById('modal-title').textContent = dateStr;
  document.getElementById('modal-body').innerHTML = `
    ${entry.compliance ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <div style="width:10px;height:10px;border-radius:50%;background:${compColor}"></div>
      <span style="font-size:13px;color:${compColor};font-family:var(--mono)">${entry.compliance}% compliance</span>
    </div>` : ''}
    ${entry.feel ? `<div class="meal-section">How I felt</div><p>${entry.feel}</p>` : ''}
    ${entry.food ? `<div class="meal-section">Food</div><p>${entry.food}</p>` : ''}
    ${entry.fast ? `<div class="meal-section">Fast</div><p>${entry.fast}</p>` : ''}
    ${entry.mind ? `<div class="meal-section">Mind</div><p>${entry.mind}</p>` : ''}
    ${entry.carry ? `<div class="meal-section">Carry forward</div><p>${entry.carry}</p>` : ''}
    ${mealRows ? `<div class="meal-section">Meals eaten</div>${mealRows}` : ''}
    ${exRows ? `<div class="meal-section">Exercise</div>${exRows}` : ''}
    <button class="btn btn-r btn-sm" style="margin-top:14px;width:100%" onclick="deleteJournalEntry('${date}')">Delete this entry</button>`;
}

function deleteJournalEntry(date){
  if(!confirm('Delete this entry?')) return;
  APP.journals = APP.journals.filter(j => j.date !== date);
  saveData(); closeModal(); renderJournal();
}

// ── TTS ──
function readJournal(){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech not supported in this browser.'); return; }
  if(ttsActive){ speechSynthesis.cancel(); ttsActive=false; document.getElementById('tts-read-btn')?.classList.remove('active'); return; }
  const texts = [
    document.getElementById('j-feel')?.value,
    document.getElementById('j-food')?.value,
    document.getElementById('j-fast')?.value,
    document.getElementById('j-mind')?.value,
    document.getElementById('j-carry')?.value,
  ].filter(Boolean).join('. ');
  if(!texts){ alert('Nothing written to read aloud.'); return; }
  const utt = new SpeechSynthesisUtterance(texts);
  utt.rate = 0.9; utt.lang = 'en-GB';
  utt.onend = () => { ttsActive=false; document.getElementById('tts-read-btn')?.classList.remove('active'); };
  speechSynthesis.speak(utt); ttsActive=true;
  document.getElementById('tts-read-btn')?.classList.add('active');
}

// ── Dictation ──
function toggleDictation(){
  const btn = document.getElementById('mic-btn');
  const status = document.getElementById('mic-status');
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    alert('Dictation not supported in this browser.'); return;
  }
  if(dictationActive){ recognition?.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-KE'; recognition.continuous = true; recognition.interimResults = true;
  recognition.onstart = () => { dictationActive=true; btn?.classList.add('active'); if(status) status.textContent='Listening...'; };
  recognition.onend = () => { dictationActive=false; btn?.classList.remove('active'); if(status) status.textContent=''; };
  recognition.onerror = () => { dictationActive=false; btn?.classList.remove('active'); if(status) status.textContent=''; };
  recognition.onresult = (ev) => {
    const active = document.querySelector('.tab-body [id^="j-"]:focus') || document.getElementById('j-feel');
    if(!active) return;
    let transcript = '';
    for(let i = ev.resultIndex; i < ev.results.length; i++) transcript += ev.results[i][0].transcript;
    active.value += (active.value ? ' ' : '') + transcript;
  };
  recognition.start();
}
