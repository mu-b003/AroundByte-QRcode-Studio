import {$,$$,esc,icon,toast} from './ui.js';
import {dl,svgBlob,svgToPng,pngToPdf} from './export.js';
const D=/^\d+$/,gs1=b=>{let s=0;for(let i=b.length-1,k=0;i>=0;i--,k++)s+=+b[i]*(k%2?1:3);return String((10-s%10)%10)};
const gtin=(n,body,label)=>s=>{if(!D.test(s))return 'Digits only (0–9).';if(s.length!==body&&s.length!==body+1)return `${label} needs ${body} digits (check digit is added) or ${body+1} digits.`;if(s.length===body+1&&gs1(s.slice(0,body))!==s.slice(-1))return `Check digit is wrong — it should be ${gs1(s.slice(0,body))}.`;return ''};
export const FORMATS={
 EAN13:{n:'EAN-13',jb:'EAN13',hint:'12 digits (check digit added automatically) or 13 digits',ex:'590123412345',v:gtin(0,12,'EAN-13')},
 EAN8:{n:'EAN-8',jb:'EAN8',hint:'7 digits (check digit added) or 8 digits',ex:'9638507',v:gtin(0,7,'EAN-8')},
 UPCA:{n:'UPC-A',jb:'UPC',hint:'11 digits (check digit added) or 12 digits',ex:'03600029145',v:gtin(0,11,'UPC-A')},
 UPCE:{n:'UPC-E',jb:'UPCE',hint:'6 digits, or 7 digits (check digit added) / 8 digits starting with 0 or 1',ex:'0123456',v:s=>!D.test(s)?'Digits only (0–9).':![6,7,8].includes(s.length)?'UPC-E needs 6, 7 or 8 digits.':s.length>6&&!/^[01]/.test(s)?'UPC-E number system must be 0 or 1.':s.length===8&&upceCheck(s.slice(0,7))!==s[7]?`Check digit is wrong — it should be ${upceCheck(s.slice(0,7))}.`:''},
 CODE128:{n:'Code 128',jb:'CODE128',hint:'Any printable ASCII text (letters, digits, symbols)',ex:'AroundByte-2026',v:s=>/^[\x20-\x7e]+$/.test(s)?'':'Use printable ASCII characters only (no accents or emoji).'},
 CODE39:{n:'Code 39',jb:'CODE39',hint:'A–Z, 0–9, space and - . $ / + %',ex:'AROUND-BYTE',v:s=>/^[0-9A-Z\-. $\/+%]+$/.test(s.toUpperCase())?'':'Allowed: A–Z, 0–9, space and - . $ / + %'},
 ITF14:{n:'ITF-14',jb:'ITF14',hint:'13 digits (check digit added) or 14 digits',ex:'1234567890123',v:gtin(0,13,'ITF-14')},
 ITF:{n:'ITF (Interleaved 2 of 5)',jb:'ITF',hint:'An even number of digits',ex:'12345678',v:s=>!D.test(s)?'Digits only (0–9).':s.length%2?'ITF needs an even number of digits.':''},
 CODABAR:{n:'Codabar',jb:'codabar',hint:'Start and stop with A–D; digits and - $ : / . + between',ex:'A123456789B',v:s=>/^[A-D][0-9\-$:\/.+]+[A-D]$/i.test(s)?'':'Start and end with A, B, C or D, with digits or - $ : / . + in between (e.g. A123456B).'}};
const upceCheck=s7=>{const n=s7[0],d=s7.slice(1),l=d[5];const a=l<='2'?n+d[0]+d[1]+l+'0000'+d[2]+d[3]+d[4]:l==='3'?n+d[0]+d[1]+d[2]+'00000'+d[3]+d[4]:l==='4'?n+d.slice(0,4)+'00000'+d[4]:n+d.slice(0,5)+'0000'+l;return gs1(a)};
const normalize=(k,s)=>(k==='CODE39'||k==='CODABAR')?s.toUpperCase():(k==='UPCE'&&/^[01]\d{6}$/.test(s))?s+upceCheck(s):s;
/** Returns {svg,w,h} or throws Error with a user-friendly message. o:{w,h,m,fg,bg,text,fs,pos} */
export function barcodeSvg(key,raw,o){
  const F=FORMATS[key];let val=normalize(key,String(raw).trim());if(!val)throw Object.assign(new Error('Enter the data to encode.'),{soft:1});
  const e=F.v(val);if(e)throw new Error(e);
  const el=document.createElementNS('http://www.w3.org/2000/svg','svg');let ok=true;
  window.JsBarcode(el,val,{format:F.jb,width:o.w,height:o.h,margin:o.m,lineColor:o.fg,background:o.bg,displayValue:o.text,fontSize:o.fs,font:'Arial, Helvetica, sans-serif',textPosition:o.pos,textMargin:3,valid:v=>{ok=v}});
  if(!ok)throw new Error('This data is not valid for '+F.n+'.');
  const w=parseFloat(el.getAttribute('width')),h=parseFloat(el.getAttribute('height'));
  el.setAttribute('xmlns','http://www.w3.org/2000/svg');el.setAttribute('viewBox',`0 0 ${w} ${h}`);el.removeAttribute('style');
  return {svg:new XMLSerializer().serializeToString(el),w,h}}
