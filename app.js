const S="nicheSlotV3",DAY=864e5,WEEK=7*DAY,$=id=>document.getElementById(id);
let st=JSON.parse(localStorage.getItem(S)||"null")||{n:null,p:null,m:null,start:0,last:0,dials:0,leads:[],cb:{},tab:1};
let SYNC="lokal",syncT=null;const tokH=()=>({"Content-Type":"application/json","x-sync-token":localStorage.getItem("nsToken")||""});
const save=()=>{st.u=Date.now();localStorage.setItem(S,JSON.stringify(st));clearTimeout(syncT);syncT=setTimeout(push,800)};
async function push(){try{const r=await fetch("/api/state",{method:"PUT",headers:tokH(),body:JSON.stringify(st)});SYNC=r.ok?"☁ gespeichert":"⚠ Cloud-Fehler "+r.status}catch(_){SYNC="⚠ offline, lokal gespeichert"}showSync()}
async function pull(){try{const r=await fetch("/api/state",{headers:tokH()});if(r.status==401){const t=prompt("Sync-Passwort eingeben:");if(t){localStorage.setItem("nsToken",t);return pull()}}
if(!r.ok)throw 0;const c=await r.json();if(c&&(c.u||0)>(st.u||0)){st=c;localStorage.setItem(S,JSON.stringify(st));ui()}else if(!c||(st.u||0)>(c.u||0))push();SYNC="☁ synchron"}catch(_){SYNC="lokal (Cloud nicht erreichbar)"}showSync()}
function showSync(){const e=$("sync");if(e)e.textContent=SYNC}
const STAT=["Neu","Nicht erreicht","Kein Interesse","Rückruf","Demo geplant","Angebot raus","Gewonnen"];
const EXTRA=["Neue Webseite","Social-Media-Content"];
const ALLP=()=>[...Object.keys(PRODUCTS),...EXTRA];
const TABS=["Heute","Drehen","Vorbereiten","Leads","Anrufen","Demo & Abschluss","Bauen","Coach"];
const esc=s=>String(s??"").replace(/[&<>"]/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));
const ctx=()=>{const[pain,does,unit]=PRODUCTS[st.p];return{n:st.n,p:st.p,pain,does,unit,m:st.m}};
const won=()=>st.leads.filter(l=>l.s=="Gewonnen").length;
const demos=()=>st.leads.filter(l=>["Demo geplant","Angebot raus","Gewonnen"].includes(l.s)).length;
const today=()=>new Date().toISOString().slice(0,10);
const day=()=>st.start?Math.min(30,Math.floor((Date.now()-st.start)/DAY)+1):0;
let COPY=[],FR="",FOUND=[];
const say=(t,tip,alt)=>{COPY.push(t);return `<div class="say ${alt?"alt":""}"><button class="cp" data-cp="${COPY.length-1}">Kopieren</button>„${esc(t)}“</div>${tip?`<p class="tip">💡 ${esc(tip)}</p>`:""}`};
const card=(h,b,cls="")=>`<div class="card ${cls}"><h3>${h}</h3>${b}</div>`;
const checks=(id,list)=>list.map((x,i)=>{const k=id+i;return `<label><input type="checkbox" data-c="${k}" ${st.cb[k]?"checked":""}><span>${esc(x)}</span></label>`}).join("");
const it=(t,v)=>`<div class="item"><small>${t}</small>${esc(v)}</div>`;

function stats(){const m=st.m||[0,0],w=won();
$("stats").innerHTML=[["Sprint",st.start?`Tag ${day()}/30`:"–",`<span id="cd"></span>`],["Wählversuche",st.dials,"Ziel: 100"],["Demos",demos(),"Ziel: 8"],["Zusagen",w,"Ziel: 2"],["Umsatz",fmt(w*(m[0]*0.5+m[1])),fmt(w*m[1])+" MRR"]].map(([h,v,s])=>card(h,`<div class="v">${v}</div><p class="muted">${s}</p>`)).join("");tick()}
function tick(){const e=$("cd");if(!e||!st.start)return;const ms=st.start+30*DAY-Date.now();if(ms<=0){e.textContent=won()>=2?"🏆 Geschafft!":"Sprint vorbei";return}
const d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/36e5),mi=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);e.textContent=`noch ${d}T ${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}:${String(s).padStart(2,"0")}`}

