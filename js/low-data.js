/* MIX33 low-data bootstrap. Same-origin files are cached on first actual use. */
(function(){
  try{localStorage.setItem('cro.data.saver','1')}catch(_){}
  document.documentElement.dataset.dataSaver='on';
  if('serviceWorker'in navigator && window.isSecureContext){navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});}
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(c?.saveData)document.documentElement.dataset.networkSaveData='on';
})();