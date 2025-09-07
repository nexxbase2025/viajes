(function(){
  // -------- i18n helpers --------
  function detectLang(){
    try{
      var forced = localStorage.getItem('tf_lang_forced');
      if (forced && forced !== 'auto') return forced;
      var sel = document.getElementById('langSel');
      if (sel && sel.value && sel.value !== 'auto') return sel.value;
    }catch(e){}
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.indexOf('es') === 0 ? 'es' : 'en';
  }
  // Prefer global t() if app provides it
  function tt(key, en, es){
    try{
      if (typeof t === 'function') return t(key);
    }catch(e){}
    return detectLang() === 'es' ? (es || en || key) : (en || key);
  }

  // -------- platform detection --------
  function isStandalone(){
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  function isIOS(){
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  function isAndroid(){
    return /Android/i.test(navigator.userAgent);
  }
  function isDesktop(){
    return !isIOS() && !isAndroid();
  }

  // -------- UI elements --------
  var bubble, headerBtn, iosDlg, iosTitle, iosBody;

  function ensureRefs(){
    bubble    = document.getElementById('installBubble');
    headerBtn = document.getElementById('btnInstall'); // header "Install" button
    iosDlg    = document.getElementById('installHowToDlg');
    iosTitle  = document.getElementById('installHowToTitle');
    iosBody   = document.getElementById('installHowToBody');
  }

  function setLabels(){
    var lang = detectLang();
    if (bubble){
      bubble.textContent = lang === 'es' ? 'Instalar' : 'Install';
      bubble.setAttribute('aria-label', bubble.textContent);
    }
    if (headerBtn){
      headerBtn.textContent = lang === 'es' ? 'Instalar' : 'Install';
      headerBtn.setAttribute('aria-label', headerBtn.textContent);
    }
    if (iosTitle){
      iosTitle.textContent = lang === 'es' ? 'Cómo instalar' : 'How to install';
    }
    if (iosBody){
      iosBody.innerHTML = lang === 'es'
        ? "En Safari, toca el botón <b>Compartir</b> y luego selecciona <b>Añadir a pantalla de inicio</b>."
        : "In Safari, tap the <b>Share</b> button and then select <b>Add to Home Screen</b>.";
    }
  }

  // -------- behavior --------
  function showIOSInstructionsOnce(){
    var key = 'dwcs_ios_hint_shown';
    if (localStorage.getItem(key) === '1') return; // already shown once
    if (iosDlg && iosDlg.showModal){
      iosDlg.showModal();
    } else {
      alert(tt('howto_body',
        "Open in Safari → Share → Add to Home Screen → Confirm.",
        "Abre en Safari → Compartir → Añadir a pantalla de inicio → Confirmar."));
    }
    localStorage.setItem(key, '1');
  }

  function handleInstallClick(){
    // iOS: show instructions once
    if (isIOS()){
      showIOSInstructionsOnce();
      return;
    }
    // Non-iOS: use beforeinstallprompt when available
    var bip = window.deferredPrompt || window.__bip || null;
    if (bip && typeof bip.prompt === 'function'){
      try{
        bip.prompt();
        bip.userChoice && bip.userChoice.then(function(choice){
          if (choice && choice.outcome === 'accepted'){
            hideInstallUI();
          }
          window.deferredPrompt = null;
          window.__bip = null;
        });
      }catch(e){
        fallbackInstallHelp();
      }
      return;
    }
    // Fallback (desktop browsers when no BIP yet)
    fallbackInstallHelp();
  }

  function fallbackInstallHelp(){
    var lang = detectLang();
    var msg = lang === 'es'
      ? "Para instalar, usa el menú del navegador y selecciona 'Instalar aplicación' o 'Añadir a pantalla de inicio'."
      : "To install, use the browser menu and select 'Install app' or 'Add to Home screen'.";
    alert(msg);
  }

  function showInstallUI(){
    ensureRefs(); setLabels();
    var showBubble = true, showHeaderBtn = true;

    if (isStandalone()){
      hideInstallUI();
      return;
    }

    // iOS: only show one-time helper (bubble visible until tapped once), then hide in subsequent sessions
    if (isIOS()){
      var shown = localStorage.getItem('dwcs_ios_hint_shown') === '1';
      showHeaderBtn = !shown; // hide header button after first instruction viewed
      showBubble    = !shown;
    }

    if (bubble)    bubble.hidden = !showBubble;
    if (headerBtn) headerBtn.style.display = showHeaderBtn ? 'inline-flex' : 'none';
  }

  function hideInstallUI(){
    ensureRefs();
    if (bubble)    bubble.hidden = true;
    if (headerBtn) headerBtn.style.display = 'none';
  }

  function wire(){
    ensureRefs(); setLabels();
    // Click on either control triggers same behavior
    if (bubble){
      bubble.addEventListener('click', handleInstallClick);
    }
    if (headerBtn){
      headerBtn.addEventListener('click', handleInstallClick);
    }

    // Language selector live-updates labels
    document.addEventListener('change', function(e){
      if (e && e.target && e.target.id === 'langSel') setLabels();
    });

    // BIP handler (Android/Chrome/Edge/Desktop Chromium)
    window.addEventListener('beforeinstallprompt', function(e){
      e.preventDefault();
      // store globally so both scripts can read it
      window.deferredPrompt = e;
      window.__bip = e;
      showInstallUI();
    });

    // Installed → hide everywhere
    window.addEventListener('appinstalled', function(){
      hideInstallUI();
      // Clean flags so it doesn't reappear
      try { window.deferredPrompt = null; window.__bip = null; } catch(_){}
    });

    // Initial visibility
    document.addEventListener('visibilitychange', function(){
      if (!document.hidden) showInstallUI();
    });
    showInstallUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();