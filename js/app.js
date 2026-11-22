import {$,$$,esc,icon} from './ui.js';
import {renderQr,QR_PAGES,TYPES,qrSvg} from './qrgen.js';
import {renderBarcode,BC_PAGES,FORMATS} from './barcode.js';
import {renderScan} from './scan.js';
import {renderBulk} from './bulk.js';
import {initI18n} from './i18n.js';
initI18n();

const CONTACT_EMAIL='mubarakdigitals26@gmail.com';

const QR_TOOLS=[['qr','qr','QR Code Generator','All content types in one place.','#/qr'],['link','url','URL QR Generator','Link any website.','#/qr/url'],['text','text','Text QR Generator','Encode plain text.','#/qr/text'],['wifi','wifi','Wi-Fi QR Generator','Share network access.','#/qr/wifi'],['user','contact','Contact QR Generator','Share a vCard contact.','#/qr/contact'],['mail','email','Email QR Generator','Pre-filled email message.','#/qr/email'],['phone','phone','Phone QR Generator','Tap to call.','#/qr/phone'],['sms','sms','SMS QR Generator','Pre-filled text message.','#/qr/sms'],['brush','designer','Custom QR Designer','Colors, shapes and logo.','#/qr/designer'],['scan','scan','QR Code Scanner','Scan by camera or image.','#/scan/qr']];
const DESC={EAN13:'Retail product barcodes.',EAN8:'Compact retail barcodes.',UPCA:'North American retail.',UPCE:'Short-form UPC.',CODE128:'Dense alphanumeric data.',CODE39:'Industrial labels.',ITF14:'Shipping cartons (GTIN-14).',ITF:'Numeric pairs, even length.',CODABAR:'Libraries and labs.'};
const BC_TOOLS=[...Object.entries(BC_PAGES).map(([s,k])=>['bars',s,FORMATS[k].n+' Generator',DESC[k],'#/barcode/'+s]),['scan','bscan','Barcode Scanner','Scan 1D barcodes.','#/scan/barcode']];
const MORE=[['layers','bq','Bulk QR Code Generator','CSV or list → ZIP.','#/bulk/qr'],['layers','bb','Bulk Barcode Generator','CSV or list → ZIP.','#/bulk/barcode']];
const CARD_IMAGES={
 qr:'QR Code Generator.png',
 url:'URL QR Generator.png',
 text:'Text QR Generator.png',
 wifi:'Wi-Fi QR Generator.png',
 contact:'Contact QR Generator.png',
 email:'Email QR Generator.png',
 phone:'Phone QR Generator.png',
 sms:'SMS QR Generator.png',
 designer:'Custom QR Designer.png',
 scan:'QR Code Scanner.png',
 ean13:'EAN-13 Generator.png',
 ean8:'EAN-8 Generator.png',
 upca:'UPC-A Generator.png',
 upce:'UPC-E Generator.png',
 code128:'Code 128 Generator.png',
 code39:'Code 39 Generator.png',
 itf14:'ITF-14 Generator.png',
 itf:'ITF (Interleaved 2 of 5) Generator.png',
 codabar:'Codabar Generator.png',
 bscan:'Barcode Scanner.png',
 bq:'Bulk QR Code Generator.png',
 bb:'Bulk Barcode Generator.png'
};

const card=t=>{
 const image=CARD_IMAGES[t[1]];
 if(!image)return `<a class="tile tool-card" href="${t[4]}"><span class="ico">${icon(t[0])}</span><b>${t[2]}</b><span class="d">${t[3]}</span></a>`;
 return `<a class="tile tool-card" href="${t[4]}"><img class="tool-card-image" src="assets/tool-cards/${image}" alt="${esc(t[2])}" loading="lazy" decoding="async"><span class="tool-card-content"><b>${t[2]}</b><span class="d">${t[3]}</span></span></a>`;
};
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

