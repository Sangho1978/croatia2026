
function videoFilter(cat,btn){
  document.querySelectorAll('.video-tab').forEach(x=>x.classList.remove('active'));
  if(btn)btn.classList.add('active');
  let shown=0;
  document.querySelectorAll('.video-card').forEach(card=>{
    let ok=cat==='all'||card.dataset.cat===cat;
    card.classList.toggle('hidden',!ok);
    if(ok)shown++;
  });
  let c=document.getElementById('videoCount');if(c)c.textContent=`추천 영상 ${shown}편`;
}
async function copyVideoUrl(url){
  try{await navigator.clipboard.writeText(url);alert('영상 URL을 복사했습니다.');}
  catch(e){prompt('아래 URL을 복사하세요.',url)}
}
