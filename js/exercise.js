// ════════════════════════════════
// exercise.js — Workouts, SVG muscle diagrams, YouTube embeds
// ════════════════════════════════

// Equipment: dumbbells, skipping rope, ab roller, chest expander, light resistance bands

const WORKOUTS = [
  {
    day: 'Monday',
    label: 'Upper body',
    focus: 'Chest · Shoulders · Arms',
    color: 'var(--blu)',
    moves: [
      {name:'Skipping warm-up', sets:'5 min', muscles:['calves','quads','cardiovascular'], yt:'https://www.youtube.com/watch?v=FJmRQ5iTXKE', cue:'Light pace, stay on balls of feet'},
      {name:'Dumbbell shoulder press', sets:'3×10', muscles:['anterior deltoid','lateral deltoid','triceps'], yt:'https://www.youtube.com/watch?v=qEwKCR5JCog', cue:'Control the descent. Core tight. Do not arch lower back.'},
      {name:'Dumbbell rows', sets:'3×12 each side', muscles:['latissimus dorsi','rhomboids','biceps','rear deltoid'], yt:'https://www.youtube.com/watch?v=roCP6wCXPqo', cue:'Elbow drives back, not up. Squeeze at the top for 1 second.'},
      {name:'Chest expander pulls', sets:'3×12', muscles:['pectorals','anterior deltoid','biceps'], yt:'https://www.youtube.com/watch?v=qr5-MW59bLs', cue:'Arms level with shoulders. Slow and controlled. Feel the chest stretch at full extension.'},
      {name:'Band chest fly', sets:'3×12', muscles:['pectorals','anterior deltoid'], yt:'https://www.youtube.com/watch?v=rx5HCh0gNGM', cue:'Stand in band, arms wide, bring together at chest. Squeeze pecs at the end.'},
      {name:'Bicep curls', sets:'3×10', muscles:['biceps','brachialis'], yt:'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', cue:'No swinging. Full range — fully extend at bottom, squeeze at top.'},
      {name:'Tricep overhead extension', sets:'3×10', muscles:['triceps'], yt:'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q', cue:'Elbows stay pointing forward. Do not let them flare wide.'}
    ]
  },
  {
    day: 'Tuesday',
    label: 'Active recovery',
    focus: 'Core · Mobility',
    color: 'var(--grn)',
    moves: [
      {name:'Ab roller', sets:'3×8 slow', muscles:['rectus abdominis','obliques','hip flexors','lats'], yt:'https://www.youtube.com/watch?v=p5-v0JiKFqk', cue:'Full extension then pull back with abs, not arms. Do not let lower back drop.'},
      {name:'Band pull-apart or using chest pull', sets:'3×15', muscles:['rear deltoid','rhomboids','rotator cuff'], yt:'https://www.youtube.com/watch?v=7tfPMYJCfQ4', cue:'Arms straight, pull band to chest width apart. Squeeze shoulder blades at the end.'},
      {name:'10-min post-meal walk', sets:'once', muscles:['full body metabolic'], yt:null, cue:'10 minutes after any meal lowers blood glucose by up to 30%. Non-negotiable.'},
      {name:'Expander lower back extensions', sets:'3×12', muscles:['lower back','glutes','hamstrings'], yt:'https://www.youtube.com/watch?v=0YQR9HuAn00&t=428s', cue:'Anchor band low, pull up with lower back and glutes. Do not use arms.'},
      {name: 'Stretching', sets:'10 min', muscles:['hip flexors','hamstrings','chest','shoulders'], yt:'https://www.youtube.com/watch?v=L_xrDAtykMI', cue:'Focus on areas that feel tight. Hold each stretch for 30s.'}
    ]
  },
  {
    day: 'Wednesday',
    label: 'Lower body + core',
    focus: 'Legs · Glutes · Core',
    color: 'var(--amb)',
    moves: [
      {name:'Skipping warm-up', sets:'5 min', muscles:['calves','quads','cardiovascular'], yt:'https://www.youtube.com/watch?v=FJmRQ5iTXKE', cue:'Light pace, stay on balls of feet'},
      {name:'Dumbbell squats', sets:'3×12', muscles:['quadriceps','glutes','hamstrings','core'], yt:'https://www.youtube.com/watch?v=U3HlEF_E9fo', cue:'Feet shoulder width. Drive through heels. Chest up. Knees track over toes.'},
      {name:'Dumbbell lunges', sets:'3×10 each leg', muscles:['quadriceps','glutes','hamstrings','calves'], yt:'https://www.youtube.com/watch?v=D7KaRcUTQeE', cue:'Front knee does not go past foot. Back knee nearly touches floor. Keep torso upright.'},
      {name:'Romanian deadlift', sets:'3×10', muscles:['hamstrings','glutes','lower back'], yt:'https://www.youtube.com/watch?v=hCDzSR6bW10', cue:'Hinge at hips, not waist. Slight knee bend. Feel hamstring stretch. Do not round spine.'},
      {name:'Ab roller', sets:'3×10', muscles:['rectus abdominis','obliques','hip flexors','lats'], yt:'https://www.youtube.com/watch?v=p5-v0JiKFqk', cue:'Full extension then pull with abs only.'},
      {name:'Skipping intervals', sets:'30s on / 15s off × 8', muscles:['calves','cardiovascular','quads'], yt:'https://www.youtube.com/watch?v=FJmRQ5iTXKE', cue:'Push intensity during the 30s. This is your HIIT finisher.'}
    ]
  },
  {
    day: 'Thursday',
    label: 'Rest',
    focus: 'Recovery',
    color: 'var(--t3)',
    moves: [
      {name:'Stretching', sets:'10 min', muscles:['hip flexors','hamstrings','chest','shoulders'], yt:'https://www.youtube.com/watch?v=L_xrDAtykMI', cue:'Protect this rest day. Recovery is when muscle is actually built.'},
      {name:'Walk if possible', sets:'10–20 min', muscles:['full body metabolic'], yt:null, cue:'Post-meal walk always counts regardless of rest day.'}
    ]
  },
  {
    day: 'Friday',
    label: 'Full body',
    focus: 'Compound · Power',
    color: 'var(--acc)',
    moves: [
      {name:'Dumbbell deadlifts', sets:'3×10', muscles:['hamstrings','glutes','lower back','traps'], yt:'https://www.youtube.com/watch?v=op9kVnSso6Q', cue:'Hinge at hips. Neutral spine. Drive through heels. Bar (dumbbells) close to body.'},
      {name:'Push-ups', sets:'3×12', muscles:['pectorals','triceps','anterior deltoid','core'], yt:'https://www.youtube.com/watch?v=IODxDxX7oi4', cue:'Hands slightly wider than shoulder. Elbows at 45° not 90°. Full range.'},
      {name:'Chest expander pulls', sets:'3×12', muscles:['pectorals','anterior deltoid','biceps'], yt:'https://www.youtube.com/watch?v=qr5-MW59bLs', cue:'Slow controlled arc. Keep arms at shoulder height.'},
      {name:'Dumbbell clean and press', sets:'3×8', muscles:['full body','deltoids','traps','quads','glutes'], yt:'https://www.youtube.com/watch?v=fVNQjmKJhBE', cue:'Explosive pull, catch at shoulders, press overhead. This is your highest-calorie move.'},
      {name:'Plank', sets:'3×30s', muscles:['rectus abdominis','transverse abdominis','obliques','lower back'], yt:'https://www.youtube.com/watch?v=ASdvN_XEl_c', cue:'Straight line head to heel. Do not let hips sag or rise. Squeeze glutes.'},
      {name:'Skipping', sets:'10 min', muscles:['calves','cardiovascular'], yt:'https://www.youtube.com/watch?v=FJmRQ5iTXKE', cue:'Pace you can sustain. End on a strong 60-second sprint.'}
    ]
  },
  {
    day: 'Saturday',
    label: 'Core + cardio',
    focus: 'Abs · Fat burn',
    color: 'var(--pur)',
    moves: [
      {name:'Skipping intervals', sets:'15 min total', muscles:['calves','cardiovascular','quads'], yt:'https://www.youtube.com/watch?v=FJmRQ5iTXKE', cue:'Alternate 1 min moderate, 30s hard. This is your main fat-burn session.'},
      {name:'Ab roller', sets:'4×10', muscles:['rectus abdominis','obliques','lats'], yt:'https://www.youtube.com/watch?v=p5-v0JiKFqk', cue:'Full extension. Return is where abs do the work — do not rush it.'},
      {name:'Woodchoper', sets:'3×12 each side', muscles:['obliques','transverse abdominis','shoulders'], yt:'https://www.youtube.com/watch?v=Rf-2l8Z40dg&pp=ygUXYmFuZCB3b29kIGNob3AgZXhlcmNpc2U%3D', cue:'Rotate from core, not arms. Plant feet firm.'},
      {name:'Bicycle crunches', sets:'3×20', muscles:['rectus abdominis','obliques'], yt:'https://www.youtube.com/watch?v=9FGilxCbdz8', cue:'Slow and deliberate. Do not pull neck. Elbow to opposite knee.'}
    ]
  },
  {
    day: 'Sunday',
    label: 'Full rest',
    focus: 'Reflect · Plan',
    color: 'var(--grn)',
    moves: [
      {name:'Log your weight', sets:'once — same time each week', muscles:[], yt:null, cue:'Sunday morning. After bathroom. Before eating. Same conditions every time.'},
      {name:'Plan next week meals', sets:'10 min', muscles:[], yt:null, cue:'Decide what to ferment, what to soak, what to prep. Preparation prevents slipping.'},
      {name:'Review wins', sets:'5 min', muscles:[], yt:null, cue:'Non-scale victories: energy, sleep quality, hunger control, mood, how clothes fit.'}
    ]
  }
];

