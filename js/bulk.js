import {$,$$,esc,icon,toast} from './ui.js';
import {dl,svgBlob,svgToPng} from './export.js';
import {qrSvg} from './qrgen.js';
import {FORMATS,barcodeSvg} from './barcode.js';
export function parseCsv(t){const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','||c==='\t'){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);rows.push(r);r=[];f=''}else f+=c}if(f||r.length){r.push(f);rows.push(r)}return rows.filter(r=>r.some(x=>x.trim()))}
const safe=s=>String(s).normalize('NFKD').replace(/[^\w.-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40)||'item';
const MAX=500;
export function renderBulk(root,kind){
  if(kind!=='qr'&&kind!=='barcode')return false;const isQ=kind==='qr';let names=null,busy=false;
  root.innerHTML=`<header class="top"><div class="top-copy"><a class="btn ghost back-btn" href="#/">${icon('back')}<span>All tools</span></a><h1>Bulk ${isQ?'QR Code':'Barcode'} Generator</h1><p>Enter one value per line or upload a CSV, then download every code in a single ZIP (up to ${MAX} per batch).</p></div></header>
  <section class="work"><div class="stack"><div class="blk"><h2 class="blk-h">Entries</h2>
   <label class="full">One ${isQ?'URL or text':'barcode value'} per line<textarea id="list" rows="9" placeholder="${isQ?'https://example.com/a\nhttps://example.com/b':FORMATS.CODE128.ex+'\nAB-1002'}"></textarea></label>
   <div class="logo-row"><label class="btn ghost file-btn">${icon('upload')}<span>Upload CSV / TXT</span><input type="file" id="csv" accept=".csv,.txt,text/csv,text/plain" hidden></label><label class="check-row"><input type="checkbox" id="hdr"> First row is a header</label></div>
   <p class="hint">CSV: first column = value, optional second column = file name.</p><p class="status" id="count"></p></div>
  <div class="blk"><h2 class="blk-h">Settings</h2><div class="two">
   ${isQ?`<label>Module style<select id="shape"><option value="square">Square</option><option value="rounded">Rounded</option><option value="dot">Dots</option></select></label><label>Error correction<select id="ecc"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></label><label><span>Size: <b id="sV">800</b> px</span><input type="range" id="s" min="256" max="2048" step="64" value="800"></label>`:
   `<label>Format<select id="fmt">${Object.entries(FORMATS).map(([k,f])=>`<option value="${k}" ${k==='CODE128'?'selected':''}>${f.n}</option>`).join('')}</select></label><label><span>Bar width: <b id="wV">2</b> px</span><input type="range" id="w" min="1" max="6" value="2"></label><label><span>Height: <b id="hV">100</b> px</span><input type="range" id="h" min="30" max="300" value="100"></label><label class="check-row"><input type="checkbox" id="text" checked> Show text</label>`}
   <label>Foreground<input type="color" id="fg" value="#000000"></label><label>Background<input type="color" id="bg" value="#ffffff"></label>
   <label class="check-row"><input type="checkbox" id="png" checked> PNG files</label><label class="check-row"><input type="checkbox" id="svg" checked> SVG files</label></div></div></div>
   <aside class="panel"><h2>Batch</h2><p class="muted" id="sum">Add entries to begin.</p><div class="prog" hidden id="prog"><i style="width:0"></i></div><div id="errs" class="errs"></div><button class="btn pri" id="go">${icon('layers')}Generate ZIP</button></aside></section>`;
  const list=$('#list',root),cnt=$('#count',root),entries=()=>list.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const upd=()=>{const n=entries().length;cnt.textContent=n?`${n} entr${n===1?'y':'ies'}${n>MAX?` — only the first ${MAX} will be used`:''}`:'';cnt.className='status '+(n>MAX?'warn':'ok');$('#sum',root).textContent=n?`${Math.min(n,MAX)} code${n===1?'':'s'} ready to generate.`:'Add entries to begin.'};
  list.addEventListener('input',()=>{names=null;upd()});
  root.addEventListener('input',e=>{const id=e.target.id;if(['s','w','h'].includes(id))$('#'+id+'V',root).textContent=e.target.value});
  $('#csv',root).addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(f.size>5e6)return toast('File is too large (max 5 MB).','err');const r=new FileReader();r.onload=()=>{let rows=parseCsv(String(r.result).replace(/^\uFEFF/,''));if($('#hdr',root).checked)rows=rows.slice(1);rows=rows.filter(x=>(x[0]||'').trim());if(!rows.length)return toast('No entries found in that file.','err');names=rows.map(x=>(x[1]||'').trim());list.value=rows.map(x=>x[0].trim()).join('\n');upd();toast(`Loaded ${rows.length} entries`,'ok')};r.onerror=()=>toast('Could not read the file.','err');r.readAsText(f)});
  $('#go',root).addEventListener('click',async()=>{if(busy)return;const items=entries().slice(0,MAX);if(!items.length)return toast('Add at least one entry.','err');
    const png=$('#png',root).checked,svgOn=$('#svg',root).checked;if(!png&&!svgOn)return toast('Choose PNG, SVG or both.','err');
    busy=true;const go=$('#go',root);go.disabled=true;const pr=$('#prog',root),bar=pr.firstElementChild;pr.hidden=false;const errs=[],rows=['file,value,status'],zip=new JSZip(),used=new Set();let ok=0;
    const g=id=>$('#'+id,root),o=isQ?{ecc:g('ecc').value,size:+g('s').value,quiet:4,fg:g('fg').value,bg:g('bg').value,shape:g('shape').value}:{w:+g('w').value,h:+g('h').value,m:10,fg:g('fg').value,bg:g('bg').value,text:g('text').checked,fs:18,pos:'bottom'};
    const csvq=s=>'"'+String(s).replace(/"/g,'""')+'"';
    try{for(let i=0;i<items.length;i++){const v=items[i];let base=String(i+1).padStart(3,'0')+'-'+safe((names&&names[i])||v);while(used.has(base))base+='_';used.add(base);
      try{let svg,w,h;if(isQ){svg=qrSvg(v,o);w=h=o.size}else{({svg,w,h}=barcodeSvg(g('fmt').value,v,o))}
        if(svgOn)zip.file(`svg/${base}.svg`,svg);if(png)zip.file(`png/${base}.png`,await svgToPng(svg,w,h,isQ?1:3));ok++;rows.push(`${csvq(base)},${csvq(v)},ok`)}
      catch(e){const m=/overflow|code length/i.test(e.message)?'Too much data for a QR code':e.message;errs.push(`Line ${i+1}: ${m}`);rows.push(`,${csvq(v)},${csvq(m)}`)}
      bar.style.width=Math.round((i+1)/items.length*90)+'%';if(i%5===4)await new Promise(r=>setTimeout(r))}
      if(!ok)throw new Error('No codes could be generated. Check the errors below.');
      zip.file('report.csv',rows.join('\r\n'));const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'},m=>{bar.style.width=90+m.percent/10+'%'});dl(blob,`aroundbyte-bulk-${kind}-codes.zip`);toast(`${ok} code${ok===1?'':'s'} generated`,'ok')}
    catch(e){toast(e.message||'Bulk generation failed','err')}
    $('#errs',root).innerHTML=errs.length?`<p class="status err">${errs.length} skipped:</p><ul>${errs.slice(0,30).map(x=>`<li>${esc(x)}</li>`).join('')}${errs.length>30?`<li>…and ${errs.length-30} more (see report.csv)</li>`:''}</ul>`:'';
    pr.hidden=true;bar.style.width='0';go.disabled=false;busy=false});
  return true}
