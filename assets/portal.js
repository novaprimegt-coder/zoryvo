'use strict';
(() => {
  const page = document.documentElement.dataset.zoryvoPage || 'home';
  const HOME_URL = 'index.html';
  const REWARDS_URL = 'rewards.html';
  const iconUse = id => `<svg class="ui-icon" aria-hidden="true"><use href="#${id}"></use></svg>`;

  function routeTo(view){
    if(view === 'rewards'){
      if(page !== 'rewards') location.href = REWARDS_URL;
      return;
    }
    if(page === 'rewards'){
      try{ sessionStorage.setItem('zoryvo_target_view', view); }catch{}
      location.href = HOME_URL;
    }
  }

  function navLink(view, href, current=false){
    const old = document.querySelector(`.bottom-nav .nav-btn[data-view="${view}"], .bottom-nav .nav-btn[data-page-link="${view}"]`);
    if(!old) return null;
    if(old.tagName === 'A'){
      old.href = href;
      old.dataset.pageLink = view;
      delete old.dataset.view;
      old.classList.toggle('active', current);
      if(current) old.setAttribute('aria-current','page'); else old.removeAttribute('aria-current');
      return old;
    }
    const link = document.createElement('a');
    link.className = old.className;
    link.href = href;
    link.dataset.pageLink = view;
    link.innerHTML = old.innerHTML;
    if(view === 'rewards') link.innerHTML = link.innerHTML.replace('Premios','Recompensas');
    link.setAttribute('aria-label', view === 'rewards' ? 'Abrir página de recompensas' : 'Abrir Home de ZORYVO');
    if(current){ link.classList.add('active'); link.setAttribute('aria-current','page'); }
    else{ link.classList.remove('active'); link.removeAttribute('aria-current'); }
    old.replaceWith(link);
    return link;
  }

  function upgradePortalLinks(){
    if(page === 'rewards'){
      navLink('home', HOME_URL, false);
      navLink('rewards', REWARDS_URL, true);
    }else{
      navLink('rewards', REWARDS_URL, false);
    }
  }

  document.addEventListener('click', event => {
    if(page === 'rewards' && event.target.closest?.('#topProfileButton')){
      event.preventDefault(); event.stopImmediatePropagation(); routeTo('profile'); return;
    }
    const nav = event.target.closest?.('.nav-btn[data-view]');
    if(!nav) return;
    const view = nav.dataset.view;
    if(page === 'rewards'){
      event.preventDefault();
      event.stopImmediatePropagation();
      routeTo(view);
    }
  }, true);

  function ensureHomeWallet(){
    const home = document.querySelector('#view-home');
    if(!home || document.querySelector('#homeWalletSummary')) return;
    const hero = home.querySelector('.hero');
    if(!hero) return;
    const wrap = document.createElement('section');
    wrap.id = 'homeWalletSummary';
    wrap.className = 'home-wallet-summary';
    wrap.setAttribute('aria-label','Resumen de recompensas');
    wrap.innerHTML = `<div class="home-wallet-head"><div><span class="wallet-kicker">TU CUENTA ZORYVO</span><h2>Saldo y recompensas</h2><p>Monedas y pases sincronizados con tu página de Recompensas.</p></div><a class="wallet-open" href="${REWARDS_URL}">${iconUse('i-gift')}<span>Ver recompensas</span></a></div><div class="wallet-summary-grid"><div class="wallet-summary-item">${iconUse('i-coins')}<div><b id="homeCoins">0</b><span>Monedas</span></div></div><div class="wallet-summary-item">${iconUse('i-ticket')}<div><b id="homePasses">0</b><span>Pases</span></div></div><div class="wallet-summary-item">${iconUse('i-activity')}<div><b id="homeStreak">0</b><span>Racha</span></div></div></div>`;
    hero.insertAdjacentElement('afterend', wrap);
  }

  function ensureRewardsHeader(){
    if(page !== 'rewards') return;
    const view = document.querySelector('#view-rewards');
    const hero = view?.querySelector('.reward-hero');
    if(!view || !hero || document.querySelector('#rewardsPortalHead')) return;
    const head = document.createElement('div');
    head.id = 'rewardsPortalHead';
    head.className = 'rewards-portal-head';
    head.innerHTML = `<div><span>PÁGINA INDEPENDIENTE</span><b>Centro de recompensas</b></div><a href="${HOME_URL}" class="rewards-home-link">${iconUse('i-home')}<span>Home</span></a>`;
    hero.insertAdjacentElement('beforebegin', head);
  }

  function ensureRewardStats(){
    const hero = document.querySelector('#view-rewards .reward-hero');
    if(!hero || document.querySelector('#rewardSharedStats')) return;
    const wallet = hero.querySelector('.reward-wallet');
    if(!wallet) return;
    const stats = document.createElement('div');
    stats.id = 'rewardSharedStats';
    stats.className = 'reward-shared-stats';
    stats.innerHTML = `<div class="reward-shared-stat">${iconUse('i-ticket')}<div><b id="rewardPasses">0</b><span>Pases disponibles</span></div></div><div class="reward-shared-stat">${iconUse('i-activity')}<div><b id="rewardStreak">0</b><span>Racha actual</span></div></div><div class="reward-shared-stat">${iconUse('i-gift')}<div><b id="rewardToday">Disponible</b><span>Recompensa diaria</span></div></div>`;
    wallet.insertAdjacentElement('afterend', stats);
  }

  function syncSharedState(){
    if(typeof state === 'undefined') return;
    ensureHomeWallet();
    ensureRewardsHeader();
    ensureRewardStats();
    upgradePortalLinks();
    const today = typeof localDateKey === 'function' ? localDateKey() : '';
    const claimed = !!(state.reward && state.reward.lastClaim === today);
    const pairs = [['homeCoins',state.coins],['homePasses',state.freePasses],['homeStreak',(state.reward&&state.reward.streak)||0],['rewardPasses',state.freePasses],['rewardStreak',(state.reward&&state.reward.streak)||0],['rewardToday',claimed?'Recibida':'Disponible']];
    pairs.forEach(([id,value]) => { const el=document.getElementById(id); if(el) el.textContent=String(value); });
  }

  if(typeof renderRewards === 'function'){
    const coreRenderRewards = renderRewards;
    renderRewards = function(){ const result = coreRenderRewards.apply(this, arguments); syncSharedState(); return result; };
  }
  if(typeof renderAll === 'function'){
    const coreRenderAll = renderAll;
    renderAll = function(){ const result = coreRenderAll.apply(this, arguments); syncSharedState(); return result; };
  }

  window.addEventListener('storage', event => {
    if(event.key !== 'zoryvo_state_v4' || typeof loadState !== 'function') return;
    try{ state = loadState(); if(typeof renderAll === 'function') renderAll(); if(page === 'rewards' && typeof switchView === 'function') switchView('rewards'); syncSharedState(); }catch{}
  });
  window.addEventListener('pageshow', syncSharedState);
  syncSharedState();

  if(typeof switchView === 'function'){
    if(page === 'rewards'){
      switchView('rewards');
      document.title = 'Recompensas · ZORYVO';
      upgradePortalLinks();
    }else{
      let target = '';
      try{ target = sessionStorage.getItem('zoryvo_target_view') || ''; sessionStorage.removeItem('zoryvo_target_view'); }catch{}
      if(target && target !== 'rewards') switchView(target);
    }
  }
})();