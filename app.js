import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIBq4ZsRADoKRNoJZkNq-dLWirlSotIPc",
  authDomain: "tripfast-d359d.firebaseapp.com",
  projectId: "tripfast-d359d",
  storageBucket: "tripfast-d359d.firebasestorage.app",
  messagingSenderId: "559477235356",
  appId: "1:559477235356:web:a311792f680f5fd5995759",
  measurementId: "G-CSRR8VWYFZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
try { getAnalytics(app); } catch(e) {}

const DISPATCHERS = ["donbeltranmusic@gmail.com"];
const DRIVERS = ["fmluisorlando@gmail.com"];

const COMPANY = {
  name: "Danbury Wheel Chair Service",
  slogan: "On time, every time!",
  phone: "(203) 748 3433",
  web: "www.danburywheelchairservice.com"
};

// i18n
const STR = {
  en:{install:"Install",signout:"Sign out",welcome:"Welcome",signin:"Sign in to continue",
      new_dispatch:"New dispatch",client:"Client / Requester",client_phone:"Client phone/email",
      pick:"Pickup (origin)",pick_time:"Date/Time",drop:"Dropoff (destination)",
      passenger:"Passenger",age:"Age",companions:"Companions",needs:"Needs / Accessibility",
      need_wheel:"Wheelchair",need_bari:"Bariatric chair",need_stret:"Stretcher",need_oxy:"Oxygen",need_extra:"Extra staff",
      floor:"Destination floor",no_elev:"No elevator?",steps:"# steps",price:"Price (USD)",notes:"Notes",
      driver:"Driver / Vehicle",generate:"Generate summary",send:"Send to driver",
      open_map:"Open map",client_data:"Client data",print:"Print",preview:"Message preview",
      drivers:"Drivers",jobs_today:"Jobs today",scheduled:"Scheduled",my_jobs:"My jobs",
      trips_done:"Trips done",trips_sched:"Scheduled",today:"Today",upcoming:"Upcoming",
      how_to_install:"How to install",howto_title:"Install on iPhone/iPad",
      howto_body:"1) Open in Safari · 2) Tap <b>Share</b> · 3) <b>Add to Home Screen</b> · 4) Confirm.",
      ok:"OK",close:"Close",dispatcher:"Dispatcher",driver_role:"Driver",user:"User",
      alert_fill:"Complete origin and destination",alert_pick_driver:"Pick a driver",
      saved:"Saved and sent to driver.",login_error:"Login error: ",installed:"Installed",
      backup:"Set backup",backup_desc:"Backups are stored on this device. You can export a JSON file anytime.",backup_auto:"Auto‑save summaries",
      export_json:"Export JSON",clear_local:"Clear local",
      send_whatsapp:"Send WhatsApp",send_sms:"Send SMS",send_email:"Send Email",empty:"(empty)",
      saved_local:"Saved locally.", saved_server_fail:"Could not save to server. Saved locally instead."
  },
  es:{install:"Instalar",signout:"Cerrar sesión",welcome:"Bienvenido",signin:"Inicia sesión para continuar",
      new_dispatch:"Nuevo despacho",client:"Cliente / Solicitante",client_phone:"Teléfono/correo del cliente",
      pick:"Recogida (origen)",pick_time:"Fecha/Hora",drop:"Destino (llegada)",
      passenger:"Pasajero",age:"Edad",companions:"Acompañantes",needs:"Necesidades / Accesibilidad",
      need_wheel:"Silla de ruedas",need_bari:"Silla bariátrica",need_stret:"Camilla",need_oxy:"Oxígeno",need_extra:"Personal extra",
      floor:"Piso de destino",no_elev:"¿Sin ascensor?",steps:"# escalones",price:"Precio (USD)",notes:"Notas",
      driver:"Conductor / Vehículo",generate:"Generar resumen",send:"Enviar al conductor",
      open_map:"Abrir mapa",client_data:"Datos del cliente",print:"Imprimir",preview:"Vista previa del mensaje",
      drivers:"Conductores",jobs_today:"Despachos hoy",scheduled:"Programados",my_jobs:"Mis viajes",
      trips_done:"Viajes realizados",trips_sched:"Programados",today:"Hoy",upcoming:"Próximos",
      how_to_install:"Cómo instalar",howto_title:"Instalar en iPhone/iPad",
      howto_body:"1) Abre en Safari · 2) Toca <b>Compartir</b> · 3) <b>Añadir a pantalla de inicio</b> · 4) Confirmar.",
      ok:"OK",close:"Cerrar",dispatcher:"Despachador",driver_role:"Conductor",user:"Usuario",
      alert_fill:"Completa origen y destino",alert_pick_driver:"Selecciona un conductor",
      saved:"Despacho guardado y enviado al conductor.",login_error:"Error de inicio de sesión: ",installed:"Instalada",
      backup:"Configurar respaldo",backup_desc:"Los respaldos se guardan en este dispositivo. Puedes exportar un archivo JSON cuando quieras.",backup_auto:"Auto‑guardar resúmenes",
      export_json:"Exportar JSON",clear_local:"Borrar local",
      send_whatsapp:"Enviar WhatsApp",send_sms:"Enviar SMS",send_email:"Enviar Email",empty:"(vacío)",
      saved_local:"Guardado localmente.", saved_server_fail:"No se pudo guardar en el servidor. Guardado localmente."
  }
};
function getLang(){ const forced=localStorage.getItem('tf_lang_forced'); if(forced && forced!=='auto') return forced; return (navigator.language||'es').toLowerCase().startsWith('es')?'es':'en'; }
function t(k){ const lang=getLang(); return STR[lang][k]||STR.en[k]||k; }
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.getAttribute('data-i18n'); el.innerHTML=t(key); });
  const placeholders=[['#email','email','correo'],['#password','password','contraseña'],['#clientName','Name and phone','Nombre y teléfono'],['#clientContact','+1 … or email','+1 … o correo'],['#from','Exact address…','Dirección exacta…'],['#to','Address or reference…','Dirección o referencia…'],['#passenger','First and last name','Nombre y apellido'],['#notes','Additional instructions…','Indicaciones adicionales…'],['#clientSendTo','WhatsApp (+1...), SMS (+1...), or email','WhatsApp (+1...), SMS (+1...) o correo']];
  const es=getLang()==='es'; placeholders.forEach(([sel,en,esTxt])=>{ const el=document.querySelector(sel); if(el) el.setAttribute('placeholder', es?esTxt:en); });
  const pill=document.getElementById('rolePill'); if(pill?.dataset?.role){ const map={dispatcher:'dispatcher',driver:'driver_role',user:'user'}; pill.textContent=t(map[pill.dataset.role]||'user'); }
}
const sel=document.getElementById('langSel'); sel.value=localStorage.getItem('tf_lang_forced')||'auto'; sel.addEventListener('change',()=>{ localStorage.setItem('tf_lang_forced', sel.value); location.reload(); });
const $=(s)=>document.querySelector(s);

