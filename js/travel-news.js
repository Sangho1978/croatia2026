/* MIX23 · itinerary-focused live travel news / disaster watch
 * Goal: show only stories that can affect the actual 10/12~10/18 itinerary.
 * Primary provider: GDELT DOC 2.0. Fallback: Google News RSS via rss2json.
 * Static GitHub Pages limitation: refreshes while open; cannot guarantee background refresh while closed.
 */
(function(){
  'use strict';

  const REFRESH_MS=60*60*1000;
  const MAX_AGE_MS=7*24*60*60*1000;
  const URGENT_AGE_MS=72*60*60*1000;
  const CACHE_KEY='cro.travelNews.cache.v3';
  const TRANS_KEY='cro.travelNews.translation.v3';
  const DISMISS_KEY='cro.travelNews.dismissed.v3';
  const GDELT='https://api.gdeltproject.org/api/v2/doc/doc';
  const RSS2JSON='https://api.rss2json.com/v1/api.json';
  const TRANSLATE='https://api.mymemory.translated.net/get';

  let items=[];
  let activeFilter='important';
  let timer=0;
  let fetching=false;
  let lastUpdated=0;
  let lastError='';
  let searchState={attempted:0,succeeded:0,failed:0,provider:'',partial:false};

  const SOURCES={
    'hina.hr':{label:'HINA · 크로아티아 통신',kind:'local'},
    'hrt.hr':{label:'HRT · 크로아티아 공영방송',kind:'local'},
    'glashrvatske.hrt.hr':{label:'HRT · 크로아티아 공영방송',kind:'local'},
    'jutarnji.hr':{label:'Jutarnji list',kind:'local'},
    'vecernji.hr':{label:'Večernji list',kind:'local'},
    'index.hr':{label:'Index.hr',kind:'local'},
    'n1info.hr':{label:'N1 Hrvatska',kind:'local'},
    'ansa.it':{label:'ANSA · 이탈리아 통신',kind:'local'},
    'rainews.it':{label:'Rai News',kind:'local'},
    'corriere.it':{label:'Corriere della Sera',kind:'local'},
    'repubblica.it':{label:'la Repubblica',kind:'local'},
    'ilmessaggero.it':{label:'Il Messaggero',kind:'local'},
    'reuters.com':{label:'Reuters',kind:'wire'},
    'apnews.com':{label:'AP',kind:'wire'},
    'bbc.com':{label:'BBC',kind:'wire'},
    'euronews.com':{label:'Euronews',kind:'wire'}
  };

  const OFFICIAL=[
    {country:'🇭🇷 크로아티아',name:'DHMZ 기상특보',note:'폭우·강풍·뇌우·고온 등 공식 기상경보',url:'https://meteo.hr/naslovnica-upozorenja.php?lang=en&tab=upozorenja'},
    {country:'🇭🇷 크로아티아',name:'HAK 도로·교통',note:'A1·DC8·국경·페리·도로통제 실시간',url:'https://www.hak.hr/en'},
    {country:'🇭🇷 크로아티아',name:'Civil Protection',note:'재난·대피·112 공식 공지',url:'https://civilna-zastita.gov.hr/en'},
    {country:'🇮🇹 이탈리아',name:'Protezione Civile',note:'기상·홍수·지진 등 국가 재난정보',url:'https://www.protezionecivile.gov.it/en/'},
    {country:'🇮🇹 이탈리아',name:'교통파업 공식 일정',note:'항공·철도·대중교통 파업 일정',url:'https://scioperi.mit.gov.it/mit2/public/scioperi'},
    {country:'🇮🇹 로마 FCO',name:'Fiumicino 실시간 항공편',note:'출도착·지연·취소 공식 확인',url:'https://www.adr.it/en/web/aeroporti-di-roma-en/pax-fco-realtime-flight'}
  ];

  const SCHEDULE=[
    {date:'10/12',label:'10/12 로마 FCO → 두브로브니크',keys:['rome','roma','fiumicino','fco','dubrovnik','dbv']},
    {date:'10/13–14',label:'10/13–14 두브로브니크',keys:['dubrovnik','dbv']},
    {date:'10/15',label:'10/15 스플리트·트로기르',keys:['split','trogir','duce','duće']},
    {date:'10/16',label:'10/16 자다르·플리트비체',keys:['zadar','plitvice','biograd']},
    {date:'10/17',label:'10/17 라스토케·자그레브·ZAG',keys:['rastoke','zagreb','zag','karlovac']},
    {date:'10/18',label:'10/18 로마·FCO',keys:['rome','roma','fiumicino','fco','lazio','orvieto','assisi','civita']}
  ];

  // Short queries are more reliable than one large GDELT expression.
  const QUERIES=[
    {bucket:'croatia',country:'크로아티아',q:'Croatia (wildfire OR flood OR earthquake OR storm OR evacuation OR warning)',google:'Croatia wildfire flood earthquake storm evacuation warning'},
    {bucket:'croatia',country:'크로아티아',q:'(Dubrovnik OR Split OR Trogir OR Zadar OR Plitvice OR Zagreb) (fire OR flood OR storm OR traffic OR closure OR airport OR strike)',google:'Dubrovnik Split Trogir Zadar Plitvice Zagreb fire flood storm traffic closure airport strike'},
    {bucket:'croatia',country:'크로아티아',q:'Hrvatska (pozar OR poplava OR potres OR oluja OR promet OR strajk)',google:'Hrvatska požar poplava potres oluja promet štrajk'},
    {bucket:'italy',country:'로마·이탈리아',q:'(Rome OR Roma OR Fiumicino OR Lazio) (flood OR storm OR strike OR airport OR flight OR train OR traffic OR closure)',google:'Rome Roma Fiumicino Lazio flood storm strike airport flight train traffic closure'},
    {bucket:'italy',country:'로마·이탈리아',q:'Italy (transport strike OR airport disruption OR rail strike OR severe weather)',google:'Italy transport strike airport disruption rail strike severe weather'},
    {bucket:'italy',country:'로마·이탈리아',q:'Italia (sciopero OR maltempo OR alluvione OR incendio OR terremoto OR aeroporto OR voli OR treni)',google:'Italia sciopero maltempo alluvione incendio terremoto aeroporto voli treni'}
  ];

  const IMPACT_TERMS=[
    ['evacuat',5,'대피'],['evacuaz',5,'대피'],['wildfire',5,'산불'],['forest fire',5,'산불'],['pozar',5,'산불'],['požar',5,'산불'],['incendio',5,'산불·화재'],
    ['earthquake',5,'지진'],['potres',5,'지진'],['terremoto',5,'지진'],['flash flood',5,'급류·홍수'],['flood',4,'홍수'],['poplava',4,'홍수'],['alluvion',4,'홍수'],
    ['red alert',5,'적색경보'],['warning',2,'경보'],['upozoren',2,'경보'],['allerta',2,'경보'],['severe storm',5,'강한 폭풍'],['storm',3,'폭풍'],['oluja',3,'폭풍'],['maltempo',3,'악천후'],
    ['landslide',5,'산사태'],['heatwave',3,'폭염'],['emergency',4,'비상상황'],['explosion',5,'폭발'],['shooting',5,'총격'],['terror',5,'테러'],
    ['airport closed',6,'공항폐쇄'],['airport closure',6,'공항폐쇄'],['closed airport',6,'공항폐쇄'],['flight disruption',5,'항공차질'],['flight cancelled',5,'항공취소'],['flight canceled',5,'항공취소'],
    ['cancelled',3,'취소'],['canceled',3,'취소'],['strike',4,'파업'],['sciopero',4,'파업'],['strajk',4,'파업'],['štrajk',4,'파업'],
    ['road closed',4,'도로통제'],['road closure',4,'도로통제'],['zatvoren',3,'도로·시설통제'],['traffic',2,'교통'],['promet',2,'교통'],['ferry suspended',4,'페리중단'],
    ['airport',2,'공항'],['aeroporto',2,'공항'],['flight',2,'항공'],['voli',2,'항공'],['train',2,'철도'],['treni',2,'철도'],['accident',3,'사고'],['protest',3,'시위']
  ];

  const PLACE_MAP={
    dubrovnik:'두브로브니크',dbv:'두브로브니크 공항',split:'스플리트',trogir:'트로기르',duce:'두체',duće:'두체',zadar:'자다르',plitvice:'플리트비체',biograd:'비오그라드',
    zagreb:'자그레브',zag:'자그레브 공항',rastoke:'라스토케',karlovac:'카를로바츠',rome:'로마',roma:'로마',fiumicino:'FCO',fco:'FCO',lazio:'라치오',
    orvieto:'오르비에토',assisi:'아시시',civita:'치비타',dalmatia:'달마티아'
  };

  const TRUSTED_PUBLISHERS=['reuters','associated press','ap news','ansa','hina','hrt','jutarnji','večernji','vecernji','index.hr','n1 hrvatska','n1','rai news','corriere della sera','repubblica','il messaggero','bbc','euronews'];

  const GENERIC_PATTERNS=[
    /best (beaches|hotels|restaurants|places)/i,/things to do/i,/travel guide/i,/where to stay/i,/food guide/i,/holiday deals?/i,/top \d+/i,/instagram/i,/celebrity/i,/luxury hotel/i,/new restaurant/i,/tourism record/i,/record tourists?/i,/award/i
  ];

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function idOf(s){let h=2166136261;for(const ch of String(s).slice(0,600)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return 'n'+(h>>>0).toString(36);}
  function simplify(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
  function domainOf(url,domain){
    if(domain)return String(domain).replace(/^www\./,'').toLowerCase();
    try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase();}catch(_){return '';}
  }
  function sourceMeta(domain){
    const d=String(domain||'').replace(/^www\./,'').toLowerCase();
    if(SOURCES[d])return SOURCES[d];
    const key=Object.keys(SOURCES).find(k=>d===k||d.endsWith('.'+k));
    return key?SOURCES[key]:null;
  }
  function trustedPublisherName(raw,title){
    const bits=[String(raw?.author||''),String(raw?.source||''),String(title||'')].join(' ').toLowerCase();
    const hit=TRUSTED_PUBLISHERS.find(x=>bits.includes(x));
    if(!hit)return '';
    const map={'reuters':'Reuters','associated press':'AP','ap news':'AP','ansa':'ANSA','hina':'HINA','hrt':'HRT','jutarnji':'Jutarnji list','večernji':'Večernji list','vecernji':'Večernji list','index.hr':'Index.hr','n1 hrvatska':'N1 Hrvatska','n1':'N1','rai news':'Rai News','corriere della sera':'Corriere della Sera','repubblica':'la Repubblica','il messaggero':'Il Messaggero','bbc':'BBC','euronews':'Euronews'};
    return map[hit]||hit;
  }
  function parseDate(v){
    if(!v)return 0;
    if(/^\d{14}$/.test(v))return Date.UTC(+v.slice(0,4),+v.slice(4,6)-1,+v.slice(6,8),+v.slice(8,10),+v.slice(10,12),+v.slice(12,14));
    const d=Date.parse(v);return Number.isFinite(d)?d:0;
  }
  function fmtDate(ts,country){
    if(!ts)return '날짜 미상';
    const zone=country==='크로아티아'?'Europe/Zagreb':'Europe/Rome';
    try{return new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(ts));}
    catch(_){return new Date(ts).toLocaleString('ko-KR');}
  }
  function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(_){return fallback;}}
  function writeJSON(key,v){try{localStorage.setItem(key,JSON.stringify(v));}catch(_){}}

  function scheduleMatches(text,bucket){
    const s=simplify(text);const matches=[];
    SCHEDULE.forEach(x=>{if(x.keys.some(k=>s.includes(simplify(k))))matches.push(x.label);});
    if(matches.length)return [...new Set(matches)].slice(0,3);
    const countryWide=bucket==='croatia'?/(croatia|hrvatska|dalmatia)/.test(s):/(italy|italia|national|nationwide)/.test(s);
    if(countryWide)return bucket==='croatia'?['10/13–17 크로아티아 전 일정']:['10/12·17·18 로마/FCO 이동일'];
    return [];
  }

  function classify(a){
    const s=simplify(a.title+' '+a.description+' '+a.url);let score=0;const tags=[];let strongest=0;
    IMPACT_TERMS.forEach(([w,n,label])=>{if(s.includes(simplify(w))){score+=n;strongest=Math.max(strongest,n);if(!tags.includes(label))tags.push(label);}});
    const places=[];Object.keys(PLACE_MAP).forEach(w=>{if(s.includes(simplify(w))&&!places.includes(PLACE_MAP[w]))places.push(PLACE_MAP[w]);});
    if(places.length)score+=5;
    const schedule=scheduleMatches(s,a.bucket);if(schedule.length)score+=4;
    const meta=sourceMeta(a.domain);if(meta?.kind==='wire')score+=2;else if(meta?.kind==='local')score+=2;
    if(a.trustedSource)score+=2;
    const age=Date.now()-(a.ts||0);if(age>=0&&age<24*60*60*1000)score+=2;else if(age>=0&&age<72*60*60*1000)score+=1;
    const generic=GENERIC_PATTERNS.some(re=>re.test(a.title||''));if(generic)score-=8;
    const hasImpact=tags.length>0;
    const hasScope=schedule.length>0||places.length>0;
    const countryStrong=strongest>=4&&schedule.length>0;
    const relevant=!generic&&a.trustedSource&&hasImpact&&(hasScope||countryStrong)&&score>=8;
    let level='info';
    if(relevant&&score>=15&&strongest>=4)level='urgent';
    else if(relevant&&score>=10)level='watch';
    return {score,level,tags:tags.slice(0,4),places:places.slice(0,4),schedule:schedule.slice(0,3),relevant,generic};
  }

  function normalize(raw,bucket,country,provider){
    const title=String(raw.title||'').trim();const url=String(raw.url||raw.link||raw.url_mobile||'').trim();if(!title||!url)return null;
    const domain=domainOf(url,raw.domain);const ts=parseDate(raw.seendate||raw.date||raw.pubDate||raw.pubdate);
    const desc=String(raw.description||raw.content||'').replace(/<[^>]+>/g,' ').trim().slice(0,500);
    const meta=sourceMeta(domain);const fallbackPublisher=trustedPublisherName(raw,title);const trustedSource=Boolean(meta||fallbackPublisher);
    const a={id:idOf(url||title),title,titleKo:'',translationTried:false,url,domain,description:desc,source:(meta?.label||fallbackPublisher||String(raw.author||raw.source||domain||'출처 미상')),trustedSource,bucket,country,ts,language:String(raw.language||'English'),provider};
    Object.assign(a,classify(a));return a;
  }

  async function fetchJSON(url,timeout=13000){
    const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);
    try{const r=await fetch(url,{cache:'no-store',signal:c.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(t);}
  }
  function gdeltURL(q){const u=new URL(GDELT);u.searchParams.set('query',q);u.searchParams.set('mode','artlist');u.searchParams.set('maxrecords','20');u.searchParams.set('timespan','7d');u.searchParams.set('sort','datedesc');u.searchParams.set('format','json');return u.toString();}
  async function fetchGdelt(cfg){
    const j=await fetchJSON(gdeltURL(cfg.q));const arr=Array.isArray(j?.articles)?j.articles:Array.isArray(j)?j:[];
    return arr.map(x=>normalize(x,cfg.bucket,cfg.country,'GDELT')).filter(Boolean);
  }
  function googleRssURL(q,bucket){
    const locale=bucket==='italy'?'it':'en';const gl=bucket==='italy'?'IT':'HR';const ceid=bucket==='italy'?'IT:it':'HR:en';
    return `https://news.google.com/rss/search?q=${encodeURIComponent(q+' when:7d')}&hl=${locale}&gl=${gl}&ceid=${ceid}`;
  }
  async function fetchRssFallback(cfg){
    const u=RSS2JSON+'?rss_url='+encodeURIComponent(googleRssURL(cfg.google,cfg.bucket));
    const j=await fetchJSON(u,13000);const arr=Array.isArray(j?.items)?j.items:[];
    return arr.map(x=>normalize(x,cfg.bucket,cfg.country,'Google News RSS')).filter(Boolean);
  }

  function dedupeAndSelect(list){
    const seen=new Set();const kept=[];const perBucket={croatia:0,italy:0};
    list.sort((a,b)=>(b.ts||0)-(a.ts||0));
    for(const a of list){
      const k=(a.url||a.title).replace(/[?#].*$/,'').toLowerCase();if(seen.has(k))continue;seen.add(k);
      if(a.ts&&Date.now()-a.ts>MAX_AGE_MS)continue;
      if(!a.relevant)continue;
      const b=a.bucket||'other';if((perBucket[b]||0)>=12)continue;
      perBucket[b]=(perBucket[b]||0)+1;kept.push(a);
    }
    return kept;
  }

  function translationCache(){const c=readJSON(TRANS_KEY,{});const cutoff=Date.now()-14*24*60*60*1000;Object.keys(c).forEach(k=>{if(!c[k]||c[k].at<cutoff)delete c[k];});return c;}
  function koEnough(s){return /[가-힣]/.test(s||'');}
  function langCode(a){const l=simplify(a.language);if(l.includes('croat'))return 'hr';if(l.includes('ital'))return 'it';return 'en';}
  async function translateOne(a,cache){
    const k=a.url||a.title;if(cache[k]?.text){a.titleKo=cache[k].text;a.translationTried=true;return;}
    if(koEnough(a.title)){a.titleKo=a.title;a.translationTried=true;cache[k]={text:a.title,at:Date.now()};return;}
    try{
      const q=a.title.slice(0,480);const lp=langCode(a)+'%7Cko';const u=TRANSLATE+'?q='+encodeURIComponent(q)+'&langpair='+lp+'&mt=1';const j=await fetchJSON(u,10000);const tx=String(j?.responseData?.translatedText||'').trim();
      if(tx&&tx.toLowerCase()!==q.toLowerCase()){a.titleKo=tx;cache[k]={text:tx,at:Date.now()};}
    }catch(_){/* original title remains available */}
    finally{a.translationTried=true;}
  }
  async function translateVisible(list){
    const cache=translationCache();let n=0;
    for(const a of list){if(n>=12)break;if(!a.titleKo){await translateOne(a,cache);n++;renderAll();}}
    writeJSON(TRANS_KEY,cache);
  }

  function cachedLoad(){
    const c=readJSON(CACHE_KEY,null);if(!c||!Array.isArray(c.items))return false;
    items=c.items.map(a=>({...a,translationTried:Boolean(a.translationTried||a.titleKo)}));lastUpdated=+c.at||0;searchState=c.searchState||searchState;lastError='';return true;
  }
  function cachedSave(){writeJSON(CACHE_KEY,{at:lastUpdated,items,searchState});}

  function importantItems(){return items.filter(a=>a.level==='urgent'&&(a.ts?Date.now()-a.ts<URGENT_AGE_MS:true)).slice(0,4);}
  function watchItems(){return items.filter(a=>a.level==='urgent'||a.level==='watch');}
  function filtered(){
    const list=items.slice();
    if(activeFilter==='all')return list;
    if(activeFilter==='croatia')return list.filter(a=>a.bucket==='croatia');
    if(activeFilter==='italy')return list.filter(a=>a.bucket==='italy');
    if(activeFilter==='transport')return list.filter(a=>/파업|공항|항공|철도|도로|교통|페리|취소/.test((a.tags||[]).join(' ')));
    if(activeFilter==='disaster')return list.filter(a=>/산불|화재|지진|홍수|폭풍|악천후|산사태|비상상황|폭발|총격|테러|폭염|대피|경보/.test((a.tags||[]).join(' ')));
    return watchItems();
  }

  function sourceBadge(a){const s=sourceMeta(a.domain);return s?.kind==='wire'?'국제통신·주요언론':s?.kind==='local'?'현지 주요언론':'주요 뉴스';}
  function impactText(a){
    const t=a.tags||[];
    if(t.includes('산불')||t.includes('산불·화재'))return '산불·연기·도로통제 여부를 확인해야 합니다. 일정에 표시된 방문지·이동도로와 공식 경보를 함께 확인하세요.';
    if(t.includes('홍수')||t.includes('폭풍')||t.includes('악천후')||t.includes('산사태'))return '야외 일정·차량 이동에 영향을 줄 수 있습니다. 기상특보와 도로통제를 우선 확인하세요.';
    if(t.includes('지진'))return '현지 당국의 피해·시설폐쇄·교통통제 공지를 우선 확인하세요.';
    if(t.includes('파업'))return '항공·철도·대중교통 운항 변경 가능성이 있습니다. 해당 날짜 공식 운항정보를 다시 확인하세요.';
    if(t.includes('공항폐쇄')||t.includes('항공차질')||t.includes('항공취소'))return '항공편에 직접 영향을 줄 수 있습니다. FCO·ZAG·DBV 및 항공사 출도착 정보를 확인하세요.';
    if(t.includes('도로통제')||t.includes('교통')||t.includes('도로·시설통제'))return '전용차량 이동시간이나 접근로에 영향을 줄 수 있습니다. 크로아티아 HAK 등 공식 교통정보를 확인하세요.';
    return '연수 방문지·이동경로와 영향 키워드가 함께 확인된 기사입니다. 실제 통제 여부는 공식기관 공지를 최종 기준으로 확인하세요.';
  }
  function translateArticleLink(a){return 'https://translate.google.com/translate?sl=auto&tl=ko&u='+encodeURIComponent(a.url);}

  function statusModel(){
    const important=watchItems().length;
    const total=items.length;
    const stale=lastUpdated&&Date.now()-lastUpdated>=REFRESH_MS;
    if(fetching)return {cls:'loading',icon:'↻',title:'최신 연수 관련 뉴스를 확인하는 중입니다.',detail:'방문도시·공항·이동경로와 재난·교통·파업 키워드를 함께 대조하고 있습니다.'};
    if(lastError&&searchState.succeeded===0)return {cls:'error',icon:'!',title:'실시간 뉴스 조회 실패 — 뉴스 유무를 확인하지 못했습니다.',detail:(lastUpdated?`저장된 기사 ${total}건을 표시합니다. 마지막 정상 확인 ${fmtDate(lastUpdated,'크로아티아')}. `:'')+'아래 공식기관 참조 링크에서 최신 경보를 직접 확인할 수 있습니다.'};
    if(important>0)return {cls:'alert',icon:'⚠',title:`연수 일정에 영향 줄 수 있는 주요 기사 ${important}건을 확인했습니다.`,detail:`전체 선별기사 ${total}건 · 방문지/이동경로와 직접 관련된 기사만 표시합니다.${searchState.partial?' 일부 검색 소스는 응답하지 않았습니다.':''}`};
    if(total>0)return {cls:stale?'stale':'ok',icon:'✓',title:'최근 7일 연수 일정에 직접 영향 줄 긴급·주의 뉴스는 없습니다.',detail:`참고할 일정 관련 기사 ${total}건이 있습니다. 중요 탭에는 직접 영향 가능성이 높은 기사만 표시합니다.${searchState.partial?' 일부 검색 소스는 응답하지 않았습니다.':''}`};
    return {cls:stale?'stale':'ok',icon:'✓',title:'최근 7일 재난·재해·교통·파업 등 연수 일정 관련 주요 뉴스 없음',detail:`두브로브니크·스플리트·트로기르·자다르·플리트비체·자그레브·로마/FCO 일정 기준으로 확인했습니다.${searchState.partial?' 단, 일부 검색 소스는 응답하지 않았습니다.':''}`};
  }

  function renderStatus(){
    const box=document.getElementById('travelNewsState');if(!box)return;const m=statusModel();
    const when=lastUpdated?fmtDate(lastUpdated,'크로아티아'):'아직 정상 확인 없음';
    box.className='travel-news-state is-'+m.cls;
    box.innerHTML=`<div class="news-state-icon">${esc(m.icon)}</div><div><b>${esc(m.title)}</b><p>${esc(m.detail)}</p><small>마지막 확인: ${esc(when)} · 자동 갱신 1시간</small></div>`;
    const inline=document.getElementById('travelNewsStatus');if(inline)inline.textContent=lastError&&searchState.succeeded===0?'실시간 조회 실패':`선별 ${items.length}건 · ${searchState.provider||'뉴스 검색'}`;
  }

  function renderList(){
    const root=document.getElementById('travelNewsList');if(!root)return;const list=filtered();
    document.querySelectorAll('[data-news-filter]').forEach(b=>{const on=b.dataset.newsFilter===activeFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    const count=document.getElementById('travelNewsCount');if(count)count.textContent=items.length+'건';
    if(!list.length){
      let title='이 필터에 해당하는 연수 관련 기사가 없습니다.';let sub='다른 필터를 선택하거나 나중에 다시 갱신해 주세요.';
      if(fetching){title='뉴스를 확인하고 있습니다.';sub='잠시만 기다려 주세요.';}
      else if(lastError&&searchState.succeeded===0){title='실시간 조회에 실패해 기사 유무를 확인하지 못했습니다.';sub='저장된 기사 또는 아래 공식기관 링크를 이용해 주세요.';}
      else if(activeFilter==='important'){title='최근 7일 연수 일정에 직접 영향 줄 주요 뉴스 없음';sub='재난·재해·교통통제·파업·공항차질을 일정과 대조해 선별한 결과입니다.';}
      root.innerHTML=`<div class="news-empty"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;return;
    }
    root.innerHTML=list.slice(0,24).map(a=>{
      const ko=a.titleKo||'';const level=a.level==='urgent'?'긴급 확인':a.level==='watch'?'일정 주의':'참고';
      const koHeading=ko?esc(ko):(a.translationTried?'<span class="news-translate-failed">한국어 자동번역을 불러오지 못했습니다.</span>':'<span class="news-translating">한국어 번역 중…</span>');
      const schedule=(a.schedule||[]).map(x=>`<span class="news-schedule">🗓 ${esc(x)}</span>`).join('');
      return `<article class="travel-news-card is-${a.level}">
        <div class="travel-news-meta"><span class="news-level">${level}</span><span>${esc(a.country)}</span>${schedule}<span>${esc(sourceBadge(a))}</span></div>
        <h3>${koHeading}</h3>
        <p class="news-original">${esc(a.title)}</p>
        <div class="news-byline"><b>${esc(a.source)}</b><span>${esc(fmtDate(a.ts,a.country))}</span></div>
        ${(a.tags||[]).length?`<div class="news-tags">${a.tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
        <p class="news-impact"><b>연수 일정과의 관련성</b>${esc(impactText(a))}</p>
        <div class="news-actions"><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">원문보기 ↗</a><a class="secondary" href="${esc(translateArticleLink(a))}" target="_blank" rel="noopener noreferrer">번역해서 보기 ↗</a></div>
      </article>`;
    }).join('');
  }

  function officialRender(){
    const root=document.getElementById('officialTravelSources');if(!root)return;
    root.innerHTML=OFFICIAL.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(x.country)}</span><b>${esc(x.name)}</b><small>${esc(x.note)}</small></a>`).join('');
  }

  function renderScope(){
    const root=document.getElementById('travelNewsScope');if(!root)return;
    root.innerHTML=SCHEDULE.map(x=>`<span>${esc(x.label)}</span>`).join('');
  }

  function renderTodayBanner(){
    const host=document.getElementById('todayNewsAlert');if(!host)return;const list=importantItems();
    if(!list.length){host.hidden=true;host.innerHTML='';return;}
    host.hidden=false;host.innerHTML=`<button type="button" data-route="news" data-sub="important"><span>⚠ 여행 중요뉴스 ${list.length}건</span><b>${esc(list[0].titleKo||list[0].title)}</b><small>${esc((list[0].schedule||[])[0]||'연수 일정 영향 가능')} · 눌러서 기사와 공식 경보를 확인하세요.</small></button>`;
  }
  function dismissed(){return readJSON(DISMISS_KEY,{});}
  function renderStartupAlert(allowOpen=true){
    renderTodayBanner();const list=importantItems();if(!list.length||typeof currentUser==='undefined'||!currentUser)return;
    const modal=document.getElementById('travelNewsModal');if(!modal)return;const d=dismissed();const unseen=list.filter(a=>!d[a.url]||Date.now()-d[a.url]>12*60*60*1000);if(!unseen.length)return;
    const box=document.getElementById('travelNewsModalItems');if(box)box.innerHTML=unseen.map(a=>`<article><span>${esc((a.schedule||[]).join(' · ')||a.country)} · ${esc(a.source)}</span><b>${esc(a.titleKo||a.title)}</b><small>${esc(fmtDate(a.ts,a.country))} · ${esc((a.tags||[]).join(' · '))}</small></article>`).join('');
    if(allowOpen&&!modal.open){try{modal.showModal();}catch(_){modal.setAttribute('open','');}}
  }
  function closeStartup(mark=true){
    const modal=document.getElementById('travelNewsModal');if(!modal)return;if(mark){const d=dismissed();importantItems().forEach(a=>d[a.url]=Date.now());writeJSON(DISMISS_KEY,d);}try{modal.close();}catch(_){modal.removeAttribute('open');}
  }

  function renderAll(){renderStatus();renderList();renderTodayBanner();}

  async function runProvider(fetcher,name){
    const settled=await Promise.allSettled(QUERIES.map(fetcher));const merged=[];let ok=0,fail=0;
    settled.forEach(x=>{if(x.status==='fulfilled'){ok++;merged.push(...x.value);}else fail++;});
    return {name,merged,ok,fail};
  }

  async function refresh(force=false){
    if(fetching)return;
    if(!force&&lastUpdated&&Date.now()-lastUpdated<REFRESH_MS){renderAll();renderStartupAlert(false);return;}
    if(navigator.onLine===false){lastError='오프라인';searchState={attempted:0,succeeded:0,failed:0,provider:'오프라인',partial:true};renderAll();renderStartupAlert(false);return;}
    fetching=true;lastError='';renderAll();
    try{
      let result=await runProvider(fetchGdelt,'GDELT');
      if(result.ok===0||result.merged.length===0){
        const fallback=await runProvider(fetchRssFallback,'Google News RSS 보조');
        if(fallback.ok>0){result=fallback;}
      }
      searchState={attempted:QUERIES.length,succeeded:result.ok,failed:result.fail,provider:result.name,partial:result.fail>0};
      if(result.ok===0)throw Error('뉴스 검색 서비스 응답 없음');
      const oldTrans=translationCache();items=dedupeAndSelect(result.merged).map(a=>{if(oldTrans[a.url]?.text){a.titleKo=oldTrans[a.url].text;a.translationTried=true;}return a;});
      lastUpdated=Date.now();cachedSave();renderAll();renderStartupAlert(false);
      const priority=[...importantItems(),...watchItems(),...items];const uniq=[];const seen=new Set();for(const a of priority){if(!seen.has(a.url)){seen.add(a.url);uniq.push(a);}}
      translateVisible(uniq.slice(0,18)).then(()=>renderStartupAlert(true));
    }catch(e){
      lastError=e?.name==='AbortError'?'시간 초과':(e?.message||'조회 오류');
      if(!searchState.attempted)searchState={attempted:QUERIES.length,succeeded:0,failed:QUERIES.length,provider:'뉴스 검색',partial:true};
      renderAll();renderStartupAlert(false);
    }finally{fetching=false;renderAll();}
  }

  function install(){
    cachedLoad();officialRender();renderScope();renderAll();
    document.addEventListener('click',e=>{
      const f=e.target.closest('[data-news-filter]');if(f){activeFilter=f.dataset.newsFilter;renderList();translateVisible(filtered().slice(0,12));return;}
      if(e.target.closest('#travelNewsRefresh'))refresh(true);
      if(e.target.closest('[data-news-modal-close]'))closeStartup(true);
      if(e.target.closest('[data-news-modal-open]')){closeStartup(true);window.AppRouter?.go('news');}
    });
    window.addEventListener('cro-auth-change',()=>{setTimeout(()=>{refresh(false);translateVisible([...importantItems(),...items].slice(0,12)).then(()=>renderStartupAlert(true));},250);});
    window.addEventListener('cro-route',e=>{if(e.detail?.view==='news'){renderAll();officialRender();renderScope();refresh(false);translateVisible(filtered().slice(0,12));}});
    window.addEventListener('online',()=>refresh(false));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastUpdated>=REFRESH_MS)refresh(false);});
    clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh(false);},REFRESH_MS);
    if(typeof currentUser!=='undefined'&&currentUser)setTimeout(()=>{refresh(false);translateVisible([...importantItems(),...filtered()].slice(0,12)).then(()=>renderStartupAlert(true));},400);
    else if(!lastUpdated||Date.now()-lastUpdated>=REFRESH_MS)setTimeout(()=>refresh(false),1000);
    else{renderStartupAlert(false);translateVisible(filtered().slice(0,8));}
  }

  document.addEventListener('DOMContentLoaded',install);
  window.TravelNews={refresh,items:()=>items.slice(),important:importantItems,state:()=>({...searchState,lastUpdated,lastError})};
})();
