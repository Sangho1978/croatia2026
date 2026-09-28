/* MIX46 · report photo guide UI (Croatia only) */
(function(){
  'use strict';
  const P=()=>window.CRO_REPORT_PHOTO_PLAN;
  const isCroatia=()=>((window.GSPA_TRIP_ID||'croatia')==='croatia');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storeKey='cro.report.photo.done.v1';
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(storeKey)||'{}')||{}}catch(_){saved={}}
  function save(){try{localStorage.setItem(storeKey,JSON.stringify(saved))}catch(_){}}
  function shotKey(date,g,i){return `${date}|g${g}|${i}`}
  function taskList(date,g,items){
    return `<ul class="photo-shot-list">${items.map((s,i)=>{const k=shotKey(date,g,i);return `<li><label><input type="checkbox" data-photo-check="${esc(k)}" ${saved[k]?'checked':''}><span>${esc(s)}</span></label></li>`}).join('')}</ul>`;
  }
  function groupMini(date,g,d){
    const grp=P().groups[g],x=d.groups[g];
    return `<article class="day-photo-group g${g}"><div class="day-photo-group-head"><b>${esc(grp.title)}</b><span>${esc(x.count)}</span></div>${taskList(date,g,x.shots)}<small>메모 · ${esc(x.memo)}</small></article>`;
  }
  window.dayPhotoGuideHtml=function(date){
    if(!isCroatia()||!P()?.days?.[date])return '';
    const d=P().days[date];
    return `<details class="day-photo-guide" data-photo-date="${esc(date)}"><summary><span class="photo-camera" aria-hidden="true">📷</span><span><b>결과보고서 촬영</b><small>${esc(d.label)} · 조별 체크포인트</small></span><span class="photo-summary-count">확인</span></summary><div class="day-photo-guide-body"><p class="photo-common-note">${esc(d.common)}</p><div class="day-photo-groups">${[1,2,3,4].map(g=>groupMini(date,g,d)).join('')}</div>${d.optional?`<div class="photo-optional"><b>보강촬영(선택)</b>${esc(d.optional)}</div>`:''}<button type="button" class="photo-full-guide-btn" data-route="fieldphotos">전체 조별 촬영가이드 보기</button></div></details>`;
  };
  function corePlaceCards(){
    const dates=['2026-10-13','2026-10-15','2026-10-16','2026-10-17'];
    return dates.map(date=>{const d=P().days[date];return `<article class="photo-place-card"><div><small>${date.slice(5).replace('-','/')}</small><h3>${esc(d.place)}</h3></div><div class="photo-place-counts">${[1,2,3,4].map(g=>`<span><b>${g}조</b>${esc(d.groups[g].count)}</span>`).join('')}</div><button type="button" data-photo-jump="${date}">해당 일정 열기</button></article>`}).join('');
  }
  function groupCards(){
    return [1,2,3,4].map(g=>{const x=P().groups[g];const rows=Object.entries(P().days).filter(([,d])=>d.core).map(([date,d])=>`<div class="photo-group-location"><b>${date.slice(5).replace('-','/')} · ${esc(d.place)}</b><span>${esc(d.groups[g].count)}</span><p>${d.groups[g].shots.map(esc).join(' · ')}</p><small>${esc(d.groups[g].memo)}</small></div>`).join('');return `<article class="photo-group-master g${g}" data-photo-group-card="${g}"><header><small>PART ${g}</small><h3>${esc(x.title)}</h3><p>${esc(x.subtitle)}</p></header><div class="photo-question">${esc(x.question)}</div><div class="photo-target"><b>전체 목표</b>${esc(x.target)}</div><div class="photo-focus">${x.focus.map(a=>`<span>${esc(a)}</span>`).join('')}</div>${rows}</article>`}).join('');
  }
  function renderMaster(){
    const root=document.getElementById('fieldPhotoGuide');if(!root||!P())return;
    root.innerHTML=`<div class="photo-master-intro"><div><small>FIELD EVIDENCE</small><h2>국외연수 결과보고 · 촬영가이드</h2><p>핵심 4개 현장을 같은 동선으로 보되, 각 조는 서로 다른 증거사진을 확보합니다.</p></div><div class="photo-master-rule"><b>${esc(P().common.title)}</b><span>${esc(P().common.minimum)}</span><small>${esc(P().common.editTip)}</small></div></div><div class="photo-place-grid">${corePlaceCards()}</div><div class="photo-filter" role="group" aria-label="조별 촬영가이드 필터"><button class="active" data-photo-filter="all">전체</button>${[1,2,3,4].map(g=>`<button data-photo-filter="${g}">${g}조</button>`).join('')}</div><div class="photo-group-master-grid">${groupCards()}</div><div class="photo-file-tip">${esc(P().common.filename)}</div>`;
  }
  function applyFilter(v){document.querySelectorAll('[data-photo-group-card]').forEach(el=>{el.hidden=(v!=='all'&&el.dataset.photoGroupCard!==String(v))});document.querySelectorAll('[data-photo-filter]').forEach(b=>b.classList.toggle('active',b.dataset.photoFilter===String(v)))}
  document.addEventListener('change',e=>{const cb=e.target.closest('[data-photo-check]');if(!cb)return;saved[cb.dataset.photoCheck]=cb.checked;save()});
  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-photo-filter]');if(f){applyFilter(f.dataset.photoFilter);return}
    const j=e.target.closest('[data-photo-jump]');if(j){window.AppRouter?.go('schedule',j.dataset.photoJump);return}
  });
  function init(){if(!isCroatia())return;renderMaster()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