// Fleet
const DEFAULT_DRIVERS=[{id:'YbrStIOyf7NGabgUvlkbOqiR7cq2',email:'fmluisorlando@gmail.com',name:'Luis Orlando',phone:'+1',vehicle:'Ford Transit',plate:'—',whatsapp:'+1'}];
let fleet=[...DEFAULT_DRIVERS];
async function loadDrivers(){ try{ const snap=await getDocs(collection(db,'drivers')); const list=[]; snap.forEach(d=>list.push(d.data())); if(list.length) fleet=list; }catch(e){} }
function paintFleet(){
  $('#kpiDrivers').textContent=String(fleet.length);
  const sel=$('#driverSel'); sel.innerHTML=''; fleet.forEach(d=>{ const opt=document.createElement('option'); opt.value=d.id||d.uid||d.email; opt.textContent=`${d.name||d.email} • ${d.vehicle||''} • ${d.plate||''}`; sel.appendChild(opt); });
  const list=$('#fleetList'); list.innerHTML=fleet.map(d=>`<div class="pill" style="margin:4px 6px 6px 0;display:flex;justify-content:space-between;align-items:center;width:100%"><span>🚗 <b>${d.name||d.email}</b> · ${d.vehicle||'—'} · ${d.plate||'—'} · <span class="muted">${d.phone||''}</span></span></div>`).join('');
  updateDriverInfo();
}
function findDriver(id){ return fleet.find(d=>(d.id||d.uid||d.email)==id) || fleet[0]; }
function updateDriverInfo(){ const d=findDriver($('#driverSel').value); if(!d) return; $('#driverInfo').textContent = `Phone: ${d.phone||'—'} · WhatsApp: ${d.whatsapp||'—'} · Email: ${d.email||'—'}`; }
$('#driverSel')?.addEventListener('change', updateDriverInfo);

