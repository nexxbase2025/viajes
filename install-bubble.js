(function(){
  // Robust language detector (ES/EN)
  function detectLang(){
    try{
      var sel=document.getElementById('langSel');
      if(sel && sel.value && sel.value!=='auto') return sel.value;
    }catch(e){}
    var nav=(navigator.language||navigator.userLanguage||'en').toLowerCase();
    return nav.indexOf('es')===0 ? 'es' : 'en';
  }
  // Expose/override getLang if app uses it
  try{ window.getLang = detectLang; }catch(e){}

  function setBubbleText(){
    var btn=document.getElementById('installBubble');
    if(!btn) return;
    var isEs=detectLang()==='es';
    btn.textContent = isEs ? 'Instalar' : 'Install';
    btn.setAttribute('aria-label', btn.textContent);
  }

  function isStandalone(){
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  function isIOS(){
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function showIOSInstructions(){
    var dlg=document.getElementById('installHowToDlg');
    var title=document.getElementById('installHowToTitle');
    var body=document.getElementById('installHowToBody');
    var es = detectLang()==='es';
    if(title) title.textContent = es ? 'Cómo instalar' : 'How to install';
    if(body) body.innerHTML = es
      ? "En Safari, toca el botón <b>Compartir</b> (el cuadrado con flecha) y luego selecciona <b>Añadir a pantalla de inicio</b>."
      : "In Safari, tap the <b>Share</b> button (the square with the arrow) and then select <b>Add to Home Screen</b>.";
    if(dlg && dlg.showModal){ dlg.showModal(); }
    else{
      alert(es
        ? "En Safari, toca Compartir y luego 'Añadir a pantalla de inicio'."
        : "In Safari, tap Share then 'Add to Home Screen'.");
    }
  }

  function updateInstallBubble(){
    var btn=document.getElementById('installBubble');
    if(!btn) return;
    if(isStandalone()){
      btn.hidden=true;
      return;
    }
    btn.hidden=false; // Always visible on non-installed
  }

  function wireInstall(){
    var btn=document.getElementById('installBubble');
    if(!btn) return;
    btn.addEventListener('click', function(){
      if(isIOS()){
        showIOSInstructions();
      }else if(window.deferredPrompt){
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then(function(choice){
          if(choice && choice.outcome==='accepted'){
            btn.hidden=true;
          }
          window.deferredPrompt=null;
        });
      }else{
        var es = detectLang()==='es';
        alert(es
          ? "Para instalar, usa el menú del navegador y selecciona 'Añadir a pantalla principal'."
          : "To install, use the browser menu and select 'Add to Home screen'.");
      }
    });
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    window.deferredPrompt = e;
    updateInstallBubble();
  });

  window.addEventListener('appinstalled', function(){
    var btn=document.getElementById('installBubble');
    if(btn) btn.hidden=true;
  });

  // Keep label in sync with language selector if present
  document.addEventListener('change', function(e){
    if(e && e.target && e.target.id==='langSel') setBubbleText();
  });

  // Init after DOM ready
  function init(){
    try{ if(typeof applyI18n==='function') applyI18n(); }catch(e){}
    setBubbleText();
    updateInstallBubble();
    wireInstall();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();