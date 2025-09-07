/* === DWCS Export & Clear-Local Patch (drop-in) =======================
   Add after app.js. Safe: only affects Export JSON/TXT and Clear Local buttons.
   - Save As (when supported), fallback download otherwise
   - Prevent dialog auto-close (type=button)
   - Bilingual toasts + confirms
   ===================================================================== */
(function(){
  if (window.__dwcs_export_patch_v2__) return;
  window.__dwcs_export_patch_v2__ = 1;

  function langIsEs(){
    try { return (typeof getLang==='function') ? (getLang()==='es') : (navigator.language||'en').toLowerCase().startsWith('es'); }
    catch(_){ return false; }
  }
  function injectToastStyles(){
    if (document.getElementById('dwcs_toast_css')) return;
    var css = document.createElement('style'); css.id='dwcs_toast_css';
    css.textContent = '.dwcs-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:10px;border:1px solid rgba(0,0,0,.15);background:rgba(20,20,25,.92);color:#fff;font:600 14px/1.1 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:2147483647;opacity:0;transition:opacity .18s ease} .dwcs-toast.show{opacity:1}';
    document.head.appendChild(css);
  }
  function showToast(msgEn, msgEs){
    injectToastStyles();
    var text = langIsEs() ? (msgEs || msgEn) : (msgEn || msgEs);
    var el = document.createElement('div'); el.className='dwcs-toast'; el.textContent=text; document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('show'); });
    setTimeout(function(){ el.classList.remove('show'); setTimeout(function(){ el.remove(); }, 200); }, 1800);
  }

  async function pickAndSaveFile({ suggestedName, mimeType, data }){
    if (window.showSaveFilePicker){
      try{
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description: mimeType.includes('json')?'JSON':'Text', accept: { [mimeType]: [mimeType.includes('json')?'.json':'.txt'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return true;
      }catch(e){
        return false;
      }
    }
    // Fallback: anchor download
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    try {
      if (!localStorage.getItem('dwcs_save_tip_shown')){
        alert(langIsEs()
          ? "Tu navegador guardó el archivo en la carpeta de Descargas por defecto. Para elegir carpeta siempre, activa 'Preguntar dónde guardar' en la configuración del navegador."
          : "Your browser saved the file to the default Downloads folder. To choose a folder every time, enable 'Ask where to save each file' in your browser settings.");
        localStorage.setItem('dwcs_save_tip_shown','1');
      }
    } catch(_){}
    return true;
  }

  function setTypeButton(id){
    var b = document.getElementById(id); if (b) b.setAttribute('type','button');
  }
  function replaceClick(id, fn){
    var b = document.getElementById(id); if (!b) return;
    var clone = b.cloneNode(true);
    clone.setAttribute('type','button');
    clone.addEventListener('click', fn);
    b.parentNode.replaceChild(clone, b);
  }

  function closeBackupDialog(){
    try { document.getElementById('backupDlg')?.close(); } catch(_){}
  }

  function init(){
    // Prevent auto-close on dialog buttons
    ['btnExport','btnExportTXT','btnClearLocal','btnSaveNow'].forEach(setTypeButton);

    // Export JSON
    replaceClick('btnExport', async function(e){
      e.preventDefault(); e.stopPropagation();
      try{
        var data = JSON.stringify((typeof getLocalJobs==='function'? getLocalJobs(): []), null, 2);
        var ok = await pickAndSaveFile({ suggestedName: 'dwcs-backup.json', mimeType: 'application/json', data });
        if (ok){ closeBackupDialog(); showToast('Saved', 'Guardado'); }
      }catch(_){}
    });

    // Export TXT
    replaceClick('btnExportTXT', async function(e){
      e.preventDefault(); e.stopPropagation();
      try{
        var arr = (typeof getLocalJobs==='function') ? getLocalJobs() : [];
        var es = langIsEs();
        var lines = arr.map(function(j,i){
          var lang = es ? 'es-ES' : 'en-US';
          var when = j.pickupAt ? new Date(j.pickupAt).toLocaleString(lang) : '-';
          var head = '#' + (i+1) + ' ' + (j.passenger||'-') + ' — ' + (j.from||'-') + ' → ' + (j.to||'-');
          var body = [
            (es?'Fecha/Hora: ':'Date/Time: ') + when,
            (es?'Precio: ':'Price: ') + (j.price ?? '-'),
            (es?'Acompañantes: ':'Companions: ') + (j.companions ?? '-'),
            (es?'Necesidades: ':'Needs: ') + (j.acc || j.needs || 'N/A'),
            (es?'Ruta: ':'Route: ') + (j.mapUrl || '-'),
            (es?'Cliente: ':'Client: ') + (j.clientName || '-') + ' (' + (j.clientContact || '-') + ')',
            (es?'Notas: ':'Notes: ') + (j.notes || '-')
          ].join('\\n');
          return head + '\\n' + body;
        });
        var content = lines.join('\\n\\n----------------------------------------\\n\\n');
        var ok = await pickAndSaveFile({ suggestedName: 'dwcs-backup.txt', mimeType: 'text/plain', data: content });
        if (ok){ closeBackupDialog(); showToast('Saved', 'Guardado'); }
      }catch(_){}
    });

    // Clear Local
    replaceClick('btnClearLocal', function(e){
      e.preventDefault(); e.stopPropagation();
      var es = langIsEs();
      var sure = confirm(es ? '¿Borrar datos locales? Esta acción no se puede deshacer.' : 'Clear local data? This action cannot be undone.');
      if (!sure) return;
      try{
        localStorage.removeItem('dwcs_jobs');
        if (typeof refreshLocalInfo==='function') refreshLocalInfo();
        if (typeof refreshKPIs==='function') refreshKPIs();
      }catch(_){}
      closeBackupDialog();
      showToast('Cleared', 'Borrado');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();