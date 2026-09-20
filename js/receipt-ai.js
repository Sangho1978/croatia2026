/* Secure AI receipt extraction client. Uses a server endpoint; never exposes an OpenAI API key in GitHub Pages. */
(function(){
  'use strict';
  const endpoint=()=>typeof AI_RECEIPT_ENDPOINT==='string'?AI_RECEIPT_ENDPOINT.trim():'';
  function configured(){return !!endpoint()}
  async function analyze(dataUrl){
    if(!configured())throw Error('AI 영수증 판독 endpoint가 설정되지 않았습니다.');
    if(!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(dataUrl||''))throw Error('지원되는 영수증 이미지가 아닙니다.');
    const tk=typeof token==='function'?await token():'';
    const ctrl=new AbortController(),tid=setTimeout(()=>ctrl.abort(),30000);
    try{
      const r=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json',...(tk?{'Authorization':'Bearer '+tk}:{})},body:JSON.stringify({image:dataUrl}),signal:ctrl.signal,cache:'no-store'});
      const text=await r.text();let j={};try{j=text?JSON.parse(text):{}}catch(_){throw Error('AI 판독 응답을 읽지 못했습니다.');}
      if(!r.ok)throw Error(j.error||('AI 판독 실패 ('+r.status+')'));
      const x=j.receipt||j;
      return {provider:'ai',merchant:x.merchant||'',date:x.date||'',time:x.time||'',amount:Number.isFinite(+x.amount)?+x.amount:null,currency:/^(EUR|KRW)$/.test(x.currency)?x.currency:'EUR',category:x.category||'기타',purpose:x.purpose||'공동경비',country:x.country||'',confidence:Math.max(0,Math.min(100,Math.round(+x.confidence||0))),notes:x.notes||'',rawText:''};
    }catch(e){if(e.name==='AbortError')throw Error('AI 판독 시간이 초과되었습니다.');throw e}finally{clearTimeout(tid)}
  }
  window.ReceiptAI={configured,analyze,get endpoint(){return endpoint()}};
})();
