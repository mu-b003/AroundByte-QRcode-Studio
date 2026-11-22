import {$,$$,esc,icon} from './ui.js';
import {renderQr,QR_PAGES,TYPES,qrSvg} from './qrgen.js';
import {renderBarcode,BC_PAGES,FORMATS} from './barcode.js';
import {renderScan} from './scan.js';
import {renderBulk} from './bulk.js';
import {initI18n} from './i18n.js';
initI18n();

const QR_TOOLS=[['qr','qr','QR Code Generator','All content types in one place.','#/qr'],['link','url','URL QR Generator','Link any website.','#/qr/url'],['text','text','Text QR Generator','Encode plain text.','#/qr/text'],['wifi','wifi','Wi-Fi QR Generator','Share network access.','#/qr/wifi'],['user','contact','Contact QR Generator','Share a vCard contact.','#/qr/contact'],['mail','email','Email QR Generator','Pre-filled email message.','#/qr/email'],['phone','phone','Phone QR Generator','Tap to call.','#/qr/phone'],['sms','sms','SMS QR Generator','Pre-filled text message.','#/qr/sms'],['brush','designer','Custom QR Designer','Colors, shapes and logo.','#/qr/designer'],['scan','scan','QR Code Scanner','Scan by camera or image.','#/scan/qr']];
const DESC={EAN13:'Retail product barcodes.',EAN8:'Compact retail barcodes.',UPCA:'North American retail.',UPCE:'Short-form UPC.',CODE128:'Dense alphanumeric data.',CODE39:'Industrial labels.',ITF14:'Shipping cartons (GTIN-14).',ITF:'Numeric pairs, even length.',CODABAR:'Libraries and labs.'};
const BC_TOOLS=[...Object.entries(BC_PAGES).map(([s,k])=>['bars',s,FORMATS[k].n+' Generator',DESC[k],'#/barcode/'+s]),['scan','bscan','Barcode Scanner','Scan 1D barcodes.','#/scan/barcode']];
const MORE=[['layers','bq','Bulk QR Code Generator','CSV or list → ZIP.','#/bulk/qr'],['layers','bb','Bulk Barcode Generator','CSV or list → ZIP.','#/bulk/barcode']];
const card=t=>`<a class="tile tool-card" href="${t[4]}"><span class="ico">${icon(t[0])}</span><b>${t[2]}</b><span class="d">${t[3]}</span></a>`;
const menu=(items)=>items.map(t=>`<a href="${t[4]}">${icon(t[0])}${t[2].replace(' Generator','')}</a>`).join('');
$('#mainNav').innerHTML=`<a href="#/" data-r="home">Home</a>
 <details class="dd"><summary>QR Code Tools <span class="chevron" aria-hidden="true">⌄</span></summary><div class="dd-nav">${menu(QR_TOOLS)}</div></details>
 <details class="dd"><summary>Barcode Tools <span class="chevron" aria-hidden="true">⌄</span></summary><div class="dd-nav">${menu([...BC_TOOLS,...MORE])}</div></details>
 <a href="#/scan/qr" data-r="scan">Scanner</a><a href="#/about" data-r="about">About</a>
 <button type="button" class="btn ghost icon-btn" id="theme" aria-label="Toggle light/dark theme"></button><button type="button" class="btn ghost" id="lang" aria-label="Switch language">العربية</button>`;

const themeBtn=$('#theme'),setIcon=()=>themeBtn.innerHTML=icon(document.documentElement.dataset.theme==='light'?'moon':'sun');setIcon();
themeBtn.onclick=()=>{const n=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=n;try{localStorage.setItem('abqs-theme',n)}catch{}setIcon()};
$('#lang').onclick=()=>window.abqsSetLanguage(document.documentElement.lang==='ar'?'en':'ar');
document.addEventListener('click',e=>{$$('details.dd[open]').forEach(d=>{if(!d.contains(e.target))d.open=false})});

