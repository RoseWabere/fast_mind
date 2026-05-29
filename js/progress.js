// ════════════════════════════════
// progress.js — Weight log, compliance score, streak analysis
// ════════════════════════════════

// ── Render weight log ──
function renderWeightLog(){
  const el = document.getElementById('weight-log-list'); if(!el) return;
  const logs = [...(APP.weightLog||[])].reverse();
  if(!logs.length){
    el.innerHTML = `<div class="empty">No weight logged yet.<br><br>
      <small style="color:var(--t3);font-size:11px">No scale? Log waist measurements instead. Tape tells more than scale anyway — muscle weighs more than fat.</small>
    </div>`;
    return;
  }

  el.innerHTML = logs.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'});
    const prev = logs[i+1];
    let delta = '';
    if(prev && e.kg && prev.kg){
      const diff = parseFloat(e.kg) - parseFloat(prev.kg);
      const cls = diff <= 0 ? 'delta-down' : 'delta-up';
      const sign = diff <= 0 ? '' : '+';
      delta = `<span class="weight-delta ${cls}">${sign}${diff.toFixed(1)} kg</span>`;
    }
    return `<div class="weight-entry">
      <div>
        <div style="display:flex;align-items:baseline;gap:8px">
          ${e.kg ? `<span class="weight-val">${e.kg} kg</span>` : ''}
          ${e.waist ? `<span style="font-size:14px;font-family:var(--mono);color:var(--t2)">${e.waist} cm waist</span>` : ''}
          ${delta}
        </div>
        <div class="weight-date">${dateStr}</div>
        ${e.note ? `<div class="weight-note">${e.note}</div>` : ''}
      </div>
      <button onclick="deleteWeight('${e.ts}')" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:4px">×</button>
    </div>`;
  }).join('');

  // Update summary card
  renderWeightSummary(logs);
}

function deleteWeight(ts){
  APP.weightLog = (APP.weightLog||[]).filter(e => e.ts !== ts);
  saveData(); renderWeightLog();
}

function renderWeightSummary(logs){
  const el = document.getElementById('weight-summary'); if(!el) return;
  if(logs.length < 2){ el.style.display='none'; return; }
  el.style.display='block';
  const first = [...logs].reverse()[0];
  const latest = logs[0];
  const target = APP.settings.target;

  let summary = '';
  if(first.kg && latest.kg){
    const total = parseFloat(latest.kg) - parseFloat(first.kg);
    const color = total <= 0 ? 'var(--grn)' : 'var(--red)';
    summary += `<div style="font-size:13px;color:${color};font-family:var(--mono)">${total <= 0 ? '' : '+'}${total.toFixed(1)} kg total change</div>`;
    if(target && latest.kg){
      const remaining = parseFloat(latest.kg) - parseFloat(target);
      if(remaining > 0){
        const pct = Math.round(((parseFloat(first.kg) - parseFloat(latest.kg)) / (parseFloat(first.kg) - parseFloat(target))) * 100);
        summary += `<div style="font-size:12px;color:var(--t2);margin-top:4px">${remaining.toFixed(1)} kg to target</div>`;
        summary += `<div class="prog-bar" style="margin-top:6px"><div class="prog-fill" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div>`;
      } else {
        summary += `<div style="font-size:12px;color:var(--grn);margin-top:4px">Target reached.</div>`;
      }
    }
  }
  el.innerHTML = summary;
}

// ── Render compliance / streak chart ──
function renderProgress(){
  renderComplianceChart();
  renderWeightChart();
  renderWeightLog();
  renderEatenHistory();
}

function renderComplianceChart(){
  const el = document.getElementById('compliance-chart'); if(!el) return;
  const last14 = [];
  for(let i = 13; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0,10);
    const streakDay = APP.streak.find(s => s.date === date);
    const mealEntries = (APP.mealEatenLog||[]).filter(e => e.date === date);
    let score = 0;
    if(mealEntries.length){
      const scores = {ideal:100, ok:60, avoid:20};
      score = Math.round(mealEntries.reduce((s,e) => s+(scores[e.comp]||50),0) / mealEntries.length);
    } else if(streakDay?.status === 'done') score = 85;
    else if(streakDay?.status === 'partial') score = 50;
    last14.push({date, score, label: d.toLocaleDateString('en-KE',{weekday:'short'}).slice(0,2)});
  }

  const maxScore = 100;
  const barH = 80;
  const barW = 16;
  const gap = 7;
  const svgW = last14.length * (barW + gap);

  el.innerHTML = `<svg viewBox="0 0 ${svgW} ${barH+24}" xmlns="http://www.w3.org/2000/svg" style="width:100%">
    ${last14.map((d, i) => {
      const x = i * (barW + gap);
      const h = Math.max(3, Math.round((d.score / maxScore) * barH));
      const color = d.score >= 80 ? 'var(--grn)' : (d.score >= 50 ? 'var(--amb)' : (d.score > 0 ? 'var(--red)' : 'var(--b2)'));
      return `<rect x="${x}" y="${barH - h}" width="${barW}" height="${h}" rx="3" fill="${color}"/>
        <text x="${x + barW/2}" y="${barH + 14}" text-anchor="middle" font-size="8" fill="var(--t3)" font-family="var(--mono)">${d.label}</text>`;
    }).join('')}
    <line x1="0" y1="${barH}" x2="${svgW}" y2="${barH}" stroke="var(--b1)" stroke-width=".5"/>
  </svg>`;
}

