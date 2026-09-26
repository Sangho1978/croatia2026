/* Shared album URL only. Photo uploads stay in the user's album service. */
(function(){
  let album=null,etag=null,allowed=false,epoch=0,busy=false;
  const safeUrl=raw=>{try{const u=new URL(raw);return u.protocol==='https:'&&['photos.app.goo.gl','photos.google.com','drive.google.com'].includes(u.hostname)?u.href:null}catch(_){return null}};
  const esc=s=>Integration.escape(s);
  function render(){
    const box=document.getElementById('photosApp');if(!box)return;
    const link=safeUrl(album?.url||'');
    box.innerHTML=`<div class="album-hero"><small>CROATIA · OUR MEMORIES</small><h3>${esc(album?.title||'함께 남기는 크로아티아')}</h3><p>${link?'공동앨범에서 사진을 올리고 함께 볼 수 있습니다.':'아직 공유앨범이 연결되지 않았습니다.'}</p>${link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">공동앨범 열기 ↗</a>':''}</div><div class="card"><h3>사진은 앨범에서, 안내는 이 앱에서</h3><p class="quiet">사진·동영상은 Google Photos 공유앨범에서 관리합니다. 이 앱은 앨범 바로가기를 공유하며 사진 원본을 Firebase에 올리지 않습니다. 앨범의 공동작업·접근 권한은 사진 서비스에서 설정하세요.</p></div>${Integration.isStaff()?`<div class="finance-panel"><h3>공유앨범 연결 · 운영진</h3><form id="albumForm" class="finance-form"><label class="field">앨범 이름<input id="albumTitle" maxlength="100" value="${esc(album?.title||'크로아티아 공동앨범')}" required /></label><label class="field">공유 링크<input type="url" id="albumUrl" value="${esc(link||'')}" placeholder="https://photos.app.goo.gl/..." required /></label><button class="solid-action" id="albumSave" type="submit" ${allowed?'':'disabled'}>공유 링크 저장</button><p class="quiet">팀장·부팀장·총무의 승인된 기기에서만 변경할 수 있습니다. 일반 원우는 연결된 앨범을 열 수 있습니다.</p><div id="albumFeedback" class="form-feedback" role="status"></div></form></div>`:''}`;
    document.getElementById('albumForm')?.addEventListener('submit',e=>{e.preventDefault();save()});
  }
  async function load(){
    if(!currentUser)return;const my=++epoch,name=currentUser.name;
    allowed=false;
    try{
      const r=await Integration.api('photoAlbums/'+TRIP_CODE+'/shared',{headers:{'X-Firebase-ETag':'true'}});
      if(my!==epoch||currentUser?.name!==name)return;album=r.data;etag=r.etag;
      if(Integration.isStaff()){
        const p=await Integration.api('financeManagers/'+TRIP_CODE+'/'+localStorage.getItem('fb_uid'));
        if(my!==epoch)return;allowed=p.data===name;
      }
      render();
      if(Integration.isStaff()&&!allowed)Integration.feedback(document.getElementById('albumFeedback'),'공동경비 화면에서 기기 ID 승인 상태를 확인하세요.');
    }catch(e){if(my!==epoch)return;render();const panel=document.getElementById('albumFeedback');if(panel)Integration.feedback(panel,e.message,'error');else{const n=document.createElement('p');n.className='form-feedback error';n.textContent='공유앨범 조회 실패 · '+e.message;document.getElementById('photosApp').append(n)}}
  }
  async function save(){
    if(busy)return;
    const feedback=document.getElementById('albumFeedback');
    try{
      if(!Integration.isStaff()||!allowed)throw Error('승인된 운영진만 연결할 수 있습니다.');
      const url=safeUrl(document.getElementById('albumUrl').value.trim()),title=document.getElementById('albumTitle').value.trim();
      if(!url)throw Error('Google Photos 또는 Google Drive의 https 공유 링크를 입력해 주세요.');
      if(!title)throw Error('앨범 이름을 입력해 주세요.');
      busy=true;document.getElementById('albumSave').disabled=true;
      const d={title,url,updatedAt:{'.sv':'timestamp'},updatedBy:localStorage.getItem('fb_uid'),updatedByName:currentUser.name};
      const r=await Integration.api('photoAlbums/'+TRIP_CODE+'/shared',{method:'PUT',headers:{'if-match':etag||'null_etag'},body:JSON.stringify(d)});
      album=r.data;await load();Integration.feedback(document.getElementById('albumFeedback'),'공유앨범 연결을 저장했습니다.','success');
    }catch(e){Integration.feedback(feedback,e.message,'error')}finally{busy=false;const b=document.getElementById('albumSave');if(b)b.disabled=!allowed}
  }
  window.addEventListener('cro-role-ready',()=>{epoch++;album=null;etag=null;allowed=false;document.getElementById('photosApp')?.replaceChildren();});
  window.addEventListener('cro-route',e=>{if(e.detail.view==='photos'){render();load()}});
})();