const ABOUT=()=>`<header class="top"><div class="top-copy"><h1>About AroundByte QRcode Studio</h1><p>Part of the AroundByte family of browser-based tools.</p></div></header><div class="prose panel plain">
<p>AroundByte QRcode Studio creates, customizes and scans QR codes and barcodes. It supports URL, text, Wi-Fi, contact (vCard), email, phone and SMS QR codes; EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF-14, ITF and Codabar barcodes; camera and image scanning; and bulk generation to ZIP.</p>
<p>It is a static application with no account system. Your content and images are processed locally in your browser and are not sent to a server.</p>
<p>Looking for ID cards? Visit <a href="https://cardstudio.aroundbyte.com" rel="noopener">AroundByte Card Studio</a>.</p>
<p><b>Note:</b> “QR Code” is a registered trademark of DENSO WAVE INCORPORATED.</p>
</div>`;

const PRIVACY=()=>`<header class="top"><div class="top-copy"><h1>Privacy Policy</h1><p>How AroundByte QRcode Studio handles information and files.</p></div></header>
<div class="prose panel plain">
<p><b>Last updated:</b> November 2026</p>
<h2>1. Introduction</h2>
<p>AroundByte QRcode Studio is a browser-based toolkit for creating, customizing, scanning and managing QR codes and barcodes. This Privacy Policy explains how information is handled when you use the website.</p>
<h2>2. No Account Required</h2>
<p>You do not need to create an account to use the core tools. We do not ask you to register or provide personal information to generate or scan codes.</p>
<h2>3. Local Processing</h2>
<p>Where supported, text, URLs, contact details and other information you enter are processed locally in your browser. Files and images you select are also processed in your browser. In the normal operation of these tools, your content and selected files are not intentionally uploaded to our servers.</p>
<p>Generated QR codes and barcodes remain under your control. You can download the results using your browser.</p>
<h2>4. Local Storage and Preferences</h2>
<p>The website may use your browser's local storage to remember preferences such as language, theme or interface settings. These preferences remain in your browser and can be cleared through your browser settings.</p>
<h2>5. Advertising and Cookies</h2>
<p>This website may display advertisements provided by third parties, including Google AdSense. Advertising partners may use cookies or similar technologies to display ads, measure advertising performance or provide more relevant advertising, subject to their own privacy policies and your available settings.</p>
<p>You can review Google's information about how it uses data from sites and apps that use its services through Google's privacy resources and advertising settings.</p>
<h2>6. Third-Party Websites</h2>
<p>Our website may contain links to third-party websites. We do not control their content, privacy practices or security. Please review the privacy policies of those websites before providing information to them.</p>
<h2>7. Security</h2>
<p>We take reasonable steps to maintain the website, but no website, browser or method of electronic transmission can be guaranteed to be completely secure. Please avoid entering confidential or highly sensitive information into online tools.</p>
<h2>8. Children's Privacy</h2>
<p>This website is intended as a general-purpose tool. We do not knowingly collect personal information from children. If you believe a child has provided personal information to us, please contact us so we can review the concern.</p>
<h2>9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Any changes will be published on this page with a revised update date.</p>
<h2>10. Contact</h2>
<p>If you have questions about this Privacy Policy, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
</div>`;

