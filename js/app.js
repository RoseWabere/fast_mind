// ════════════════════════════════
// app.js — Core state, storage, shared utils
// Updated: default window 14:00–18:00, added environment emergency protocols, preserved all existing
// ════════════════════════════════

// ── Supabase (fill in your project URL and anon key after setup) ──
const SUPABASE_URL = '';
const SUPABASE_ANON = '';
let supabase = null;
let supabaseReady = false;

async function initSupabase(){
  if(!SUPABASE_URL || !SUPABASE_ANON){ console.info('Supabase not configured — running offline only.'); return; }
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    supabaseReady = true;
    console.info('Supabase connected.');
    await syncFromSupabase();
  } catch(e){ console.warn('Supabase init failed, offline only:', e.message); }
}

// ── Default APP state (window now 14:00–18:00) ──
const APP_DEFAULTS = {
  settings:{ name:'', weight:'', target:'', weightUnit:'kg', cycle:'', windowOpen:'14:00', windowClose:'18:00', protocol:'20:4', envMode:false, remOpen:true, remClose:true, remFast:true },
  fastLog:[],
  foodLog:[],
  exLog:[],
  journals:[],
  streak:[],
  weekProgress:{},
  customMeals:[],
  customQuotes:[],
  mealTicks:{},
  mealEatenLog:[],
  weightLog:[]
};

let APP = JSON.parse(JSON.stringify(APP_DEFAULTS));

function loadData(){
  try {
    const saved = localStorage.getItem('fm_v2');
    if(saved){ APP = Object.assign(JSON.parse(JSON.stringify(APP_DEFAULTS)), JSON.parse(saved)); }
  } catch(e){ console.warn('loadData failed:', e); }
}

function saveData(){
  try { localStorage.setItem('fm_v2', JSON.stringify(APP)); }
  catch(e){ console.warn('saveData failed:', e); }
  if(supabaseReady) syncToSupabase();
}

async function syncToSupabase(){
  if(!supabaseReady) return;
  try {
    const deviceId = getDeviceId();
    await supabase.from('fm_state').upsert({ device_id: deviceId, data: APP, updated_at: new Date().toISOString() }, { onConflict: 'device_id' });
  } catch(e){ console.warn('Supabase sync failed:', e.message); }
}

async function syncFromSupabase(){
  if(!supabaseReady) return;
  try {
    const deviceId = getDeviceId();
    const { data, error } = await supabase.from('fm_state').select('data').eq('device_id', deviceId).single();
    if(!error && data?.data){
      APP = Object.assign(JSON.parse(JSON.stringify(APP_DEFAULTS)), data.data);
      saveData();
      renderAll();
    }
  } catch(e){ console.warn('Supabase pull failed:', e.message); }
}

