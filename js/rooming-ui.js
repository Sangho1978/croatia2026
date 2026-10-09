(function(){
'use strict';
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){
  const box=document.getElementById('roomingApp'); if(!box)return;
  const list=Array.isArray(window.CRO_ROOMING)?window.CRO_ROOMING:[];
  box.innerHTML=`<div class="rooming-summary"><b>${list.length}</b><span>객실 · 크로아티아팀 전체</span></div><div class="rooming-grid">${list.map(r=>`<article class="rooming-card"><div class="rooming-no">ROOM ${r.room}</div>${r.people.map(p=>`<div class="rooming-person"><b>${esc(p.name)}</b><span>${esc(p.org)}</span><em>${esc(p.gender)}</em></div>`).join('')}</article>`).join('')}</div><p class="rooming-note">전화번호는 개인정보 보호를 위해 표시하지 않습니다.</p>`;
}
document.addEventListener('DOMContentLoaded',render);
document.addEventListener('click',e=>{if(e.target.closest('[data-route="rooming"]'))setTimeout(render,30)});
window.RoomingUI={render};
})();
