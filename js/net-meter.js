/* Request/response body estimator. Not carrier billing, images or map tiles. */
(function(){
  const nativeFetch=window.fetch.bind(window),encoder=new TextEncoder();
  const totals={sent:0,received:0,requests:0};
  function bytes(x){if(x==null)return 0;if(typeof x==='string')return encoder.encode(x).byteLength;if(x instanceof URLSearchParams)return encoder.encode(x.toString()).byteLength;if(x instanceof Blob)return x.size;if(x instanceof ArrayBuffer)return x.byteLength;return 0}
  function paint(){const e=document.getElementById('trafficTotal');if(e){const b=totals.sent+totals.received;e.textContent='데이터 약 '+(b>=1048576?(b/1048576).toFixed(2)+' MB':(b/1024).toFixed(1)+' KB')}}
  window.fetch=async function(input,options){
    let url='';try{url=typeof input==='string'?input:input.url||String(input)}catch(_){}
    const track=/firebasedatabase\.app|firebaseio\.com|googleapis\.com\/(v1|v1beta)|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|open-meteo\.com|frankfurter\.(app|dev)/.test(url);
    if(track){totals.sent+=bytes(options?.body);totals.requests++;paint()}
    const res=await nativeFetch(input,options);
    if(track){res.clone().arrayBuffer().then(b=>{totals.received+=b.byteLength;paint()}).catch(()=>{})}
    return res;
  };
  window.AppTraffic={totals,paint,description:()=>`이 화면을 연 뒤 앱 데이터 요청 ${totals.requests}회\n송신 본문 ${(totals.sent/1024).toFixed(1)} KB / 수신 본문 ${(totals.received/1024).toFixed(1)} KB\n\n날씨·환율·Firebase·경비·영수증 이미지·앨범 정보의 요청/응답 본문 추정량입니다. 지도 타일·외부 사진·HTML/CSS/JS·통신 헤더·TLS 및 외부 앱 사용량은 포함하지 않습니다. 통신사 청구량과 다릅니다.`};
  document.addEventListener('DOMContentLoaded',paint);
})();