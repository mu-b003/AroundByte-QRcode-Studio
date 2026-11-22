import {$,esc,icon,toast} from './ui.js';
const NAMES={QR_CODE:'QR Code',EAN_13:'EAN-13',EAN_8:'EAN-8',UPC_A:'UPC-A',UPC_E:'UPC-E',CODE_128:'Code 128',CODE_39:'Code 39',CODE_93:'Code 93',ITF:'ITF (Interleaved 2 of 5)',CODABAR:'Codabar'};
function zx(canvas,formats){const Z=window.ZXing,h=new Map();h.set(Z.DecodeHintType.POSSIBLE_FORMATS,formats.map(f=>Z.BarcodeFormat[f]));h.set(Z.DecodeHintType.TRY_HARDER,true);
  const r=new Z.MultiFormatReader();r.setHints(h);try{const res=r.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(canvas))));return {text:res.getText(),fmt:Z.BarcodeFormat[res.getBarcodeFormat()]}}catch{return null}}
let BD=null;
async function native(canvas){try{if(!('BarcodeDetector' in window))return null;if(!BD){const sup=await BarcodeDetector.getSupportedFormats();const want=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','code_93','itf','codabar'].filter(f=>sup.includes(f));if(!want.length)return null;BD=new BarcodeDetector({formats:want})}const r=await BD.detect(canvas);return r[0]?{text:r[0].rawValue,fmt:r[0].format.toUpperCase()}:null}catch{return null}}
export async function decode(canvas,mode){if(mode!=='qr'){const n=await native(canvas);if(n)return n}return decodeJs(canvas,mode)}
function decodeJs(canvas,mode){
  if(mode==='qr'){const c=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height);const q=window.jsQR(c.data,c.width,c.height,{inversionAttempts:'attemptBoth'});if(q&&q.data)return {text:q.data,fmt:'QR_CODE'};const z=zx(canvas,['QR_CODE']);return z}
  const F=['EAN_13','EAN_8','UPC_A','UPC_E','CODE_128','CODE_39','CODE_93','ITF','CODABAR'];let r=zx(canvas,F);if(r)return r;
  for(const k of [1,2,3]){const c=document.createElement('canvas'),pad=40;c.width=canvas.width*k+pad*2;c.height=canvas.height*k+pad*2;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.imageSmoothingEnabled=false;x.drawImage(canvas,pad,pad,canvas.width*k,canvas.height*k);r=zx(c,F);if(r)return r}
  return null;
  return zx(canvas,['EAN_13','EAN_8','UPC_A','UPC_E','CODE_128','CODE_39','CODE_93','ITF','CODABAR'])}
export function renderScan(root,mode){
  if(mode!=='qr'&&mode!=='barcode')return false;let stream=null,raf=0,last=0;
  root.innerHTML=`<header class="top"><div class="top-copy"><a class="btn ghost back-btn" href="#/">${icon('back')}<span>All tools</span></a><h1>${mode==='qr'?'QR Code Scanner':'Barcode Scanner'}</h1><p>Scan with your camera or upload an image. Everything is decoded on your device — images are never uploaded.</p></div></header>
  <div class="chips tabs"><a class="chip" href="#/scan/qr" aria-selected="${mode==='qr'}">${icon('qr')}QR Code</a><a class="chip" href="#/scan/barcode" aria-selected="${mode==='barcode'}">${icon('bars')}Barcode</a></div>
  <section class="work"><div class="stack"><div class="blk"><h2 class="blk-h">Camera</h2><div class="cam" id="cam"><video id="vid" playsinline muted></video><div class="reticle" aria-hidden="true"></div><div class="cam-off" id="camOff">${icon('camera')}<span>Camera is off</span></div></div>
   <div class="dl-row"><button class="btn pri" id="start">${icon('camera')}Start camera</button><button class="btn" id="stop" disabled>Stop</button></div>
   <p class="hint" id="camMsg">Camera access needs a secure (HTTPS) connection and your permission.</p></div>
   <div class="blk"><h2 class="blk-h">Image</h2><label class="dz" id="dz" tabindex="0">${icon('upload')}<strong>Choose or drop an image</strong><span class="muted">PNG, JPG, WebP — a photo or screenshot of a ${mode==='qr'?'QR code':'barcode'}</span><input type="file" id="file" accept="image/*" hidden></label></div></div>
   <aside class="panel"><h2>Result</h2><div class="result" id="res"><p class="muted">Nothing scanned yet.</p></div></aside></section>`;
  const vid=$('#vid',root),cv=document.createElement('canvas');
  const show=r=>{const isUrl=/^https?:\/\/\S+$/i.test(r.text),name=NAMES[r.fmt]||r.fmt;
    $('#res',root).innerHTML=`<div class="fmt"><span class="tag">${esc(name)}</span><span class="tag">${r.text.length} chars</span></div><pre class="out" id="out">${esc(r.text)}</pre><div class="dl-row"><button class="btn pri" id="copy">${icon('copy')}Copy</button>${isUrl?`<a class="btn" href="${esc(r.text)}" target="_blank" rel="noopener noreferrer">Open link</a>`:''}</div>${isUrl?'<p class="hint">Only open links you trust.</p>':''}`;
    $('#copy',root).onclick=async()=>{try{await navigator.clipboard.writeText(r.text)}catch{const t=document.createElement('textarea');t.value=r.text;document.body.append(t);t.select();document.execCommand('copy');t.remove()}toast('Copied to clipboard','ok')}};
  const stop=()=>{cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;vid.srcObject=null;$('#camOff',root).hidden=false;$('#start',root).disabled=false;$('#stop',root).disabled=true};
  let busy=false;const loop=async ts=>{if(!stream)return;raf=requestAnimationFrame(loop);if(busy||ts-last<140||vid.readyState<2)return;last=ts;busy=true;const s=Math.min(1,960/vid.videoWidth);cv.width=Math.round(vid.videoWidth*s);cv.height=Math.round(vid.videoHeight*s);cv.getContext('2d',{willReadFrequently:true}).drawImage(vid,0,0,cv.width,cv.height);const r=await decode(cv,mode);busy=false;if(r&&stream){stop();show(r);toast('Code detected','ok')}};
  $('#start',root).onclick=async()=>{const m=$('#camMsg',root);if(!navigator.mediaDevices?.getUserMedia){m.textContent='Camera is not available in this browser or context (HTTPS required). Use image upload instead.';return}
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});vid.srcObject=stream;await vid.play();$('#camOff',root).hidden=true;$('#start',root).disabled=true;$('#stop',root).disabled=false;m.textContent='Point the camera at the code and hold steady.';raf=requestAnimationFrame(loop)}
    catch(e){stream&&stop();m.textContent=e.name==='NotAllowedError'?'Camera permission was denied. Allow access in your browser settings, or upload an image.':e.name==='NotFoundError'?'No camera found. Upload an image instead.':'Could not start the camera: '+(e.message||e.name)}};
  $('#stop',root).onclick=stop;
  const fromFile=f=>{if(!f)return;if(!/^image\//.test(f.type))return toast('Please choose an image file.','err');const u=URL.createObjectURL(f),im=new Image();
    im.onload=async()=>{URL.revokeObjectURL(u);const s=Math.min(1,1800/Math.max(im.width,im.height));cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);const x=cv.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0,cv.width,cv.height);
      const r=await decode(cv,mode);if(r){show(r);toast('Code detected','ok')}else{$('#res',root).innerHTML=`<p class="status err">No ${mode==='qr'?'QR code':'barcode'} found. Try a sharper, closer image with the whole code visible${mode==='qr'?'':', or switch to the other scanner tab'}.</p>`}};
    im.onerror=()=>{URL.revokeObjectURL(u);toast('Could not read that image.','err')};im.src=u};
  const dz=$('#dz',root);$('#file',root).onchange=e=>{fromFile(e.target.files[0]);e.target.value=''};
  ['dragover','dragenter'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add('over')}));['dragleave','drop'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.remove('over')}));dz.addEventListener('drop',e=>fromFile(e.dataTransfer.files[0]));
  dz.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#file',root).click()}});
  return stop}
