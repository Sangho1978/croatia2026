/* MIX47 · concise, role-aware Croatia report photo guide */
(function(){
  'use strict';
  const P=()=>window.CRO_REPORT_PHOTO_PLAN;
  const isCroatia=()=>((window.GSPA_TRIP_ID||'croatia')==='croatia');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storeKey='cro.report.photo.done.v2';
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(storeKey)||'{}')||{}}catch(_){saved={}}
  function save(){try{localStorage.setItem(storeKey,JSON.stringify(saved))}catch(_){}}
  function user(){try{return typeof currentUser!=='undefined'?currentUser:null}catch(_){return null}}
  function access(){
    const u=user(),admins=new Set(P()?.adminViewers||['한상호','나종민']);
    const all=!!u&&admins.has(u.name);
    const groups=all?[1,2,3,4]:(u&&+u.group>=1&&+u.group<=4?[+u.group]:[]);
    return {u,all,groups};
  }
  function shotKey(date,g,i){return `${date}|g${g}|${i}`}
  function cleanShot(s){return String(s||'').replace(/^(기본|문제|벤치)\s*·\s*/,'')}
  function conciseShots(g,x){
    const a=(x?.shots||[]).map(cleanShot).filter(Boolean);
    if(a.length<=3)return a;
    if(+g===3){
      const raw=x.shots||[];
      const basic=cleanShot(raw[0]||a[0]);
      const problem=cleanShot(raw.find(v=>/^문제\s*·/.test(v))||a[1]);
      const bench=cleanShot(raw.find(v=>/^벤치\s*·/.test(v))||a[2]);
      return [basic,problem,bench].filter(Boolean);
    }
    if(+g===4){
      const price=a.find(v=>/가격|메뉴판|입장료/.test(v))||a[1];
      const pack=a.find(v=>/포장|원산지|품질|결제|온라인/.test(v))||a[a.length-1];
      return [a[0],price,pack].filter(Boolean);
    }
    return a.slice(0,3);
  }
  function taskList(date,g,x){
    const items=conciseShots(g,x);
    return `<div class="photo-must-list">${items.map((s,i)=>{const k=shotKey(date,g,i);return `<label class="photo-must-item"><input type="checkbox" data-photo-check="${esc(k)}" ${saved[k]?'checked':''}><i>${i+1}</i><span>${esc(s)}</span></label>`}).join('')}</div>`;
  }
  function exampleHtml(d,compact=false){
    if(!d?.example?.image)return '';
    return `<figure class="photo-example ${compact?'compact':''}"><img src="${esc(d.example.image)}" alt="${esc(d.place)} 촬영 구도 예시" loading="lazy" decoding="async"><figcaption><b>예시 구도</b>${esc(d.example.caption.replace(/^예시\s*·\s*/,''))}<small>첨부 발표자료의 예시 이미지를 촬영 참고용으로 사용</small></figcaption></figure>`;
  }
  function groupMini(date,g,d){
    const grp=P().groups[g],x=d.groups[g];
    return `<article class="day-photo-group g${g}" data-photo-day-group="${g}"><div class="day-photo-group-head"><div><small>PART ${g}</small><b>${esc(grp.title)}</b></div><span>${esc(x.count)}</span></div>${taskList(date,g,x)}<div class="photo-evidence-note"><b>같이 메모</b>${esc(x.memo)}</div></article>`;
  }
  window.dayPhotoGuideHtml=function(date){
    if(!isCroatia()||!P()?.days?.[date])return '';
    const d=P().days[date];
    return `<details class="day-photo-guide" data-photo-date="${esc(date)}"><summary><span class="photo-camera" aria-hidden="true">📷</span><span><b>결과보고서 촬영</b><small class="photo-access-label">${esc(d.label)}</small></span><span class="photo-summary-count">핵심 3컷</span></summary><div class="day-photo-guide-body">${exampleHtml(d,true)}<p class="photo-common-note">${esc(d.common)}</p><div class="day-photo-groups">${[1,2,3,4].map(g=>groupMini(date,g,d)).join('')}</div>${d.optional?`<details class="photo-optional"><summary>+ 보강촬영</summary><p>${esc(d.optional)}</p></details>`:''}<button type="button" class="photo-full-guide-btn" data-route="fieldphotos">내 촬영가이드 전체보기</button></div></details>`;
  };
  function corePlaceCards(){
    const dates=['2026-10-13','2026-10-15','2026-10-16','2026-10-17'];
    return dates.map(date=>{const d=P().days[date];return `<article class="photo-place-card"><img src="${esc(d.example?.image||'')}" alt="${esc(d.place)} 촬영 예시" loading="lazy" decoding="async"><div class="photo-place-body"><small>${date.slice(5).replace('-','/')}</small><h3>${esc(d.place)}</h3><div class="photo-place-counts">${[1,2,3,4].map(g=>`<span data-photo-count-group="${g}"><b>${g}조</b>${esc(d.groups[g].count)}</span>`).join('')}</div><button type="button" data-photo-jump="${date}">일정에서 보기</button></div></article>`}).join('');
  }
  function groupCards(){
    return [1,2,3,4].map(g=>{
      const x=P().groups[g];
      const rows=Object.entries(P().days).filter(([,d])=>d.core).map(([date,d])=>{
        const gx=d.groups[g],shots=conciseShots(g,gx);
        return `<div class="photo-group-location"><div class="photo-group-location-head"><b>${date.slice(5).replace('-','/')} · ${esc(d.place)}</b><span>${esc(gx.count)}</span></div><p>${shots.map((s,i)=>`<span><em>${i+1}</em>${esc(s)}</span>`).join('')}</p></div>`;
      }).join('');
      return `<article class="photo-group-master g${g}" data-photo-group-card="${g}"><header><small>PART ${g}</small><h3>${esc(x.title)}</h3><p>${esc(x.subtitle)}</p></header><div class="photo-target"><b>전체 목표</b>${esc(x.target)}</div>${rows}</article>`;
    }).join('');
  }
  function renderMaster(){
    const root=document.getElementById('fieldPhotoGuide');if(!root||!P())return;
    root.innerHTML=`<div class="photo-master-intro"><div><small>FIELD EVIDENCE</small><h2>결과보고서 촬영가이드</h2><p id="photoViewerNote">로그인한 조에 맞춰 필요한 촬영만 보여줍니다.</p></div><div class="photo-master-rule"><b>촬영 원칙</b><span>예쁜 풍경 1장 + 운영 방식이 보이는 증거사진을 우선 확보</span><small>사진과 함께 시간·가격·대기·불편/장점 중 하나는 꼭 메모하세요.</small></div></div><div class="photo-place-grid">${corePlaceCards()}</div><div class="photo-filter" role="group" aria-label="조별 촬영가이드 필터"><button class="active" data-photo-filter="all">전체</button>${[1,2,3,4].map(g=>`<button data-photo-filter="${g}">${g}조</button>`).join('')}</div><div class="photo-group-master-grid">${groupCards()}</div><div class="photo-file-tip">${esc(P().common.filename)}</div>`;
  }
  function applyFilter(v){
    document.querySelectorAll('[data-photo-group-card]').forEach(el=>{el.hidden=(v!=='all'&&el.dataset.photoGroupCard!==String(v))});
    document.querySelectorAll('[data-photo-filter]').forEach(b=>b.classList.toggle('active',b.dataset.photoFilter===String(v)));
  }
  function applyAccess(){
    if(!isCroatia())return;
    const {u,all,groups}=access(),allowed=new Set(groups.map(String));
    document.querySelectorAll('.day-photo-guide').forEach(guide=>{
      guide.hidden=!u;
      guide.querySelectorAll('[data-photo-day-group]').forEach(card=>card.hidden=!allowed.has(card.dataset.photoDayGroup));
      const lab=guide.querySelector('.photo-access-label');if(lab)lab.textContent=all?'전체 4개 조 · 핵심 촬영':groups.length?`${groups[0]}조 · 핵심 촬영`:'촬영가이드';
      const btn=guide.querySelector('.photo-full-guide-btn');if(btn)btn.textContent=all?'전체 조 촬영가이드 보기':groups.length?`${groups[0]}조 촬영가이드 전체보기`:'촬영가이드 보기';
    });
    const note=document.getElementById('photoViewerNote');
    if(note)note.textContent=!u?'로그인 후 내 조 촬영가이드를 확인할 수 있습니다.':all?'한상호·나종민 교수 화면 · 1~4조 전체 확인 가능':`${u.name} · ${groups[0]}조 촬영만 표시`;
    const filter=document.querySelector('.photo-filter');if(filter)filter.hidden=!all;
    document.querySelectorAll('[data-photo-count-group]').forEach(el=>{el.hidden=!allowed.has(el.dataset.photoCountGroup)});
    document.querySelectorAll('[data-photo-group-card]').forEach(el=>{el.hidden=!allowed.has(el.dataset.photoGroupCard)});
    if(all)applyFilter('all');
  }
  document.addEventListener('change',e=>{const cb=e.target.closest('[data-photo-check]');if(!cb)return;saved[cb.dataset.photoCheck]=cb.checked;save()});
  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-photo-filter]');if(f){applyFilter(f.dataset.photoFilter);return}
    const j=e.target.closest('[data-photo-jump]');if(j){window.AppRouter?.go('schedule',j.dataset.photoJump);return}
  });
  function init(){if(!isCroatia())return;renderMaster();applyAccess()}
  window.addEventListener('cro-auth-change',()=>setTimeout(applyAccess,0));
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='fieldphotos')setTimeout(applyAccess,0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
