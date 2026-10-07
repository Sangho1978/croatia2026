/* MIX62: standalone meal directory retained; schedule meal cards are merged into the chronological agenda. */
/* MIX59 · compact meal schedule, public menus, Google Maps links only. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const isCroatia=()=>typeof TRIP_ID==='undefined'||TRIP_ID==='croatia';
  const meals=()=>isCroatia()&&Array.isArray(window.CRO_MEALS)?window.CRO_MEALS:[];
  const menuOpen=()=>true;
  const dateLabel=d=>{const x=new Date(d+'T12:00:00');return `${x.getMonth()+1}/${x.getDate()} (${['일','월','화','수','목','금','토'][x.getDay()]})`};
  const mapUrl=m=>m.mapQuery?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapQuery)}`:'';
  const mealClass=m=>m.free?'meal-free':m.type==='중식'?'meal-lunch':m.type==='석식'?'meal-dinner':'meal-other';
  const mealIcon=m=>m.free?'☕':m.type==='중식'?'☀️':m.type==='석식'?'🌙':'🍽️';
  function menuHtml(m,compact=false){
    if(m.free)return '<div class="meal-menu meal-menu-free"><b>메뉴</b><span>자유식</span></div>';
    const items=(m.menuKo?.length?m.menuKo:m.menu||[]);
    if(!items.length)return `<div class="meal-menu"><b>메뉴</b><span>${esc(m.menuNote||'세부 메뉴 미기재')}</span></div>`;
    return `<div class="meal-menu ${compact?'compact':''}"><b>메뉴</b><div>${items.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
  }
  function buttons(m){
    const out=[];
    if(m.mapQuery)out.push(`<a class="meal-btn map" href="${mapUrl(m)}" target="_blank" rel="noopener">📍 Google Maps</a>`);
    if(m.website)out.push(`<a class="meal-btn web" href="${esc(m.website)}" target="_blank" rel="noopener">↗ 웹사이트</a>`);
    return out.length?`<div class="meal-actions">${out.join('')}</div>`:'';
  }
  function card(m,{schedule=false}={}){
    const cls=mealClass(m);
    return `<article class="meal-card ${cls}${schedule?' schedule-meal':''}">
      <div class="meal-card-head"><div><span class="meal-type-badge">${mealIcon(m)} ${esc(m.type)}</span><small>${esc(m.time)} · 현지시간</small><h3>${esc(m.name)}</h3></div><span class="meal-city">${esc(m.city)}</span></div>
      ${schedule?'':`<div class="meal-place">${esc(m.address)}</div>${m.phone?`<div class="meal-phone">☎ ${esc(m.phone)}</div>`:''}`}
      ${menuHtml(m,schedule)}
      ${buttons(m)}
    </article>`;
  }
  function legend(){return `<div class="meal-legend" aria-label="식사 구분"><span class="lunch">● 중식</span><span class="dinner">● 석식</span><span class="free">● 자유식</span></div>`}
  function renderMealsView(){
    const root=document.getElementById('mealPlacesApp');if(!root)return;
    const groups=new Map();meals().forEach(m=>{if(!groups.has(m.date))groups.set(m.date,[]);groups.get(m.date).push(m)});
    root.innerHTML=legend()+[...groups].map(([d,list])=>`<section class="meal-day"><div class="meal-day-title"><b>${dateLabel(d)}</b><span>${esc((days.find(x=>x.date===d)||{}).title||'')}</span></div>${list.map(m=>card(m)).join('')}</section>`).join('');
  }
  function renderScheduleMeals(){
    // MIX62: 식사는 시간순 일정 안에 합쳐서 표시한다. 별도 블록은 중복이므로 제거.
    document.querySelectorAll('.schedule-meals-block').forEach(x=>x.remove());
  }
  function refresh(){renderMealsView();renderScheduleMeals()}
  window.GSPA_Meals={refresh,menuOpen};
  window.addEventListener('cro-auth-change',refresh);
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='meals')renderMealsView();if(e.detail?.view==='schedule')renderScheduleMeals()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,40),{once:true});else setTimeout(refresh,40);
})();
