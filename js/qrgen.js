import {$,$$,esc,icon,toast,contrast} from './ui.js';
import {dl,svgBlob,svgToPng,pngToPdf} from './export.js';
const Q=window.qrcode;if(Q.stringToBytesFuncs&&Q.stringToBytesFuncs['UTF-8'])Q.stringToBytes=Q.stringToBytesFuncs['UTF-8'];

export function matrix(text,ecc){const q=Q(0,ecc);q.addData(text);q.make();const n=q.getModuleCount();return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>q.isDark(r,c)))}
const f2=n=>Math.round(n*100)/100;
/** Builds a QR SVG string. o:{ecc,size,quiet,fg,bg,trans,shape,logo} */
export function qrSvg(text,o){
  const ecc=o.logo?'H':o.ecc,m=matrix(text,ecc),n=m.length,tot=n+2*o.quiet,cs=o.size/tot;let body='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!m[r][c])continue;const x=f2((o.quiet+c)*cs),y=f2((o.quiet+r)*cs),s=f2(cs);
    const fin=(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
    if(o.shape==='dot'&&!fin){const rr=f2(cs*.46),cx=f2(x+cs/2);body+=`M${f2(cx-rr)} ${f2(y+cs/2)}a${rr} ${rr} 0 1 0 ${f2(rr*2)} 0a${rr} ${rr} 0 1 0 -${f2(rr*2)} 0z`}
    else if(o.shape==='rounded'&&!fin){const k=f2(cs*.3);body+=`M${x+k} ${y}h${f2(s-2*k)}a${k} ${k} 0 0 1 ${k} ${k}v${f2(s-2*k)}a${k} ${k} 0 0 1 -${k} ${k}h-${f2(s-2*k)}a${k} ${k} 0 0 1 -${k} -${k}v-${f2(s-2*k)}a${k} ${k} 0 0 1 ${k} -${k}z`}
    else body+=`M${x} ${y}h${s}v${s}h-${s}z`}
  let s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${o.size}" height="${o.size}" viewBox="0 0 ${o.size} ${o.size}" shape-rendering="${o.shape==='square'?'crispEdges':'geometricPrecision'}">`;
  if(!o.trans)s+=`<rect width="${o.size}" height="${o.size}" fill="${o.bg}"/>`;
  s+=`<path fill="${o.fg}" d="${body}"/>`;
  if(o.logo){const L=o.size*.2,pad=L*.14,x=(o.size-L)/2;s+=`<rect x="${f2(x-pad)}" y="${f2(x-pad)}" width="${f2(L+2*pad)}" height="${f2(L+2*pad)}" rx="${f2(L*.12)}" fill="${o.trans?'#ffffff':o.bg}"/><image x="${f2(x)}" y="${f2(x)}" width="${f2(L)}" height="${f2(L)}" preserveAspectRatio="xMidYMid meet" href="${o.logo}" xlink:href="${o.logo}"/>`}
  return s+'</svg>'}

