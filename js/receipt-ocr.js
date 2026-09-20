/* MIX15 receipt OCR: persistent worker + auto rotation + dual-pass high contrast OCR.
 * Local OCR is a fallback. AI receipt extraction remains preferred when configured.
 */
(function(){
  'use strict';
  let loading=null, workerPromise=null, progressCb=null;
  const SCRIPT='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const LANGS=['eng','ita','hrv']; // keep download size reasonable; Latin receipts still read Slovenian/German well.
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function loadScript(){
    if(window.Tesseract)return Promise.resolve(window.Tesseract);
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=SCRIPT;s.async=true;s.crossOrigin='anonymous';s.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(Error('OCR 모듈을 불러오지 못했습니다.'));s.onerror=()=>reject(Error('OCR 모듈 연결에 실패했습니다. 인터넷 연결을 확인해 주세요.'));document.head.appendChild(s)});
    return loading;
  }
  async function getWorker(onProgress){
    progressCb=onProgress||null;
    if(workerPromise)return workerPromise;
    workerPromise=(async()=>{
      const T=await loadScript();
      const worker=await T.createWorker(LANGS,1,{logger:m=>{if(m.status==='recognizing text'&&progressCb)progressCb(Math.max(0,Math.min(100,Math.round((m.progress||0)*100))))}});
      await worker.setParameters({preserve_interword_spaces:'1',user_defined_dpi:'300'}).catch(()=>{});
      return worker;
    })().catch(e=>{workerPromise=null;throw e});
    return workerPromise;
  }

  function normalize(text){return String(text||'').replace(/\r/g,'\n').replace(/[\t ]+/g,' ').replace(/\n{2,}/g,'\n').trim()}
  function isoDate(y,m,d){y=+y;if(y<100)y+=2000;m=+m;d=+d;if(y<2024||y>2030||m<1||m>12||d<1||d>31)return'';return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
  function parseTime(lines){
    const scored=[];
    lines.forEach((line,i)=>{let m;const re=/(?:vrijeme|time|ora|heure|cas|čas|uhr)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)(?::([0-5]\d))?/ig;while((m=re.exec(line))){let score=6-i*.01;if(/datum|date|ora|time|vrijeme|cas|čas/i.test(line))score+=5;scored.push([score,String(m[1]).padStart(2,'0')+':'+m[2]])}});
    scored.sort((a,b)=>b[0]-a[0]);return scored[0]?.[1]||'';
  }
  function parseDate(lines){
    const scored=[];
    lines.forEach((line,i)=>{
      const boost=/\b(date|datum|data|vrijeme|time|račun|racun|cas|čas)\b/i.test(line)?12:0;let m;
      const r1=/(20\d{2})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(\d{1,2})/g;while((m=r1.exec(line))){const v=isoDate(m[1],m[2],m[3]);if(v)scored.push([boost+8-i*.03,v])}
      const r2=/(\d{1,2})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(20\d{2}|\d{2})/g;while((m=r2.exec(line))){const v=isoDate(m[3],m[2],m[1]);if(v)scored.push([boost+8-i*.03,v])}
    });
    scored.sort((a,b)=>b[0]-a[0]);return scored[0]?.[1]||'';
  }
  function numberFrom(s){
    let x=String(s).replace(/\s/g,'').replace(/[^0-9.,]/g,'');if(!x)return NaN;
    const lc=x.lastIndexOf(','),ld=x.lastIndexOf('.');const pos=Math.max(lc,ld);
    if(pos>=0){const tail=x.slice(pos+1),head=x.slice(0,pos).replace(/[.,]/g,'');if(tail.length===1||tail.length===2)return Number(head+'.'+tail)}
    return Number(x.replace(/[.,]/g,''));
  }
  const FINAL_LABELS=[
    [/\bimporto\s+pagato\b/i,90],[/\bza\s*pla[čc]ilo\b/i,90],[/\bznesek\s*(?:za\s*)?pla[čc]il/i,88],[/\bgrand\s*total\b/i,88],
    [/\btotal(?:e)?\s+complessivo\b/i,85],[/\bsveukupno\b/i,84],[/\bukupno\b/i,82],[/\bskupaj\b/i,80],[/\bsum\b/i,78],
    [/\bamount\s*(?:due|paid)\b/i,84],[/\btotal\s*(?:due|paid)?\b/i,70],[/\bpagamento\s+elettronico\b/i,55]
  ];
  function lineLabelScore(s){
    if(/\bsub\s*total\b|\bsubtotal\b/i.test(s))return-80;
    let v=0;for(const [re,score] of FINAL_LABELS)if(re.test(s))v=Math.max(v,score);
    if(/\b(?:iva|vat|pdv|ddv|tax|porez|popust|discount|change|resto|cash)\b/i.test(s)&&v<80)v-=25;
    return v;
  }
  function parseAmount(lines){
    const scored=[];
    lines.forEach((line,i)=>{
      const context=((lines[i-2]||'')+' '+(lines[i-1]||'')+' '+line).trim();
      const label=Math.max(lineLabelScore(line),lineLabelScore(context)-8);
      const nums=[...(line.matchAll(/(?<!\d)(\d{1,6}(?:[.,]\d{1,2}))(?!\d)/g))];
      nums.forEach((m,idx)=>{const v=numberFrom(m[1]);if(!Number.isFinite(v)||v<=0||v>1000000)return;let score=label+(idx===nums.length-1?5:0)+(line.includes('€')||/\bEUR\b/i.test(line)?8:0)-i*.015;scored.push([score,v,line])});
    });
    if(!scored.length)return null;scored.sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
    // Never allow an obvious subtotal to beat a final-payment line.
    const strong=scored.find(x=>x[0]>=65);return (strong||scored[0])[1];
  }
  function parseMerchant(lines,text){
    const n=text.toUpperCase(),compact=n.replace(/[^A-Z0-9]/g,'');
    if(/EURO.{0,40}SPIN/i.test(n)||compact.includes('EUROSPIN')||compact.includes('OUROSPIN'))return'Eurospin';
    if(/\bMERCATOR\b/.test(n))return'Mercator';
    if(/ZAVOD\s+ZA\s+KULTURO\s+BLED/i.test(text))return'Zavod za kulturo Bled';
    if(/GASTHAUS\s+CAMPING/i.test(text)){const z=/ZUM\s+SEE/i.test(text)?' Zum See':'';return'Gasthaus Camping'+z}
    if(/CAMPING|CAKP\s*ING|PING\s+K/i.test(text)||compact.includes('CAKPING')){if(/KLAUSNER|HOELL|HOETT|H[OÖ]LL/i.test(text))return'Camping Klausner Höll';const a=(text.match(/(?:CAMPING|CAKP\s*ING)[^\n]{0,30}/i)?.[0]||'Camping').trim();return a.replace(/\s{2,}/g,' ')}
    const noise=/\b(fiscal|invoice|receipt|račun|racun|r1|oib|pib|vat|pdv|iva|tel|www\.|http|date|datum|time|vrijeme|cash|card|visa|mastercard|total|subtotal|ukupno|documento|descrizione|prezzo)\b/i;
    const candidates=[];
    for(let i=0;i<Math.min(lines.length,18);i++){
      const clean=lines[i].replace(/[|_*#=]+/g,' ').replace(/\s{2,}/g,' ').trim();if(clean.length<3||clean.length>80||noise.test(clean)||/^\W*\d[\d\s.,:/-]*$/.test(clean))continue;
      const letters=(clean.match(/[A-Za-zČĆŽŠĐčćžšđÀ-ž]/g)||[]).length;if(letters<3)continue;let score=30-i+(clean===clean.toUpperCase()?5:0)-(clean.match(/\d/g)||[]).length*.5;candidates.push([score,clean]);
      if(i+1<lines.length){const joined=(clean+' '+lines[i+1]).replace(/\s+/g,' ').trim();if(joined.length<90&&!noise.test(joined)){const l=(joined.match(/[A-Za-zÀ-ž]/g)||[]).length;if(l>=6)candidates.push([score+2,joined])}}
    }
    candidates.sort((a,b)=>b[0]-a[0]);return candidates[0]?.[1]||'';
  }
  function category(text,merchant){const s=(merchant+' '+text).toLowerCase();if(/konoba|restaurant|restoran|ristorante|trattoria|pizzeria|bistro|caffe|cafe|coffee|bar\b|pekara|bakery|food|meal|lunch|dinner/.test(s))return'식사';if(/taxi|uber|bolt|parking|parkir|gorivo|fuel|petrol|benz|diesel|autobus|bus\b|train|rail|toll|cestarina/.test(s))return'교통';if(/museum|muzej|ticket|vstopnica|ulaz|entry|entrance|tour|excursion|boat|ferry|funicular|zavod za kulturo/.test(s))return'입장·체험';if(/market|shop|store|supermarket|mercator|eurospin|dm\b|muller|pharmacy|ljekarn|souvenir/.test(s))return'공용물품';if(/camping|gasthaus|hotel/.test(s))return'기타';return'기타'}
  function purposeFor(cat,merchant){if(cat==='식사')return'식사';if(cat==='교통')return'교통비';if(cat==='입장·체험')return'입장·체험';if(cat==='간식·음료')return'간식·음료';if(cat==='공용물품')return'공용물품';return merchant?merchant+' 공동경비':'공동경비'}
  function parse(text,confidence=0,meta={}){
    const n=normalize(text),lines=n.split('\n').map(x=>x.trim()).filter(Boolean),merchant=parseMerchant(lines,n),date=parseDate(lines),time=parseTime(lines),amount=parseAmount(lines);const currency=/€|\bEUR\b/i.test(n)?'EUR':(/₩|\bKRW\b/i.test(n)?'KRW':'EUR');const cat=category(n,merchant);
    return {provider:'local',merchant,date,time,amount:Number.isFinite(amount)?amount:null,currency,category:cat,purpose:purposeFor(cat,merchant),confidence:Math.round(Number(confidence)||0),rawText:n,rotation:meta.rotation||0,passes:meta.passes||1};
  }
  function quality(r,text){let s=0;if(r.amount!=null)s+=35;if(r.date)s+=28;if(r.merchant)s+=20;if(r.time)s+=5;if(/\b(total|totale|ukupno|skupaj|sum|pagato|pla[čc]ilo|eur)\b/i.test(text||''))s+=8;if((text||'').length>120)s+=4;return Math.min(100,s)}

  function imageObj(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error('영수증 이미지를 읽지 못했습니다.'));i.src=src})}
  async function prepareFile(file){
    if(!file)return'';let img,release=()=>{};try{img=await createImageBitmap(file,{imageOrientation:'from-image'});release=()=>img.close()}catch(_){const u=URL.createObjectURL(file);img=await imageObj(u);release=()=>URL.revokeObjectURL(u)}
    try{const max=3200,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.94)}finally{release()}
  }
  function percentile(hist,total,p){let target=total*p,acc=0;for(let i=0;i<256;i++){acc+=hist[i];if(acc>=target)return i}return 255}
  async function renderVariant(src,rotation=0,mode='gray'){
    const img=await imageObj(src);const rad=(rotation%360)*Math.PI/180,swap=Math.abs(rotation%180)===90;const iw=img.naturalWidth,ih=img.naturalHeight;const rw=swap?ih:iw,rh=swap?iw:ih;const cap=mode==='bw'?2000:2600;let scale=Math.min(cap/Math.max(rw,rh),Math.max(1,2200/Math.max(rw,rh)));scale=Math.min(scale,1.8);const w=Math.max(1,Math.round(rw*scale)),h=Math.max(1,Math.round(rh*scale));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.save();x.translate(w/2,h/2);x.rotate(rad);x.drawImage(img,-iw*scale/2,-ih*scale/2,iw*scale,ih*scale);x.restore();const d=x.getImageData(0,0,w,h),px=d.data,hist=new Uint32Array(256),gray=new Uint8Array(w*h);for(let i=0,j=0;i<px.length;i+=4,j++){const g=Math.max(0,Math.min(255,Math.round(.299*px[i]+.587*px[i+1]+.114*px[i+2])));gray[j]=g;hist[g]++}const low=percentile(hist,gray.length,.02),high=Math.max(low+25,percentile(hist,gray.length,.985));for(let j=0,i=0;j<gray.length;j++,i+=4){let g=Math.max(0,Math.min(255,(gray[j]-low)*255/(high-low)));g=(g-128)*1.22+128;g=Math.max(0,Math.min(255,g));gray[j]=g;px[i]=px[i+1]=px[i+2]=g;px[i+3]=255}
    if(mode==='bw'){
      // Integral-image adaptive threshold. Handles wrinkled/faint thermal receipts much better than one global threshold.
      const integral=new Uint32Array((w+1)*(h+1));for(let yy=1;yy<=h;yy++){let row=0;const base=yy*(w+1),prev=(yy-1)*(w+1);for(let xx=1;xx<=w;xx++){row+=gray[(yy-1)*w+xx-1];integral[base+xx]=integral[prev+xx]+row}}
      const r=15,offset=9;for(let yy=0,j=0,i=0;yy<h;yy++){const y0=Math.max(0,yy-r),y1=Math.min(h-1,yy+r);for(let xx=0;xx<w;xx++,j++,i+=4){const x0=Math.max(0,xx-r),x1=Math.min(w-1,xx+r),A=y0*(w+1)+x0,B=y0*(w+1)+x1+1,C=(y1+1)*(w+1)+x0,D=(y1+1)*(w+1)+x1+1,area=(x1-x0+1)*(y1-y0+1),mean=(integral[D]-integral[B]-integral[C]+integral[A])/area,v=gray[j]<mean-offset?0:255;px[i]=px[i+1]=px[i+2]=v}}
    }
    x.putImageData(d,0,0);return {url:c.toDataURL(mode==='bw'?'image/png':'image/jpeg',mode==='bw'?undefined:.96),width:w,height:h,rotation};
  }
  async function ocr(worker,image,psm,onProgress,stage){progressCb=p=>onProgress&&onProgress(p,stage);await worker.setParameters({tessedit_pageseg_mode:String(psm),preserve_interword_spaces:'1'});const r=await worker.recognize(image.url);return {text:r?.data?.text||'',confidence:r?.data?.confidence||0}}
  function mergeResult(a,b){const text=[a?.rawText,b?.rawText].filter(Boolean).join('\n');const conf=Math.max(a?.confidence||0,b?.confidence||0);const r=parse(text,conf,{rotation:a?.rotation??b?.rotation??0,passes:(a?.passes||0)+(b?.passes||0)});if(b?.amount!=null&&(a?.amount==null||Math.abs(b.amount-a.amount)/Math.max(1,b.amount,a.amount)<.05))r.amount=b.amount;else if(r.amount==null)r.amount=a?.amount??b?.amount??null;if(!r.date)r.date=a?.date||b?.date||'';if(!r.time)r.time=a?.time||b?.time||'';if(!r.merchant)r.merchant=a?.merchant||b?.merchant||'';return r}
  async function recognize(dataUrl,onProgress){
    const worker=await getWorker(p=>onProgress&&onProgress(p,'load'));const rotations=[0,270,90,180];let best=null,bestImage=null,attempt=0;
    for(const rotation of rotations){attempt++;const image=await renderVariant(dataUrl,rotation,'gray');const raw=await ocr(worker,image,6,(p)=>onProgress&&onProgress(Math.round(((attempt-1)+p/100)/Math.min(3,rotations.length)*70),`방향 ${rotation}°`),'orientation');const r=parse(raw.text,raw.confidence,{rotation,passes:1});const q=quality(r,raw.text);if(!best||q>best.q){best={...r,q};bestImage=image}if(q>=86)break;if(attempt>=3&&q>=70)break}
    if(!bestImage)throw Error('영수증 방향을 확인하지 못했습니다.');
    // Second pass: adaptive high-contrast + sparse text. This fixes faint thermal receipts and final amount lines.
    const bw=await renderVariant(dataUrl,best.rotation,'bw');const raw2=await ocr(worker,bw,11,p=>onProgress&&onProgress(70+Math.round(p*.3),'고대비 재판독'),'refine');const r2=parse(raw2.text,raw2.confidence,{rotation:best.rotation,passes:1});let merged=mergeResult(best,r2);merged.rotation=best.rotation;merged.passes=2;
    // If date is still missing, scan the lower-left footer where receipt date/time is frequently printed.
    if(!merged.date){try{await worker.setParameters({tessedit_pageseg_mode:'6'});const rect={left:Math.round(bw.width*.02),top:Math.round(bw.height*.60),width:Math.round(bw.width*.76),height:Math.round(bw.height*.30)};const rr=await worker.recognize(bw.url,{rectangle:rect});const footer=parse(rr?.data?.text||'',rr?.data?.confidence||0,{rotation:best.rotation,passes:1});merged=mergeResult(merged,footer);merged.rotation=best.rotation;merged.passes=3}catch(_){}}
    merged.quality=quality(merged,merged.rawText);return merged;
  }
  window.ReceiptOCR={recognize,parse,prepareFile,renderVariant,quality,escape:esc};
})();
