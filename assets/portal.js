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

  document.addEventListener('click', event => {
    const nav = event.target.closest?.('[data-view]');
    if(!nav) return;
    const view = nav.dataset.view;
    if(view === 'rewards' || page === 'rewards'){
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
    wrap.innerHTML = `<div class="home-wallet-head"><div><span class="wallet-kicker">TU CUENTA ZORYVO</span><h2>Saldo y recompensas</h2></div><a class="wallet-open" href="${REWARDS_URL}">${iconUse('i-gift')}<span>Ver recompensas</span></a></div><div class="wallet-summary-grid"><div class="wallet-summary-item">${iconUse('i-coins')}<div><b id="homeCoins">0</b><span>Monedas</span></div></div><div class="wallet-summary-item">${iconUse('i-ticket')}<div><b id="homePasses">0</b><span>Pases</span></div></div><div class="wallet-summary-item">${iconUse('i-activity')}<div><b id="homeStreak">0</b><span>Racha</span></div></div></div>`;
    hero.insertAdjacentElement('afterend', wrap);
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
    ensureRewardStats();
    const today = typeof localDateKey === 'function' ? localDateKey() : '';
    const claimed = !!(state.reward && state.reward.lastClaim === today);
    const pairs = [['homeCoins',state.coins],['homePasses',state.freePasses],['homeStreak',state.reward?.streak||0],['rewardPasses',state.freePasses],['rewardStreak',state.reward?.streak||0],['rewardToday',claimed?'Recibida':'Disponible']];
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
    try{
      state = loadState();
      if(typeof renderAll === 'function') renderAll();
      if(page === 'rewards' && typeof switchView === 'function') switchView('rewards');
    }catch{}
  });
  window.addEventListener('pageshow', syncSharedState);
  syncSharedState();

  if(typeof switchView === 'function'){
    if(page === 'rewards'){
      switchView('rewards');
      document.title = 'Recompensas · ZORYVO';
    }else{
      let target = '';
      try{ target = sessionStorage.getItem('zoryvo_target_view') || ''; sessionStorage.removeItem('zoryvo_target_view'); }catch{}
      if(target && target !== 'rewards') switchView(target);
    }
  }
})();