const TERMS=()=>`<header class="top"><div class="top-copy"><h1>Terms of Use</h1><p>Terms that apply when you use AroundByte QRcode Studio.</p></div></header>
<div class="prose panel plain">
<p><b>Last updated:</b> November 2026</p>
<h2>1. Acceptance of These Terms</h2>
<p>By accessing or using AroundByte QRcode Studio, you agree to these Terms of Use. If you do not agree with these terms, please do not use the website.</p>
<h2>2. About the Service</h2>
<p>AroundByte QRcode Studio provides browser-based tools for creating, customizing, scanning and managing QR codes and barcodes. Features may include individual code generation, barcode format validation, camera or image scanning, and bulk generation.</p>
<h2>3. Permitted Use</h2>
<p>You may use the website for lawful personal, educational and business purposes. You must not use the service to:</p>
<ul>
<li>Break any applicable law or regulation.</li>
<li>Create or distribute fraudulent, deceptive, harmful or misleading codes.</li>
<li>Create or distribute phishing links, malware or content intended to compromise another person or system.</li>
<li>Interfere with the website, attempt unauthorized access, or disrupt its operation.</li>
<li>Violate the rights, privacy or intellectual property of another person or organization.</li>
</ul>
<h2>4. Your Responsibilities</h2>
<p>You are responsible for the information and content you enter, encode, scan, download or distribute. You must ensure that you have the necessary rights and permissions to use that content.</p>
<p>You are also responsible for checking the accuracy and functionality of generated codes before printing, publishing, distributing or using them for important purposes.</p>
<h2>5. Local Processing and User Content</h2>
<p>The tools are designed to process content locally in your browser where supported. You remain responsible for keeping copies of important input data and downloaded results. Please review our Privacy Policy for more information about data handling.</p>
<h2>6. Intellectual Property</h2>
<p>The website's original design, branding, text, graphics and software are protected by applicable intellectual property laws. These terms do not transfer ownership of the website or its original materials to you.</p>
<p>You may use generated QR codes and barcodes for lawful purposes. You must not imply that you own or are affiliated with the AroundByte brand unless you have permission.</p>
<p>“QR Code” is a registered trademark of DENSO WAVE INCORPORATED.</p>
<h2>7. Third-Party Services and Links</h2>
<p>The website may include links to external websites or services, including advertising services. These third parties operate independently and may have their own terms and privacy policies. We are not responsible for their content, availability or practices.</p>
<h2>8. Availability and Changes</h2>
<p>We may update, modify, suspend or discontinue any part of the website or its features at any time. We do not guarantee uninterrupted availability or compatibility with every device, browser or environment.</p>
<h2>9. Disclaimer of Warranties</h2>
<p>The website and its tools are provided on an “as is” and “as available” basis, to the extent permitted by law. We make no guarantee that the service will be error-free, uninterrupted, suitable for every purpose or that every generated or scanned code will work with every device or scanner.</p>
<h2>10. Limitation of Liability</h2>
<p>To the extent permitted by applicable law, AroundByte shall not be liable for indirect, incidental, special or consequential loss or damage arising from your use of, inability to use, or reliance on the website or its output. This includes issues caused by inaccurate input, unreadable codes, scanning failures or third-party services.</p>
<h2>11. Privacy</h2>
<p>Your use of the website is also subject to our <a href="#/privacy">Privacy Policy</a>, which explains how information and files are handled.</p>
<h2>12. Changes to These Terms</h2>
<p>We may revise these Terms of Use from time to time. Updated terms will be published on this page with a revised date. Your continued use of the website after changes are published means you accept the updated terms, to the extent permitted by law.</p>
<h2>13. Contact</h2>
<p>For questions about these terms, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
</div>`;

const DISCLAIMER=()=>`<header class="top"><div class="top-copy"><h1>Disclaimer</h1><p>Important information about using our QR code and barcode tools.</p></div></header>
<div class="prose panel plain">
<p><b>Last updated:</b> November 2026</p>
<h2>1. General Information</h2>
<p>AroundByte QRcode Studio provides browser-based tools for creating, customizing, scanning and managing QR codes and barcodes. The tools are provided for general informational and practical purposes.</p>
<h2>2. Accuracy and Reliability</h2>
<p>We do not guarantee that every generated QR code or barcode will work with every scanner, device, application or environment. Results may depend on the selected format, encoded content, printing quality, code size, contrast and scanning conditions.</p>
<h2>3. User Responsibility</h2>
<p>You are responsible for ensuring that the information you enter and encode is accurate and appropriate for your intended use. Always test generated codes before printing, publishing, distributing or relying on them for important activities.</p>
<h2>4. Scanning and Decoded Content</h2>
<p>Scanned codes may contain links, contact information, text or other content. We do not control or verify the content of codes you choose to scan. Review decoded information carefully and only open links or take actions when you trust the source.</p>
<h2>5. Local Browser Processing</h2>
<p>The tools are designed to process your content and files locally in your browser where supported. However, browser extensions, device settings or third-party software may affect how your device operates. You are responsible for maintaining the security of your device and browser.</p>
<h2>6. Availability and Technical Limitations</h2>
<p>We do not guarantee that the website will always be available, free from errors or fully compatible with every device or browser. Features may be changed, limited or discontinued without notice.</p>
<h2>7. Limitation of Liability</h2>
<p>To the extent permitted by applicable law, AroundByte shall not be responsible for losses or damages resulting from the use of, inability to use, or reliance on the tools or their output, including errors in generated codes, scanning results or user-provided information.</p>
<h2>8. External Links</h2>
<p>Links to external websites are provided for convenience. We do not control and are not responsible for the content, availability, privacy practices or terms of external websites.</p>
<h2>9. Changes to This Disclaimer</h2>
<p>We may update this Disclaimer when necessary. Changes will be published on this page with an updated date.</p>
<h2>10. Contact</h2>
<p>If you have questions about this Disclaimer, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
</div>`;