// ── Render exercise plan ──
function renderExPlan(){
  const el = document.getElementById('ex-plan-list'); if(!el) return;
  el.innerHTML = WORKOUTS.map((w, wi) => `
    <div class="ex-card" id="ex-day-${wi}">
      <div class="ex-header" onclick="toggleExDay(${wi})">
        <div>
          <div class="ex-day-label">${w.day.toUpperCase()}</div>
          <div class="ex-title">${w.label} <span style="font-size:11px;color:var(--t3);font-weight:400">— ${w.focus}</span></div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" style="stroke:var(--t3);fill:none;stroke-width:2;flex-shrink:0" id="ex-chevron-${wi}"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="ex-body" id="ex-body-${wi}">
        <div style="margin-bottom:12px">
          ${renderMuscleDiagram(w.moves, w.color)}
        </div>
        ${w.moves.map(m => renderExMove(m)).join('')}
      </div>
    </div>`).join('');
}

function toggleExDay(wi){
  const body = document.getElementById('ex-body-'+wi);
  const chevron = document.getElementById('ex-chevron-'+wi);
  body.classList.toggle('open');
  chevron.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function renderExMove(m){
  return `<div class="ex-move">
    <div class="ex-move-info">
      <div class="ex-move-name">${m.name}</div>
      <div class="ex-move-detail">${m.sets}${m.cue ? ' — '+m.cue : ''}</div>
      ${m.muscles.length ? `<div class="ex-muscle-tags">${m.muscles.map(mu => `<span class="muscle-tag">${mu}</span>`).join('')}</div>` : ''}
      ${m.yt ? `<a class="yt-btn" href="${m.yt}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>Watch demo
      </a>` : ''}
    </div>
  </div>`;
}

// ── SVG muscle diagram ──
// Simple front/back body silhouette with targeted muscles highlighted
function renderMuscleDiagram(moves, accentColor){
  const all = moves.flatMap(m => m.muscles).map(s => s.toLowerCase());
  const has = (...keys) => keys.some(k => all.some(m => m.includes(k)));

  // Colour helpers
  const active = accentColor || 'var(--acc)';
  const dim = 'var(--b2)';
  const c = (cond) => cond ? active : dim;

  return `<div class="muscle-diagram-wrap">
    <svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg" style="padding:12px">
      <text x="85" y="14" text-anchor="middle" font-size="9" fill="var(--t3)" font-family="var(--mono)">FRONT</text>
      <text x="255" y="14" text-anchor="middle" font-size="9" fill="var(--t3)" font-family="var(--mono)">BACK</text>

      <!-- FRONT SILHOUETTE -->
      <!-- Head -->
      <ellipse cx="85" cy="32" rx="14" ry="16" fill="var(--s3)" stroke="${dim}" stroke-width="1"/>
      <!-- Neck -->
      <rect x="80" y="46" width="10" height="10" rx="2" fill="${dim}"/>
      <!-- Chest / pecs -->
      <ellipse cx="73" cy="70" rx="14" ry="12" fill="${c(has('pectoral','chest'))}" opacity="${has('pectoral','chest')?1:.5}"/>
      <ellipse cx="97" cy="70" rx="14" ry="12" fill="${c(has('pectoral','chest'))}" opacity="${has('pectoral','chest')?1:.5}"/>
      <!-- Shoulders front -->
      <ellipse cx="57" cy="63" rx="9" ry="10" fill="${c(has('deltoid','shoulder'))}" opacity="${has('deltoid','shoulder')?1:.5}"/>
      <ellipse cx="113" cy="63" rx="9" ry="10" fill="${c(has('deltoid','shoulder'))}" opacity="${has('deltoid','shoulder')?1:.5}"/>
      <!-- Biceps -->
      <rect x="44" y="73" width="11" height="22" rx="5" fill="${c(has('bicep'))}" opacity="${has('bicep')?1:.5}"/>
      <rect x="115" y="73" width="11" height="22" rx="5" fill="${c(has('bicep'))}" opacity="${has('bicep')?1:.5}"/>
      <!-- Forearms -->
      <rect x="43" y="97" width="10" height="20" rx="4" fill="${dim}"/>
      <rect x="117" y="97" width="10" height="20" rx="4" fill="${dim}"/>
      <!-- Abs / core -->
      <rect x="78" y="84" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <rect x="92" y="84" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <rect x="78" y="95" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <rect x="92" y="95" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <rect x="78" y="106" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <rect x="92" y="106" width="10" height="9" rx="2" fill="${c(has('ab','core','oblique','transverse'))}" opacity="${has('ab','core','oblique','transverse')?1:.5}"/>
      <!-- Obliques -->
      <ellipse cx="72" cy="100" rx="7" ry="14" fill="${c(has('oblique'))}" opacity="${has('oblique')?1:.5}"/>
      <ellipse cx="98" cy="100" rx="7" ry="14" fill="${c(has('oblique'))}" opacity="${has('oblique')?1:.5}"/>
      <!-- Quads -->
      <ellipse cx="76" cy="148" rx="12" ry="22" fill="${c(has('quad','leg'))}" opacity="${has('quad','leg')?1:.5}"/>
      <ellipse cx="94" cy="148" rx="12" ry="22" fill="${c(has('quad','leg'))}" opacity="${has('quad','leg')?1:.5}"/>
      <!-- Knees -->
      <ellipse cx="76" cy="172" rx="9" ry="6" fill="${dim}"/>
      <ellipse cx="94" cy="172" rx="9" ry="6" fill="${dim}"/>
      <!-- Calves front -->
      <ellipse cx="76" cy="192" rx="8" ry="14" fill="${c(has('calf','calve'))}" opacity="${has('calf','calve')?1:.5}"/>
      <ellipse cx="94" cy="192" rx="8" ry="14" fill="${c(has('calf','calve'))}" opacity="${has('calf','calve')?1:.5}"/>
      <!-- Hip / glutes -->
      <ellipse cx="76" cy="127" rx="13" ry="10" fill="${c(has('glute','hip'))}" opacity="${has('glute','hip')?1:.5}"/>
      <ellipse cx="94" cy="127" rx="13" ry="10" fill="${c(has('glute','hip'))}" opacity="${has('glute','hip')?1:.5}"/>

      <!-- BACK SILHOUETTE -->
      <!-- Head -->
      <ellipse cx="255" cy="32" rx="14" ry="16" fill="var(--s3)" stroke="${dim}" stroke-width="1"/>
      <!-- Neck/traps -->
      <rect x="250" y="46" width="10" height="10" rx="2" fill="${c(has('trap'))}"/>
      <!-- Traps upper -->
      <ellipse cx="235" cy="62" rx="11" ry="9" fill="${c(has('trap'))}" opacity="${has('trap')?1:.5}"/>
      <ellipse cx="275" cy="62" rx="11" ry="9" fill="${c(has('trap'))}" opacity="${has('trap')?1:.5}"/>
      <!-- Rear delts -->
      <ellipse cx="227" cy="70" rx="9" ry="9" fill="${c(has('deltoid','shoulder'))}" opacity="${has('deltoid','shoulder')?1:.5}"/>
      <ellipse cx="283" cy="70" rx="9" ry="9" fill="${c(has('deltoid','shoulder'))}" opacity="${has('deltoid','shoulder')?1:.5}"/>
      <!-- Lats -->
      <ellipse cx="237" cy="95" rx="14" ry="20" fill="${c(has('lat','latissimus'))}" opacity="${has('lat','latissimus')?1:.5}"/>
      <ellipse cx="273" cy="95" rx="14" ry="20" fill="${c(has('lat','latissimus'))}" opacity="${has('lat','latissimus')?1:.5}"/>
      <!-- Rhomboids -->
      <rect x="245" y="68" width="20" height="16" rx="3" fill="${c(has('rhomboid'))}" opacity="${has('rhomboid')?1:.5}"/>
      <!-- Lower back -->
      <rect x="245" y="108" width="20" height="14" rx="3" fill="${c(has('lower back'))}" opacity="${has('lower back')?1:.5}"/>
      <!-- Triceps -->
      <rect x="214" y="74" width="11" height="22" rx="5" fill="${c(has('tricep'))}" opacity="${has('tricep')?1:.5}"/>
      <rect x="285" y="74" width="11" height="22" rx="5" fill="${c(has('tricep'))}" opacity="${has('tricep')?1:.5}"/>
      <!-- Forearms back -->
      <rect x="213" y="98" width="10" height="20" rx="4" fill="${dim}"/>
      <rect x="287" y="98" width="10" height="20" rx="4" fill="${dim}"/>
      <!-- Glutes back -->
      <ellipse cx="246" cy="130" rx="14" ry="12" fill="${c(has('glute'))}" opacity="${has('glute')?1:.5}"/>
      <ellipse cx="264" cy="130" rx="14" ry="12" fill="${c(has('glute'))}" opacity="${has('glute')?1:.5}"/>
      <!-- Hamstrings -->
      <ellipse cx="246" cy="155" rx="12" ry="20" fill="${c(has('hamstring'))}" opacity="${has('hamstring')?1:.5}"/>
      <ellipse cx="264" cy="155" rx="12" ry="20" fill="${c(has('hamstring'))}" opacity="${has('hamstring')?1:.5}"/>
      <!-- Calves back -->
      <ellipse cx="246" cy="192" rx="9" ry="14" fill="${c(has('calf','calve'))}" opacity="${has('calf','calve')?1:.5}"/>
      <ellipse cx="264" cy="192" rx="9" ry="14" fill="${c(has('calf','calve'))}" opacity="${has('calf','calve')?1:.5}"/>

      <!-- Divider line -->
      <line x1="170" y1="10" x2="170" y2="210" stroke="var(--b1)" stroke-width=".5" stroke-dasharray="4 4"/>
    </svg>
  </div>`;
}

// ── Exercise log render ──
function renderExLog(){
  const el = document.getElementById('ex-log-list'); if(!el) return;
  const recent = [...(APP.exLog||[])].reverse().slice(0, 20);
  if(!recent.length){ el.innerHTML = '<div class="empty">No workouts logged yet.</div>'; return; }
  const intColors = {light:'var(--grn)', moderate:'var(--amb)', hard:'var(--red)'};
  el.innerHTML = recent.map(e => {
    const d = new Date(e.ts);
    const dateStr = d.toLocaleString('en-KE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<div class="log-item">
      <div class="log-dot" style="background:${intColors[e.intensity]||'var(--t3)'}"></div>
      <div style="flex:1">
        <div class="log-meta">${dateStr}</div>
        <div class="log-text">${e.name}${e.dur ? ' · '+e.dur+' min' : ''}${e.note ? ' — '+e.note : ''}</div>
      </div>
    </div>`;
  }).join('');
}
