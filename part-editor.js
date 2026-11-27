const PartEditor = (()=>{
 const el=id=>document.getElementById(id);
 let outfit,parts=[],colors={},masks={},active=null,original=null,sourceImage=null,w=0,h=0,revision=0,history=[],drawing=false,lastPoint=null,frame=0;
 let pickPending=null;
 let mode='pick',keyPoint={x:256,y:384},loadFailed=false;
 const canvas=el('colorCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const hasMask=id=>masks[id]?.some(v=>v>0);
 const changed=()=>parts.filter(p=>PART_COLORS[colors[p.id]]);
 const pending=()=>changed().filter(p=>!hasMask(p.id));
 const status=text=>{el('editorStatus').textContent=text;};
 function emptyMask(){return new Uint8Array(w*h);}
 function snapshot(){history.push({colors:{...colors},masks:Object.fromEntries(Object.entries(masks).map(([id,m])=>[id,m.slice()]))});if(history.length>6)history.shift();}
 function draw(){
  if(!original)return;
  let pixels=new Uint8ClampedArray(original.data);
  if(!el('compareOriginal').checked){
   for(const p of changed())if(hasMask(p.id))pixels=tintPixels(pixels,masks[p.id],PART_COLORS[colors[p.id]][1]);
   if(el('showMask').checked&&hasMask(active))for(let i=0;i<w*h;i++)if(masks[active][i]){const k=i*4;pixels[k]=pixels[k]*.55+30*.45;pixels[k+1]=pixels[k+1]*.55+190*.45;pixels[k+2]=pixels[k+2]*.55+180*.45;}
  }
  ctx.putImageData(new ImageData(pixels,w,h),0,0);
 }
 function scheduleDraw(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});}
 function update(){
  el('partRows').innerHTML=parts.map(p=>{
   const choice=PART_COLORS[colors[p.id]],selected=p.id===active;
   return `<section class="partRow ${selected?'is-active':''}"><div class="partRowHeading"><button type="button" data-part="${p.id}" aria-pressed="${selected}">${p.label}<span>${hasMask(p.id)?'영역 지정됨':'영역 선택'}</span></button><span class="partColorName">${choice?choice[0]:'원본'}</span></div><div class="partSwatches" role="group" aria-label="${p.label} 색상"><button type="button" class="originalSwatch" data-color="original" data-for="${p.id}" aria-label="${p.label} 원본 색상" title="원본" aria-pressed="${!choice}">↺</button>${partPalette(p,outfit).map(k=>`<button type="button" data-color="${k}" data-for="${p.id}" style="--swatch:${PART_COLORS[k][1]}" aria-label="${p.label} ${PART_COLORS[k][0]}" title="${PART_COLORS[k][0]}" aria-pressed="${colors[p.id]===k}"><span>${colors[p.id]===k?'✓':''}</span></button>`).join('')}</div>${selected?'<button type="button" class="jumpToImage" data-jump="true">사진에서 영역 선택 ↑</button>':''}</section>`;
  }).join('');
  const p=parts.find(p=>p.id===active);
  el('activePart').textContent=p?p.label:'파츠 선택';
  el('prompt').value=partPrompt(outfit.prompt,parts,colors);
  el('copy').textContent='의상 태그 복사 ↗';
  const missing=pending();
  el('exportColors').disabled=!original||!changed().length||!!missing.length;
  el('saveCombination').disabled=!original;
  el('undoMask').disabled=!history.length;
  el('clearMask').disabled=!hasMask(active);
  el('exportHelp').textContent=loadFailed?'이미지를 불러오지 못했어요. 원본 다운로드를 사용하거나 다시 열어 주세요.':!original?'이미지를 불러오는 중…':missing.length?`${missing.map(p=>p.label).join(', ')}의 영역을 먼저 지정해 주세요.`:changed().length?'현재 색상과 영역으로 PNG를 저장해요.':'파츠 색상을 선택하면 보정 이미지를 저장할 수 있어요.';
  scheduleDraw();
 }
 function ranges(mask){const out=[];for(let i=0;i<mask.length;i++){if(!mask[i])continue;const start=i;while(i+1<mask.length&&mask[i+1])i++;out.push(start,i-start+1);}return out;}
 function restore(saved){
  if(saved?.version!==1||saved.prompt!==outfit.prompt||saved.w!==w||saved.h!==h)return;
  for(const p of parts){if(PART_COLORS[saved.colors?.[p.id]])colors[p.id]=saved.colors[p.id];const runs=saved.masks?.[p.id];if(!Array.isArray(runs)||runs.length%2)continue;const m=emptyMask();for(let j=0;j<runs.length;j+=2){const start=runs[j],len=runs[j+1];if(Number.isInteger(start)&&Number.isInteger(len)&&start>=0&&len>0&&start+len<=m.length)m.fill(255,start,start+len);}masks[p.id]=m;}
 }
 function open(next){
  const token=++revision;outfit=next;parts=garmentParts(next.prompt);colors={};masks={};history=[];original=null;sourceImage=null;active=parts[0]?.id;drawing=false;pickPending=null;loadFailed=false;
  el('compareOriginal').checked=false;el('showMask').checked=false;setMode('pick');
  el('editorVisual').hidden=!next.image;canvas.hidden=true;el('detailImage').hidden=!next.image;el('editorLoading').hidden=false;
  status('색상 선택 후 사진에서 해당 옷을 눌러 주세요.');update();
  if(!next.image)return;
  const img=new Image();
  img.onload=()=>{if(token!==revision)return;sourceImage=img;w=Math.min(512,img.naturalWidth);h=Math.round(img.naturalHeight*w/img.naturalWidth);canvas.width=w;canvas.height=h;ctx.drawImage(img,0,0,w,h);
   try{original=ctx.getImageData(0,0,w,h);}catch{fail();return;}
   keyPoint={x:Math.floor(w/2),y:Math.floor(h/2)};
   try{restore(JSON.parse(localStorage.getItem('wa-parts-'+next.id)||'null'));}catch{}
   canvas.hidden=false;el('detailImage').hidden=true;el('editorLoading').hidden=true;update();
  };
  function fail(){if(token!==revision)return;loadFailed=true;el('editorLoading').hidden=true;status('이미지를 불러오지 못했어요. 창을 다시 열어 주세요.');update();}
  img.onerror=fail;img.src=next.image;
 }
 function setMode(next){mode=next;document.querySelectorAll('[data-mask-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.maskMode===next)));canvas.dataset.mode=next;}
 function applyMask(addition,erase=false){
  if(!active)return;if(!masks[active])masks[active]=emptyMask();
  for(let i=0;i<addition.length;i++)if(addition[i]){masks[active][i]=erase?0:255;if(!erase)for(const id in masks)if(id!==active)masks[id][i]=0;}
 }
 function pick(x,y){if(!original||!active)return;snapshot();const mask=connectedMask(original.data,w,h,x,y,Number(el('maskTolerance').value));if(mask.reduce((n,v)=>n+(v?1:0),0)>w*h*.45){history.pop();status('배경까지 넓게 선택돼 적용하지 않았어요. 선택 범위를 낮추거나 브러시로 지정해 주세요.');return;}applyMask(mask);status(`${parts.find(p=>p.id===active).label} 영역에 추가했어요. 다른 조각도 눌러 추가할 수 있어요.`);update();}
 function point(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(w-1,Math.floor((e.clientX-r.left)*w/r.width))),y:Math.max(0,Math.min(h-1,Math.floor((e.clientY-r.top)*h/r.height)))};}
 function stroke(a,b){const radius=Number(el('brushSize').value),distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(distance/(radius*.4))),addition=emptyMask();
  for(let s=0;s<=steps;s++){const x=a.x+(b.x-a.x)*s/steps,y=a.y+(b.y-a.y)*s/steps;for(let yy=Math.max(0,Math.floor(y-radius));yy<=Math.min(h-1,Math.ceil(y+radius));yy++)for(let xx=Math.max(0,Math.floor(x-radius));xx<=Math.min(w-1,Math.ceil(x+radius));xx++)if((xx-x)**2+(yy-y)**2<=radius**2)addition[yy*w+xx]=255;}
  applyMask(addition,mode==='erase');scheduleDraw();
 }
 canvas.addEventListener('pointerdown',e=>{if(!original||!active||el('compareOriginal').checked)return;e.preventDefault();const p=point(e);keyPoint=p;if(mode==='pick'){pickPending=p;return;}snapshot();drawing=true;lastPoint=p;canvas.setPointerCapture(e.pointerId);stroke(p,p);});
 canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);stroke(lastPoint,p);lastPoint=p;});
 function endStroke(){if(drawing){drawing=false;update();status('영역을 수정했어요. 선택 영역 표시로 확인할 수 있어요.');}}
 canvas.addEventListener('pointerup',e=>{if(pickPending){const p=point(e);if(Math.hypot(p.x-pickPending.x,p.y-pickPending.y)<10)pick(p.x,p.y);pickPending=null;}endStroke();});canvas.addEventListener('pointercancel',()=>{pickPending=null;endStroke();});canvas.addEventListener('lostpointercapture',endStroke);
 canvas.addEventListener('keydown',e=>{if(!original)return;const dirs={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};if(dirs[e.key]){e.preventDefault();keyPoint.x=Math.max(0,Math.min(w-1,keyPoint.x+dirs[e.key][0]));keyPoint.y=Math.max(0,Math.min(h-1,keyPoint.y+dirs[e.key][1]));draw();ctx.strokeStyle='#00b8a9';ctx.lineWidth=2;ctx.strokeRect(keyPoint.x-5,keyPoint.y-5,10,10);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(el('compareOriginal').checked)return;if(mode==='pick')pick(keyPoint.x,keyPoint.y);else{snapshot();stroke(keyPoint,keyPoint);update();}}});
 el('partRows').onclick=e=>{const b=e.target.closest('[data-color],[data-part],[data-jump]');if(!b)return;if(b.dataset.jump){el('editorVisual').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});canvas.focus({preventScroll:true});return;}if(b.dataset.color){snapshot();active=b.dataset.for;if(b.dataset.color==='original')delete colors[active];else colors[active]=b.dataset.color;el('compareOriginal').checked=false;update();const colorButton=el('partRows').querySelector(`[data-for="${active}"][data-color="${b.dataset.color}"]`);colorButton?.focus({preventScroll:true});status(hasMask(active)?'색상을 적용했어요.':`${parts.find(p=>p.id===active).label}: 사진에서 이 옷을 눌러 영역을 지정해 주세요.`);}else{active=b.dataset.part;update();el('partRows').querySelector(`[data-part="${active}"]`)?.focus({preventScroll:true});status('선택한 파츠의 옷을 사진에서 눌러 주세요.');}};
 el('maskTools').onclick=e=>{const b=e.target.closest('[data-mask-mode]');if(b)setMode(b.dataset.maskMode);};
 el('showMask').onchange=draw;el('compareOriginal').onchange=draw;
 el('undoMask').onclick=()=>{const prev=history.pop();if(!prev)return;colors=prev.colors;masks=prev.masks;update();status('이전 단계로 되돌렸어요.');};
 el('clearMask').onclick=()=>{snapshot();delete masks[active];update();status('이 파츠의 영역을 지웠어요. 다시 선택해 주세요.');};
 el('resetParts').onclick=()=>{snapshot();colors={};masks={};el('compareOriginal').checked=false;update();status('원본으로 돌아왔어요. 저장된 조합도 바꾸려면 조합 저장을 눌러 주세요.');};
 el('saveCombination').onclick=()=>{try{localStorage.setItem('wa-parts-'+outfit.id,JSON.stringify({version:1,prompt:outfit.prompt,w,h,colors,masks:Object.fromEntries(Object.entries(masks).map(([id,m])=>[id,ranges(m)]))}));status('이 브라우저에 조합과 영역을 저장했어요. 다시 열어도 유지돼요.');}catch{status('브라우저 저장 공간이 부족해요. 이미지를 다운로드해서 보관해 주세요.');}};
 el('exportColors').onclick=async()=>{
  if(!original||pending().length||!changed().length)return;
  const token=revision,img=sourceImage,exportW=w,exportH=h,selected=changed().map(p=>({mask:masks[p.id].slice(),hex:PART_COLORS[colors[p.id]][1]})),filename=outfit.id+'-custom.png';
  el('exportColors').disabled=true;status('원본 해상도로 이미지를 저장하는 중…');
  try{
   await new Promise(requestAnimationFrame);
   const output=document.createElement('canvas');output.width=img.naturalWidth;output.height=img.naturalHeight;const out=output.getContext('2d');out.drawImage(img,0,0);let pixels=out.getImageData(0,0,output.width,output.height);
   const small=document.createElement('canvas');small.width=exportW;small.height=exportH;const smallCtx=small.getContext('2d');const large=document.createElement('canvas');large.width=output.width;large.height=output.height;const largeCtx=large.getContext('2d');
   for(const p of selected){const md=smallCtx.createImageData(exportW,exportH);for(let i=0;i<exportW*exportH;i++)md.data[i*4+3]=p.mask[i];smallCtx.putImageData(md,0,0);largeCtx.clearRect(0,0,large.width,large.height);largeCtx.drawImage(small,0,0,large.width,large.height);const scaled=largeCtx.getImageData(0,0,large.width,large.height).data,mask=new Uint8Array(large.width*large.height);for(let i=0;i<mask.length;i++)mask[i]=scaled[i*4+3];pixels=new ImageData(tintPixels(pixels.data,mask,p.hex),large.width,large.height);}
   out.putImageData(pixels,0,0);const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw Error('empty PNG');
   if(token!==revision)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status('색상 변경 PNG를 다운로드했어요.');
  }catch{if(token===revision)status('이미지 저장에 실패했어요. 다시 시도해 주세요.');}finally{if(token===revision)update();}
 };
 return {open};
})();
