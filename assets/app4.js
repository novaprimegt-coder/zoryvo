/* ---------- history / share / diagnostics ---------- */
function renderHistory(){
 const seen=new Set();const items=state.history.filter(item=>{const key=`${item.id}:${item.ep}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,25);$('#historyEmpty').classList.toggle('hidden',items.length>0);
 $('#historyList').innerHTML=items.map(item=>{const series=getSeries(item.id);if(!series)return '';const p=state.progress[item.id];return `<button type="button" class="continue-item" data-play-series="${esc(item.id)}" data-ep="${item.ep}"><div class="continue-thumb" style="--c1:${esc(series.c1)};--c2:${esc(series.c2)}"><span>${icon('play')}</span></div><div class="continue-info"><b>${esc(series.name)}</b><span>Episodio ${item.ep}${p&&p.ep===item.ep?` · ${Math.round(p.percent)}%`:''}</span></div><span class="continue-arrow">${icon('chevron-right')}</span></button>`}).join('');
}
async function copyText(text){
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch{}
 try{const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(area);area.select();const ok=document.execCommand?.('copy')===true;area.remove();return ok}catch{return false}
}
async function shareCurrent(){
 const series=runtime.activeSeries,text=`Estoy viendo ${series.name}, episodio ${runtime.activeEpisode}, en ZORYVO.`;
 try{if(navigator.share){await navigator.share({title:series.name,text});return}}catch(err){if(err?.name==='AbortError')return}
 const copied=await copyText(text);toast(copied?'Texto copiado para compartir':'No se pudo compartir en este navegador');
}
function runDiagnostics(){
 const checks=[];const add=(name,status,detail)=>checks.push({name,status,detail});
 const ids=$$('[id]').map(el=>el.id),unique=new Set(ids);add('Estructura DOM',ids.length===unique.size?'pass':'fail',ids.length===unique.size?`${ids.length} IDs únicos`:'Hay IDs duplicados');
 add('Catálogo',SERIES.length>0&&SERIES.every(s=>validSeriesId(s.id)&&Number.isInteger(s.episodes)&&s.episodes>=FREE_EPISODES)?'pass':'fail',`${SERIES.length} series validadas`);
 const normalized=normalizeState(state);add('Integridad del estado',JSON.stringify(normalized)===JSON.stringify(state)?'pass':'warn','Estado normalizable y protegido contra IDs inválidos');
 add('Almacenamiento',runtime.storageMode==='persistent'?'pass':'warn',runtime.storageMode==='persistent'?'Persistencia local disponible':'Usando memoria temporal; el navegador bloqueó localStorage');
 const video=document.createElement('video');add('Video HTML5',typeof video.canPlayType==='function'?'pass':'fail',typeof video.canPlayType==='function'?'Elemento video compatible':'No disponible');
 add('Pantalla completa',document.fullscreenEnabled===true?'pass':'warn',document.fullscreenEnabled===true?'API disponible':'Puede no estar disponible en este contexto');
 add('Compartir',typeof navigator.share==='function'?'pass':'warn',typeof navigator.share==='function'?'Web Share disponible':'Se utilizará copia al portapapeles como alternativa');
 add('Accesibilidad básica',$$('button:not([type])').length===0?'pass':'warn',$$('button:not([type])').length===0?'Botones con tipo explícito':'Hay botones sin tipo explícito');
 add('Iconografía SVG',(()=>{const uses=$$('svg.ui-icon use');return uses.length>0&&uses.every(use=>{const href=use.getAttribute('href')||'';return href.startsWith('#i-')&&document.querySelector(href)})})()?'pass':'fail',`${$$('svg.ui-icon use').length} iconos semánticos vinculados al sistema interno`);
 add('AppCreator24 · referido',(()=>{const link=$('.appcreator-referral');return !!link&&link.getAttribute('href')==='go:ZORYVO'})()?'pass':'fail','El botón Ver anuncio usa exactamente go:ZORYVO');
 const score=Math.round(checks.filter(c=>c.status==='pass').length/checks.length*100);const fails=checks.filter(c=>c.status==='fail').length;
 $('#diagnosticsBody').innerHTML=`<div class="diag-summary"><div class="diag-score">${score}%</div><div><b>${fails?'Se detectaron fallas':'Base operativa sin fallas críticas detectadas'}</b><span>${checks.length} comprobaciones en este navegador · V${APP_VERSION}</span></div></div><div class="diag-list">${checks.map(c=>`<div class="diag-item ${c.status}"><div class="diag-icon">${icon(c.status==='pass'?'check':c.status==='warn'?'alert':'x')}</div><div><b>${esc(c.name)}</b><span>${esc(c.detail)}</span></div><div class="diag-status">${c.status==='pass'?'OK':c.status==='warn'?'AVISO':'FALLO'}</div></div>`).join('')}</div>`;
 return {score,checks};
}
function resetDemo(){Storage.remove(STORAGE_KEY);Storage.set(MIGRATION_KEY,'1');state=cloneDefault();runtime.activeSeries=SERIES[0];runtime.activeEpisode=1;runtime.pendingUnlock=null;runtime.activeGenre='Todos';runtime.currentSort='popular';runtime.didMigrate=false;$('#searchInput').value='';$('#sortSelect').value='popular';closeLayer('resetModal');saveState();renderAll();toast('ZORYVO V4.0.6 restablecido')}

/* ---------- global events ---------- */
document.addEventListener('click',event=>{
 const nav=event.target.closest('[data-view]');if(nav){switchView(nav.dataset.view);return}
 const close=event.target.closest('[data-close]');if(close){closeLayer(close.dataset.close);return}
 const seriesCard=event.target.closest('[data-series]');if(seriesCard){openDetail(seriesCard.dataset.series);return}
 const play=event.target.closest('[data-play-series]');if(play){playSeries(play.dataset.playSeries,Number(play.dataset.ep)||1);return}
 const lib=event.target.closest('[data-toggle-library]');if(lib){toggleLibrary(lib.dataset.toggleLibrary);return}
 const chip=event.target.closest('[data-genre]');if(chip){runtime.activeGenre=genres().includes(chip.dataset.genre)?chip.dataset.genre:'Todos';renderHome();renderDiscover();return}
 const task=event.target.closest('[data-task]');if(task){claimTask(task.dataset.task);return}
 const pack=event.target.closest('[data-package]');if(pack){runtime.selectedPackage=Math.max(1,Number(pack.dataset.package)||120);renderCoinPackages();return}
 const setting=event.target.closest('[data-setting]');if(setting){const key=setting.dataset.setting;if(!(key in state.settings))return;state.settings[key]=!state.settings[key];saveState();renderProfile();toast(`${setting.parentElement?.querySelector('.setting-info b')?.textContent||'Ajuste'} ${state.settings[key]?'activado':'desactivado'}`);return}
 const choice=event.target.closest('[data-choice]');if(choice&&INTERACTIVE_CHOICES.has(choice.dataset.choice)){state.interactive[`${runtime.activeSeries.id}:${runtime.activeEpisode}`]=choice.dataset.choice;saveState();renderInteractive();toast(`Decisión guardada: ${choice.dataset.choice}`);return}
});
document.addEventListener('keydown',event=>{
 if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('.series-card[data-series]')){event.preventDefault();openDetail(event.target.dataset.series);return}
 if(event.key==='Escape'){
   if($('#adScreen').classList.contains('open'))return;
   const layer=topOpenLayer();if(layer){closeLayer(layer.id);return}
   if($('#player').classList.contains('open')){closePlayer();return}
 }
 const layer=topOpenLayer();if(layer)trapFocus(event,layer);else if($('#player').classList.contains('open'))trapFocus(event,$('#playerStage'));
});

$('#topProfileButton').addEventListener('click',()=>switchView('profile'));
$('#searchInput').addEventListener('input',renderDiscover);
$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';renderDiscover();$('#searchInput').focus()});
$('#sortSelect').addEventListener('change',event=>{runtime.currentSort=['popular','new','episodes','az'].includes(event.target.value)?event.target.value:'popular';renderDiscover()});
$('#notificationsButton').addEventListener('click',()=>{renderNotifications();openLayer('notificationSheet')});
$('#storageButton').addEventListener('click',openStorageStatus);
$('#coinButton').addEventListener('click',()=>{renderCoinPackages();openLayer('coinModal')});
$('#simulateCoinPurchase').addEventListener('click',simulatePurchase);
$('#heroPlay').addEventListener('click',()=>{const featured=getFeaturedSeries();playSeries(featured.id,nextPlayableEpisode(featured))});
$('#heroInfo').addEventListener('click',()=>openDetail(getFeaturedSeries().id));
$('#claimDaily').addEventListener('click',claimDaily);
$('#vipSetting').addEventListener('click',()=>openLayer('vipModal'));
$('#toggleVip').addEventListener('click',toggleVip);
$('#historySetting').addEventListener('click',()=>{renderHistory();openLayer('historySheet')});
$('#diagnosticsSetting').addEventListener('click',()=>{runDiagnostics();openLayer('diagnosticsSheet')});
$('#resetSetting').addEventListener('click',()=>openLayer('resetModal'));
$('#confirmReset').addEventListener('click',resetDemo);
$('#useFreePass').addEventListener('click',()=>confirmUnlock('pass'));
$('#unlockCoins').addEventListener('click',()=>confirmUnlock('coins'));
$('#unlockByAd').addEventListener('click',()=>startAd('unlock'));
$('#closePlayer').addEventListener('click',closePlayer);
$('#episodesButton').addEventListener('click',()=>{renderEpisodes();openLayer('episodeSheet')});
$('#nextButton').addEventListener('click',nextEpisode);
$('#likeButton').addEventListener('click',()=>toggleLike(runtime.activeSeries.id));
$('#playerLibrary').addEventListener('click',()=>toggleLibrary(runtime.activeSeries.id));
$('#shareButton').addEventListener('click',shareCurrent);
$('#centerPlay').addEventListener('click',togglePlayback);
$('#video').addEventListener('click',togglePlayback);
$('#muteButton').addEventListener('click',toggleMute);
$('#retryVideo').addEventListener('click',retryVideo);
$('#fullscreenButton').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('#playerStage').requestFullscreen?.();else await document.exitFullscreen?.()}catch{toast('Pantalla completa no disponible')}});
$('#timelineRange').addEventListener('input',seekFromRange);
$('#video').addEventListener('loadstart',()=>showVideoLoading(true));
$('#video').addEventListener('loadeddata',()=>showVideoLoading(false));
$('#video').addEventListener('playing',()=>{showVideoLoading(false);showVideoError(false);updatePlayUi()});
$('#video').addEventListener('waiting',()=>showVideoLoading(true));
$('#video').addEventListener('pause',()=>{updatePlayUi();saveCurrentProgress(true)});
$('#video').addEventListener('play',updatePlayUi);
$('#video').addEventListener('timeupdate',()=>{updateTimeline();saveCurrentProgress(false)});
$('#video').addEventListener('error',()=>{if($('#player').classList.contains('open')){showVideoError(true);updatePlayUi()}});
$('#video').addEventListener('ended',()=>{markCompleted();updatePlayUi();if(state.settings.autoplay&&runtime.activeEpisode<runtime.activeSeries.episodes)setTimeout(()=>nextEpisode(),420);else toast(runtime.activeEpisode<runtime.activeSeries.episodes?'Episodio completado':'Serie completada')});
window.addEventListener('beforeunload',()=>saveCurrentProgress(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveCurrentProgress(true)});

/* ---------- boot ---------- */
resetAdDay();saveState();if(runtime.didMigrate){Storage.set(MIGRATION_KEY,'1');runtime.didMigrate=false}renderAll();updateStorageIndicator();
window.ZORYVODebug={version:APP_VERSION,runDiagnostics,getState:()=>JSON.parse(JSON.stringify(state)),normalizeState,playSeries,switchView};window.JMShortDebug=window.ZORYVODebug;
