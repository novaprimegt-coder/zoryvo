(function(){
  'use strict';
  var page=window.ZORYVO_PAGE==='rewards'?'rewards':'home';

  function syncWallet(){
    var coins=typeof state!=='undefined'?state.coins:0;
    var passes=typeof state!=='undefined'?state.freePasses:0;
    var homeCoins=document.getElementById('homeCoins');
    var homePasses=document.getElementById('homePasses');
    var rewardsPasses=document.getElementById('rewardsPasses');
    if(homeCoins)homeCoins.textContent=coins;
    if(homePasses)homePasses.textContent=passes;
    if(rewardsPasses)rewardsPasses.textContent=passes;
  }

  function restorePageNav(){
    document.querySelectorAll('[data-page-link]').forEach(function(link){
      var active=page==='rewards'&&link.dataset.pageLink==='rewards';
      link.classList.toggle('active',active);
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
  }

  if(typeof renderRewards==='function'){
    var originalRenderRewards=renderRewards;
    renderRewards=function(){var r=originalRenderRewards();syncWallet();return r};
  }
  if(typeof renderAll==='function'){
    var originalRenderAll=renderAll;
    renderAll=function(){var r=originalRenderAll();syncWallet();restorePageNav();return r};
  }

  if(page==='rewards'){
    if(typeof switchView==='function')switchView('rewards');
    restorePageNav();
  }else{
    var requested=new URLSearchParams(location.search).get('view');
    if(['home','discover','library','profile'].includes(requested)&&typeof switchView==='function')switchView(requested);
    else if(typeof switchView==='function')switchView('home');
  }
  syncWallet();

  window.addEventListener('pageshow',function(){syncWallet();if(page==='rewards')restorePageNav()});
  window.addEventListener('storage',function(event){
    if(typeof STORAGE_KEY!=='undefined'&&event.key===STORAGE_KEY&&typeof loadState==='function'){
      try{state=loadState();if(typeof renderAll==='function')renderAll();syncWallet()}catch(e){console.warn('ZORYVO sync',e)}
    }
  });
})();