function tabs(){$("tabs").innerHTML=TABS.map((t,i)=>{const lock=(![0,1,7].includes(i)&&!st.n)||(i==6&&!won());return `<button class="tab ${st.tab==i?"on":""} ${lock?"lock":""}" data-t="${i}">${lock?"🔒 ":""}${t}</button>`}).join("")}

function panes(){COPY=[];const P=[];const has=!!st.n,c=has?ctx():null;
// 0 Heute
if(!has)P.push(card("Heute",`<p class="txt">Noch kein Sprint aktiv. Geh auf <b>Drehen</b> und starte deine Challenge.</p>`));
else{const [mt,md]=MISSION(day());const due=st.leads.filter(l=>l.f&&l.f<=today()&&!["Gewonnen","Kein Interesse"].includes(l.s));
const G=[["Wählversuche",st.dials,100],["Demos",demos(),8],["Zusagen",won(),2]];
P.push(`<div class="g2">${card(`Mission Tag ${day()} · ${mt}`,`<p class="big">${md}</p><p style="margin-top:12px;color:#c9d4ff">🎯 ${esc(c.p)} für ${esc(c.n)} · ${priceTxt(c.m)}</p>`,"mission")}
${card("Fortschritt",G.map(([l,v,g])=>`<div class="goal"><span>${l}</span><span>${v} / ${g}</span></div><div class="bar"><i style="width:${Math.min(100,v/g*100)}%"></i></div>`).join(""))}</div>
<div style="margin-top:16px">${card(`Heute fällig (${due.length})`,due.length?due.map(l=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)"><span><b>${esc(l.name)}</b> · ${esc(l.s)} · ${esc(l.note||"")}</span><a class="btn ghost sm" href="tel:${esc(l.tel)}">📞 ${esc(l.tel)}</a></div>`).join(""):`<p class="muted">Keine fälligen Rückrufe. Zeit für neue Anrufe!</p>`)}</div>`)}
// 1 Drehen
P.push(card("Schritt 1 · Drehen",`<div class="g3" style="margin:8px 0 20px"><div class="reel" id="r0"></div><div class="reel" id="r1"></div><div class="reel" id="r2"></div></div>
<div class="row"><button class="btn" id="spin">▶ START</button><span class="muted">${st.start&&Date.now()-st.last<WEEK?`Nächster freier Re-Spin in ${Math.ceil((WEEK-(Date.now()-st.last))/DAY)} Tagen`:""}</span></div>
${has?say(`Ich helfe ${c.n}, ${c.pain} zu beenden. Mein ${c.p} ${c.does}.`,"Dein Ein-Satz-Pitch. Lern ihn auswendig."):`<p class="muted" style="margin-top:16px">Drück START, um Nische, Produkt und Preis zu ziehen.</p>`}`));
if(!has){$("panes").innerHTML=P.map((x,i)=>`<section class="pane ${st.tab==i?"on":""}">${x}</section>`).join("");return}
// 2 Vorbereiten
P.push(`<div class="g2">${card("Schritt 2 · Vorbereiten (Tag 1–3)",`<div class="chk">${checks("prep",PREP(c))}</div>`)}
${card("So bereitest du dich vor",`<p class="txt"><b>Wo du Kunden findest:</b> Google Maps („${esc(c.n)} + Stadt“), LinkedIn, Branchenverzeichnisse. Ideal sind Betriebe mit 3 bis 30 Mitarbeitern, dort erreichst du direkt den Chef.</p>
<p class="txt"><b>Was du zeigst:</b> Kein fertiges Produkt, sondern eine Vorschau. Ein Screenshot oder 60-Sekunden-Video, wie der ${esc(c.p)} bei einem typischen Betrieb aussieht, mit einem Beispiel-Dialog. Das reicht für die Demo.</p>
<p class="txt"><b>Dein Angebot:</b> ${priceTxt(c.m)}. Für die ersten 3 Pilotkunden: ${pilotTxt(c.m)}.</p>`)}</div>`);
// 3 Leads
{const opt=v=>ALLP().map(x=>`<option ${x==v?"selected":""}>${esc(x)}</option>`).join("");
const cnt=STAT.map(s=>[s,st.leads.filter(l=>l.s==s).length]);
const pitch=l=>{const pr=PRODUCTS[l.prod];return pr?`Guten Tag, hier ist [Name]. Ich habe mir ${l.name} angeschaut und mir ist aufgefallen: ${l.obs||pr[0]}. Genau dafür habe ich einen ${l.prod} konzipiert, der ${pr[1]}. Darf ich Ihnen zwei kurze Fragen dazu stellen?`:`Guten Tag, hier ist [Name]. Ich habe mir die Webseite von ${l.name} angeschaut und mir ist aufgefallen: ${l.obs||"da ist noch viel Potenzial"}. Ich habe eine Idee, wie Sie mit ${l.prod} mehr Mandanten gewinnen. Darf ich Ihnen zwei kurze Fragen stellen?`};
P.push(card("🔎 Leads finden (Google Maps)",`<div class="row" style="flex-wrap:wrap"><input type="text" id="fQ" value="${esc((st.fq)||c.n+" in Saulheim")}" style="flex:3;min-width:220px" placeholder="z. B. Anwaltskanzlei in Wörrstadt"><button class="btn" id="fGo">Suchen</button></div><div id="fR" style="margin-top:12px">${FR}</div><p class="tip">💡 Tipp: Mehrere Orte nacheinander suchen (Saulheim, Wörrstadt, Nieder-Olm, Alzey …). Schon vorhandene Leads werden markiert.</p>`)+
card("Leads & Rückrufe",`<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:12px">${cnt.map(([s,n])=>`<span class="badge ${s=="Gewonnen"?"ok":""}">${s}: ${n}</span>`).join("")}</div>
<div class="row" style="margin-bottom:8px;flex-wrap:wrap"><input type="text" id="lN" placeholder="Firma / Ansprechpartner" style="flex:2;min-width:170px"><input type="text" id="lC" placeholder="Ort" style="flex:1;min-width:100px"><input type="tel" id="lT" placeholder="Telefon" style="flex:1;min-width:120px"><input type="url" id="lW" placeholder="Webseite" style="flex:1.5;min-width:150px"></div>
<div class="row" style="margin-bottom:14px;flex-wrap:wrap"><input type="text" id="lO" placeholder="Beobachtung / Schwäche, z. B. nur telefonisch buchbar" style="flex:3;min-width:220px"><select id="lP" style="flex:1.5;min-width:170px">${opt(st.p)}</select><input type="text" id="lU" placeholder="Upsell-Ideen" style="flex:1.5;min-width:150px"><button class="btn" id="lAdd">+ Lead</button></div>
${st.leads.length?`<div style="overflow-x:auto"><table><tr><th>Lead</th><th>Schwäche & Pitch</th><th>Einstieg</th><th>Status</th><th>Rückruf am</th><th>Notiz</th><th>Versuche</th><th></th></tr>${st.leads.map((l,i)=>`<tr><td><b>${esc(l.name)}</b>${l.city?`<br><span class="muted">${esc(l.city)}</span>`:""}<br><a class="muted" href="tel:${esc(l.tel)}">${esc(l.tel)}</a>${l.web?`<br><a class="muted" href="${esc(l.web)}" target="_blank">Webseite ↗</a>`:""}</td>
<td style="min-width:220px"><input type="text" data-lb="${i}" value="${esc(l.obs||"")}" placeholder="Schwäche"><details><summary class="muted">Pitch anzeigen</summary><div>${say(pitch(l),"",true)}</div></details></td>
<td><select data-lp="${i}">${opt(l.prod)}</select><input type="text" data-lu="${i}" value="${esc(l.up||"")}" placeholder="Upsell" style="margin-top:4px"></td>
<td><select data-ls="${i}">${STAT.map(s=>`<option ${s==l.s?"selected":""}>${s}</option>`).join("")}</select></td>
<td><input type="date" data-lf="${i}" value="${esc(l.f||"")}"></td><td><input type="text" data-lo="${i}" value="${esc(l.note||"")}"></td>
<td><span class="badge ${l.s=="Gewonnen"?"ok":l.tries>=3?"warn":""}">${l.tries||0}</span></td>
<td class="row"><button class="btn ghost sm" data-ld="${i}">📞 Anruf</button><button class="btn ghost sm" data-lx="${i}">✕</button></td></tr>`).join("")}</table></div>`:`<p class="muted">Noch keine Leads. Trag oben deine ersten 30 ein.</p>`}
<div class="row" style="margin-top:14px;flex-wrap:wrap;gap:8px"><button class="btn ghost sm" id="xJson">⬇ Backup speichern</button><label class="btn ghost sm" style="cursor:pointer">⬆ Backup laden<input type="file" id="iJson" accept=".json" hidden></label><button class="btn ghost sm" id="xCsv">⬇ Als CSV (Excel)</button></div>
<p class="tip" style="margin-top:12px">💡 Leads werden nur in diesem Browser gespeichert. Mach regelmäßig ein Backup. Nach jedem Anruf: Status setzen und, wenn nötig, ein Rückrufdatum eintragen.</p>`))}
// 4 Anrufen
P.push(`<div class="g2">${card("Schritt 3 · Kaltanruf-Skript · Ziel: Demo-Termin",CALL(c).map(([h,t,tip])=>`<div class="step">${h}</div>${say(t,tip)}`).join(""))}
${card("Einwände souverän behandeln",OBJ(c).map(([q,a])=>`<details><summary>${q}</summary><div>${say(a,"",true)}</div></details>`).join("")+`<p class="tip" style="margin-top:12px">💡 Erst Verständnis zeigen, dann eine Frage stellen. Nie diskutieren, sondern den wahren Grund herausfinden.</p>`)}</div>`);
// 5 Demo
P.push(`<div class="g2">${card("Schritt 4 · Demo-Termin & Abschluss",DEMO(c).map(([h,t,tip])=>`<div class="step">${h}</div>${say(t,tip)}`).join(""))}
<div>${card("ROI-Rechner für die Demo",`<p class="txt">Trag die Zahlen ein, die der Kunde im Erstgespräch genannt hat.</p>
<div class="g2"><label class="muted">${esc(c.unit)}<input type="number" id="roiA" value="5" min="0"></label><label class="muted">Wert pro Kunde/Fall in €<input type="number" id="roiB" value="150" min="0"></label></div><div id="roiR" style="margin-top:14px"></div>`)}
<div style="margin-top:16px">${card("Nachfass-Vorlagen",FOLLOW(c).map(([h,t])=>`<details><summary>${h}</summary><div>${say(t,"",true)}</div></details>`).join(""))}</div></div></div>`);
// 6 Bauen
P.push(`<div class="g2">${card("Schritt 5 · Nach dem Ja: Bauen",`<div class="chk">${checks("build",BUILD(c))}</div>`)}
${card("Lieferplan",`<p class="txt"><b>Woche 1:</b> Kickoff und Prototyp.</p><p class="txt"><b>Woche 2:</b> Feedback, Feinschliff, Livegang.</p><p class="txt"><b>Danach:</b> monatliche Betreuung für ${fmt(c.m[1])}. Jeder zufriedene Kunde wird deine Fallstudie für die nächsten ${esc(c.n)}.</p>`)}</div>`);
// 7 Coach
P.push(card("Verkaufs-Coach",COACH.map(([h,t],i)=>`<details ${i==0?"open":""}><summary>${i+1}. ${h}</summary><div>${esc(t)}</div></details>`).join("")));
$("panes").innerHTML=P.map((x,i)=>`<section class="pane ${st.tab==i?"on":""}">${x}</section>`).join("");roi()}
function roi(){const a=$("roiA");if(!a)return;const f=()=>{const lost=(+a.value||0)*(+$("roiB").value||0)*4.3,m=st.m[1],back=lost/3;
$("roiR").innerHTML=`<div class="say">Verlust aktuell: <b>${fmt(lost)}/Monat</b><br>Schon bei einem Drittel zurückgeholt: <b>${fmt(back)}/Monat</b><br>Kosten: <b>${fmt(m)}/Monat</b> → ${back>m?`<b style="color:var(--ok)">Gewinn ${fmt(back-m)} pro Monat</b>`:`<b style="color:#9a6b00">Zahlen nachfragen, Nutzen noch zu klein</b>`}</div>`};a.oninput=$("roiB").oninput=f;f()}
function reels(){const t=["NISCHE","PRODUKT","PREIS"],v=st.n?[st.n,st.p,priceTxt(st.m)]:["?","?","?"];v.forEach((x,i)=>{const r=$("r"+i);if(r)r.innerHTML=`<div class="strip">${it(t[i],x)}</div>`})}
function spin(){if(st.start&&!confirm("Neu drehen startet einen neuen Sprint. Deine Leads bleiben erhalten, Fortschritt und Checklisten werden zurückgesetzt. Fortfahren?"))return;
$("spin").disabled=true;const PK=Object.keys(PRODUCTS),n=NICHES[Math.random()*NICHES.length|0],p=PK[Math.random()*PK.length|0],m=PRICES[Math.random()*PRICES.length|0];
const L=[NICHES,PK,PRICES.map(priceTxt)],F=[n,p,priceTxt(m)],T=["NISCHE","PRODUKT","PREIS"];
F.forEach((f,i)=>{let h="";for(let k=0;k<24;k++)h+=it(T[i],L[i][Math.random()*L[i].length|0]);h+=it(T[i],f);$("r"+i).innerHTML=`<div class="strip">${h}</div>`;const s=$("r"+i).firstChild;
requestAnimationFrame(()=>requestAnimationFrame(()=>{s.style.transition=`transform ${1.6+i*.6}s cubic-bezier(.15,.85,.25,1)`;s.style.transform=`translateY(-${24*160}px)`}))});
setTimeout(()=>{Object.assign(st,{n,p,m,start:Date.now(),last:Date.now(),dials:0,cb:{}});save();ui()},2900)}
function ui(){tabs();panes();stats();reels()}
document.addEventListener("click",e=>{const d=e.target.closest("[data-t],[data-cp],[data-ld],[data-lx],#spin,#lAdd,#reset,#xJson,#xCsv,#fGo,[data-fa]");if(!d)return;
if(d.dataset.t!==undefined){const i=+d.dataset.t;if(![0,1,7].includes(i)&&!st.n)return alert("Erst drehen!");if(i==6&&!won())return alert("Bauen schaltet sich erst nach der ersten Zusage frei. Erst verkaufen, dann bauen!");st.tab=i;save();ui()}
else if(d.dataset.cp!==undefined){navigator.clipboard.writeText(COPY[+d.dataset.cp]);d.textContent="✓ Kopiert";setTimeout(()=>d.textContent="Kopieren",1500)}
else if(d.dataset.ld!==undefined){const l=st.leads[+d.dataset.ld];l.tries=(l.tries||0)+1;st.dials++;save();ui()}
else if(d.dataset.lx!==undefined){if(confirm("Lead löschen?")){st.leads.splice(+d.dataset.lx,1);save();ui()}}
else if(d.id=="spin")spin();
else if(d.id=="lAdd"){const name=$("lN").value.trim();if(!name)return;st.leads.push({name,city:$("lC").value.trim(),tel:$("lT").value.trim(),web:$("lW").value.trim(),obs:$("lO").value.trim(),prod:$("lP").value,up:$("lU").value.trim(),note:"",s:"Neu",f:"",tries:0,added:today()});save();ui()}
else if(d.id=="fGo"){const q=$("fQ").value.trim();if(!q)return;st.fq=q;FR=`<p class="muted">Suche läuft …</p>`;$("fR").innerHTML=FR;
fetch("/api/places?q="+encodeURIComponent(q),{headers:tokH()}).then(r=>r.json()).then(j=>{if(j.error){FR=`<p class="tip">⚠ ${esc(j.error)}</p>`}else{FOUND=j;renderFound()}$("fR").innerHTML=FR}).catch(()=>{FR=`<p class="tip">⚠ Suche nicht erreichbar. Läuft die Seite auf Netlify?</p>`;$("fR").innerHTML=FR})}
else if(d.dataset.fa!==undefined){const f=FOUND[+d.dataset.fa];st.leads.push({name:f.name,city:(f.addr.match(/\d{5} ([^,]+)/)||[])[1]||"",tel:f.tel,web:f.web,obs:[f.web?"":"keine Webseite",f.rating?`Google ${f.rating} (${f.reviews})`:"keine Bewertungen"].filter(Boolean).join(", "),prod:st.p,up:"",note:"",s:"Neu",f:"",tries:0,added:today()});save();renderFound();ui()}
else if(d.id=="xJson")dl("niche-slot-backup-"+today()+".json",JSON.stringify(st,null,1),"application/json");
else if(d.id=="xCsv"){const H=["Firma","Ort","Telefon","Webseite","Schwäche","Einstieg","Upsell","Status","Rückruf","Notiz","Versuche"],q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
dl("leads-"+today()+".csv","\ufeff"+[H,...st.leads.map(l=>[l.name,l.city,l.tel,l.web,l.obs,l.prod,l.up,l.s,l.f,l.note,l.tries||0])].map(r=>r.map(q).join(";")).join("\n"),"text/csv")}
else if(d.id=="reset"){if(confirm("Sprint wirklich zurücksetzen?")){localStorage.removeItem(S);location.reload()}}});
document.addEventListener("change",e=>{const t=e.target,ds=t.dataset;
if(ds.c){st.cb[ds.c]=t.checked;save()}
else if(ds.ls!==undefined){const before=won();st.leads[+ds.ls].s=t.value;save();ui();if(t.value=="Gewonnen"&&before==0)alert("🎉 Erste Zusage! Der Tab „Bauen“ ist jetzt freigeschaltet.")}
else if(ds.lf!==undefined){st.leads[+ds.lf].f=t.value;save()}
else if(ds.lo!==undefined){st.leads[+ds.lo].note=t.value;save()}
else if(ds.lb!==undefined){st.leads[+ds.lb].obs=t.value;save();ui()}
else if(ds.lp!==undefined){st.leads[+ds.lp].prod=t.value;save();ui()}
else if(ds.lu!==undefined){st.leads[+ds.lu].up=t.value;save()}
else if(t.id=="iJson"&&t.files[0]){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.leads))throw 0;if(confirm(`Backup mit ${x.leads.length} Leads laden? Aktueller Stand wird ersetzt.`)){st=x;save();ui()}}catch(_){alert("Datei ist kein gültiges Niche-Slot-Backup.")}};r.readAsText(t.files[0])}});
function renderFound(){const have=new Set(st.leads.map(l=>l.name.toLowerCase()));FR=FOUND.length?`<div style="overflow-x:auto"><table><tr><th>Betrieb</th><th>Telefon</th><th>Webseite</th><th>Google</th><th></th></tr>${FOUND.map((f,i)=>`<tr><td><b>${esc(f.name)}</b><br><span class="muted">${esc(f.addr)}</span></td><td>${esc(f.tel||"–")}</td><td>${f.web?`<a href="${esc(f.web)}" target="_blank">öffnen ↗</a>`:`<span class="badge warn">keine</span>`}</td><td>${f.rating?`${f.rating} ★ (${f.reviews})`:"–"}</td><td>${have.has(f.name.toLowerCase())?`<span class="badge ok">✓ in Liste</span>`:`<button class="btn ghost sm" data-fa="${i}">+ übernehmen</button>`}</td></tr>`).join("")}</table></div>`:`<p class="muted">Keine Treffer.</p>`}
function dl(n,c,type){const u=URL.createObjectURL(new Blob([c],{type}));const e=document.createElement("a");e.href=u;e.download=n;e.click();setTimeout(()=>URL.revokeObjectURL(u),1e3)}
setInterval(tick,1000);ui();pull();document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull()});