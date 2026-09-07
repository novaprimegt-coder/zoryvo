'use strict';
(() => {
  const page=document.documentElement.dataset.zoryvoPage||'home';
  const params=new URLSearchParams(location.search);
  const requested=params.get('view')||'';
  const VERSION='422';
  const HOME=`index.html?v=${VERSION}`;
  const REWARDS=`rewards.html?v=${VERSION}`;
  const DAILY=[20,25,30,35,40,50,80];
  const icon=name=>`<svg class="zv42-icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const localDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  function readState(){
    try{const raw=JSON.parse(localStorage.getItem('zoryvo_state_v4')||'null');const d=raw&&raw.data?raw.data:raw;if(d&&typeof d==='object')return d}catch{}
    return {coins:120,freePasses:0,reward:{streak:0,lastClaim:null,claimedTasks:[]},completedEpisodes:[]};
  }
  function clickHidden(id){const el=document.getElementById(id);if(el){el.click();return true}return false}
  function nav(active){return `<nav class="zv42-bottom" aria-label="Navegación principal">
    <a class="zv42-nav ${active==='home'?'active':''}" href="${HOME}">${icon('home')}<span>Inicio</span></a>
    <a class="zv42-nav" href="index.html?view=discover&v=${VERSION}">${icon('compass')}<span>Descubrir</span></a>
    <a class="zv42-nav ${active==='rewards'?'active':''}" href="${REWARDS}">${icon('gift')}<span>Recompensas</span></a>
    <a class="zv42-nav" href="index.html?view=library&v=${VERSION}">${icon('bookmark')}<span>Biblioteca</span></a>
    <a class="zv42-nav" href="index.html?view=profile&v=${VERSION}">${icon('user')}<span>Perfil</span></a>
  </nav>`}
  function header(coins){return `<header class="zv42-header">
    <a href="${HOME}" aria-label="ZORYVO"><span class="zv42-logo" role="img" aria-label="Logo ZORYVO"></span></a>
    <div class="zv42-head-actions"><div class="zv42-coins" aria-label="${coins} monedas">${icon('coins')}<strong>${coins}</strong></div><a class="zv42-profile" href="index.html?view=profile&v=${VERSION}" aria-label="Perfil">${icon('user')}</a></div>
  </header>`}
  function stat(iconName,value,label,href=''){
    const inner=`${icon(iconName)}<div><b>${value}</b><span>${label}</span></div>${icon('chevron-right').replace('zv42-icon','zv42-icon chev')}`;
    return href?`<a class="zv42-stat" href="${href}" style="text-decoration:none;color:inherit">${inner}</a>`:`<div class="zv42-stat">${inner}</div>`
  }
  function buildHome(){
    const s=readState(),coins=Math.max(0,Number(s.coins)||0),passes=Math.max(0,Number(s.freePasses)||0),streak=Math.max(0,Number(s.reward?.streak)||0);
    document.documentElement.classList.add('zv42');
    document.body.insertAdjacentHTML('beforeend',`<div class="zv42-app" id="zv42App">
      ${header(coins)}
      <section class="zv42-panel zv42-hero"><div class="zv42-hero-art"></div><div class="zv42-hero-copy">
        <span class="zv42-kicker">ZORYVO ORIGINAL · EPISODIOS CORTOS</span><h1>La Reina Regresa</h1><p class="zv42-hero-desc">Todos la dieron por vencida. Fue su mayor error.</p>
        <div class="zv42-meta"><span>Venganza</span><i class="zv42-dot"></i><span>45 episodios</span><i class="zv42-dot"></i><span>Vertical</span><span class="zv42-rating">${icon('star')} 4.9</span></div>
        <div class="zv42-actions"><button type="button" class="zv42-btn primary" id="zvPlay">${icon('play')}<span>Ver ahora</span></button><button type="button" class="zv42-btn secondary" id="zvInfo">${icon('info')}<span>Información</span></button></div>
      </div><div class="zv42-dots"><i class="active"></i><i></i><i></i><i></i></div></section>
      <section class="zv42-panel zv42-wallet"><div class="zv42-wallet-head"><div><div class="zv42-eyebrow">TU CUENTA ZORYVO</div><h2>Saldo y recompensas</h2><p>Disfruta, mira y gana más.</p></div><a class="zv42-wallet-open" href="${REWARDS}" aria-label="Abrir recompensas">${icon('gift')}</a></div>
      <div class="zv42-stats">${stat('coins',coins,'Monedas',REWARDS)}${stat('ticket',passes,'Pases',REWARDS)}${stat('activity',streak,'Racha',REWARDS)}</div></section>
      <section class="zv42-section"><div class="zv42-section-head"><h2>Explorar por género</h2><a class="zv42-seeall" href="index.html?view=discover&v=${VERSION}">Ver todos ›</a></div><div class="zv42-genres"><a class="zv42-chip active" href="index.html?view=discover&v=${VERSION}">Todos</a><a class="zv42-chip" href="index.html?view=discover&v=${VERSION}">Drama</a><a class="zv42-chip" href="index.html?view=discover&v=${VERSION}">Romance</a><a class="zv42-chip" href="index.html?view=discover&v=${VERSION}">Venganza</a><a class="zv42-chip" href="index.html?view=discover&v=${VERSION}">CEO</a></div></section>
      <section class="zv42-section"><div class="zv42-section-head"><h2>Originales de ZORYVO</h2><a class="zv42-seeall" href="index.html?view=discover&v=${VERSION}">Ver todos ›</a></div><div class="zv42-originals"><button type="button" class="zv42-card c1" data-zv-series="contrato" aria-label="Contrato con el CEO"></button><button type="button" class="zv42-card c2" data-zv-series="destino" aria-label="Destino Prohibido"></button><button type="button" class="zv42-card c3" data-zv-series="imperio" aria-label="Dueño del Imperio"></button></div></section>
      ${nav('home')}</div>`);
    document.getElementById('zvPlay')?.addEventListener('click',()=>window.ZORYVODebug?.playSeries?.('reina',1));
    document.getElementById('zvInfo')?.addEventListener('click',()=>{const target=[...document.querySelectorAll('[data-series="reina"]')].find(el=>!el.closest('#zv42App'));target?.click()});
    document.querySelectorAll('[data-zv-series]').forEach(el=>el.addEventListener('click',()=>window.ZORYVODebug?.playSeries?.(el.dataset.zvSeries,1)));
  }
  function buildRewards(){
    const s=readState(),coins=Math.max(0,Number(s.coins)||0),passes=Math.max(0,Number(s.freePasses)||0),streak=Math.max(0,Number(s.reward?.streak)||0),claimedToday=s.reward?.lastClaim===localDay(),nextIdx=streak%7,claimed=Array.isArray(s.reward?.claimedTasks)?s.reward.claimedTasks:[],completeCount=Math.min(3,Array.isArray(s.completedEpisodes)?s.completedEpisodes.length:0);
    document.documentElement.classList.add('zv42');
    const days=DAILY.map((r,i)=>`<div class="zv42-day ${i===nextIdx?'today':''}"><span>D${i+1}</span><b>+${r}</b></div>`).join('');
    document.body.insertAdjacentHTML('beforeend',`<div class="zv42-app" id="zv42App">${header(coins)}
      <section class="zv42-reward-head"><h1>Recompensas</h1><p>Consulta tu saldo, pases, racha diaria y recompensas obtenidas en un solo lugar.</p><div class="zv42-gift"></div></section>
      <section class="zv42-panel zv42-balance"><div class="zv42-balance-left">${icon('coins')}<div><span class="zv42-balance-label">Saldo disponible</span><div class="zv42-balance-num"><b>${coins}</b><span>monedas</span></div></div></div><div><button type="button" class="zv42-add" id="zvAddCoins">⊕ &nbsp; Añadir monedas</button><div class="zv42-add-note">Más historias te esperan</div></div></section>
      <section class="zv42-panel zv42-streak"><div class="zv42-streak-head"><div><h2>Racha diaria</h2><p>Inicia sesión cada día y gana más monedas.</p></div><div class="zv42-streak-mark">${icon('grid')}<div><b>7 días</b><span>Mayores premios</span></div></div></div><div class="zv42-days">${days}</div><button type="button" class="zv42-claim" id="zvClaim" ${claimedToday?'disabled':''}>${icon('gift')} &nbsp; ${claimedToday?'Recompensa diaria reclamada':'Reclamar recompensa diaria'}</button></section>
      <section class="zv42-panel zv42-reward-stats"><div class="zv42-stats" style="margin-top:0">${stat('coins',coins,'Monedas')}${stat('ticket',passes,'Pases')}${stat('activity',streak,'Racha')}</div></section>
      <section class="zv42-missions"><h2>Misiones</h2><p>Completa misiones y gana recompensas. Tu progreso se guarda en este dispositivo.</p><div class="zv42-mission-grid">
        <article class="zv42-mission"><div class="zv42-mission-icon">${icon('play')}</div><h3>Ver anuncio</h3><p>Obtén pases para usar en episodios disponibles.</p><a class="zv42-mission-action primary" href="go:ZORYVO">go:ZORYVO ›</a></article>
        <article class="zv42-mission"><div class="zv42-mission-icon">${icon('bookmark')}</div><h3>Guarda una serie</h3><p>Añade 1 serie a tu biblioteca · +10 monedas</p><div class="zv42-mission-action">${claimed.includes('library')?'Completada':'Pendiente'}</div></article>
        <article class="zv42-mission"><div class="zv42-mission-icon">${icon('check')}</div><h3>Completa 3 episodios</h3><p>Progreso ${completeCount}/3 · +25 monedas</p><div class="zv42-mission-action">${claimed.includes('watch3')?'Completada':'Pendiente'}</div></article>
      </div></section>${nav('rewards')}</div>`);
    document.getElementById('zvAddCoins')?.addEventListener('click',()=>clickHidden('coinButton'));
    document.getElementById('zvClaim')?.addEventListener('click',()=>{clickHidden('claimDaily');setTimeout(()=>location.replace(`${REWARDS}&r=${Date.now()}`),250)});
  }
  function boot(){
    if(page==='home'&&requested&&requested!=='home'){setTimeout(()=>window.ZORYVODebug?.switchView?.(requested),0);return}
    page==='rewards'?buildRewards():buildHome();
    window.addEventListener('storage',e=>{if(e.key==='zoryvo_state_v4')location.reload()});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();