// Helpers
function accSummary(){ const items=[]; if($('#needWheel').checked) items.push(t('need_wheel')); if($('#needBari').checked) items.push(t('need_bari')); if($('#needStret').checked) items.push(t('need_stret')); if($('#needOxy').checked) items.push(t('need_oxy')); if($('#needExtra').checked) items.push(t('need_extra')); return items.length?items.join(', '):'N/A'; }
function buildMapUrl(pickup,destination){ const enc=encodeURIComponent; const base="https://www.google.com/maps/dir/?api=1"; return `${base}&destination=${enc(destination)}&waypoints=${enc(pickup)}&travelmode=driving&dir_action=navigate`; }
function companyFooter(){ return `\n\n— ${COMPANY.name} • ${COMPANY.slogan}\n☎ ${COMPANY.phone} • ${COMPANY.web}`; }

function collect(){
  const driver=findDriver($('#driverSel').value);
  const from=$('#from').value.trim(); const to=$('#to').value.trim();
  const mapUrl=(from&&to)?buildMapUrl(from,to):'';
  const pickupAt=$('#pickupAt').value? new Date($('#pickupAt').value).toISOString():null;
  return {clientName:$('#clientName').value.trim(), clientContact:$('#clientContact').value.trim(),
    passenger:$('#passenger').value.trim(), age:Number($('#age').value||0), companions:Number($('#companions').value||0),
    from,to,mapUrl,pickupAt, acc:accSummary(), floor:Number($('#floor').value||0), noElev:$('#noElev').value, steps:Number($('#steps').value||0),
    price:Number($('#price').value||0), notes:$('#notes').value.trim(), driver };
}

function renderPreview(){
  const o=collect();
  const when=o.pickupAt ? new Date(o.pickupAt).toLocaleString(getLang()==='es'?'es-ES':'en-US'):'-';
  const msg=`Client: ${o.clientName} (${o.clientContact})\nPassenger: ${o.passenger} • ${o.age? t('age')+': '+o.age:''} • ${t('companions')}: ${o.companions}\n${t('pick')}: ${o.from}\n${t('drop')}: ${o.to}\n${t('pick_time')}: ${when}\n${t('needs')}: ${o.acc}\nBuilding: ${t('floor')} ${o.floor} • ${o.noElev==='yes'?t('no_elev'):'Elevator'} • ${t('steps')}: ${o.steps}\n${t('price')}: ${o.price}\nNotes: ${o.notes||'-'}\nROUTE: ${o.mapUrl}` + companyFooter();
  $('#preview').textContent=msg;
  return {msg,data:o};
}

// Local storage
function getLocalJobs(){ try{ return JSON.parse(localStorage.getItem('dwcs_jobs')||'[]'); }catch(e){ return []; } }
function setLocalJobs(a){ localStorage.setItem('dwcs_jobs', JSON.stringify(a)); }
function saveLocalJob(job){ const a=getLocalJobs(); const id=Date.now()+'_'+Math.random().toString(36).slice(2,8); a.push({...job,id,status:job.status||'draft', savedAt:new Date().toISOString()}); setLocalJobs(a); return id; }
function updateLocalJob(id,patch){ const a=getLocalJobs(); const i=a.findIndex(x=>x.id===id); if(i>=0){ a[i]={...a[i],...patch}; setLocalJobs(a); } }
function getLocalDriverInbox(driverKey){ try{ return JSON.parse(localStorage.getItem('dwcs_inbox_'+driverKey)||'[]'); }catch(e){ return []; } }
function addToLocalDriverInbox(driverKey, job){ const a=getLocalDriverInbox(driverKey); a.push(job); localStorage.setItem('dwcs_inbox_'+driverKey, JSON.stringify(a)); }

function refreshLocalInfo(){ const arr=getLocalJobs(); const todayStr=(new Date()).toDateString(); let today=0; let future=0; arr.forEach(j=>{ const when=j.pickupAt? new Date(j.pickupAt):null; if(!when) return; if(when.toDateString()===todayStr) today++; if(when>new Date()) future++; }); $('#localInfo').textContent = `${arr.length} local items • ${today} today`; }

