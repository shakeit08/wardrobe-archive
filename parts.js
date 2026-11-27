/* Garment-level prompt edits. Color words after the garment noun (lining,
 * piping, buttons, buckles) are intentionally preserved. */
const PART_COLORS = {
 ivory:['아이보리','#ece5d5','ivory'], black:['블랙','#27272c','black'], charcoal:['차콜','#55555e','charcoal'],
 navy:['네이비','#33415e','navy'], blue:['블루','#7196b6','dusty blue'], brown:['브라운','#795743','chocolate brown'],
 camel:['카멜','#b4926d','camel'], burgundy:['버건디','#773c4d','burgundy'], green:['세이지','#87927a','sage green'],
 olive:['올리브','#62694d','olive'], pink:['더스티 핑크','#c58e9c','dusty pink'], lavender:['라벤더','#aaa0c2','lavender'],
 yellow:['버터 옐로','#deca89','butter yellow'], gray:['그레이','#999ba3','gray'],
 mint:['민트','#7bd9b5','mint green'], red:['레드','#df303d','red'], cobalt:['코발트','#315be3','cobalt blue'],
 coral:['코랄','#f27c70','coral'], turquoise:['터쿼이즈','#28babc','turquoise'], orange:['오렌지','#f28b35','orange'],
 lemon:['레몬 옐로','#f3d94e','lemon yellow'], emerald:['에메랄드','#18946a','emerald green'],
 hotpink:['핫핑크','#e84694','hot pink'], purple:['바이올렛','#8651c3','violet']
};
const PART_TYPES = [
 ['outer','재킷 / 아우터',/\b(?:jacket|blazer|coat|blouson|suit)\b/i],
 ['layer','가디건 / 레이어',/\b(?:cardigan|bolero|(?:sweater )?vest|hoodie)\b/i],
 ['top','상의',/\b(?:t-shirt|tee|shirt|blouse|camisoles?|tank top|turtleneck|sweater|sweatshirt|jersey|polo|undershirt|top)\b/i],
 ['bottom','하의',/\b(?:miniskirt|skirt|shorts|pants|trousers|jeans|chinos)\b/i],
 ['shoes','신발',/\b(?:boots|sneakers|loafers|brogues|shoes|sandals|flats|heels)\b/i],
 ['leg','양말 / 레그웨어',/\b(?:socks|tights|thighhighs|leg warmers)\b/i],
 ['bag','가방',/\b(?:bag|handbag|backpack|satchel|purse)\b/i],
 ['scarf','목도리 / 타이',/\b(?:scarf|necktie|tie|choker)\b/i],
 ['belt','벨트',/\bbelt\b/i],
 ['hat','모자 / 헤어',/\b(?:beret|beanie|hat|cap|headband|earmuffs|hair ribbon|hair clips)\b/i]
];
const PART_COLOR_WORDS = [...new Set([...COLOR_WORDS,...Object.values(PART_COLORS).map(c=>c[2]),'dusty blue','butter yellow','dark grey','light grey','grey','lavender','red','green','yellow','purple','orange','silver','gold'])].sort((a,b)=>b.length-a.length);
function garmentParts(prompt){
 const parts=[];
 // Keep offsets into the original prompt, including layered garments in one tag.
 const chunks=prompt.matchAll(/[^,]+/g);
 for(const chunk of chunks){
  const clauses=chunk[0].matchAll(/(?:(?!\s(?:over|under|with a)\s).)+/g);
  for(const clause of clauses){
   let s=clause[0],base=chunk.index+clause.index;
   const lead=s.match(/^\s*(?:(?:over|under|with a)\s+)?/)[0];base+=lead.length;s=s.slice(lead.length);
   const hits=PART_TYPES.map(([type,label,re])=>({type,label,match:re.exec(s)})).filter(x=>x.match).sort((a,b)=>a.match.index-b.match.index);
   if(!hits.length)continue;
   const h=hits[0], prefix=s.slice(0,h.match.index),start=base,end=base+h.match.index;
   const source=(prefix.match(new RegExp('\\b('+PART_COLOR_WORDS.join('|')+')\\b','gi'))||[]).join(' / ');
   parts.push({id:'part-'+parts.length,type:h.type,label:h.label,noun:h.match[0],start,end,source,phrase:s.trim()});
  }
 }
 // Distinguish repeated layers (outer shirt / undershirt, tights / leg warmers).
 const names={'jacket':'재킷','blazer':'블레이저','coat':'코트','cardigan':'가디건','bolero':'볼레로','hoodie':'후디','vest':'베스트','sweater vest':'니트 베스트','t-shirt':'티셔츠','tee':'티셔츠','shirt':'셔츠','blouse':'블라우스','camisole':'캐미솔','camisoles':'캐미솔','tank top':'탱크톱','turtleneck':'터틀넥','sweater':'니트','polo':'폴로','undershirt':'이너','miniskirt':'미니스커트','skirt':'스커트','shorts':'반바지','pants':'팬츠','trousers':'슬랙스','jeans':'데님','chinos':'치노','socks':'양말','tights':'타이츠','leg warmers':'레그워머','belt':'벨트','scarf':'목도리','necktie':'넥타이','tie':'타이','headband':'헤어밴드','hair clips':'헤어핀','hair ribbon':'헤어리본'};
 const counts={};
 for(const p of parts){p.label=names[p.noun.toLowerCase()]||p.label;counts[p.label]=(counts[p.label]||0)+1;if(counts[p.label]>1)p.label+=' '+counts[p.label];}
 return parts;
}
function partPalette(part,outfit){
 const vibe=outfit.prompt+' '+outfit.style;
 let keys=['ivory','black','navy','brown','mint','red','cobalt','lemon','emerald','coral','lavender','orange'];
 if(/ballet|발레/i.test(vibe))keys=['ivory','pink','lavender','yellow','mint','red','coral','blue','turquoise','hotpink','purple','black'];
 else if(/mcbling|pink|맥블링/i.test(vibe))keys=['ivory','black','pink','lavender','mint','red','hotpink','cobalt','lemon','coral','turquoise','purple'];
 else if(/acubi|아쿠비|sleaze|슬리즈/i.test(vibe))keys=['black','charcoal','gray','ivory','mint','red','cobalt','emerald','hotpink','purple','orange','turquoise'];
 else if(/old money|올드머니|클래식/i.test(outfit.category+' '+outfit.style))keys=['ivory','navy','camel','brown','mint','red','cobalt','emerald','lemon','coral','lavender','burgundy'];
 if(part.type==='shoes'||part.type==='belt'||part.type==='bag')keys=['black','brown','ivory','mint','red',...keys.filter(k=>!['black','brown','ivory','mint','red'].includes(k))].slice(0,12);
 if(part.noun==='jeans')keys=['blue','navy','black','gray','ivory','brown','mint','red','cobalt','pink','lemon','purple'];
 return keys;
}

