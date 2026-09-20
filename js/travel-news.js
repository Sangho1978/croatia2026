/* MIX22 · live travel news / disaster watch
 * Free client-side implementation: GDELT DOC 2.0 (news search) + MyMemory (headline translation).
 * Refreshes while the app is open, and refreshes on next open when the 1-hour cache is stale.
 */
(function(){
  'use strict';
  const REFRESH_MS=60*60*1000;
  const MAX_AGE_MS=7*24*60*60*1000;
  const URGENT_AGE_MS=72*60*60*1000;
  const CACHE_KEY='cro.travelNews.cache.v2';
  const TRANS_KEY='cro.travelNews.translation.v2';
  const DISMISS_KEY='cro.travelNews.dismissed.v2';
  const GDELT='https://api.gdeltproject.org/api/v2/doc/doc';
  const TRANSLATE='https://api.mymemory.translated.net/get';
  let items=[],activeFilter='important',timer=0,fetching=false,lastUpdated=0,lastError='';

  const SOURCES={
    'hina.hr':{label:'HINA · 크로아티아 통신',kind:'local'},
    'glashrvatske.hrt.hr':{label:'HRT · 크로아티아 공영방송',kind:'local'},
    'reuters.com':{label:'Reuters',kind:'wire'},
    'apnews.com':{label:'AP',kind:'wire'},
    'ansa.it':{label:'ANSA · 이탈리아 통신',kind:'local'},
    'croatiaweek.com':{label:'Croatia Week · 현지 영문매체',kind:'local'},
    'bbc.com':{label:'BBC',kind:'wire'},
    'euronews.com':{label:'Euronews',kind:'wire'}
  };
  const OFFICIAL=[
    {country:'🇭🇷 크로아티아',name:'DHMZ 기상특보',note:'폭우·강풍·뇌우·고온 경보',url:'https://meteo.hr/naslovnica-upozorenja.php?lang=en&tab=upozorenja'},
    {country:'🇭🇷 크로아티아',name:'HAK 도로·교통',note:'A1·DC8·국경·페리 실시간',url:'https://www.hak.hr/en'},
    {country:'🇭🇷 크로아티아',name:'Civil Protection',note:'재난·대피·112 공식 안내',url:'https://civilna-zastita.gov.hr/en'},
    {country:'🇮🇹 이탈리아',name:'Protezione Civile',note:'기상·홍수·지진 등 국가 경보',url:'https://www.protezionecivile.gov.it/en/'},
    {country:'🇮🇹 이탈리아',name:'교통파업 공식 일정',note:'항공·철도·대중교통 파업',url:'https://scioperi.mit.gov.it/mit2/public/scioperi'},
    {country:'🇮🇹 로마 FCO',name:'Fiumicino 실시간 항공편',note:'출도착·지연·취소 확인',url:'https://www.adr.it/en/web/aeroporti-di-roma-en/pax-fco-realtime-flight'}
  ];
  const QUERIES=[
    {
      bucket:'croatia',country:'크로아티아',
      q:'sourcelang:english (domain:hina.hr OR domain:glashrvatske.hrt.hr OR domain:reuters.com OR domain:apnews.com OR domain:bbc.com OR domain:euronews.com OR domain:croatiaweek.com) (Croatia OR Dubrovnik OR Split OR Trogir OR Zadar OR Zagreb OR Plitvice OR Dalmatia) (travel OR tourism OR wildfire OR fire OR flood OR earthquake OR storm OR weather OR alert OR traffic OR road OR airport OR flight OR ferry OR strike OR closure OR accident OR evacuation OR heatwave OR landslide)'
    },
    {
      bucket:'italy',country:'로마·이탈리아',
      q:'sourcelang:english (domain:ansa.it OR domain:reuters.com OR domain:apnews.com OR domain:bbc.com OR domain:euronews.com) (Italy OR Rome OR Roma OR Lazio OR Fiumicino) (travel OR tourism OR wildfire OR fire OR flood OR earthquake OR storm OR weather OR alert OR traffic OR road OR airport OR flight OR train OR transport OR strike OR closure OR accident OR evacuation OR heatwave OR landslide)'
    }
  ];
  const criticalWords=[
    ['evacuat',4,'대피'],['wildfire',4,'산불'],['forest fire',4,'산불'],['earthquake',4,'지진'],['flash flood',4,'급류·홍수'],['flood',3,'홍수'],['red alert',4,'적색경보'],['airport closed',5,'공항폐쇄'],['airport closure',5,'공항폐쇄'],['closed airport',5,'공항폐쇄'],['cancelled',3,'취소'],['canceled',3,'취소'],['strike',3,'파업'],['severe storm',4,'강한 폭풍'],['storm',2,'폭풍'],['landslide',4,'산사태'],['emergency',3,'비상상황'],['explosion',5,'폭발'],['shooting',5,'총격'],['terror',5,'테러'],['heatwave',2,'폭염'],['road closed',3,'도로통제'],['road closure',3,'도로통제'],['ferry suspended',3,'페리중단'],['flight disruption',3,'항공차질'],['delay',1,'지연'],['traffic',1,'교통'],['accident',2,'사고'],['protest',2,'시위']
  ];
  const PLACE_MAP={dubrovnik:'두브로브니크',split:'스플리트',trogir:'트로기르',zadar:'자다르',plitvice:'플리트비체',zagreb:'자그레브',rome:'로마',roma:'로마',fiumicino:'FCO',lazio:'라치오',dalmatia:'달마티아'};
  const destinationWords=Object.keys(PLACE_MAP);

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function idOf(s){let h=2166136261;for(const ch of String(s).slice(0,600)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return 'n'+(h>>>0).toString(36)}
  function domainOf(url,domain){
    if(domain)return String(domain).replace(/^www\./,'').toLowerCase();
    try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return ''}
  }
  function parseDate(v){
    if(!v)return 0;
    if(/^\d{14}$/.test(v))return Date.UTC(+v.slice(0,4),+v.slice(4,6)-1,+v.slice(6,8),+v.slice(8,10),+v.slice(10,12),+v.slice(12,14));
    const d=Date.parse(v);return Number.isFinite(d)?d:0;
  }
  function fmtDate(ts,country){
    if(!ts)return '날짜 미상';
    const zone=country==='크로아티아'?'Europe/Zagreb':'Europe/Rome';
    try{return new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(ts))}
    catch(_){return new Date(ts).toLocaleString('ko-KR')}
  }
  function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch(_){return fallback}}
  function writeJSON(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch(_){}}
  function classify(a){
    const s=(a.title+' '+a.url).toLowerCase();let score=0,tags=[];
    criticalWords.forEach(([w,n,label])=>{if(s.includes(w)){score+=n;if(!tags.includes(label))tags.push(label)}});
    const places=[];destinationWords.forEach(w=>{if(s.includes(w)&&!places.includes(PLACE_MAP[w]))places.push(PLACE_MAP[w])});if(places.length)score+=2;
    if(/airport|flight|train|transport|road|traffic|ferry/.test(s)){score+=1;if(!tags.includes('교통'))tags.push('교통')}
    if(/travel|tourism|tourist/.test(s)){score+=1;if(!tags.includes('여행'))tags.push('여행')}
    const age=Date.now()-(a.ts||0);if(age<24*60*60*1000)score+=2;else if(age<72*60*60*1000)score+=1;
    const level=score>=7?'urgent':score>=4?'watch':'info';
    return {score,level,tags:tags.slice(0,3),places:places.slice(0,3)};
  }
  function normalize(raw,bucket,country){
    const title=String(raw.title||'').trim();const url=String(raw.url||raw.url_mobile||'').trim();if(!title||!url)return null;
    const domain=domainOf(url,raw.domain);const ts=parseDate(raw.seendate||raw.date||raw.pubDate);
    const a={id:idOf(url||title),title,titleKo:'',translationTried:false,url,domain,source:(SOURCES[domain]?.label||domain||'출처 미상'),bucket,country,ts,language:String(raw.language||'English')};
    Object.assign(a,classify(a));return a;
  }
  async function fetchJSON(url,timeout=14000){
    const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);
    try{const r=await fetch(url,{cache:'no-store',signal:c.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}
  }
  function gdeltURL(q){const u=new URL(GDELT);u.searchParams.set('query',q);u.searchParams.set('mode','artlist');u.searchParams.set('maxrecords','30');u.searchParams.set('timespan','7d');u.searchParams.set('sort','datedesc');u.searchParams.set('format','json');return u.toString()}
  async function fetchBucket(cfg){
    const j=await fetchJSON(gdeltURL(cfg.q));const arr=Array.isArray(j?.articles)?j.articles:Array.isArray(j)?j:[];
    return arr.map(x=>normalize(x,cfg.bucket,cfg.country)).filter(Boolean);
  }
  function dedupe(list){
    const seen=new Set(),perBucket={croatia:0,italy:0};return list.filter(a=>{const k=(a.url||a.title).replace(/[?#].*$/,'').toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).filter(a=>!a.ts||Date.now()-a.ts<MAX_AGE_MS).sort((a,b)=>(b.ts||0)-(a.ts||0)).filter(a=>{const b=a.bucket||'other';if((perBucket[b]||0)>=12)return false;perBucket[b]=(perBucket[b]||0)+1;return true});
  }
  function translationCache(){const c=readJSON(TRANS_KEY,{});const cutoff=Date.now()-14*24*60*60*1000;Object.keys(c).forEach(k=>{if(!c[k]||c[k].at<cutoff)delete c[k]});return c}
  function koEnough(s){return /[가-힣]/.test(s||'')}
  async function translateOne(a,cache){
    const k=a.url||a.title;if(cache[k]?.text){a.titleKo=cache[k].text;a.translationTried=true;return}
    if(koEnough(a.title)){a.titleKo=a.title;a.translationTried=true;cache[k]={text:a.title,at:Date.now()};return}
    try{
      const q=a.title.slice(0,480);const u=TRANSLATE+'?q='+encodeURIComponent(q)+'&langpair=en%7Cko&mt=1';const j=await fetchJSON(u,10000);const tx=String(j?.responseData?.translatedText||'').trim();
      if(tx&&tx.toLowerCase()!==q.toLowerCase()){a.titleKo=tx;cache[k]={text:tx,at:Date.now()}}
    }catch(_){/* original title remains available */}
    finally{a.translationTried=true}
  }
  async function translateVisible(list){
    const cache=translationCache();let n=0;
    for(const a of list){
      if(n>=12)break;
      if(!a.titleKo){await translateOne(a,cache);n++;renderList();renderStartupAlert(false)}
    }
    writeJSON(TRANS_KEY,cache);
  }
  function cachedLoad(){
    const c=readJSON(CACHE_KEY,null);if(!c||!Array.isArray(c.items))return false;
    items=c.items.map(a=>({...a,translationTried:Boolean(a.translationTried||a.titleKo)}));lastUpdated=+c.at||0;lastError='';return true;
  }
  function cachedSave(){writeJSON(CACHE_KEY,{at:lastUpdated,items})}
  function filtered(){
    const list=items.slice();
    if(activeFilter==='all')return list;
    if(activeFilter==='croatia')return list.filter(a=>a.bucket==='croatia');
    if(activeFilter==='italy')return list.filter(a=>a.bucket==='italy');
    if(activeFilter==='transport')return list.filter(a=>/교통|파업|공항|도로통제|페리중단|항공차질|지연/.test(a.tags.join(' '))||/airport|flight|train|transport|road|traffic|ferry|strike/i.test(a.title));
    if(activeFilter==='disaster')return list.filter(a=>/산불|지진|홍수|폭풍|산사태|비상상황|폭발|총격|테러|폭염/.test(a.tags.join(' ')));
    return list.filter(a=>a.level!=='info');
  }
  function sourceBadge(a){const s=SOURCES[a.domain];return s?.kind==='wire'?'국제통신':s?.kind==='local'?'현지주요':'뉴스'}
  function impactText(a){
    const t=a.tags;
    if(t.includes('산불'))return '산불·연기·도로통제 가능성을 확인하세요. 방문도시와 이동도로 영향 여부를 공식 경보에서 재확인하세요.';
    if(t.includes('홍수')||t.includes('폭풍')||t.includes('산사태'))return '폭우·강풍·침수·도로통제 가능성이 있습니다. 야외 일정과 이동시간을 보수적으로 잡으세요.';
    if(t.includes('지진'))return '지진 관련 보도입니다. 현지 당국의 피해·교통통제 공지를 먼저 확인하세요.';
    if(t.includes('파업'))return '교통 파업은 항공·철도·대중교통 지연/취소로 이어질 수 있습니다. 공식 운항정보를 당일 다시 확인하세요.';
    if(t.includes('공항폐쇄')||t.includes('항공차질')||t.includes('취소'))return '항공편 영향 가능성이 있습니다. FCO/항공사 출도착 정보를 즉시 확인하세요.';
    if(t.includes('도로통제')||t.includes('교통'))return '육로 이동에 영향을 줄 수 있습니다. 크로아티아에서는 HAK, 이탈리아에서는 현지 교통 공지를 확인하세요.';
    return '여행 일정과 관련될 수 있는 기사입니다. 제목만으로 단정하지 말고 원문과 공식 공지를 함께 확인하세요.';
  }
  function translateArticleLink(a){return 'https://translate.google.com/translate?sl=auto&tl=ko&u='+encodeURIComponent(a.url)}
  function renderList(){
    const root=document.getElementById('travelNewsList');if(!root)return;
    const list=filtered();const status=document.getElementById('travelNewsStatus');
    if(status){const when=lastUpdated?fmtDate(lastUpdated,'크로아티아'):'아직 없음';status.textContent=fetching?'최신 뉴스를 확인하는 중…':lastError?('실시간 조회 실패 · 저장된 뉴스 표시 · '+lastError):('최근 갱신 '+when+' · 1시간 캐시');}
    document.querySelectorAll('[data-news-filter]').forEach(b=>{const on=b.dataset.newsFilter===activeFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    const count=document.getElementById('travelNewsCount');if(count)count.textContent=items.length+'건';
    if(!list.length){root.innerHTML=`<div class="news-empty"><b>${fetching?'뉴스를 확인하고 있습니다.':'조건에 맞는 최신 기사가 없습니다.'}</b><span>${lastError?'네트워크 연결 후 새로고침해 주세요.':'필터를 바꾸거나 새로고침해 주세요.'}</span></div>`;return}
    root.innerHTML=list.slice(0,24).map(a=>{
      const ko=a.titleKo||'';const level=a.level==='urgent'?'긴급 확인':a.level==='watch'?'여행 주의':'참고';const koHeading=ko?esc(ko):(a.translationTried?'<span class="news-translate-failed">한국어 자동번역을 불러오지 못했습니다.</span>':'<span class="news-translating">한국어 번역 중…</span>');
      return `<article class="travel-news-card is-${a.level}">
        <div class="travel-news-meta"><span class="news-level">${level}</span><span>${esc(a.country)}</span>${(a.places||[]).map(x=>`<span>📍 ${esc(x)}</span>`).join('')}<span>${esc(sourceBadge(a))}</span></div>
        <h3>${koHeading}</h3>
        <p class="news-original">${esc(a.title)}</p>
        <div class="news-byline"><b>${esc(a.source)}</b><span>${esc(fmtDate(a.ts,a.country))}</span></div>
        ${a.tags.length?`<div class="news-tags">${a.tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
        <p class="news-impact"><b>여행 영향 자동분류</b>${esc(impactText(a))}</p>
        <div class="news-actions"><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">원문보기 ↗</a><a class="secondary" href="${esc(translateArticleLink(a))}" target="_blank" rel="noopener noreferrer">번역해서 보기 ↗</a></div>
      </article>`
    }).join('');
  }
  function officialRender(){
    const root=document.getElementById('officialTravelSources');if(!root)return;
    root.innerHTML=OFFICIAL.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(x.country)}</span><b>${esc(x.name)}</b><small>${esc(x.note)}</small></a>`).join('');
  }
  function importantItems(){return items.filter(a=>a.level==='urgent'&&(a.ts?Date.now()-a.ts<URGENT_AGE_MS:true)).slice(0,4)}
  function renderTodayBanner(){
    const host=document.getElementById('todayNewsAlert');if(!host)return;const list=importantItems();
    if(!list.length){host.hidden=true;host.innerHTML='';return}
    host.hidden=false;host.innerHTML=`<button type="button" data-route="news" data-sub="important"><span>⚠ 여행 중요뉴스 ${list.length}건</span><b>${esc(list[0].titleKo||list[0].title)}</b><small>누르면 최신 기사와 공식 경보를 확인합니다.</small></button>`;
  }
  function dismissed(){return readJSON(DISMISS_KEY,{})}
  function renderStartupAlert(allowOpen=true){
    renderTodayBanner();const list=importantItems();if(!list.length||!currentUser)return;
    const modal=document.getElementById('travelNewsModal');if(!modal)return;
    const d=dismissed();const unseen=list.filter(a=>!d[a.url]||Date.now()-d[a.url]>12*60*60*1000);if(!unseen.length)return;
    const box=document.getElementById('travelNewsModalItems');if(box)box.innerHTML=unseen.map(a=>`<article><span>${esc(a.country)}${(a.places||[]).length?' · '+esc(a.places.join(' · ')):''} · ${esc(a.source)}</span><b>${esc(a.titleKo||a.title)}</b><small>${esc(fmtDate(a.ts,a.country))} · ${esc(a.tags.join(' · '))}</small></article>`).join('');
    if(allowOpen&&!modal.open){try{modal.showModal()}catch(_){modal.setAttribute('open','')}}
  }
  function closeStartup(mark=true){
    const modal=document.getElementById('travelNewsModal');if(!modal)return;if(mark){const d=dismissed();importantItems().forEach(a=>d[a.url]=Date.now());writeJSON(DISMISS_KEY,d)}try{modal.close()}catch(_){modal.removeAttribute('open')}
  }
  async function refresh(force=false){
    if(fetching)return;
    if(!force&&lastUpdated&&Date.now()-lastUpdated<REFRESH_MS){renderList();renderStartupAlert(false);return}
    if(!navigator.onLine){lastError='오프라인';renderList();renderStartupAlert(false);return}
    fetching=true;lastError='';renderList();
    try{
      const settled=await Promise.allSettled(QUERIES.map(fetchBucket));const merged=[];settled.forEach(x=>{if(x.status==='fulfilled')merged.push(...x.value)});if(!merged.length)throw Error('GDELT 응답 없음');
      const oldTrans=translationCache();items=dedupe(merged).map(a=>{if(oldTrans[a.url]?.text){a.titleKo=oldTrans[a.url].text;a.translationTried=true}return a});lastUpdated=Date.now();cachedSave();renderList();renderStartupAlert(false);const priority=[...importantItems(),...items.filter(a=>a.level==='watch'),...items];const uniq=[];const seen=new Set();for(const a of priority){if(!seen.has(a.url)){seen.add(a.url);uniq.push(a)}}translateVisible(uniq.slice(0,18)).then(()=>renderStartupAlert(true));
    }catch(e){lastError=e?.name==='AbortError'?'시간 초과':(e?.message||'조회 오류');renderList();renderStartupAlert(false)}
    finally{fetching=false;renderList()}
  }
  function install(){
    cachedLoad();officialRender();renderList();renderTodayBanner();
    document.addEventListener('click',e=>{
      const f=e.target.closest('[data-news-filter]');if(f){activeFilter=f.dataset.newsFilter;renderList();translateVisible(filtered().slice(0,12));return}
      if(e.target.closest('#travelNewsRefresh'))refresh(true);
      if(e.target.closest('[data-news-modal-close]'))closeStartup(true);
      if(e.target.closest('[data-news-modal-open]')){closeStartup(true);window.AppRouter?.go('news')}
    });
    window.addEventListener('cro-auth-change',()=>{setTimeout(()=>{refresh(false);const priority=[...importantItems(),...items];translateVisible(priority.slice(0,12)).then(()=>renderStartupAlert(true))},250)});
    window.addEventListener('cro-route',e=>{if(e.detail?.view==='news'){renderList();officialRender();refresh(false);translateVisible(filtered().slice(0,12))}});
    window.addEventListener('online',()=>refresh(false));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastUpdated>=REFRESH_MS)refresh(false)});
    clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh(false)},REFRESH_MS);
    if(currentUser)setTimeout(()=>{refresh(false);const priority=[...importantItems(),...filtered()];translateVisible(priority.slice(0,12)).then(()=>renderStartupAlert(true))},400);else if(!lastUpdated||Date.now()-lastUpdated>=REFRESH_MS)setTimeout(()=>refresh(false),1000);
    else{renderStartupAlert(false);translateVisible(filtered().slice(0,8))}
  }
  document.addEventListener('DOMContentLoaded',install);
  window.TravelNews={refresh,items:()=>items.slice(),important:importantItems};
})();