// KPIs from server + local
async function refreshKPIs(){
  const itemsToday=[], itemsFuture=[]; const now=new Date(); const todayStr=now.toDateString();

  // Firestore
  try{
    const all=await getDocs(query(collection(db,'jobs')));
    all.forEach(d=>{ const j=d.data(); const when=j.pickupAt?.toDate? j.pickupAt.toDate() : (j.pickupAt? new Date(j.pickupAt):null); if(!when) return;
      const line=`${when.toLocaleString(getLang()==='es'?'es-ES':'en-US')} — ${j.passenger} · ${j.from} → ${j.to} · $${j.price||'-'}`;
      if(when.toDateString()===todayStr) itemsToday.push(line);
      if(when>now) itemsFuture.push(line);
    });
  }catch(e){ /* ignore */ }

  // Local
  getLocalJobs().forEach(j=>{ const when=j.pickupAt? new Date(j.pickupAt):null; if(!when) return;
    const line=`${when.toLocaleString(getLang()==='es'?'es-ES':'en-US')} — ${j.passenger} · ${j.from} → ${j.to} · $${j.price||'-'} (local)`;
    if(when.toDateString()===todayStr) itemsToday.push(line);
    if(when>now) itemsFuture.push(line);
  });

  $('#kpiToday').textContent=String(itemsToday.length);
  $('#kpiPending').textContent=String(itemsFuture.length);
  $('#kpiTodayCard').onclick=()=>openListDlg(t('jobs_today'), itemsToday);
  $('#kpiPendingCard').onclick=()=>openListDlg(t('scheduled'), itemsFuture);
}

function openListDlg(title, lines){ $('#listDlgTitle').textContent=title; $('#listDlgBody').textContent=lines.length?lines.join('\n'):t('empty'); $('#listDlg').showModal(); }
function urlify(text){ const urlRegex=/(https?:\/\/[^\s]+)/g; return text.replace(urlRegex, (url)=>'<a class="link" href="'+url+'" target="_self">'+url+'</a>'); }

// Driver view merge (server + local mirror)
async function loadDriverJobs(user){
  const now=new Date(); const todayStr=now.toDateString(); const today=[], upcoming=[], done=[];

  const driverKey = user.uid || user.email;
  // Firestore
  try{
    const my=await getDocs(query(collection(db,'jobs'), where('driverRef','==', driverKey)));
    my.forEach(d=>{ const j=d.data(); const when=j.pickupAt?.toDate? j.pickupAt.toDate() : (j.pickupAt? new Date(j.pickupAt):null);
      const baseTxt = `# ${j.passenger} — ${j.from} → ${j.to}\n${t('pick_time')}: ${when?when.toLocaleString(getLang()==='es'?'es-ES':'en-US'):'-'}\n${t('price')}: ${j.price||'-'}\n${t('needs')}: ${j.needs||'N/A'}\nROUTE: ${j.mapUrl}` + companyFooter();
      const baseHtml=urlify(baseTxt).replaceAll('\n','<br/>');
      const card=`<div>${baseHtml}</div>`;
      if(when && when<now) done.push(card);
      if(when && when.toDateString()===todayStr) today.push(card);
      if(when && when>now) upcoming.push(card);
    });
  }catch(e){}

  // Local mirror inbox (same device testing)
  getLocalDriverInbox(driverKey).forEach(j=>{
    const when=j.pickupAt? new Date(j.pickupAt):null;
    const baseTxt = `# ${j.passenger} — ${j.from} → ${j.to}\n${t('pick_time')}: ${when?when.toLocaleString(getLang()==='es'?'es-ES':'en-US'):'-'}\n${t('price')}: ${j.price||'-'}\n${t('needs')}: ${j.acc||'N/A'}\nROUTE: ${j.mapUrl}` + companyFooter();
    const baseHtml=urlify(baseTxt).replaceAll('\n','<br/>');
    const card=`<div>${baseHtml}</div>`;
    if(when && when<now) done.push(card);
    if(when && when.toDateString()===todayStr) today.push(card);
    if(when && when>now) upcoming.push(card);
  });

  $('#drv_today').innerHTML=today.join('<br/><br/>')||t('empty');
  $('#drv_upcoming').innerHTML=upcoming.join('<br/><br/>')||t('empty');
  $('#drv_done_count').textContent=String(done.length);
  $('#drv_sched_count').textContent=String(upcoming.length);
}

