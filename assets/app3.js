/* ---------- detail / library ---------- */
function openDetail(id){
 const series=getSeries(id);if(!series)return false;runtime.activeSeries=series;const p=state.progress[id];const lib=state.library.includes(id);const ep=resumeEpisode(series);
 const seriesStatus=lib?'Guardada':p?'En curso':'Nueva';
 const planStatus=state.vip?'VIP':'Estándar';
 $('#detailBody').innerHTML=`<div class="detail-cover" style="--c1:${esc(series.c1)};--c2:${esc(series.c2)};background:linear-gradient(135deg,var(--c1),var(--c2))"><h2>${esc(series.name)}</h2></div><div class="detail-copy"><div class="tag-row"><span class="tag">${esc(series.genre)}</span><span class="tag rating-tag">${icon('star')} ${series.rating.toFixed(1)}</span><span class="tag">${series.episodes} episodios</span><span class="tag">Vertical</span>${series.interactive?'<span class="tag">Interactiva</span>':''}</div><p>${esc(series.desc)}</p><div class="detail-facts"><div class="fact"><b>${series.episodes}</b>Episodios</div><div class="fact"><b>${seriesStatus}</b>Estado</div><div class="fact"><b>${planStatus}</b>Plan</div></div><div class="detail-actions"><button type="button" class="btn primary" data-play-series="${esc(series.id)}" data-ep="${ep}">${icon('play')}<span>${p?`Continuar episodio ${ep}`:'Comenzar'}</span></button><button type="button" class="btn secondary icon-only-action" data-toggle-library="${esc(series.id)}" aria-label="${lib?'Quitar de biblioteca':'Guardar en biblioteca'}">${icon(lib?'check':'bookmark')}</button></div></div>`;
 return openLayer('detailSheet');
}
function toggleLibrary(id){
 if(!validSeriesId(id))return false;
 if(state.library.includes(id)){state.library=state.library.filter(x=>x!==id);toast('Eliminada de tu biblioteca')}else{state.library.push(id);toast('Guardada en tu biblioteca')}
 saveState();renderAll();updatePlayerActions();if($('#detailSheet').classList.contains('open'))openDetail(id);return true;
}
function toggleLike(id){if(!validSeriesId(id))return false;state.likes=state.likes.includes(id)?state.likes.filter(x=>x!==id):[...state.likes,id];saveState();updatePlayerActions();toast(state.likes.includes(id)?'Te gusta esta serie':'Me gusta eliminado');return true}
function updatePlayerActions(){const series=runtime.activeSeries;if(!series)return;const liked=state.likes.includes(series.id),saved=state.library.includes(series.id);$('#likeButton').classList.toggle('active',liked);$('#likeButton').innerHTML=icon('heart');$('#playerLibrary').classList.toggle('saved',saved);$('#playerLibrary').innerHTML=icon(saved?'check':'bookmark');$('#playerLibrary').setAttribute('aria-label',saved?'Guardada en biblioteca':'Guardar en biblioteca')}

