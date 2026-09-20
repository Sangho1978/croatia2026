/* Lazy receipt OCR for Croatian/Italian/English receipts. OCR runs in-browser; parsed values must be reviewed. */
(function(){
  let loading=null;
  const SCRIPT='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function loadScript(){
    if(window.Tesseract)return Promise.resolve(window.Tesseract);
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=SCRIPT;s.async=true;s.crossOrigin='anonymous';s.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(Error('OCR 모듈을 불러오지 못했습니다.'));s.onerror=()=>reject(Error('OCR 모듈 연결에 실패했습니다. 인터넷 연결을 확인해 주세요.'));document.head.appendChild(s)});
    return loading;
  }
  function normalize(text){return String(text||'').replace(/\r/g,'\n').replace(/[\t ]+/g,' ').replace(/\n{2,}/g,'\n').trim()}
  function isoDate(y,m,d){y=+y;if(y<100)y+=2000;m=+m;d=+d;if(y<2024||y>2030||m<1||m>12||d<1||d>31)return'';return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
  function parseTime(lines){
    for(const line of lines){const m=line.match(/(?:vrijeme|time|ora|heure)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)(?::[0-5]\d)?/i);if(m)return String(m[1]).padStart(2,'0')+':'+m[2]}return '';
  }
  function parseDate(lines){
    const scored=[];
    lines.forEach((line,i)=>{
      const boost=/\b(date|datum|data|vrijeme|time|račun|racun)\b/i.test(line)?10:0;
      let m;
      const r1=/(20\d{2})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(\d{1,2})/g;while((m=r1.exec(line))){const v=isoDate(m[1],m[2],m[3]);if(v)scored.push([boost+5-i*.05,v])}
      const r2=/(\d{1,2})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(20\d{2}|\d{2})/g;while((m=r2.exec(line))){const v=isoDate(m[3],m[2],m[1]);if(v)scored.push([boost+5-i*.05,v])}
    });
    scored.sort((a,b)=>b[0]-a[0]);return scored[0]?.[1]||'';
  }
  function numberFrom(s){
    const x=String(s).replace(/\s/g,'').replace(/[^0-9.,]/g,'');if(!x)return NaN;
    const lastComma=x.lastIndexOf(','),lastDot=x.lastIndexOf('.');let dec='';if(lastComma>lastDot)dec=',';else if(lastDot>=0)dec='.';
    if(dec){const parts=x.split(dec),tail=parts.pop();if(tail.length===2)return Number(parts.join('').replace(/[.,]/g,'')+'.'+tail)}
    return Number(x.replace(/[.,]/g,''));
  }
  function parseAmount(lines){
    const keys=/\b(grand\s*total|total|ukupno|sveukupno|za\s*platiti|iznos|amount|totale|da\s*pagare|eur)\b/i;
    const bad=/\b(vat|pdv|iva|tax|porez|change|cash|card|visa|mastercard)\b/i;
    const scored=[];
    lines.forEach((line,i)=>{
      const nums=line.match(/\d{1,6}(?:[.,]\d{2})/g)||[];
      nums.forEach(n=>{const v=numberFrom(n);if(!Number.isFinite(v)||v<=0||v>1000000)return;let score=(keys.test(line)?18:0)-(bad.test(line)?8:0)+(line.includes('€')||/\bEUR\b/i.test(line)?5:0)+v/100000-i*.01;scored.push([score,v,line])});
    });
    if(!scored.length)return null;scored.sort((a,b)=>b[0]-a[0]);return scored[0][1];
  }
  function parseMerchant(lines){
    const noise=/\b(fiscal|invoice|receipt|račun|racun|r1|oib|pib|vat|pdv|iva|tel|www\.|http|date|datum|time|vrijeme|cash|card|visa|mastercard|total|ukupno)\b/i;
    const candidates=lines.slice(0,12).map((line,i)=>{
      const clean=line.replace(/[|_*#=]+/g,' ').replace(/\s{2,}/g,' ').trim();
      if(clean.length<3||clean.length>70||noise.test(clean)||/^\W*\d[\d\s.,:/-]*$/.test(clean))return null;
      const letters=(clean.match(/[A-Za-zČĆŽŠĐčćžšđÀ-ž]/g)||[]).length;if(letters<3)return null;
      let score=20-i+(clean===clean.toUpperCase()?4:0)-(clean.match(/\d/g)||[]).length*.4;
      return [score,clean];
    }).filter(Boolean).sort((a,b)=>b[0]-a[0]);
    return candidates[0]?.[1]||'';
  }
  function category(text,merchant){
    const s=(merchant+' '+text).toLowerCase();
    if(/konoba|restaurant|restoran|ristorante|trattoria|pizzeria|bistro|caffe|cafe|coffee|bar\b|pekara|bakery|food|meal|lunch|dinner/.test(s))return'식사';
    if(/taxi|uber|bolt|parking|parkir|gorivo|fuel|petrol|benz|diesel|autobus|bus\b|train|rail|toll|cestarina/.test(s))return'교통';
    if(/museum|muzej|ticket|ulaz|entry|entrance|tour|excursion|boat|ferry|funicular/.test(s))return'입장·체험';
    if(/market|shop|store|supermarket|dm\b|muller|pharmacy|ljekarn|souvenir/.test(s))return'공용물품';
    return'기타';
  }
  function purposeFor(cat){return ({'식사':'식사','교통':'교통비','입장·체험':'입장·체험','간식·음료':'간식·음료','공용물품':'공용물품'})[cat]||'공동경비'}
  function parse(text,confidence=0){
    const n=normalize(text),lines=n.split('\n').map(x=>x.trim()).filter(Boolean),merchant=parseMerchant(lines),date=parseDate(lines),time=parseTime(lines),amount=parseAmount(lines);
    const currency=/€|\bEUR\b/i.test(n)?'EUR':(/₩|\bKRW\b/i.test(n)?'KRW':'EUR');const cat=category(n,merchant);
    return {provider:'local',merchant,date,time,amount:Number.isFinite(amount)?amount:null,currency,category:cat,purpose:purposeFor(cat),confidence:Math.round(Number(confidence)||0),rawText:n};
  }
  async function imageForOcr(dataUrl){
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error('영수증 이미지를 읽지 못했습니다.'));i.src=dataUrl});
    const max=2200,ratio=Math.min(1.35,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*ratio));c.height=Math.max(1,Math.round(img.naturalHeight*ratio));const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.filter='grayscale(1) contrast(1.55) brightness(1.04)';x.drawImage(img,0,0,c.width,c.height);x.filter='none';return c.toDataURL('image/jpeg',.94);
  }
  async function recognize(dataUrl,onProgress){
    const T=await loadScript(),image=await imageForOcr(dataUrl);
    let r;try{r=await T.recognize(image,'eng+ita+hrv',{logger:m=>{if(m.status==='recognizing text'&&onProgress)onProgress(Math.max(0,Math.min(100,Math.round((m.progress||0)*100))))}})}catch(_){r=await T.recognize(image,'eng',{logger:m=>{if(m.status==='recognizing text'&&onProgress)onProgress(Math.max(0,Math.min(100,Math.round((m.progress||0)*100))))}})}
    return parse(r?.data?.text||'',r?.data?.confidence||0);
  }
  window.ReceiptOCR={recognize,parse,escape:esc};
})();