class Soft extends Error{}
const req=(v,l)=>{if(!String(v??'').trim())throw new Soft(`Enter ${l}.`);return String(v).trim()};
const EM=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,PH=/^\+?[0-9][0-9 ()\-.]{3,18}[0-9]$/;
const wesc=s=>String(s).replace(/([\\;,:"])/g,'\\$1'),vesc=s=>String(s).replace(/([\\;,])/g,'\\$1').replace(/\n/g,'\\n');
const phone=v=>{const p=req(v,'a phone number');if(!PH.test(p))throw new Error('Phone number looks invalid. Use digits, with an optional leading +.');return p.replace(/[ ()\-.]/g,'')};
export const TYPES={
 url:{n:'URL',icon:'link',fields:[{k:'url',l:'Website address',t:'url',ph:'https://example.com'}],build(v){let u=req(v.url,'a website address');if(!/^[a-z][a-z0-9+.-]*:/i.test(u))u='https://'+u;let x;try{x=new URL(u)}catch{throw new Error('That does not look like a valid web address.')}if(/^https?:$/.test(x.protocol)&&!/\.|^localhost$/.test(x.hostname))throw new Error('That does not look like a valid web address.');return u}},
 text:{n:'Text',icon:'text',fields:[{k:'text',l:'Text',t:'textarea',ph:'Type any text…'}],build(v){const t=String(v.text??'');if(!t.trim())throw new Soft('Enter some text.');return t}},
 wifi:{n:'Wi-Fi',icon:'wifi',fields:[{k:'ssid',l:'Network name (SSID)',t:'text'},{k:'enc',l:'Security',t:'select',o:[['WPA','WPA / WPA2 / WPA3'],['WEP','WEP'],['nopass','None (open network)']]},{k:'pw',l:'Password',t:'text'},{k:'hid',l:'Hidden network',t:'check'}],build(v){const s=req(v.ssid,'the network name'),e=v.enc||'WPA';let p='';if(e!=='nopass'){p=String(v.pw??'');if(!p)throw new Soft('Enter the Wi-Fi password.');if(e==='WPA'&&(p.length<8||p.length>63))throw new Error('WPA passwords must be 8–63 characters.')}return `WIFI:T:${e};S:${wesc(s)};${e==='nopass'?'':`P:${wesc(p)};`}${v.hid?'H:true;':''};`}},
 contact:{n:'Contact',icon:'user',fields:[{k:'fn',l:'First name',t:'text'},{k:'ln',l:'Last name',t:'text'},{k:'org',l:'Company',t:'text'},{k:'title',l:'Job title',t:'text'},{k:'tel',l:'Phone',t:'tel'},{k:'em',l:'Email',t:'email'},{k:'web',l:'Website',t:'url'},{k:'adr',l:'Address',t:'text',full:1}],build(v){const fn=(v.fn||'').trim(),ln=(v.ln||'').trim(),org=(v.org||'').trim();if(!fn&&!ln&&!org)throw new Soft('Enter a name or company.');
   if(v.em&&!EM.test(v.em.trim()))throw new Error('Email address looks invalid.');if(v.tel&&!PH.test(v.tel.trim()))throw new Error('Phone number looks invalid.');
   const L=['BEGIN:VCARD','VERSION:3.0',`N:${vesc(ln)};${vesc(fn)};;;`,`FN:${vesc((fn+' '+ln).trim()||org)}`];
   if(org)L.push('ORG:'+vesc(org));if(v.title)L.push('TITLE:'+vesc(v.title));if(v.tel)L.push('TEL;TYPE=CELL:'+v.tel.trim().replace(/[ ()\-.]/g,''));if(v.em)L.push('EMAIL:'+v.em.trim());if(v.web)L.push('URL:'+v.web.trim());if(v.adr)L.push('ADR;TYPE=WORK:;;'+vesc(v.adr)+';;;;');L.push('END:VCARD');return L.join('\r\n')}},
 email:{n:'Email',icon:'mail',fields:[{k:'to',l:'Email address',t:'email',ph:'name@example.com'},{k:'sub',l:'Subject (optional)',t:'text'},{k:'body',l:'Message (optional)',t:'textarea'}],build(v){const a=req(v.to,'an email address');if(!EM.test(a))throw new Error('Email address looks invalid.');const q=[];if(v.sub)q.push('subject='+encodeURIComponent(v.sub));if(v.body)q.push('body='+encodeURIComponent(v.body));return 'mailto:'+a+(q.length?'?'+q.join('&'):'')}},
 phone:{n:'Phone',icon:'phone',fields:[{k:'tel',l:'Phone number',t:'tel',ph:'+1 555 123 4567'}],build:v=>'tel:'+phone(v.tel)},
 sms:{n:'SMS',icon:'sms',fields:[{k:'tel',l:'Phone number',t:'tel',ph:'+1 555 123 4567'},{k:'msg',l:'Message (optional)',t:'textarea'}],build(v){const p=phone(v.tel);return 'sms:'+p+(v.msg?'?body='+encodeURIComponent(v.msg):'')}}};

export const QR_PAGES={
 qr:{title:'QR Code Generator',desc:'Choose a content type, enter your details and download a ready-to-print QR code.',type:'url'},
 url:{title:'URL QR Generator',desc:'Turn any web address into a QR code.',type:'url',fixed:1},
 text:{title:'Text QR Generator',desc:'Encode any plain text in a QR code.',type:'text',fixed:1},
 wifi:{title:'Wi-Fi QR Generator',desc:'Let guests join your network by scanning — no typing the password.',type:'wifi',fixed:1},
 contact:{title:'Contact QR Generator',desc:'Share a vCard contact that phones can save in one tap.',type:'contact',fixed:1},
 email:{title:'Email QR Generator',desc:'Open a pre-filled email when the code is scanned.',type:'email',fixed:1},
 phone:{title:'Phone QR Generator',desc:'Start a phone call by scanning.',type:'phone',fixed:1},
 sms:{title:'SMS QR Generator',desc:'Open a text message with the number and message filled in.',type:'sms',fixed:1},
 designer:{title:'Custom QR Designer',desc:'Style your QR code: colors, module shapes and your own logo.',type:'url',shape:'rounded',design:1}};

const fieldHtml=(f,val)=>{const id='f_'+f.k,v=esc(val??'');
  if(f.t==='check')return `<label class="check-row"><input type="checkbox" data-f="${f.k}" ${val?'checked':''}> ${f.l}</label>`;
  const inner=f.t==='textarea'?`<textarea data-f="${f.k}" rows="4" placeholder="${esc(f.ph||'')}">${v}</textarea>`:f.t==='select'?`<select data-f="${f.k}">${f.o.map(([a,b])=>`<option value="${a}" ${val===a?'selected':''}>${b}</option>`).join('')}</select>`:`<input data-f="${f.k}" type="${f.t}" value="${v}" placeholder="${esc(f.ph||'')}" autocomplete="off">`;
  return `<label class="${f.full||f.t==='textarea'?'full':''}">${f.l}${inner}</label>`};

export function renderQr(root,key){
  const M=QR_PAGES[key];if(!M)return false;
  const S={type:M.type,vals:{},fg:'#000000',bg:'#ffffff',trans:false,shape:M.shape||'square',ecc:'M',size:1024,quiet:4,logo:null,logoName:''};let cur=null;
  root.innerHTML=`<header class="top"><div class="top-copy"><a class="btn ghost back-btn" href="#/">${icon('back')}<span>All tools</span></a><h1>${M.title}</h1><p>${M.desc}</p></div></header>
  <section class="work"><div class="stack">
   <div class="blk"><h2 class="blk-h">Content</h2>${M.fixed?'':`<div class="chips" role="tablist" aria-label="Content type">${Object.entries(TYPES).map(([k,t])=>`<button type="button" class="chip" role="tab" data-type="${k}">${icon(t.icon)}${t.n}</button>`).join('')}</div>`}<div class="fields two" id="fields"></div></div>
   <div class="blk"><h2 class="blk-h">Design</h2><div class="two">
    <label>Foreground color<input type="color" id="fg" value="#000000"></label><label>Background color<input type="color" id="bg" value="#ffffff"></label>
    <label>Module style<select id="shape"><option value="square">Square</option><option value="rounded">Rounded</option><option value="dot">Dots</option></select></label>
    <label>Error correction<select id="ecc"><option value="L">Low (7%)</option><option value="M" selected>Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option></select></label>
    <label><span>Size: <b id="sizeV">1024</b> px</span><input type="range" id="size" min="256" max="2048" step="64" value="1024"></label>
    <label><span>Quiet zone: <b id="quietV">4</b> modules</span><input type="range" id="quiet" min="1" max="8" value="4"></label>
    <label class="check-row"><input type="checkbox" id="trans"> Transparent background</label>
    <div class="logo-row full"><label class="btn ghost file-btn">${icon('image')}<span>Add logo</span><input type="file" id="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden></label><span id="logoName" class="muted"></span><button type="button" class="btn ghost" id="logoX" hidden>Remove</button></div>
    <p class="hint full" id="logoHint" hidden>With a logo, error correction is set to High so the code stays scannable.</p></div></div></div>
   <aside class="panel"><h2>Preview</h2><div class="stage" id="stage"></div><p class="status" id="status" role="status"></p>
    <div class="dl-row"><button class="btn pri" data-dl="png">${icon('download')}PNG</button><button class="btn" data-dl="svg">${icon('download')}SVG</button><button class="btn" data-dl="pdf">${icon('download')}PDF</button></div></aside></section>`;
  const st=$('#stage',root),stat=$('#status',root),btns=$$('[data-dl]',root);
  const drawFields=()=>{$('#fields',root).innerHTML=TYPES[S.type].fields.map(f=>fieldHtml(f,(S.vals[S.type]||{})[f.k])).join('');$$('.chip',root).forEach(c=>c.setAttribute('aria-selected',c.dataset.type===S.type))};
  const opts=()=>({ecc:S.ecc,size:S.size,quiet:S.quiet,fg:S.fg,bg:S.bg,trans:S.trans,shape:S.shape,logo:S.logo});
  let t;const upd=()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>{let msg='',cls='',svg=null;
    try{const text=TYPES[S.type].build(S.vals[S.type]||{});svg=qrSvg(text,opts());cur={svg,type:S.type};
      const c=contrast(S.trans?'#ffffff':S.bg,S.fg);msg=c<3?'Warning: low contrast — this code may not scan. Use a much darker foreground.':(!S.trans&&S.fg.toLowerCase()!==S.bg.toLowerCase()&&contrast('#000000',S.fg)>contrast('#000000',S.bg)?'Note: light-on-dark (inverted) codes are not read by every scanner.':'');cls=msg?'warn':'ok';if(!msg)msg=`Ready · ${text.length} characters encoded`}
    catch(e){cur=null;if(e instanceof Soft){msg=e.message;cls='soft'}else if(e.message&&/overflow|code length/i.test(e.message)){msg='Too much data for a QR code. Shorten the content or lower the error correction.';cls='err'}else{msg=e.message||'Could not generate the code.';cls='err'}}
    st.innerHTML=svg||`<div class="ph">${icon('qr')}<span>Your QR code appears here</span></div>`;stat.textContent=msg;stat.className='status '+cls;btns.forEach(b=>b.disabled=!cur)})};
  root.addEventListener('input',e=>{const el=e.target;if(el.dataset.f){(S.vals[S.type]??={})[el.dataset.f]=el.type==='checkbox'?el.checked:el.value}
    else if(el.id==='fg'||el.id==='bg')S[el.id]=el.value;else if(el.id==='shape'||el.id==='ecc')S[el.id]=el.value;else if(el.id==='trans')S.trans=el.checked;
    else if(el.id==='size'||el.id==='quiet'){S[el.id]=+el.value;$('#'+el.id+'V',root).textContent=el.value}else return;upd()});
  root.addEventListener('click',e=>{const c=e.target.closest('.chip');if(c){S.type=c.dataset.type;drawFields();upd()}
    if(e.target.closest('#logoX')){S.logo=null;$('#logo',root).value='';sync();upd()}
    const b=e.target.closest('[data-dl]');if(b&&cur)down(b.dataset.dl)});
  const sync=()=>{$('#logoName',root).textContent=S.logoName&&S.logo?S.logoName:'';$('#logoX',root).hidden=!S.logo;$('#logoHint',root).hidden=!S.logo};
  $('#logo',root).addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(!/^image\//.test(f.type))return toast('Please choose an image file.','err');if(f.size>2e6)return toast('Logo must be under 2 MB.','err');const r=new FileReader();r.onload=()=>{S.logo=r.result;S.logoName=f.name;sync();upd()};r.onerror=()=>toast('Could not read the logo.','err');r.readAsDataURL(f)});
  async function down(kind){const base=`aroundbyte-qrcode-${cur.type}`;try{if(kind==='svg')return dl(svgBlob(cur.svg),base+'.svg');const png=await svgToPng(cur.svg,S.size,S.size);if(kind==='png')dl(png,base+'.png');else dl(await pngToPdf(png,S.size,S.size,'QR Code'),base+'.pdf');toast('Download started','ok')}catch(e){toast(e.message||'Download failed','err')}}
  $('#shape',root).value=S.shape;drawFields();upd();return true}