/* ---------- player ---------- */
function updatePlayUi(){
 const video=$('#video');const paused=video.paused||video.ended;const blocked=$('#videoError').classList.contains('show')||$('#videoLoading').classList.contains('show');$('#centerPlay').innerHTML=icon(paused?'play':'pause');$('#centerPlay').classList.toggle('show',paused&&!blocked);$('#centerPlay').setAttribute('aria-label',paused?'Reproducir':'Pausar');
}
function updateMuteUi(){const muted=$('#video').muted;$('#muteButton').innerHTML=icon(muted?'volume-x':'volume');$('#muteButton').setAttribute('aria-label',muted?'Activar sonido':'Silenciar')}
function showVideoLoading(show){$('#videoLoading').classList.toggle('show',!!show)}
function showVideoError(show){$('#videoError').classList.toggle('show',!!show);if(show)showVideoLoading(false)}
function loadCurrentVideo({resume=true}={}){
 const series=runtime.activeSeries,ep=runtime.activeEpisode,video=$('#video');if(!series||!validEp(series.id,ep))return;
 const token=++runtime.videoLoadToken;showVideoError(false);showVideoLoading(true);$('#centerPlay').classList.remove('show');
 video.pause();video.removeAttribute('src');video.load();
 video.preload=state.settings.dataSaver?'metadata':'auto';video.src=VIDEO_SOURCES[(ep-1)%VIDEO_SOURCES.length];video.muted=state.settings.muted;updateMuteUi();
 const saved=state.progress[series.id];
 video.onloadedmetadata=()=>{
   if(token!==runtime.videoLoadToken)return;
   showVideoLoading(false);
   if(resume&&saved&&saved.ep===ep&&saved.time>0&&saved.percent<98&&saved.time<video.duration-1){try{video.currentTime=Math.min(saved.time,Math.max(0,video.duration-1))}catch{}}
   updateTimeline();
   const promise=video.play();if(promise?.catch)promise.catch(()=>updatePlayUi());
 };
 video.load();
}
function playSeries(id,ep=1){
 const series=getSeries(id);ep=Math.floor(Number(ep)||1);if(!series||!validEp(id,ep))return false;
 if(!isUnlocked(id,ep)){
   if($('#player').classList.contains('open')){saveCurrentProgress(true);$('#video').pause();updatePlayUi()}
   runtime.pendingUnlock={id,ep};$('#freePassCount').textContent=`${state.freePasses} pase${state.freePasses===1?'':'s'}`;$('#unlockDescription').textContent=`Episodio ${ep} de ${series.name}. Elige cómo desbloquearlo.`;openLayer('unlockModal');return false;
 }
 closeAllLayers();runtime.activeSeries=series;runtime.activeEpisode=ep;runtime.lastProgressSave=0;
 state.history=[{id,ep,at:Date.now()},...state.history.filter(item=>!(item.id===id&&item.ep===ep))].slice(0,60);saveState();
 $('#playerSeries').textContent=series.name;$('#playerEpisodeTop').textContent=`Episodio ${ep} de ${series.episodes}`;$('#episodeLabel').textContent=`EPISODIO ${ep} · ${series.genre.toUpperCase()}`;$('#episodeTitle').textContent=ep===1?series.ep:`Episodio ${ep}`;$('#episodeDesc').textContent=series.desc;
 $('#player').classList.add('open');$('#player').setAttribute('aria-hidden','false');syncBodyLock();renderEpisodes();renderInteractive();updatePlayerActions();updateNextButton();loadCurrentVideo({resume:true});
 requestAnimationFrame(()=>$('#closePlayer').focus({preventScroll:true}));return true;
}
function closePlayer(){
 if(!$('#player').classList.contains('open'))return false;saveCurrentProgress(true);const video=$('#video');runtime.videoLoadToken++;video.pause();video.onloadedmetadata=null;video.removeAttribute('src');video.load();showVideoLoading(false);showVideoError(false);$('#player').classList.remove('open');$('#player').setAttribute('aria-hidden','true');syncBodyLock();renderAll();return true;
}
function togglePlayback(){const video=$('#video');if(!$('#player').classList.contains('open')||$('#videoError').classList.contains('show'))return;if(video.paused){video.play().catch(()=>toast('Toca reproducir nuevamente'))}else video.pause()}
function toggleMute(){const video=$('#video');video.muted=!video.muted;updateMuteUi()}
function updateTimeline(){const video=$('#video');const ratio=video.duration?clamp(video.currentTime/video.duration,0,1):0;const range=$('#timelineRange');range.value=String(Math.round(ratio*1000));range.style.setProperty('--seek',`${ratio*100}%`);$('#timeLabel').textContent=`${formatTime(video.currentTime)} / ${formatTime(video.duration)}`}
function seekFromRange(){const video=$('#video');if(!Number.isFinite(video.duration)||video.duration<=0)return;const ratio=Number($('#timelineRange').value)/1000;try{video.currentTime=clamp(video.duration*ratio,0,video.duration)}catch{}updateTimeline()}
function updateNextButton(){const series=runtime.activeSeries;const end=runtime.activeEpisode>=series.episodes;$('#nextButton').disabled=end;$('#nextButton').innerHTML=end?`<span>Final de serie</span>${icon('check-circle')}`:`<span>Siguiente</span>${icon('chevron-right')}`}
function renderEpisodes(){
 const series=runtime.activeSeries;if(!series)return;const html=[];
 for(let ep=1;ep<=series.episodes;ep++){const unlocked=isUnlocked(series.id,ep),done=isCompleted(series.id,ep);const status=done?icon('check'):!unlocked?icon('lock'):'';html.push(`<button type="button" class="ep ${ep===runtime.activeEpisode?'current':''} ${unlocked?'unlocked':'locked'} ${done?'done':''}" data-play-series="${esc(series.id)}" data-ep="${ep}" aria-label="Episodio ${ep}${unlocked?'':' bloqueado'}${done?' completado':''}"><span class="ep-number">${ep}</span>${status?`<span class="ep-state" aria-hidden="true">${status}</span>`:''}</button>`)}
 $('#episodeGrid').innerHTML=html.join('');$('#episodeSheetTitle').textContent=series.name;$('#episodeAccessSummary').textContent=state.vip?'Plan VIP · episodios desbloqueados':'Plan Estándar';$('#episodeProgressSummary').textContent=`${state.completedEpisodes.filter(key=>key.startsWith(`${series.id}:`)).length}/${series.episodes} completados`;
}
function renderInteractive(){const box=$('#interactiveBox'),row=$('#choiceRow'),series=runtime.activeSeries;if(!series.interactive||runtime.activeEpisode!==2){box.classList.remove('show');row.innerHTML='';return}const key=`${series.id}:2`,selected=state.interactive[key]||'';const choices=['Confrontarlo','Seguir investigando'];row.innerHTML=choices.map(choice=>`<button type="button" class="choice ${selected===choice?'selected':''}" data-choice="${esc(choice)}">${esc(choice)}</button>`).join('');box.classList.add('show')}
function saveCurrentProgress(force=false){
 const video=$('#video'),series=runtime.activeSeries;if(!series||!$('#player').classList.contains('open')||!Number.isFinite(video.duration)||video.duration<=0)return false;const now=Date.now();if(!force&&now-runtime.lastProgressSave<1800)return false;runtime.lastProgressSave=now;const percent=clamp((video.currentTime/video.duration)*100,0,100);state.progress[series.id]={ep:runtime.activeEpisode,time:video.currentTime,duration:video.duration,percent,updatedAt:now};saveState();return true;
}
function markCompleted(){
 const series=runtime.activeSeries,key=`${series.id}:${runtime.activeEpisode}`;if(!state.completedEpisodes.includes(key))state.completedEpisodes.push(key);state.progress[series.id]={ep:runtime.activeEpisode,time:0,duration:$('#video').duration||0,percent:100,updatedAt:Date.now()};saveState();renderRewards();renderEpisodes();
}
function nextEpisode(){if(runtime.activeEpisode>=runtime.activeSeries.episodes){toast('Has terminado esta serie');return false}return playSeries(runtime.activeSeries.id,runtime.activeEpisode+1)}
function retryVideo(){loadCurrentVideo({resume:true})}