// Auth / routing
const sectionAuth=$('#sectionAuth'); const dispatcherUI=$('#dispatcherUI'); const driverUI=$('#driverUI'); const rolePill=$('#rolePill');
const btnSignIn=$('#btnSignIn'); const btnSignOut=$('#btnSignOut');
btnSignIn.addEventListener('click', async ()=>{ const email=$('#email').value.trim(); const password=$('#password').value; try{ await signInWithEmailAndPassword(auth,email,password); }catch(e){ alert(t('login_error')+e.message); } });
btnSignOut.addEventListener('click', async ()=>{ await signOut(auth); });
function showOnly(s){ sectionAuth.style.display='none'; dispatcherUI.style.display='none'; driverUI.style.display='none'; s.style.display='block'; }
function landing(){ showOnly(sectionAuth); }

onAuthStateChanged(auth, async (user)=>{
  if(!user){ rolePill.textContent='—'; rolePill.dataset.role=''; landing(); return; }
  $('#btnSignOut').style.display='inline-flex';
  await loadDrivers(); paintFleet();
  const email=user.email||'';
  if(DISPATCHERS.includes(email)){ rolePill.dataset.role='dispatcher'; rolePill.textContent=t('dispatcher'); showOnly(dispatcherUI); await refreshKPIs(); }
  else if(DRIVERS.includes(email)){ rolePill.dataset.role='driver'; rolePill.textContent=t('driver_role'); showOnly(driverUI); await loadDriverJobs(user); }
  else { rolePill.dataset.role='user'; rolePill.textContent=t('user'); landing(); alert('No role assigned for this account.'); }
  applyI18n();
});

// Buttons
document.getElementById('btnPreview').addEventListener('click', ()=>{
  const {data}=renderPreview();
  if(!data.from || !data.to){ alert(t('alert_fill')); return; }
  const id=saveLocalJob({...data,status:'draft'});
  refreshLocalInfo(); refreshKPIs();
  alert(t('saved_local'));
});

document.getElementById('btnSendDriver').addEventListener('click', async ()=>{
  const {data}=renderPreview();
  if(!data.from || !data.to){ alert(t('alert_fill')); return; }
  if(!data.driver){ alert(t('alert_pick_driver')); return; }
  // Try server
  let serverOk=false;
  try{
    const job={createdAt:serverTimestamp(), pickupAt:data.pickupAt||null, from:data.from,to:data.to,mapUrl:data.mapUrl,
      passenger:data.passenger,age:data.age,companions:data.companions, needs:data.acc, floor:data.floor,noElev:data.noElev,steps:data.steps,
      price:data.price,notes:data.notes, clientName:data.clientName,clientContact:data.clientContact,
      driverRef:data.driver.id||data.driver.uid||data.driver.email, driverEmail:data.driver.email||null, status:'scheduled'};
    await addDoc(collection(db,'jobs'), job);
    serverOk=true;
  }catch(e){ /* swallow */ }
  // Always store/mark locally
  const id=saveLocalJob({...data,status:'sent'});
  // Mirror into local inbox for driver (same device testing)
  const driverKey=data.driver.id||data.driver.uid||data.driver.email;
  addToLocalDriverInbox(driverKey, {...data,status:'sent'});
  refreshLocalInfo(); refreshKPIs();
  alert(serverOk? t('saved') : t('saved_server_fail'));
});

document.getElementById('btnMap').addEventListener('click', ()=>{ const {data}=renderPreview(); if(!data.mapUrl) return alert(t('alert_fill')); document.getElementById('btnMap').href=data.mapUrl; });
document.getElementById('btnPrint').addEventListener('click', ()=>window.print());

