/* Preset garment masks: images/masks/<id>.png stores one label per pixel
 * (value = (part index + 1) * 16). Tapping a swatch tints that part at once. */
const PartEditor = (()=>{
 const el=id=>document.getElementById(id);
 let outfit,parts=[],colors={},masks={},labels=null,LW=0,LH=0,active=null,original=null,sourceImage=null,w=0,h=0,revision=0,frame=0,fade=0,loadFailed=false;
 const canvas=el('colorCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const prev=document.createElement('canvas'),prevCtx=prev.getContext('2d');
 const hasMask=id=>!!masks[id];
 const changed=()=>parts.filter(p=>PART_COLORS[colors[p.id]]);
 const status=text=>{el('editorStatus').textContent=text;};
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function render(){
  let pixels=new Uint8ClampedArray(original.data);
  if(!el('compareOriginal').checked)for(const p of changed())if(hasMask(p.id))pixels=tintPixels(pixels,masks[p.id],PART_COLORS[colors[p.id]][1]);
  return new ImageData(pixels,w,h);
 }
 function draw(animate){
  if(!original)return;
  cancelAnimationFrame(fade);
  if(!animate||reduced()){ctx.putImageData(render(),0,0);return;}
  prev.width=w;prev.height=h;prevCtx.drawImage(canvas,0,0);
  const next=document.createElement('canvas');next.width=w;next.height=h;next.getContext('2d').putImageData(render(),0,0);
  const start=performance.now();
  const step=now=>{const t=Math.min(1,(now-start)/240);ctx.globalAlpha=1;ctx.drawImage(prev,0,0);ctx.globalAlpha=t*(2-t);ctx.drawImage(next,0,0);ctx.globalAlpha=1;if(t<1)fade=requestAnimationFrame(step);};
  fade=requestAnimationFrame(step);
 }
 function scheduleDraw(animate){if(animate){draw(true);return;}if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw(false);});}
 function renderRows(){
  const swatch=(p,k)=>`<button type="button" class="swatch" data-color="${k}" data-for="${p.id}" style="--swatch:${PART_COLORS[k][1]}" aria-label="${p.label} ${PART_COLORS[k][0]}" title="${PART_COLORS[k][0]}" aria-pressed="false"></button>`;
  el('partRows').innerHTML=parts.map(p=>`<section class="partRow" data-row="${p.id}"><button type="button" class="partHead" data-part="${p.id}" aria-pressed="false"><span class="partDot"></span><span class="partName">${p.label}</span><span class="partState"></span><span class="partColorName"></span></button><div class="partSwatches" role="group" aria-label="${p.label} 색상"><button type="button" class="swatch originalSwatch" data-color="original" data-for="${p.id}" aria-label="${p.label} 원본 색상" title="원본" aria-pressed="true">원본</button>${partPalette(p,outfit).map(k=>swatch(p,k)).join('')}</div></section>`).join('');
 }
 function update(animate){
  for(const p of parts){
   const row=el('partRows').querySelector(`[data-row="${p.id}"]`);if(!row)continue;
   const choice=PART_COLORS[colors[p.id]],selected=p.id===active;
   row.classList.toggle('is-active',selected);row.classList.toggle('is-colored',!!choice);
   row.querySelector('.partHead').setAttribute('aria-pressed',String(selected));
   row.querySelector('.partDot').style.setProperty('--swatch',choice?choice[1]:'transparent');
   const state=row.querySelector('.partState');state.textContent=original&&!hasMask(p.id)?'태그만 변경':'';
   row.querySelector('.partColorName').textContent=choice?choice[0]:'원본';
   row.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===(colors[p.id]||'original'))));
  }
  const p=parts.find(p=>p.id===active),choice=PART_COLORS[colors[active]];
  el('activePart').textContent=p?p.label:'파츠 선택';
  el('activeDot').style.setProperty('--swatch',choice?choice[1]:'transparent');
  el('activeColor').textContent=choice?choice[0]:'원본';
  el('prompt').value=partPrompt(outfit.prompt,parts,colors);
  el('copy').textContent='의상 태그 복사 ↗';
  const painted=changed().filter(p=>hasMask(p.id));
  el('exportColors').disabled=!original||!painted.length;
  el('saveCombination').disabled=!outfit;
  el('exportHelp').textContent=loadFailed?'이미지를 불러오지 못했어요. 원본 다운로드를 사용하거나 다시 열어 주세요.':!original?'이미지를 불러오는 중…':painted.length?'현재 색상으로 원본 해상도 PNG를 저장해요.':'파츠 색상을 고르면 보정 이미지를 저장할 수 있어요.';
  scheduleDraw(animate);
 }
 // Label map -> soft per-part alpha at (tw x th) by area averaging.
 function partAlpha(index,tw,th){
  const out=new Uint8Array(tw*th),sx=LW/tw,sy=LH/th,target=index+1;let any=false;
  for(let y=0;y<th;y++){const y0=Math.floor(y*sy),y1=Math.max(y0+1,Math.floor((y+1)*sy));
   for(let x=0;x<tw;x++){const x0=Math.floor(x*sx),x1=Math.max(x0+1,Math.floor((x+1)*sx));let hit=0,n=0;
    for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){n++;if(labels[yy*LW+xx]===target)hit++;}
    if(hit){out[y*tw+x]=Math.round(255*hit/n);any=true;}}}
  return any?out:null;
 }
 function feather(mask,tw,th){
  const out=new Uint8Array(mask.length);
  for(let y=0;y<th;y++)for(let x=0;x<tw;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=th)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=tw)continue;s+=mask[yy*tw+xx];n++;}}out[y*tw+x]=s/n;}
  return out;
 }
 function loadLabels(src){
  return new Promise(resolve=>{const m=new Image();m.onload=()=>{try{const c=document.createElement('canvas');c.width=m.naturalWidth;c.height=m.naturalHeight;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(m,0,0);const d=cx.getImageData(0,0,c.width,c.height).data,l=new Uint8Array(c.width*c.height);for(let i=0;i<l.length;i++)l[i]=Math.round(d[i*4]/16);resolve({l,W:c.width,H:c.height});}catch{resolve(null);}};m.onerror=()=>resolve(null);m.src=src;});
 }
 function restore(saved){
  if(!saved||(saved.version!==1&&saved.version!==2)||saved.prompt!==outfit.prompt)return;
  for(const p of parts)if(PART_COLORS[saved.colors?.[p.id]])colors[p.id]=saved.colors[p.id];
 }
 function open(next){
  const token=++revision;outfit=next;parts=garmentParts(next.prompt);colors={};masks={};labels=null;original=null;sourceImage=null;active=parts[0]?.id;loadFailed=false;
  el('compareOriginal').checked=false;renderRows();el('partRows').scrollTop=0;
  try{restore(JSON.parse(localStorage.getItem('wa-parts-'+next.id)||'null'));}catch{}
  el('editorVisual').hidden=!next.image;canvas.hidden=true;el('detailImage').hidden=!next.image;el('editorLoading').hidden=false;
  status('색을 탭하면 사진에 바로 입혀져요.');update();
  if(!next.image)return;
  const img=new Image();
  const imageReady=new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});img.src=next.image;
  Promise.all([imageReady,loadLabels('images/masks/'+next.id+'.png')]).then(([,lab])=>{
   if(token!==revision)return;sourceImage=img;w=Math.min(512,img.naturalWidth);h=Math.round(img.naturalHeight*w/img.naturalWidth);canvas.width=w;canvas.height=h;ctx.drawImage(img,0,0,w,h);
   try{original=ctx.getImageData(0,0,w,h);}catch{fail();return;}
   if(lab){labels=lab.l;LW=lab.W;LH=lab.H;parts.forEach((p,i)=>{const m=partAlpha(i,w,h);if(m)masks[p.id]=m;});}
   else status('이 코디는 색상 영역이 없어 태그만 바뀌어요.');
   canvas.hidden=false;el('detailImage').hidden=true;el('editorLoading').hidden=true;update();
  }).catch(fail);
  function fail(){if(token!==revision)return;loadFailed=true;el('editorLoading').hidden=true;status('이미지를 불러오지 못했어요. 창을 다시 열어 주세요.');update();}
 }
 el('partRows').onclick=e=>{const b=e.target.closest('[data-color],[data-part]');if(!b)return;
  if(b.dataset.color){active=b.dataset.for;const p=parts.find(p=>p.id===active);if(b.dataset.color==='original')delete colors[active];else colors[active]=b.dataset.color;el('compareOriginal').checked=false;update(true);
   status(b.dataset.color==='original'?`${p.label}을(를) 원본 색으로 되돌렸어요.`:hasMask(active)||!original?`${p.label}에 ${PART_COLORS[colors[active]][0]}을(를) 입혔어요.`:`${p.label}은(는) 사진에서 보이지 않아 태그만 바뀌어요.`);}
  else{active=b.dataset.part;update();}};
 el('compareOriginal').onchange=()=>draw(true);
 el('resetParts').onclick=()=>{colors={};el('compareOriginal').checked=false;update(true);status('원본으로 돌아왔어요. 저장된 조합도 바꾸려면 조합 저장을 눌러 주세요.');};
 el('saveCombination').onclick=()=>{try{localStorage.setItem('wa-parts-'+outfit.id,JSON.stringify({version:2,prompt:outfit.prompt,colors}));status('이 브라우저에 색상 조합을 저장했어요. 다시 열어도 유지돼요.');}catch{status('브라우저 저장 공간이 부족해요. 이미지를 다운로드해서 보관해 주세요.');}};
 el('exportColors').onclick=async()=>{
  const painted=changed().filter(p=>hasMask(p.id));if(!original||!painted.length||!labels)return;
  const token=revision,img=sourceImage,filename=outfit.id+'-custom.png',list=painted.map(p=>({index:parts.indexOf(p),hex:PART_COLORS[colors[p.id]][1]}));
  el('exportColors').disabled=true;status('원본 해상도로 이미지를 저장하는 중…');
  try{
   await new Promise(requestAnimationFrame);
   const output=document.createElement('canvas');output.width=img.naturalWidth;output.height=img.naturalHeight;const out=output.getContext('2d');out.drawImage(img,0,0);
   let data=out.getImageData(0,0,output.width,output.height).data;
   for(const p of list){const m=partAlpha(p.index,output.width,output.height);if(m)data=tintPixels(data,feather(m,output.width,output.height),p.hex);}
   out.putImageData(new ImageData(data,output.width,output.height),0,0);
   const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw Error('empty PNG');
   if(token!==revision)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status('색상 변경 PNG를 다운로드했어요.');
  }catch{if(token===revision)status('이미지 저장에 실패했어요. 다시 시도해 주세요.');}finally{if(token===revision)update();}
 };
 return {open};
})();