/* ---------- unlock / monetization demo ---------- */
function confirmUnlock(method){
 if(!runtime.pendingUnlock)return false;const {id,ep}=runtime.pendingUnlock;
 if(!validEp(id,ep)){runtime.pendingUnlock=null;closeLayer('unlockModal');return false}
 if(method==='pass'){if(state.freePasses<1){toast('No tienes pases disponibles');return false}state.freePasses--}
 else if(method==='coins'){if(state.coins<EPISODE_PRICE){toast('No tienes suficientes monedas');return false}state.coins-=EPISODE_PRICE}
 else return false;
 unlockEpisode(id,ep);runtime.pendingUnlock=null;saveState();closeLayer('unlockModal',{restoreFocus:false});renderAll();playSeries(id,ep);toast(method==='pass'?'Episodio desbloqueado con pase':'Episodio desbloqueado con monedas');return true;
}
function claimDaily(){
 const today=localDateKey();if(state.reward.lastClaim===today){toast('La recompensa de hoy ya fue recibida');return false}
 let streak=1;if(state.reward.lastClaim){const diff=dayDiff(state.reward.lastClaim,today);if(diff===1)streak=state.reward.streak>=7?1:state.reward.streak+1;else if(diff<=0){toast('La recompensa de hoy ya fue recibida');return false}}
 state.reward.streak=streak;state.reward.lastClaim=today;const reward=DAILY_REWARDS[streak-1]||DAILY_REWARDS[0];state.coins+=reward;saveState();renderAll();toast(`+${reward} monedas · día ${streak} de la racha`);return true;
}
function claimTask(id){
 if(id==='ad'){window.location.href='go:ZORYVO';return}
 const claimed=new Set(state.reward.claimedTasks);if(claimed.has(id))return;
 if(id==='library'&&state.library.length>=1){state.coins+=10;state.reward.claimedTasks.push(id);toast('+10 monedas')}
 else if(id==='watch3'&&completedCount()>=3){state.coins+=25;state.reward.claimedTasks.push(id);toast('+25 monedas')}
 else{toast('Aún no completas esta misión');return}
 saveState();renderAll();
}
function startAd(context='reward'){
 resetAdDay();if(state.reward.adsToday>=5){toast('Vuelve más tarde para obtener nuevas recompensas');renderRewards();return false}
 if(context==='unlock'&&!runtime.pendingUnlock){toast('No hay un episodio pendiente');return false}
 if($('#player').classList.contains('open')){$('#video').pause();saveCurrentProgress(true)}closeAllLayers();runtime.adContext=context;$('#adScreen').classList.add('open');$('#adScreen').setAttribute('aria-hidden','false');syncBodyLock();
 $('#adPurpose').textContent=context==='unlock'?'Al finalizar, el episodio seleccionado se desbloqueará directamente.':'Al finalizar, recibirás 2 pases gratuitos.';
 const endAt=Date.now()+5000;clearInterval(runtime.adTimer);
 const tick=()=>{const left=Math.max(0,Math.ceil((endAt-Date.now())/1000));$('#adCount').textContent=left>0?`Finaliza en ${left} s`:'Completado';if(left<=0){clearInterval(runtime.adTimer);completeAd()}};
 tick();runtime.adTimer=setInterval(tick,250);return true;
}
function completeAd(){
 state.reward.adsToday=Math.min(5,state.reward.adsToday+1);const context=runtime.adContext;runtime.adContext=null;$('#adScreen').classList.remove('open');$('#adScreen').setAttribute('aria-hidden','true');
 if(context==='unlock'&&runtime.pendingUnlock){const {id,ep}=runtime.pendingUnlock;if(validEp(id,ep)){unlockEpisode(id,ep);runtime.pendingUnlock=null;saveState();syncBodyLock();renderAll();playSeries(id,ep);toast('Episodio desbloqueado por anuncio');return}}
 state.freePasses+=2;saveState();syncBodyLock();renderAll();toast('+2 pases gratuitos obtenidos');
}
function renderCoinPackages(){const packs=[{coins:120,label:'Paquete inicial'},{coins:300,label:'Paquete medio'},{coins:650,label:'Paquete grande'},{coins:1400,label:'Paquete máximo'}];$('#coinPackages').innerHTML=packs.map(pack=>`<button type="button" class="package ${runtime.selectedPackage===pack.coins?'selected':''}" data-package="${pack.coins}" aria-pressed="${runtime.selectedPackage===pack.coins?'true':'false'}"><b>${icon('coins')}${pack.coins} monedas</b><span>${esc(pack.label)} · LOCAL</span></button>`).join('')}
function simulatePurchase(){state.coins+=runtime.selectedPackage;saveState();closeLayer('coinModal');renderAll();toast(`Recarga local: +${runtime.selectedPackage} monedas`)}
function toggleVip(){state.vip=!state.vip;saveState();renderAll();renderEpisodes();toast(state.vip?'VIP activado':'VIP desactivado')}
