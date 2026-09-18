/* MIX03. Receipt images only: re-encode on-device, strip EXIF, max 3 x 300 KiB.
 * Images live under expenseReceipts, NOT under the frequently loaded expense list.
 * Same Realtime Database/financeManagers authorization; no Firebase Storage needed.
 */
(function(){
  'use strict';
  const LIMIT=300*1024,MAX=3;
  let dbPromise;
  const id=()=> 'rb_'+(crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):Date.now()+'_'+Math.random().toString(36).slice(2));
  const esc=s=>Integration.escape(s);
  function openDraftDB(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open('croatia-receipt-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbPromise}
  async function draft(op,key,value){const db=await openDraftDB();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts',op==='get'?'readonly':'readwrite'),store=tx.objectStore('drafts');const r=op==='get'?store.get(key):op==='put'?store.put(value,key):store.delete(key);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
  function toBlob(canvas,q){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('\uc0ac\uc9c4 \ubcc0\ud658 \uc2e4\ud328')),'image/jpeg',q))}
  function dataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
  async function compress(file){
    if(!/^image\/(jpeg|png|webp|avif)$/i.test(file.type))throw Error('\uc0ac\uc9c4\ub294 JPG/PNG/WebP/AVIF\ub97c \uc0ac\uc6a9\ud574 \uc8fc\uc138\uc694. HEIC\ub294 JPG\ub85c \ubcc0\ud658 \ud6c4 \uc120\ud0dd\ud558\uc138\uc694.');
    if(file.size>15*1024*1024)throw Error('\uc6d0\ubcf8 \uc0ac\uc9c4\ub294 \uc7a5\ub2f9 15MB \uc774\ud558\ub9cc \ucc98\ub9ac\ud569\ub2c8\ub2e4.');
    let image,release=()=>{};
    try{image=await createImageBitmap(file,{imageOrientation:'from-image'});release=()=>image.close()}catch(_){const url=URL.createObjectURL(file);try{image=await new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>rej(Error('\uc0ac\uc9c4 \uc77d\uae30 \uc2e4\ud328'));img.src=url});release=()=>URL.revokeObjectURL(url)}catch(e){URL.revokeObjectURL(url);throw e}}
    try{
      const iw=image.width,ih=image.height;if(iw*ih>48000000||!iw||!ih)throw Error('\uc0ac\uc9c4 \ud06c\uae30\uac00 \ub108\ubb34 \ud07d\ub2c8\ub2e4. \ud574\uc0c1\ub3c4\ub97c \uc904\uc5ec \ub2e4\uc2dc \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.');
      const canvas=document.createElement('canvas');let edge=2400,b;
      for(let step=0;step<5;step++){
        const ratio=Math.min(1,edge/Math.max(iw,ih));canvas.width=Math.round(iw*ratio);canvas.height=Math.round(ih*ratio);
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
        for(const quality of [.84,.72,.6]){b=await toBlob(canvas,quality);if(b.size<=LIMIT)break}
        if(b.size<=LIMIT)break;edge=Math.round(edge*.8);
      }
      if(!b||b.size>LIMIT)throw Error('\uc555\ucd95 \ud6c4\uc5d0\ub3c4 300KB\ub97c \ucd08\uacfc\ud569\ub2c8\ub2e4. \uc601\uc218\uc99d \ubd80\ubd84\ub9cc \uc798\ub77c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.');
      return {fileName:(file.name||'receipt').replace(/\.[^.]+$/,'').slice(0,90)+'.jpg',mime:'image/jpeg',bytes:b.size,width:canvas.width,height:canvas.height,dataUrl:await dataURL(b)};
    }finally{release()}
  }
  async function upload(entryId,items,batchId){
    if(!Integration.isStaff()||!currentUser)throw Error('\uc6b4\uc601\uc9c4\ub9cc \uc601\uc218\uc99d\uc744 \uc800\uc7a5\ud569\ub2c8\ub2e4.');
    if(items.length>MAX)throw Error('\uacbd\ube44 \ud55c \uac74\ub2f9 \uc0ac\uc9c4 3\uc7a5\uae4c\uc9c0 \uc800\uc7a5\ud569\ub2c8\ub2e4.');
    const user=currentUser.name;await token();const uid=localStorage.getItem('fb_uid'),batch=batchId||id();
    for(let i=0;i<items.length;i++){
      if(currentUser?.name!==user)throw Error('\uc0ac\uc6a9\uc790\uac00 \ubcc0\uacbd\ub418\uc5b4 \uc800\uc7a5\uc744 \uc911\uc9c0\ud588\uc2b5\ub2c8\ub2e4.');
      const photo=items[i];if(photo.bytes>LIMIT||!photo.dataUrl.startsWith('data:image/jpeg;base64,'))throw Error('\uc601\uc218\uc99d \uc555\ucd95\uc815\ubcf4\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.');
      await Integration.api('expenseReceipts/'+TRIP_CODE+'/'+entryId+'/'+batch+'/r'+(i+1),{method:'PUT',body:JSON.stringify({...photo,uid,uploadedBy:user,uploadedAt:{'.sv':'timestamp'}})});
    }
    return items.length?{batchId:batch,count:items.length,bytes:items.reduce((n,x)=>n+x.bytes,0)}:null;
  }
  async function read(entryId,summary){
    if(!Integration.isStaff())throw Error('\uc6b4\uc601\uc9c4\ub9cc \uc601\uc218\uc99d\uc744 \uc870\ud68c\ud569\ub2c8\ub2e4.');if(!summary?.batchId)return [];
    const r=await Integration.api('expenseReceipts/'+TRIP_CODE+'/'+entryId+'/'+summary.batchId);
    return Object.entries(r.data||{}).sort(([a],[b])=>a.localeCompare(b)).map(([,x])=>x).filter(x=>x?.mime==='image/jpeg'&&typeof x.dataUrl==='string'&&x.dataUrl.startsWith('data:image/jpeg;base64,'));
  }
  function gallery(items){return items.map((r,i)=>`<figure class="receipt-thumb"><a href="${esc(r.dataUrl)}" download="receipt-${i+1}.jpg"><img alt="\uc601\uc218\uc99d ${i+1}" src="${esc(r.dataUrl)}" loading="lazy"></a><figcaption>${esc(r.fileName)} \u00b7 ${Math.ceil(r.bytes/1024)} KB<br>\uc0ac\uc9c4\ub97c \ub204\ub974\uba74 \uc555\ucd95 \uc800\uc7a5\ubcf8 \ubc1b\uae30</figcaption></figure>`).join('')}
  window.ReceiptStore={MAX,LIMIT,compress,upload,read,gallery,newBatch:id,saveDraft:(name,v)=>draft('put',name,v),loadDraft:name=>draft('get',name),removeDraft:name=>draft('delete',name)};
})();
