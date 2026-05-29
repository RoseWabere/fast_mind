// ════════════════════════════════
// meals.js — Meal tick, time slots, eaten log
// Updated: 20h fast (14:00–18:00), new slot keys, local food compliance, added "why" explanations
// ════════════════════════════════

// Slot name map for display (updated keys)
const SLOT_LABELS = {
  fast:    'Fasting window',
  workout: 'Pre‑workout fuel',
  first:   'First meal (break fast)',
  dinner:  'Last meal (kitchen closes)'
};

// ── Tick a meal (mark eaten) ──
function tickMeal(id, btn){
  const card = document.getElementById(id); if(!card) return;
  const wasTicked = card.classList.contains('ticked');

  if(!wasTicked){
    const mealName = card.querySelector('.meal-name')?.textContent || id;
    const slot = card.dataset.slot || '';
    const comp = inferCompliance(card);
    card.classList.add('ticked');
    persistTick(id, true);
    updateSlotStatus();
    openModal('eaten', {cardId: id, name: mealName, slot: SLOT_LABELS[slot]||slot, compliance: comp});
  } else {
    card.classList.remove('ticked');
    persistTick(id, false);
    updateSlotStatus();
  }
}

function inferCompliance(card){
  const badges = [...card.querySelectorAll('.badge')].map(b => b.textContent.toLowerCase());
  const nameEl = card.querySelector('.meal-name');
  const mealName = nameEl ? nameEl.textContent.toLowerCase() : '';

  // Local Kenyan high‑insulin triggers (avoid)
  const avoidList = [
    'chapati', 'cake', 'mandazi', 'chips', 'bhajia', 'roasted maize', 
    'potato', 'ugali', 'white rice', 'sugar', 'soda', 'biscuit'
  ];
  if(avoidList.some(word => mealName.includes(word) || badges.some(b => b.includes(word)))) {
    return 'avoid';
  }

  // Ideal – protein‑first, non‑gassy, low‑GI
  const idealList = [
    'egg', 'ndengu', 'yellow beans', 'sukuma', 'spinach', 'cinnamon',
    'gizzard', 'avocado', 'banana', 'omena', 'moringa', 'fermented uji',
    'wimbi', 'sweet potato', 'cold rice', 'cold sweet potato', 'peanut'
  ];
  if(idealList.some(word => mealName.includes(word) || badges.some(b => b.includes(word)))) {
    return 'ideal';
  }

  // Moderate fallback
  return 'ok';
}

function persistTick(id, val){
  APP.mealTicks = APP.mealTicks || {};
  const today = new Date().toISOString().slice(0,10);
  if(!APP.mealTicks[today]) APP.mealTicks[today] = {};
  APP.mealTicks[today][id] = val;
  const days = Object.keys(APP.mealTicks).sort();
  while(days.length > 14) delete APP.mealTicks[days.shift()];
  saveData();
}

function resetTodayMeals(){
  const today = new Date().toISOString().slice(0,10);
  if(APP.mealTicks && APP.mealTicks[today]) delete APP.mealTicks[today];
  saveData();
  document.querySelectorAll('.meal-card.ticked').forEach(c => c.classList.remove('ticked'));
  updateSlotStatus();
}

function restoreTicks(){
  APP.mealTicks = APP.mealTicks || {};
  const today = new Date().toISOString().slice(0,10);
  const todayTicks = APP.mealTicks[today] || {};
  Object.entries(todayTicks).forEach(([id, val]) => {
    if(val){ const c = document.getElementById(id); if(c) c.classList.add('ticked'); }
  });
  updateSlotStatus();
}

