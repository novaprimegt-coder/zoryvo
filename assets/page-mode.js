(function(){
  'use strict';
  var page=window.ZORYVO_PAGE==='rewards'?'rewards':'home';
  document.body.classList.add('page-'+page);

  function replaceNav(view,href,current){
    var old=document.querySelector('.bottom-nav [data-view="'+view+'"]');
    if(!old)return null;
    var a=document.createElement('a');
    a.className=old.className;
    a.innerHTML=old.innerHTML;
    a.href=href;
    a.dataset.pageLink=view;
    if(current){a.classList.add('active');a.setAttribute('aria-current','page')}
    else{a.classList.remove('active');a.removeAttribute('aria-current')}
    old.replaceWith(a);
    return a;
  }

  function setLogo(){
    var src='assets/zoryvo-logo-transparent.png?v=410';
    document.querySelectorAll('[data-zoryvo-logo]').forEach(function(img){
      img.onerror=function(){img.onerror=null;img.src='assets/logo-fallback.svg?v=410'};
      img.src=src;
    });
  }
  setLogo();

  if(page==='home'){
    replaceNav('rewards','rewards.html',false);
    var home=document.getElementById('view-home');
    if(home&&!document.getElementById('homeWalletPanel')){
      home.insertAdjacentHTML('afterbegin',
        '<div class="shared-wallet-panel" id="homeWalletPanel" aria-label="Resumen de recompensas">'+
          '<div class="shared-wallet-copy"><div><span>Saldo ZORYVO</span><b>Tu progreso se comparte con Recompensas</b></div></div>'+
          '<div class="wallet-metric"><span>Monedas</span><b><svg class="ui-icon" aria-hidden="true"><use href="#i-coins"></use></svg><strong id="homeCoins">0</strong></b></div>'+
          '<div class="wallet-metric pass"><span>Pases</span><b><svg class="ui-icon" aria-hidden="true"><use href="#i-ticket"></use></svg><strong id="homePasses">0</strong></b></div>'+
          '<a class="wallet-open-link" href="rewards.html"><svg class="ui-icon" aria-hidden="true"><use href="#i-gift"></use></svg><span>Recompensas</span></a>'+
        '</div>');
    }
  }else{
    replaceNav('home','./',false);
    replaceNav('discover','./?view=discover',false);
    replaceNav('rewards','rewards.html',true);
    replaceNav('library','./?view=library',false);
    replaceNav('profile','./?view=profile',false);

    var views=document.querySelectorAll('.view');
    views.forEach(function(v){v.classList.toggle('active',v.id==='view-rewards')});

    var rewards=document.getElementById('view-rewards');
    if(rewards&&!document.querySelector('.rewards-page-toolbar')){
      rewards.insertAdjacentHTML('afterbegin',
        '<div class="rewards-page-toolbar"><div><b>Centro de recompensas</b><span>Anuncios, racha, misiones y saldo en una página independiente</span></div><a class="rewards-home-link" href="./"><svg class="ui-icon" aria-hidden="true"><use href="#i-home"></use></svg><span>Inicio</span></a></div>');
    }
    var wallet=document.querySelector('#view-rewards .reward-wallet');
    if(wallet&&!document.getElementById('rewardsPasses')){
      var passes=document.createElement('div');
      passes.className='wallet-copy wallet-passes';
      passes.innerHTML='<span>Pases disponibles</span><b><span id="rewardsPasses">0</span> pases</b>';
      var action=wallet.querySelector('.wallet-action');
      wallet.insertBefore(passes,action||null);
    }
  }
})();
