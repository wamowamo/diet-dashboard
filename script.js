(() => {
  'use strict';
  const CONFIG = window.DIET_DASHBOARD_CONFIG || {};
  const $ = id => document.getElementById(id);
  const weekdayJa = ['日','月','火','水','木','金','土'];
  let currentData = null;
  let chartRange = '6m';

  const fmtDateLong = iso => { if(!iso) return '—'; const d=new Date(`${iso}T00:00:00`); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`; };
  const fmtKg = (v,d=2) => Number.isFinite(Number(v)) ? `${Number(v).toFixed(d)} kg` : '—';
  const pct = v => `${(Math.max(0,Math.min(1,Number(v)||0))*100).toFixed(1)}%`;

  function showError(msg){ $('bannerTitle').textContent='データを取得できませんでした。'; $('errorText').textContent=msg; $('errorBanner').hidden=false; }
  function hideError(){ $('errorBanner').hidden=true; }
  function setDiff(el,value,label='前回比'){
    const v=Number(value); el.className='previous neutral';
    if(!Number.isFinite(v)){el.innerHTML=`<span>${label}</span><strong>—</strong>`;return;}
    const arrow=v<0?'↓':v>0?'↑':'→'; const sign=v>0?'+':'';
    el.className=`previous ${v<0?'good':v>0?'bad':'neutral'}`;
    el.innerHTML=`<span>${label}</span><strong>${arrow} ${sign}${v.toFixed(2)} kg</strong>`;
  }

  function renderRecent(items){
    const grid=$('recentGrid'); grid.innerHTML='';
    (items||[]).forEach(item=>{
      const d=new Date(`${item.date}T00:00:00`), day=d.getDay();
      const card=document.createElement('article'); card.className=`recent-card${day===0?' sunday':day===6?' saturday':''}`;
      const w=Number.isFinite(Number(item.weight))?`${Number(item.weight).toFixed(1)} kg`:'—';
      card.innerHTML=`<div class="recent-date">${d.getMonth()+1}/${d.getDate()}<br>(${weekdayJa[day]})</div><div class="recent-value">${w}</div>`;
      grid.appendChild(card);
    });
  }

  function render(data){
    currentData=data; hideError();
    const now=new Date(); $('todayText').textContent=`▣  ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（${weekdayJa[now.getDay()]}）`;
    $('currentWeight').textContent=Number(data.current.weight).toFixed(2); setDiff($('previousDiff'),data.current.previousDiff);
    $('goal1RemainingTop').textContent=Number(data.goals.goal1Remaining).toFixed(2); $('goal2RemainingTop').textContent=Number(data.goals.goal2Remaining).toFixed(2);
    $('goal1DateTop').textContent=fmtDateLong(data.goals.goal1Date); $('goal2DateTop').textContent=fmtDateLong(data.goals.goal2Date);
    $('goal1WeightTop').textContent=fmtKg(data.goals.goal1Weight,2); $('goal2WeightTop').textContent=fmtKg(data.goals.goal2Weight,2);
    renderRecent(data.recent7);

    $('goal1StartLabel').textContent=`${Number(data.goals.startWeight).toFixed(0)}kg`; $('goal1EndLabel').textContent=`${Number(data.goals.goal1Weight).toFixed(0)}kg`;
    $('goal2StartLabel').textContent=`${Number(data.goals.goal1Weight).toFixed(0)}kg`; $('goal2EndLabel').textContent=`${Number(data.goals.goal2Weight).toFixed(0)}kg`;
    $('goal1Period').textContent=`${fmtDateLong(data.goals.startDate)} ～ ${fmtDateLong(data.goals.goal1Date)}`; $('goal2Period').textContent=`${fmtDateLong(data.goals.goal1Date)} ～ ${fmtDateLong(data.goals.goal2Date)}`;
    $('goal1Days').textContent=data.goals.goal1DaysRemaining; $('goal2Days').textContent=data.goals.goal2DaysRemaining;
    const p1=Math.max(0,Math.min(1,Number(data.goals.phase1Progress)||0)), p2=Math.max(0,Math.min(1,Number(data.goals.phase2Progress)||0));
    $('goal1ProgressBar').style.width=`${p1*100}%`; $('goal2ProgressBar').style.width=`${p2*100}%`; $('goal1ProgressPct').textContent=pct(p1); $('goal2ProgressPct').textContent=pct(p2);
    $('goal1StartCaption').textContent=fmtKg(data.goals.startWeight,1); $('goal1EndCaption').textContent=fmtKg(data.goals.goal1Weight,1); $('goal1RemainCaption').textContent=fmtKg(data.goals.goal1Remaining,2);
    $('goal2StartCaption').textContent=fmtKg(data.goals.goal1Weight,1); $('goal2EndCaption').textContent=fmtKg(data.goals.goal2Weight,1); $('goal2RemainCaption').textContent=fmtKg(data.goals.goal2Remaining,2);

    $('bodyFat').textContent=Number.isFinite(Number(data.current.bodyFat))?`${Number(data.current.bodyFat).toFixed(1)}%`:'—';
    $('bodyFatDiff').textContent='前回比 —';
    $('lostWeight').textContent=fmtKg(data.stats.lostWeight,2); $('startWeightStat').textContent=`開始時 ${fmtKg(data.goals.startWeight,1)}`;
    $('remainingWeight').textContent=fmtKg(data.goals.goal1Remaining,2); $('goal1Stat').textContent=`目標 ${fmtKg(data.goals.goal1Weight,2)}`;
    $('remainingDays').textContent=`${data.goals.goal1DaysRemaining}日`; $('goal1DateStat').textContent=`${fmtDateLong(data.goals.goal1Date)} まで`;
    $('updatedAt').textContent=`最終更新：${data.generatedAt||'—'}`;
    drawChart();
  }

  function filterByRange(arr,endIso,range){
    if(range==='all'||!endIso) return arr;
    const end=new Date(`${endIso}T00:00:00`); const start=new Date(end);
    if(range==='3m') start.setMonth(start.getMonth()-3); else if(range==='6m') start.setMonth(start.getMonth()-6); else start.setFullYear(start.getFullYear()-1);
    return arr.filter(p=>new Date(`${p.date}T00:00:00`)>=start && new Date(`${p.date}T00:00:00`)<=end);
  }

  function drawChart(){
    if(!currentData) return;
    const svg=$('weightChart'); const chart=currentData.chart||{}; const actual0=Array.isArray(chart.actual)?chart.actual:[]; const target0=Array.isArray(chart.target)?chart.target:[];
    const endIso=chartRange==='all'?currentData.goals.goal2Date:(actual0.length?actual0[actual0.length-1].date:currentData.current.date);
    let actual=filterByRange(actual0,endIso,chartRange), target=filterByRange(target0,chartRange==='all'?currentData.goals.goal2Date:endIso,chartRange);
    if(chartRange==='all'){actual=actual0;target=target0;}
    const all=[...actual,...target].filter(p=>p&&p.date&&Number.isFinite(Number(p.weight)));
    if(!all.length){svg.innerHTML='<text x="380" y="150" text-anchor="middle" fill="#8a839b" font-size="16">グラフデータがありません</text>';return;}
    const W=760,H=300,m={l:50,r:26,t:18,b:44},iw=W-m.l-m.r,ih=H-m.t-m.b;
    const times=all.map(p=>new Date(`${p.date}T00:00:00`).getTime()), vals=all.map(p=>Number(p.weight)); let minX=Math.min(...times),maxX=Math.max(...times); if(minX===maxX)maxX+=86400000;
    const minV0=Math.min(...vals),maxV0=Math.max(...vals), pad=Math.max(2,(maxV0-minV0)*.08); const minV=Math.floor((minV0-pad)/5)*5,maxV=Math.ceil((maxV0+pad)/5)*5;
    const x=d=>m.l+((new Date(`${d}T00:00:00`).getTime()-minX)/(maxX-minX))*iw, y=v=>m.t+(1-(Number(v)-minV)/(maxV-minV))*ih;
    const path=a=>a.length?a.map((p,i)=>`${i?'L':'M'}${x(p.date).toFixed(1)},${y(p.weight).toFixed(1)}`).join(' '):'';
    const g1=currentData.goals.goal1Date; const t1=target.filter(p=>p.date<=g1), t2=target.filter(p=>p.date>=g1);
    let html=''; for(let i=0;i<=5;i++){const value=minV+(maxV-minV)*i/5,yy=y(value);html+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e8e6f2"/><text x="${m.l-10}" y="${yy+5}" text-anchor="end" fill="#39306a" font-size="12">${value.toFixed(0)}</text>`;}
    const ticks=6; for(let i=0;i<=ticks;i++){const t=minX+(maxX-minX)*i/ticks,d=new Date(t),xx=m.l+(t-minX)/(maxX-minX)*iw; html+=`<line x1="${xx}" y1="${m.t}" x2="${xx}" y2="${H-m.b}" stroke="#f0eef8"/><text x="${xx}" y="${H-16}" text-anchor="middle" fill="#39306a" font-size="11">${d.getFullYear()}/${d.getMonth()+1}</text>`;}
    html+=`<path d="${path(t1)}" fill="none" stroke="#ff5791" stroke-width="2.5" stroke-dasharray="7 6"/><path d="${path(t2)}" fill="none" stroke="#00b86e" stroke-width="2.5" stroke-dasharray="7 6"/><path d="${path(actual)}" fill="none" stroke="#6846df" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    html+=actual.map(p=>`<circle cx="${x(p.date)}" cy="${y(p.weight)}" r="4" fill="#6846df"/>`).join(''); html+=`<text x="11" y="24" fill="#39306a" font-size="12">体重</text><text x="11" y="39" fill="#39306a" font-size="12">(kg)</text>`;
    const marker=(date,label1,label2,color,fill,side)=>{const p=target0.find(q=>q.date===date)||{date,weight:date===g1?currentData.goals.goal1Weight:currentData.goals.goal2Weight};const xx=x(p.date),yy=y(p.weight),bx=Math.max(80,Math.min(W-165,side==='right'?xx+18:xx-95));return `<circle cx="${xx}" cy="${yy}" r="5" fill="${color}"/><g><rect x="${bx}" y="${yy-72}" rx="12" width="140" height="60" fill="${fill}" stroke="${color}" stroke-opacity=".22"/><text x="${bx+70}" y="${yy-49}" text-anchor="middle" fill="${color}" font-size="14" font-weight="700">${label1}</text><text x="${bx+70}" y="${yy-29}" text-anchor="middle" fill="${color}" font-size="13">${label2}</text></g>`;};
    const within=date=>{const t=new Date(`${date}T00:00:00`).getTime();return t>=minX&&t<=maxX;}; if(within(g1))html+=marker(g1,'第1目標 80kg',fmtDateLong(g1),'#ff3f7c','#fff0f5','right'); if(within(currentData.goals.goal2Date))html+=marker(currentData.goals.goal2Date,'第2目標 60kg',fmtDateLong(currentData.goals.goal2Date),'#00a96a','#ebfff6','left');
    svg.innerHTML=html;
  }

  function loadJsonp(){return new Promise((resolve,reject)=>{const endpoint=CONFIG.DATA_ENDPOINT;if(!endpoint){reject(new Error('Apps Script URLが未設定です。'));return;}const cb=`dietDashboardCallback_${Date.now()}`,s=document.createElement('script');const timer=setTimeout(()=>cleanup(new Error('データ取得がタイムアウトしました。')),15000);function cleanup(err,data){clearTimeout(timer);delete window[cb];s.remove();err?reject(err):resolve(data);}window[cb]=data=>cleanup(null,data);s.onerror=()=>cleanup(new Error('Apps Scriptへの接続に失敗しました。'));s.src=`${endpoint}${endpoint.includes('?')?'&':'?'}callback=${encodeURIComponent(cb)}&_=${Date.now()}`;document.head.appendChild(s);});}
  async function refresh(){ $('refreshButton').disabled=true; try{const data=await loadJsonp(); if(!data||data.ok===false)throw new Error(data&&data.error?data.error:'不明なデータ形式です。');render(data);}catch(e){showError(e.message||String(e));}finally{$('refreshButton').disabled=false;} }
  document.querySelectorAll('.range-tabs button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.range-tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');chartRange=btn.dataset.range;drawChart();}));
  $('refreshButton').addEventListener('click',refresh); refresh();
})();
