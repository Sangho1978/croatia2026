/* MIX02: personal pre-trip checklist. Do not reassign legacy numeric keys. */
(function(){
  'use strict';
  let storageFailed=false;
  const state=new Map();
  const read=key=>{try{return localStorage.getItem(key)}catch(_){storageFailed=true;return null}};
  function write(key,on){state.set(key,on);try{localStorage.setItem(key,on?'1':'0')}catch(_){storageFailed=true;}}
  const items=()=>[...document.querySelectorAll('#checks input[data-prep-id]')];
  function display(){
    const list=items(),count=list.filter(e=>e.checked).length,only=document.getElementById('prepMissingOnly').checked;
    document.getElementById('prog').style.width=(list.length?count/list.length*100:0)+'%';
    document.querySelector('#check [role="progressbar"]').setAttribute('aria-valuenow',String(Math.round(list.length?count/list.length*100:0)));
    document.getElementById('progText').textContent=count+' / '+list.length+' 완료';
    for(const row of document.querySelectorAll('#checks .prep2-item')){row.hidden=only&&row.querySelector('input').checked;row.classList.toggle('done',row.querySelector('input').checked)}
    for(const sec of document.querySelectorAll('#checks .prep2-category')){
      const a=[...sec.querySelectorAll('input')],n=a.filter(x=>x.checked).length;
      sec.querySelector('.prep2-category-count').textContent=n+'/'+a.length;
      sec.hidden=only&&a.length===n;
    }
    document.getElementById('prepAllDone').hidden=!(only&&count===list.length);
    document.getElementById('prepStorageNotice').textContent=storageFailed?'이 브라우저에서는 저장할 수 없습니다. 창을 닫기 전에 별도로 기록해 주세요.':'체크는 이 브라우저에 자동 저장됩니다. 다른 기기와 공유하지 않습니다.';
  }
  function initialize(){
    const host=document.getElementById('checks');if(!host)return;host.innerHTML='';
    for(const group of CHECK_GROUPS){
      const sec=document.createElement('section');sec.className='prep2-category';
      const header=document.createElement('header'),title=document.createElement('h3'),counter=document.createElement('span');
      title.textContent=group.title;counter.className='prep2-category-count';header.append(title,counter);sec.append(header);
      for(const [text,tag,id,legacy] of group.items){
        let saved=read(id);
        if(saved===null&&legacy&&read(legacy)==='1'){write(id,true);saved='1';}
        state.set(id,saved==='1');
        const row=document.createElement('label');row.className='prep2-item';row.htmlFor=id;
        const cb=document.createElement('input');cb.type='checkbox';cb.id=id;cb.dataset.prepId=id;cb.checked=state.get(id);
        const label=document.createElement('span');label.className='prep2-item-text';label.textContent=text;
        const badge=document.createElement('small');badge.textContent=tag==='필수'?'필수':tag==='해당'?'해당 시':'';badge.className='prep2-tag';
        row.append(cb,label,badge);sec.append(row);
        cb.addEventListener('change',()=>{write(id,cb.checked);display()});
      }
      host.append(sec);
    }
    const message=document.createElement('div');message.id='prepAllDone';message.className='prep2-all-done';message.textContent='✓ 출발 전 준비를 모두 체크했습니다.';message.hidden=true;host.append(message);
    document.getElementById('prepMissingOnly').addEventListener('change',display);display();
  }
  window.resetPreparation=function(){if(!confirm('준비물 체크를 모두 해제할까요?'))return;for(const e of items()){e.checked=false;write(e.id,false)}display();};
  window.addEventListener('storage',e=>{if(!e.key?.startsWith('prep_'))return;const cb=document.getElementById(e.key);if(cb){cb.checked=e.newValue==='1';display();}});
  document.addEventListener('DOMContentLoaded',initialize);
})();