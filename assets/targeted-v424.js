'use strict';
/* ZORYVO V4.2.4 — SOLO corrección del logo solicitado. */
(() => {
  const SOURCE='assets/zoryvo-logo-exact.svg?v=421';
  async function applyExactLogo(){
    try{
      const text=await fetch(SOURCE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('logo');return r.text()});
      const match=text.match(/href=["'](data:image\/png;base64,[^"']+)["']/i);
      if(!match)throw Error('embedded png');
      const data=match[1];
      document.querySelectorAll('.zv42-logo').forEach(el=>{
        el.textContent='';
        el.style.backgroundImage=`url('${data}')`;
        el.style.backgroundColor='transparent';
      });
      document.querySelectorAll('img[data-zoryvo-logo]').forEach(img=>{
        img.onerror=null;
        img.src=data;
        img.style.display='block';
        img.style.background='transparent';
        img.style.objectFit='contain';
      });
    }catch{
      document.querySelectorAll('img[data-zoryvo-logo]').forEach(img=>{
        img.style.display='none';
        const wrap=img.closest('.header-logo-wrap');
        if(wrap){wrap.setAttribute('aria-label','ZORYVO');wrap.style.minWidth='145px';}
      });
      document.querySelectorAll('.zv42-logo').forEach(el=>{el.textContent='ZORYVO';});
    }
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',applyExactLogo):applyExactLogo();
})();