export const BC_PAGES={ean13:'EAN13',ean8:'EAN8',upca:'UPCA',upce:'UPCE',code128:'CODE128',code39:'CODE39',itf14:'ITF14',itf:'ITF',codabar:'CODABAR'};

export function renderBarcode(root,slug){
  const k0=BC_PAGES[slug];if(!k0)return false;const S={key:k0,vals:{},w:2,h:100,m:10,fg:'#000000',bg:'#ffffff',text:true,fs:18,pos:'bottom',scale:3};let cur=null;
  root.innerHTML=`<header class="top"><div class="top-copy"><a class="btn ghost back-btn" href="#/">${icon('back')}<span>All tools</span></a><h1 id="bt">${FORMATS[k0].n} Generator</h1><p>Enter your data, check the validation and download a barcode in PNG, SVG or PDF.</p></div></header>
  <section class="work"><div class="stack"><div class="blk"><h2 class="blk-h">Data</h2><div class="fields two">
   <label>Barcode format<select id="fmt">${Object.entries(FORMATS).map(([k,f])=>`<option value="${k}" ${k===k0?'selected':''}>${f.n}</option>`).join('')}</select></label>
   <label>Data<input id="data" autocomplete="off" spellcheck="false"></label><p class="hint full" id="hint"></p></div></div>
   <div class="blk"><h2 class="blk-h">Design</h2><div class="two">
   <label><span>Bar width: <b id="wV">2</b> px</span><input type="range" id="w" min="1" max="6" value="2"></label><label><span>Height: <b id="hV">100</b> px</span><input type="range" id="h" min="30" max="300" value="100"></label>
   <label><span>Margin: <b id="mV">10</b> px</span><input type="range" id="m" min="0" max="40" value="10"></label><label>PNG resolution<select id="scale"><option value="1">1×</option><option value="2">2×</option><option value="3" selected>3×</option><option value="4">4×</option></select></label>
   <label>Bar color<input type="color" id="fg" value="#000000"></label><label>Background<input type="color" id="bg" value="#ffffff"></label>
   <label class="check-row"><input type="checkbox" id="text" checked> Show human-readable text</label><label>Text position<select id="pos"><option value="bottom">Below bars</option><option value="top">Above bars</option></select></label>
   <label><span>Text size: <b id="fsV">18</b> px</span><input type="range" id="fs" min="10" max="40" value="18"></label></div></div></div>
   <aside class="panel"><h2>Preview</h2><div class="stage" id="stage"></div><p class="status" id="status" role="status"></p>
   <div class="dl-row"><button class="btn pri" data-dl="png">${icon('download')}PNG</button><button class="btn" data-dl="svg">${icon('download')}SVG</button><button class="btn" data-dl="pdf">${icon('download')}PDF</button></div></aside></section>`;
  const inp=$('#data',root),st=$('#stage',root),stat=$('#status',root),btns=$$('[data-dl]',root);
  const setFmt=()=>{const F=FORMATS[S.key];inp.placeholder='e.g. '+F.ex;inp.value=S.vals[S.key]??'';$('#hint',root).textContent='Accepts: '+F.hint+'.';$('#bt',root).textContent=F.n+' Generator'};
  let t;const upd=()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>{let msg='',cls='';try{const r=barcodeSvg(S.key,inp.value,S);cur={...r,val:inp.value.trim()};st.innerHTML=r.svg;msg=`Ready · ${r.w}×${r.h}px`;cls='ok'}catch(e){cur=null;st.innerHTML=`<div class="ph">${icon('bars')}<span>Your barcode appears here</span></div>`;msg=e.message||'Invalid data';cls=e.soft?'soft':'err'}stat.textContent=msg;stat.className='status '+cls;btns.forEach(b=>b.disabled=!cur)})};
  root.addEventListener('input',e=>{const el=e.target,id=el.id;if(id==='data')S.vals[S.key]=el.value;else if(id==='fmt'){S.key=el.value;setFmt()}else if('whmfs'.includes(id)&&id.length===1||id==='fs'){S[id]=+el.value;$('#'+id+'V',root).textContent=el.value}else if(id==='fg'||id==='bg'||id==='pos')S[id]=el.value;else if(id==='scale')S.scale=+el.value;else if(id==='text')S.text=el.checked;else return;upd()});
  root.addEventListener('click',async e=>{const b=e.target.closest('[data-dl]');if(!b||!cur)return;const base=`aroundbyte-${S.key.toLowerCase()}-${cur.val.replace(/[^\w-]+/g,'_').slice(0,30)}`;
    try{if(b.dataset.dl==='svg')return dl(svgBlob(cur.svg),base+'.svg');const png=await svgToPng(cur.svg,cur.w,cur.h,S.scale);if(b.dataset.dl==='png')dl(png,base+'.png');else dl(await pngToPdf(png,cur.w*S.scale,cur.h*S.scale,FORMATS[S.key].n),base+'.pdf');toast('Download started','ok')}catch(er){toast(er.message||'Download failed','err')}});
  setFmt();upd();return true}