function partPrompt(prompt,parts,selections){
 let result=prompt;
 for(const p of [...parts].reverse()){
  const color=PART_COLORS[selections[p.id]];if(!color)continue;
  let prefix=prompt.slice(p.start,p.end);
  // Replace only the dominant color, preserving a second stripe/argyle color.
  const re=new RegExp('\\b('+PART_COLOR_WORDS.join('|')+')\\b','i');
  prefix=re.test(prefix)?prefix.replace(re,color[2]):color[2]+' '+prefix;
  result=result.slice(0,p.start)+prefix+result.slice(p.end);
 }
 return result;
}

/* Connected-color selection and luminosity-preserving tint. Pure functions
 * shared by the editor and small synthetic-image regression tests. */
function connectedMask(rgba,w,h,x,y,tolerance){
 const mask=new Uint8Array(w*h),seen=new Uint8Array(w*h),queue=new Int32Array(w*h);
 const seed=y*w+x,offset=seed*4,sr=rgba[offset],sg=rgba[offset+1],sb=rgba[offset+2];
 const sl=.2126*sr+.7152*sg+.0722*sb;
 let head=0,tail=1;queue[0]=seed;seen[seed]=1;
 while(head<tail){const i=queue[head++],k=i*4,r=rgba[k],g=rgba[k+1],b=rgba[k+2],l=.2126*r+.7152*g+.0722*b;
  const distance=Math.sqrt(((r-l)-(sr-sl))**2+((g-l)-(sg-sl))**2+((b-l)-(sb-sl))**2+(.65*(l-sl))**2);
  if(distance>tolerance)continue;mask[i]=255;
  const px=i%w;for(const n of [px?i-1:-1,px<w-1?i+1:-1,i-w,i+w])if(n>=0&&n<w*h&&!seen[n]){seen[n]=1;queue[tail++]=n;}
 }
 return mask;
}
function tintPixels(source,mask,hex){
 const output=new Uint8ClampedArray(source),target=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 let sum=0,count=0;for(let i=0;i<mask.length;i++)if(mask[i]){const k=i*4;sum+=.2126*source[k]+.7152*source[k+1]+.0722*source[k+2];count++;}
 if(!count)return output;const mean=sum/count;
 for(let i=0;i<mask.length;i++)if(mask[i]){const k=i*4,lum=.2126*source[k]+.7152*source[k+1]+.0722*source[k+2],delta=lum-mean,a=mask[i]/255;
  for(let c=0;c<3;c++){const t=delta<0?target[c]*Math.max(.08,1+delta/Math.max(mean,24)):target[c]+(255-target[c])*delta/Math.max(255-mean,36);output[k+c]=source[k+c]*(1-a)+Math.max(0,Math.min(255,t))*a;}
 }
 return output;
}