const CONTACT=()=>`<header class="top"><div class="top-copy"><h1>Contact Us</h1><p>Questions, feedback or suggestions? We would be happy to hear from you.</p></div></header>
<div class="prose panel plain">
<h2>Get in Touch</h2>
<p>Thank you for using AroundByte QRcode Studio. If you have questions, comments or suggestions about the website, please contact us by email.</p>
<p>For problems while creating, customizing or scanning QR codes and barcodes, please include a description of the issue, the tool you were using and the browser you use. This helps us understand and investigate the problem.</p>
<h2>Email Support</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
<h2>Business Inquiries and Partnerships</h2>
<p>For business inquiries, partnerships or other professional matters, you can reach us using the same email address.</p>
<h2>About the Service</h2>
<p>AroundByte QRcode Studio is a browser-based toolkit for creating, customizing, scanning and managing QR codes and barcodes.</p>
</div>`;

let cleanup=null;

function route(){
 if(typeof cleanup==='function')cleanup();
 cleanup=null;

 const old=$('#view');
 const v=old.cloneNode(false);
 old.replaceWith(v);

 const p=(location.hash.replace(/^#\/?/,'')||'').split('/');
 const [a,b]=p;
 let title='';
 const infoPages=['about','privacy','terms','disclaimer','contact'];

 $$('details.dd').forEach(d=>d.open=false);

 if(!a){
  v.innerHTML=HOME();
  title='';
 }
 else if(a==='qr'&&renderQr(v,b||'qr')){
  title=QR_PAGES[b||'qr'].title;
 }
 else if(a==='barcode'&&renderBarcode(v,b)){
  title=FORMATS[BC_PAGES[b]].n+' Generator';
 }
 else if(a==='scan'&&(cleanup=renderScan(v,b))){
  title=b==='qr'?'QR Code Scanner':'Barcode Scanner';
 }
 else if(a==='bulk'&&renderBulk(v,b)){
  title='Bulk '+(b==='qr'?'QR Code':'Barcode')+' Generator';
 }
 else if(a==='about'){
  v.innerHTML=ABOUT();
  title='About Us';
 }
 else if(a==='privacy'){
  v.innerHTML=PRIVACY();
  title='Privacy Policy';
 }
 else if(a==='terms'){
  v.innerHTML=TERMS();
  title='Terms of Use';
 }
 else if(a==='disclaimer'){
  v.innerHTML=DISCLAIMER();
  title='Disclaimer';
 }
 else if(a==='contact'){
  v.innerHTML=CONTACT();
  title='Contact Us';
 }
 else{
  v.innerHTML=`<div class="prose panel plain"><h1>Page not found</h1><p><a class="btn pri" href="#/">Back to home</a></p></div>`;
  title='Not found';
 }

 if(a && !infoPages.includes(a)){
  v.insertAdjacentHTML('afterbegin','<div class="ad-slot ad-slot-page" aria-label="Advertisement space"><span>Ad space</span></div>');
 }

 document.title=(title?title+' · ':'')+'AroundByte QRcode Studio';

 $$('#mainNav a[data-r]').forEach(l=>l.removeAttribute('aria-current'));
 const cur=!a?'home':a==='scan'?'scan':a==='about'?'about':'';
 if(cur)$(`#mainNav a[data-r=${cur}]`)?.setAttribute('aria-current','page');

 window.scrollTo(0,0);
}

addEventListener('hashchange',route);
route();
