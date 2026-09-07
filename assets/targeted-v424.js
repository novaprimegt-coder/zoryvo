'use strict';
/* ZORYVO V4.2.6 — SOLO corrección del logo con PNG directo. */
(() => {
  const LOGO='assets/zoryvo-logo.png?v=426';

  function applyLogo(){
    document.querySelectorAll('.zv42-logo').forEach(el=>{
      el.textContent='';
      el.style.backgroundImage=`url("${LOGO}")`;
      el.style.backgroundColor='transparent';
      el.style.backgroundRepeat='no-repeat';
      el.style.backgroundPosition='left center';
      el.style.backgroundSize='contain';
    });

    document.querySelectorAll('img[data-zoryvo-logo], img.header-brand-logo, img.brandlogo-image, img[alt="Logo ZORYVO"]').forEach(img=>{
      img.onerror=null;
      img.src=LOGO;
      img.style.display='block';
      img.style.background='transparent';
      img.style.border='0';
      img.style.boxShadow='none';
      img.style.objectFit='contain';
      img.style.objectPosition='left center';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyLogo,{once:true});
  else applyLogo();

  window.addEventListener('load',applyLogo,{once:true});
})();