function updateMealPlanDate(){
  const el = document.getElementById('meal-plan-date'); if(!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
}

function updateSlotStatus(){
  const now = new Date();
  const h = now.getHours() + now.getMinutes()/60;

  // NEW WINDOW: 14:00 – 18:00
  const openH = 14, closeH = 18;

  const slots = {
    fast:    {start:0,      end:openH,        rangeEl:null, label:`until 14:00`},
    workout: {start:openH-1,end:openH,        rangeEl:null, label:`13:00 – 14:00`},
    first:   {start:openH,  end:openH+2,      rangeEl:null, label:`from 14:00`},
    dinner:  {start:closeH-2, end:closeH,     rangeEl:null, label:`by 18:00`}
  };

  const today = new Date().toISOString().slice(0,10);

  Object.entries(slots).forEach(([key, s]) => {
    const headerEl = document.getElementById('slot-'+key);
    const statusEl = document.getElementById('slot-'+key+'-status');
    if(s.rangeEl){ const re = document.getElementById(s.rangeEl); if(re) re.textContent = s.label; }
    if(!headerEl) return;

    const active = h >= s.start && h < s.end;
    headerEl.classList.toggle('slot-active', active);

    if(statusEl){
      let statusText = h < s.start ? 'upcoming' : (active ? '● now' : 'done');
      const cards = document.querySelectorAll(`.meal-card[data-slot="${key}"]`);
      const tickCount = [...cards].filter(c => c.classList.contains('ticked')).length;
      if(tickCount > 0) statusText += ` · ${tickCount}/${cards.length} ticked`;
      statusEl.textContent = statusText;
    }
  });

  renderTodayEatenSummary();
}

function renderTodayEatenSummary(){
  const el = document.getElementById('today-eaten-list'); if(!el) return;
  const today = new Date().toISOString().slice(0,10);
  const entries = (APP.mealEatenLog||[]).filter(e => e.date === today);
  if(!entries.length){
    el.innerHTML = '<div class="empty" style="padding:20px 0 10px">No meals ticked today. Tick a meal in the Meals plan to log it here.</div>';
    return;
  }
  const compColors = {ideal:'var(--grn)', ok:'var(--amb)', avoid:'var(--red)'};
  el.innerHTML = entries.map(e => {
    const d = new Date(e.ts);
    const timeStr = d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});
    return `<div class="eaten-log-item">
      <div style="flex:1">
        <div class="eaten-name">${escapeHtml(e.name||'Meal')}</div>
        <div class="eaten-slot">${e.slot||''}</div>
        ${e.note ? `<div style="font-size:11px;color:var(--t3);margin-top:3px">${escapeHtml(e.note)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="eaten-time">${timeStr}</div>
        <div style="width:8px;height:8px;border-radius:50%;background:${compColors[e.comp]||'var(--t3)'};margin:4px 0 0 auto"></div>
      </div>
    </div>`;
  }).join('');
}

// Helper to escape HTML
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if(m === '&') return '&amp;';
    if(m === '<') return '&lt;';
    if(m === '>') return '&gt;';
    return m;
  });
}

function renderFoodLog(){
  const el = document.getElementById('food-log-list'); if(!el) return;
  const recent = [...(APP.foodLog||[])].reverse().slice(0, 30);
  if(!recent.length){ el.innerHTML = '<div class="empty">Nothing logged yet.</div>'; return; }
  const compColors = {ideal:'var(--grn)', ok:'var(--amb)', avoid:'var(--red)'};
  el.innerHTML = recent.map(e => {
    const d = new Date(e.ts);
    const timeStr = d.toLocaleString('en-KE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<div class="food-log-item">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--t1)">${escapeHtml(e.name)}</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--t3);margin-top:2px">${timeStr}</div>
        ${e.note ? `<div style="font-size:12px;color:var(--t2);margin-top:3px">${escapeHtml(e.note)}</div>` : ''}
      </div>
      <div style="width:8px;height:8px;border-radius:50%;background:${compColors[e.comp]||'var(--t3)'};flex-shrink:0;margin-top:4px"></div>
    </div>`;
  }).join('');
}

function toggleMeal(btn){
  const body = btn.closest('.meal-card').querySelector('.meal-body');
  body.classList.toggle('open');
  btn.textContent = body.classList.contains('open') ? 'Hide ▴' : 'Recipe ▾';
}

function renderEatenLogInJournal(){
  renderTodayEatenSummary();
  updateSlotStatus();
}