function getDeviceId(){
  let id = localStorage.getItem('fm_device_id');
  if(!id){ id = 'fm_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('fm_device_id', id); }
  return id;
}

function exportData(){
  const blob = new Blob([JSON.stringify(APP, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fast-mind-backup.json'; a.click();
  URL.revokeObjectURL(url);
}
function importData(input){
  const file = input.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e => {
    try { APP = Object.assign(JSON.parse(JSON.stringify(APP_DEFAULTS)), JSON.parse(e.target.result)); saveData(); renderAll(); alert('Imported.'); }
    catch{ alert('Invalid backup file.'); }
  };
  r.readAsText(file);
}
function clearAllData(){
  if(!confirm('Delete everything? This cannot be undone.')) return;
  APP = JSON.parse(JSON.stringify(APP_DEFAULTS)); saveData(); renderAll();
}

function goTo(id){
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.nv').forEach(n => n.classList.remove('on'));
  document.getElementById('sc-'+id)?.classList.add('on');
  document.querySelector(`.nv[onclick="goTo('${id}')"]`)?.classList.add('on');
}

function switchTab(tabRowEl, bodyPrefix, btn, id){
  tabRowEl.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll(`[id^="${bodyPrefix}"]`).forEach(b => b.style.display='none');
  document.getElementById(id).style.display='block';
}
function ptab(btn, id){ switchTab(btn.parentElement, 'pt-', btn, id); }
function mtab(btn, id){ switchTab(btn.parentElement, 'ml-', btn, id); }
function etab(btn, id){ switchTab(btn.parentElement, 'ex-', btn, id); }
function jtab(btn, id){ switchTab(btn.parentElement, 'jn-', btn, id); }
function pgtab(btn, id){ switchTab(btn.parentElement, 'pg-', btn, id); }

let modalCtx = {};
function openModal(type, ctx){
  modalCtx = {type, ctx};
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  overlay.classList.add('on');
  const typeMap = {
    log: {title:'Log', fn: renderLogModal},
    foodlog: {title:'Log food', fn: renderFoodLogModal},
    exlog: {title:'Log workout', fn: renderExLogModal},
    addquote: {title:'Add quote', fn: renderAddQuoteModal},
    weight: {title:'Log weight', fn: renderWeightModal},
    eaten: {title:'Meal logged', fn: renderEatenModal}
  };
  const m = typeMap[type];
  if(m){ title.textContent = m.title; m.fn(body, ctx); }
}
function closeModal(){ document.getElementById('modal-overlay').classList.remove('on'); }

function renderLogModal(body, ctx){
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Type</label>
        <select id="m-log-type">
          <option value="fast" ${ctx==='fast'?'selected':''}>Fast start</option>
          <option value="eat" ${ctx==='eat'?'selected':''}>Meal / eating window open</option>
          <option value="slip" ${ctx==='slip'?'selected':''}>Slip / ate outside window</option>
          <option value="note">General note</option>
        </select>
      </div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Note (optional)</label>
        <textarea id="m-log-note" rows="3" placeholder="What happened, how you feel..."></textarea>
      </div>
      <button class="btn btn-p" onclick="submitLog()">Log it</button>
    </div>`;
}
function submitLog(){
  const type = document.getElementById('m-log-type').value;
  const note = document.getElementById('m-log-note').value.trim();
  const entry = { type, note, ts: new Date().toISOString() };
  APP.fastLog.push(entry);
  if(type === 'fast') updateStreak(new Date().toISOString().slice(0,10), 'done');
  if(type === 'slip') updateStreak(new Date().toISOString().slice(0,10), 'partial');
  saveData(); closeModal();
  renderFastLog();
}

function renderFoodLogModal(body){
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">What did you eat?</label>
        <input type="text" id="m-food-name" placeholder="e.g. Ndengu + ugali"></div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Compliance</label>
        <select id="m-food-comp">
          <option value="ideal">Ideal</option>
          <option value="ok">Moderate</option>
          <option value="avoid">High insulin impact</option>
        </select>
      </div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Note</label>
        <textarea id="m-food-note" rows="2" placeholder="How you felt after, portion size..."></textarea>
      </div>
      <button class="btn btn-p" onclick="submitFoodLog()">Log</button>
    </div>`;
}
function submitFoodLog(){
  const name = document.getElementById('m-food-name').value.trim(); if(!name) return;
  const comp = document.getElementById('m-food-comp').value;
  const note = document.getElementById('m-food-note').value.trim();
  APP.foodLog.push({name, comp, note, ts: new Date().toISOString()});
  saveData(); closeModal(); renderFoodLog();
}

function renderExLogModal(body){
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Workout</label>
        <input type="text" id="m-ex-name" placeholder="e.g. Upper body — dumbbells"></div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Duration (min)</label>
        <input type="number" id="m-ex-dur" placeholder="25"></div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Intensity</label>
        <select id="m-ex-intensity">
          <option value="light">Light</option>
          <option value="moderate" selected>Moderate</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Note</label>
        <textarea id="m-ex-note" rows="2" placeholder="What you did, how it felt..."></textarea>
      </div>
      <button class="btn btn-p" onclick="submitExLog()">Log workout</button>
    </div>`;
}
function submitExLog(){
  const name = document.getElementById('m-ex-name').value.trim(); if(!name) return;
  const dur = document.getElementById('m-ex-dur').value;
  const intensity = document.getElementById('m-ex-intensity').value;
  const note = document.getElementById('m-ex-note').value.trim();
  APP.exLog.push({name, dur, intensity, note, ts: new Date().toISOString()});
  updateStreak(new Date().toISOString().slice(0,10), 'partial');
  saveData(); closeModal(); renderExLog();
}

function renderAddQuoteModal(body){
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Quote</label>
        <textarea id="m-q-text" rows="3" placeholder="The quote..."></textarea></div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Author</label>
        <input type="text" id="m-q-auth" placeholder="Author or source"></div>
      <button class="btn btn-p" onclick="submitQuote()">Add</button>
    </div>`;
}
function submitQuote(){
  const text = document.getElementById('m-q-text').value.trim(); if(!text) return;
  const author = document.getElementById('m-q-auth').value.trim();
  APP.customQuotes.push({text, author}); allQuotes = [...QUOTES, ...APP.customQuotes];
  saveData(); closeModal(); renderQuotes();
}

function renderWeightModal(body){
  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="card card-grn" style="margin-bottom:0">
        <p style="font-size:12px;margin:0">Weigh once per week — Sunday morning, after bathroom, before eating. Same conditions every time. Scale not required: use a tailor's tape instead. Track cm not just kg.</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Weight (kg)</label>
          <input type="number" id="m-w-kg" placeholder="65" step="0.1"></div>
        <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Waist (cm)</label>
          <input type="number" id="m-w-waist" placeholder="80" step="0.5"></div>
      </div>
      <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Note (energy, how clothes fit, mood...)</label>
        <textarea id="m-w-note" rows="2" placeholder="Optional"></textarea></div>
      <button class="btn btn-p" onclick="submitWeight()">Save</button>
    </div>`;
}
function submitWeight(){
  const kg = document.getElementById('m-w-kg').value;
  const waist = document.getElementById('m-w-waist').value;
  const note = document.getElementById('m-w-note').value.trim();
  if(!kg && !waist){ alert('Enter at least weight or waist.'); return; }
  const date = new Date().toISOString().slice(0,10);
  APP.weightLog = APP.weightLog || [];
  APP.weightLog.push({date, kg: kg||null, waist: waist||null, note, ts: new Date().toISOString()});
  if(kg && APP.settings) APP.settings.weight = kg;
  saveData(); closeModal(); renderWeightLog();
}

function renderEatenModal(body, ctx){
  const ts = new Date();
  const timeStr = ts.toLocaleTimeString('en-KE', {hour:'2-digit', minute:'2-digit'});
  const compColor = {ideal:getComputedStyle(document.documentElement).getPropertyValue('--grn').trim(), ok:getComputedStyle(document.documentElement).getPropertyValue('--amb').trim(), avoid:getComputedStyle(document.documentElement).getPropertyValue('--red').trim()};
  body.innerHTML = `
    <div style="text-align:center;padding:10px 0 18px">
      <div style="font-size:32px;margin-bottom:8px">✓</div>
      <div style="font-size:16px;font-weight:500;color:var(--t1);margin-bottom:4px">${ctx.name||'Meal'} logged</div>
      <div style="font-size:11px;font-family:var(--mono);color:var(--t3)">${timeStr} · ${ctx.slot||'meal'}</div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <h4>Compliance</h4>
      <select id="m-eaten-comp" style="margin-top:6px">
        <option value="ideal" ${ctx.compliance==='ideal'?'selected':''}>Ideal — low GI, protein first</option>
        <option value="ok" ${ctx.compliance==='ok'?'selected':''}>Moderate — some compromise</option>
        <option value="avoid" ${ctx.compliance==='avoid'?'selected':''}>High impact — ate outside plan</option>
      </select>
    </div>
    <div><label style="font-size:11px;color:var(--t3);display:block;margin-bottom:4px">Quick note (optional)</label>
      <textarea id="m-eaten-note" rows="2" placeholder="Portion size, how you feel, any notes..."></textarea>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-p" style="flex:1" onclick="saveEatenLog('${ctx.cardId||''}','${ctx.name||''}','${ctx.slot||''}')">Save to log</button>
      <button class="btn" style="flex:0 0 auto" onclick="closeModal()">Skip</button>
    </div>`;
}

function saveEatenLog(cardId, name, slot){
  const comp = document.getElementById('m-eaten-comp').value;
  const note = document.getElementById('m-eaten-note').value.trim();
  APP.mealEatenLog = APP.mealEatenLog || [];
  const entry = {cardId, name, slot, comp, note, ts: new Date().toISOString(), date: new Date().toISOString().slice(0,10)};
  APP.mealEatenLog.push(entry);
  if(comp === 'ideal') updateStreak(entry.date, 'done');
  else if(comp === 'avoid') updateStreak(entry.date, 'partial');
  saveData(); closeModal();
  renderEatenLogInJournal();
}

function updateStreak(dateStr, status){
  const existing = APP.streak.find(s => s.date === dateStr);
  if(existing){
    if(existing.status !== 'done') existing.status = status;
  } else {
    APP.streak.push({date: dateStr, status});
    if(APP.streak.length > 90) APP.streak.shift();
  }
  saveData(); renderStreak();
}

function renderStreak(){
  const row = document.getElementById('streak-row'); if(!row) return;
  const last7 = getLast7();
  row.innerHTML = last7.map(d => {
    const entry = APP.streak.find(s => s.date === d);
    const cls = entry ? (entry.status === 'done' ? 'sd done' : 'sd partial') : 'sd';
    return `<div class="${cls}" title="${d}"></div>`;
  }).join('');
}

function getLast7(){
  const days = [];
  for(let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}

function renderAll(){
  APP.fastLog       = APP.fastLog       || [];
  APP.foodLog       = APP.foodLog       || [];
  APP.exLog         = APP.exLog         || [];
  APP.journals      = APP.journals      || [];
  APP.streak        = APP.streak        || [];
  APP.weekProgress  = APP.weekProgress  || {};
  APP.customMeals   = APP.customMeals   || [];
  APP.customQuotes  = APP.customQuotes  || [];
  APP.mealTicks     = APP.mealTicks     || {};
  APP.mealEatenLog  = APP.mealEatenLog  || [];
  APP.weightLog     = APP.weightLog     || [];

  renderStreak();
  if(typeof renderFastLog   === 'function') renderFastLog();
  if(typeof renderFoodLog   === 'function') renderFoodLog();
  if(typeof renderJournal   === 'function') renderJournal();
  if(typeof renderExLog     === 'function') renderExLog();
  if(typeof renderWeightLog === 'function') renderWeightLog();
  if(typeof renderEatenLogInJournal === 'function') renderEatenLogInJournal();
  if(typeof renderProgress  === 'function') renderProgress();
  if(typeof restoreTicks    === 'function') restoreTicks();
  if(typeof updateMealPlanDate === 'function') updateMealPlanDate();
  if(typeof updateSlotStatus   === 'function') updateSlotStatus();

  const s = APP.settings;
  ['name','weight','target','cycle'].forEach(k => {
    const el = document.getElementById('s-'+k); if(el) el.value = s[k]||'';
  });
  const sOpen  = document.getElementById('s-open');  if(sOpen)  sOpen.value  = s.windowOpen||'14:00';
  const sClose = document.getElementById('s-close'); if(sClose) sClose.value = s.windowClose||'18:00';
  const sProto = document.getElementById('s-proto'); if(sProto) sProto.value = s.protocol||'20:4';
  const sEnv   = document.getElementById('s-env');   if(sEnv)   sEnv.checked = s.envMode||false;
  const envBar = document.getElementById('env-bar'); if(envBar) envBar.style.display = s.envMode ? 'flex' : 'none';
  const hmSub  = document.getElementById('hm-sub');  if(hmSub)  hmSub.textContent = s.name ? s.name+' · protocol' : 'your protocol';
  const dOpen  = document.getElementById('disp-open');  if(dOpen)  dOpen.textContent  = s.windowOpen||'14:00';
  const dClose = document.getElementById('disp-close'); if(dClose) dClose.textContent = s.windowClose||'18:00';

  setTimeout(() => {
    const r1 = document.getElementById('streak-row');
    const r2 = document.getElementById('streak-row-2');
    if(r1 && r2) r2.innerHTML = r1.innerHTML;
  }, 50);
}

function exportICS(){
  const s = APP.settings;
  const [oh,om] = (s.windowOpen||'14:00').split(':').map(Number);
  const [ch,cm] = (s.windowClose||'18:00').split(':').map(Number);
  function ev(summary, description, startH, startM, endH, endM, rrule='RRULE:FREQ=DAILY'){
    const dt = new Date(); dt.setHours(startH, startM, 0);
    const de = new Date(); de.setHours(endH, endM, 0);
    const fmt = d => d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
    return `BEGIN:VEVENT\nSUMMARY:${summary}\nDESCRIPTION:${description}\nDTSTART:${fmt(dt)}\nDTEND:${fmt(de)}\n${rrule}\nEND:VEVENT\n`;
  }
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:Fast Mind\n';
  ics += ev('Fast Mind — ACV + first meal','ACV shot 15 min before eating. Protein first.',oh-1,om-15,oh,om);
  ics += ev('Fast Mind — kitchen closes','Brush teeth. Evening brew: ashwagandha+chamomile+cinnamon+hibiscus.',ch-1,cm,ch,cm);
  ics += ev('Fast Mind — morning brew + movement','Brew: cinnamon+hibiscus+rosemary+ginger+turmeric+pepper+cayenne. 10min skipping + 5min ab roller + 5 heavy squats + chest pulls.',7,0,7,45);
  ics += 'END:VCALENDAR';
  const blob = new Blob([ics],{type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download='fast-mind.ics'; a.click(); URL.revokeObjectURL(url);
}

function saveSettings(){
  APP.settings.name = document.getElementById('s-name')?.value.trim()||'';
  APP.settings.weight = document.getElementById('s-weight')?.value||'';
  APP.settings.target = document.getElementById('s-target')?.value||'';
  APP.settings.cycle = document.getElementById('s-cycle')?.value||'';
  APP.settings.windowOpen = document.getElementById('s-open')?.value||'14:00';
  APP.settings.windowClose = document.getElementById('s-close')?.value||'18:00';
  APP.settings.protocol = document.getElementById('s-proto')?.value||'20:4';
  APP.settings.envMode = document.getElementById('s-env')?.checked||false;
  APP.settings.remOpen = document.getElementById('s-rem-open')?.checked||true;
  APP.settings.remClose = document.getElementById('s-rem-close')?.checked||true;
  APP.settings.remFast = document.getElementById('s-rem-fast')?.checked||true;
  saveData();
  document.getElementById('hm-sub').textContent = APP.settings.name ? APP.settings.name+' · protocol' : 'your protocol';
  document.getElementById('disp-open').textContent = APP.settings.windowOpen;
  document.getElementById('disp-close').textContent = APP.settings.windowClose;
  document.getElementById('env-bar').style.display = APP.settings.envMode ? 'flex' : 'none';
  const ok = document.getElementById('save-ok'); if(ok){ ok.style.display='block'; setTimeout(()=>ok.style.display='none',2000); }
  updateSlotStatus?.();
}
function toggleEnvMode(){ APP.settings.envMode=!APP.settings.envMode; saveData(); document.getElementById('env-bar').style.display=APP.settings.envMode?'flex':'none'; }
function addCustomMeal(){
  const name=document.getElementById('add-meal-name')?.value.trim(); if(!name) return;
  const meal={name, ingredients:document.getElementById('add-meal-ing')?.value.trim(), method:document.getElementById('add-meal-method')?.value.trim(), compliance:document.getElementById('add-meal-comp')?.value};
  APP.customMeals.push(meal); saveData();
  document.getElementById('add-meal-name').value=''; document.getElementById('add-meal-ing').value=''; document.getElementById('add-meal-method').value='';
  alert('Meal saved.');
}
function setSchedMode(mode){
  document.getElementById('sched-standard').style.display=mode==='standard'?'block':'none';
  document.getElementById('sched-environment').style.display=mode==='environment'?'block':'none';
  document.getElementById('sched-mode-badge').textContent=mode==='standard'?'Standard':'Environment';
  document.getElementById('sched-std-btn').className='btn btn-sm'+(mode==='standard'?' btn-p':'');
  document.getElementById('sched-env-btn').className='btn btn-sm'+(mode==='environment'?' btn-p':'');
}