// Client dialog
document.getElementById('btnClientData').addEventListener('click', ()=>{ const {msg}=renderPreview(); document.getElementById('clientPreview').textContent=msg; document.getElementById('clientDlg').showModal(); });
document.getElementById('sendToWA').addEventListener('click',(e)=>{ e.preventDefault(); const to=document.getElementById('clientSendTo').value.replace(/\D/g,''); const {msg}=renderPreview(); if(!to) return; window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`,'_blank'); });
document.getElementById('sendToSMS').addEventListener('click',(e)=>{ e.preventDefault(); const to=document.getElementById('clientSendTo').value.replace(/\D/g,''); const {msg}=renderPreview(); if(!to) return; const body=encodeURIComponent(msg); const url = navigator.userAgent.match(/(iPhone|iPad)/) ? `sms:${to}&body=${body}` : `sms:${to}?body=${body}`; location.href=url; });
document.getElementById('sendToEmail').addEventListener('click',(e)=>{ e.preventDefault(); const to=document.getElementById('clientSendTo').value.trim(); const {msg}=renderPreview(); if(!to) return; const subject=encodeURIComponent('Dispatch'); window.open(`mailto:${to}?subject=${subject}&body=${encodeURIComponent(msg)}`,'_blank'); });

// Backup dialog
document.getElementById('btnBackup').addEventListener('click', ()=>{ document.getElementById('backupDlg').showModal(); document.getElementById('autoSave').checked = localStorage.getItem('dwcs_auto_save')==='1'; refreshLocalInfo(); });
document.getElementById('btnSaveNow').addEventListener('click', ()=>{ const {data}=renderPreview(); saveLocalJob({...data,status:'draft'}); refreshLocalInfo(); refreshKPIs(); alert(t('saved_local')); });
document.getElementById('autoSave').addEventListener('change', (e)=>{ localStorage.setItem('dwcs_auto_save', e.target.checked ? '1':'0'); });
document.getElementById('btnExport').addEventListener('click', (e)=>{ e.preventDefault(); const data = JSON.stringify(getLocalJobs(), null, 2); const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='dwcs-backup.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 1000); });
document.getElementById('btnClearLocal').addEventListener('click', (e)=>{ e.preventDefault(); if(confirm('Clear local data?')){ localStorage.removeItem('dwcs_jobs'); refreshLocalInfo(); refreshKPIs(); } });

// PWA install + SW
let deferredPrompt=null;
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true; }
function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; }

function showAndroidHowTo(){
  const dlg=document.getElementById('howTo'); if(!dlg) return;
  const body=document.getElementById('howto_body'); if(body){
    body.innerHTML=(getLang && getLang()==='es')
      ? "Toca <b>Instalar</b> para agregar esta app a tu pantalla de inicio."
      : "Tap <b>Install</b> to add this app to your home screen.";
  }
  dlg.showModal();
  dlg.addEventListener('close',()=>localStorage.setItem('dwcs_android_hint_shown','1'),{once:true});
}

function showIOSHowTo(){
  const dlg=document.getElementById('howTo'); if(!dlg) return;
  const body=document.getElementById('howto_body'); if(body){
    body.innerHTML = (typeof t==='function') ? t('howto_body') :
      "Open in Safari → Share → Add to Home Screen → Confirm.";
  }
  dlg.showModal();
  dlg.addEventListener('close',()=>localStorage.setItem('dwcs_ios_hint_shown','1'),{once:true});
}

// ANDROID: manejar el evento de instalación nativo y mostrar nuestra burbuja
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault();
  deferredPrompt=e;
  // Expose to window for the non-module helper (keeps behavior consistent)
  try { window.deferredPrompt = e; } catch(_) {}
  // Mostrar solo si no está instalada ni mostrado antes y no es iOS
  if(!isStandalone() && !localStorage.getItem('dwcs_android_hint_shown') && !isIOS()){
    showAndroidHowTo();
    const btnOk=document.querySelector('#howTo button.btn');
    if(btnOk){
      btnOk.onclick=async()=>{
        const dlg=document.getElementById('howTo'); if(dlg) dlg.close();
        try{
          deferredPrompt.prompt();
          const {outcome}=await deferredPrompt.userChoice;
          if(outcome==='accepted'){ localStorage.setItem('dwcs_android_hint_shown','1'); }
        }finally{
          deferredPrompt=null;
          try { window.deferredPrompt = null; } catch(_) {}
        }
      };
    }
  }
});

window.addEventListener('appinstalled',()=>{ deferredPrompt=null; try { window.deferredPrompt = null; } catch(_) {} });

// iOS: mostrar instrucciones una vez si no está instalada
if(isIOS() && !isStandalone() && !localStorage.getItem('dwcs_ios_hint_shown')){
  showIOSHowTo();
}

// Registrar SW (se mantiene igual)
if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('./sw.js?v=dwcs-v5'); }); }

// Initial
applyI18n();