const heroArt=()=>{const q=qrSvg('AroundByte QRcode Studio',{ecc:'M',size:240,quiet:2,fg:'#000000',bg:'#ffc800',shape:'rounded'});let b='';try{const el=document.createElementNS('http://www.w3.org/2000/svg','svg');window.JsBarcode(el,'AROUNDBYTE',{format:'CODE128',width:2,height:70,margin:10,lineColor:'#ffc800',background:'#000000',displayValue:true,fontSize:14,font:'Arial'});el.setAttribute('viewBox',`0 0 ${parseFloat(el.getAttribute('width'))} ${parseFloat(el.getAttribute('height'))}`);el.removeAttribute('style');b=new XMLSerializer().serializeToString(el)}catch{}return `<div class="hero-art" aria-hidden="true"><div class="art-qr">${q}</div><div class="art-bar">${b}</div></div>`};
const FAQ=[['Is AroundByte QRcode Studio free?','Yes. You can generate, scan and bulk-create codes without an account.'],['Are my codes or images uploaded anywhere?','No. Generation and scanning run entirely in your browser. Camera frames and uploaded images stay on your device.'],['Do my QR codes expire?','No. These are static QR codes: the data is encoded directly in the image, so they work as long as the content you encoded (for example a website) stays available.'],['Which barcode format should I choose?','Use EAN-13 or UPC-A for retail products, ITF-14 for shipping cartons, and Code 128 for general-purpose alphanumeric labels. Each format validates your data and tells you what it accepts.'],['Will my code scan reliably?','Keep strong contrast between code and background, leave the quiet zone, and avoid light-on-dark inversion. When you add a logo, error correction is raised to High automatically. Always test a printed code before mass production.'],['Why does the camera scanner not start?','Browsers allow camera access only on secure (HTTPS) pages and after you grant permission. You can always upload an image instead.']];
const HOME=()=>`<section class="hero"><div class="hero-copy"><span class="tag">QR Codes · Barcodes · Scanner · Bulk</span><h1>Create QR Codes &amp; Barcodes Easily</h1><p>Generate, customize, and download professional QR codes and barcodes in seconds. Everything you need in one place.</p>
 <div class="hero-cta"><a class="btn pri" href="#/qr">${icon('qr')}Create QR Code</a><a class="btn" href="#/barcode/code128">${icon('bars')}Generate Barcode</a></div></div>${heroArt()}</section>
 <div class="ad-slot" aria-label="Advertisement space"><span>Ad space</span></div><section class="sec" id="tools"><h2 class="sec-h">QR Code Tools</h2><div class="grid-tools">${QR_TOOLS.map(card).join('')}</div>
 <h2 class="sec-h">Barcode Tools</h2><div class="grid-tools">${BC_TOOLS.map(card).join('')}</div>
 <h2 class="sec-h">Additional Tools</h2><div class="grid-tools">${MORE.map(card).join('')}</div></section>
 <section class="sec"><h2 class="sec-h">How It Works</h2><ol class="steps"><li><b>1</b><h3>Choose a tool</h3><p>Pick a QR type or barcode format.</p></li><li><b>2</b><h3>Enter &amp; customize</h3><p>Add your data and see a live preview with validation.</p></li><li><b>3</b><h3>Download</h3><p>Save as PNG, SVG or PDF — or generate hundreds in a ZIP.</p></li></ol></section>
 <section class="sec"><h2 class="sec-h">Why Choose AroundByte QRcode Studio</h2><div class="grid-why">${[['shield','Private by design','Everything runs in your browser. Nothing is uploaded.'],['zap','Fast &amp; free','No sign-up, no watermarks, instant previews.'],['brush','Fully customizable','Colors, module shapes, logo, size and error correction.'],['check','Validated output','Format rules and check digits are verified before you download.']].map(w=>`<div class="why"><span class="ico">${icon(w[0])}</span><h3>${w[1]}</h3><p>${w[2]}</p></div>`).join('')}</div></section>
 <section class="sec"><h2 class="sec-h">Frequently Asked Questions</h2><div class="faq">${FAQ.map(f=>`<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div></section>`;
const ABOUT=()=>`<header class="top"><div class="top-copy"><h1>About AroundByte QRcode Studio</h1><p>Part of the AroundByte family of browser-based tools.</p></div></header><div class="prose panel plain"><p>AroundByte QRcode Studio creates, customizes and scans QR codes and barcodes. It supports URL, text, Wi-Fi, contact (vCard), email, phone and SMS QR codes; EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF-14, ITF and Codabar barcodes; camera and image scanning; and bulk generation to ZIP.</p><p>It is a static application with no account system. Your content and images are processed locally in your browser and are not sent to a server.</p><p>Looking for ID cards? Visit <a href="https://cardstudio.aroundbyte.com" rel="noopener">AroundByte Card Studio</a>.</p><p><b>Note:</b> “QR Code” is a registered trademark of DENSO WAVE INCORPORATED.</p></div>`;

let cleanup=null;
function route(){if(typeof cleanup==='function')cleanup();cleanup=null;const old=$('#view'),v=old.cloneNode(false);old.replaceWith(v);const p=(location.hash.replace(/^#\/?/,'')||'').split('/'),[a,b]=p;let title='';$$('details.dd').forEach(d=>d.open=false);
  if(!a){v.innerHTML=HOME();title=''}
  else if(a==='qr'&&renderQr(v,b||'qr'))title=QR_PAGES[b||'qr'].title;
  else if(a==='barcode'&&renderBarcode(v,b))title=FORMATS[BC_PAGES[b]].n+' Generator';
  else if(a==='scan'&&(cleanup=renderScan(v,b)))title=b==='qr'?'QR Code Scanner':'Barcode Scanner';
  else if(a==='bulk'&&renderBulk(v,b))title='Bulk '+(b==='qr'?'QR Code':'Barcode')+' Generator';
  else if(a==='about'){v.innerHTML=ABOUT();title='About'}
  else{v.innerHTML=`<div class="prose panel plain"><h1>Page not found</h1><p><a class="btn pri" href="#/">Back to home</a></p></div>`;title='Not found'}
  if(a && a!=='about')v.insertAdjacentHTML('afterbegin','<div class="ad-slot ad-slot-page" aria-label="Advertisement space"><span>Ad space</span></div>');
  document.title=(title?title+' · ':'')+'AroundByte QRcode Studio';
  $$('#mainNav a[data-r]').forEach(l=>l.removeAttribute('aria-current'));const cur=!a?'home':a==='scan'?'scan':a==='about'?'about':'';if(cur)$(`#mainNav a[data-r=${cur}]`)?.setAttribute('aria-current','page');
  window.scrollTo(0,0)}
addEventListener('hashchange',route);route();