function renderWeightChart(){
  const el = document.getElementById('weight-chart'); if(!el) return;
  const logs = [...(APP.weightLog||[])].filter(e => e.kg).sort((a,b) => a.date.localeCompare(b.date)).slice(-12);
  if(logs.length < 2){ el.innerHTML = '<div style="font-size:12px;color:var(--t3);text-align:center;padding:20px 0">Log weight weekly to see trend.</div>'; return; }

  const vals = logs.map(e => parseFloat(e.kg));
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const W = 280, H = 80;
  const xStep = W / (logs.length - 1);
  const yScale = H / (max - min);

  const points = vals.map((v, i) => `${Math.round(i * xStep)},${Math.round(H - (v - min) * yScale)}`).join(' ');
  const target = APP.settings.target ? parseFloat(APP.settings.target) : null;
  const targetY = target ? Math.round(H - (target - min) * yScale) : null;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H+20}" xmlns="http://www.w3.org/2000/svg" style="width:100%">
    ${target && targetY >= 0 && targetY <= H ? `<line x1="0" y1="${targetY}" x2="${W}" y2="${targetY}" stroke="var(--acc)" stroke-width=".5" stroke-dasharray="4 4"/>
    <text x="${W-2}" y="${targetY-3}" text-anchor="end" font-size="8" fill="var(--acc)" font-family="var(--mono)">target</text>` : ''}
    <polyline points="${points}" fill="none" stroke="var(--grn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${vals.map((v, i) => `<circle cx="${Math.round(i * xStep)}" cy="${Math.round(H - (v - min) * yScale)}" r="3" fill="var(--grn)"/>`).join('')}
    <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="var(--b1)" stroke-width=".5"/>
    <text x="0" y="${H+14}" font-size="8" fill="var(--t3)" font-family="var(--mono)">${logs[0].date.slice(5)}</text>
    <text x="${W}" y="${H+14}" text-anchor="end" font-size="8" fill="var(--t3)" font-family="var(--mono)">${logs[logs.length-1].date.slice(5)}</text>
  </svg>`;
}

// ── Eaten history (all days) ──
function renderEatenHistory(){
  const el = document.getElementById('eaten-history-list'); if(!el) return;
  if(!(APP.mealEatenLog||[]).length){ el.innerHTML = '<div class="empty">No meal history yet.</div>'; return; }

  // Group by date
  const byDate = {};
  (APP.mealEatenLog||[]).forEach(e => {
    if(!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const dates = Object.keys(byDate).sort().reverse().slice(0, 14);
  const compColors = {ideal:'var(--grn)', ok:'var(--amb)', avoid:'var(--red)'};

  el.innerHTML = dates.map(date => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'short'});
    const meals = byDate[date];
    const compAvg = Math.round(meals.reduce((s,e) => s + ({ideal:100,ok:60,avoid:20}[e.comp]||50), 0) / meals.length);
    const compColor = compAvg >= 80 ? 'var(--grn)' : (compAvg >= 50 ? 'var(--amb)' : 'var(--red)');
    return `<div class="card" style="margin-bottom:8px;padding:12px 14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:11px;font-family:var(--mono);color:var(--t2)">${dateStr.toUpperCase()}</div>
        <div style="font-size:10px;font-family:var(--mono);color:${compColor}">${compAvg}%</div>
      </div>
      ${meals.map(e => {
        const ts = new Date(e.ts).toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:.5px solid var(--b1)">
          <div>
            <span style="font-size:12px;color:var(--t1)">${e.name}</span>
            <span style="font-size:10px;color:var(--t3);font-family:var(--mono);margin-left:6px">${e.slot||''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;font-family:var(--mono);color:var(--t3)">${ts}</span>
            <div style="width:6px;height:6px;border-radius:50%;background:${compColors[e.comp]||'var(--t3)'}"></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}
