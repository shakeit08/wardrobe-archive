/* Garment-level prompt edits. Color words after the garment noun (lining,
 * piping, buttons, buckles) are intentionally preserved. */
const PART_COLORS = {
 ivory:['아이보리','#ece5d5','ivory'], black:['블랙','#27272c','black'], charcoal:['차콜','#55555e','charcoal'],
 navy:['네이비','#33415e','navy'], blue:['더스티 블루','#7196b6','dusty blue'], brown:['초콜릿','#795743','chocolate brown'],
 camel:['카멜','#b4926d','camel'], burgundy:['버건디','#773c4d','burgundy'], green:['세이지','#87927a','sage green'],
 olive:['올리브','#62694d','olive'], pink:['더스티 핑크','#c58e9c','dusty pink'], lavender:['라벤더','#aaa0c2','lavender'],
 yellow:['버터 옐로','#deca89','butter yellow'], gray:['그레이','#999ba3','gray'],
 mint:['민트','#7bd9b5','mint green'], red:['레드','#df303d','red'], cobalt:['코발트','#315be3','cobalt blue'],
 coral:['코랄','#f27c70','coral'], turquoise:['터쿼이즈','#28babc','turquoise'], orange:['오렌지','#f28b35','orange'],
 lemon:['레몬 옐로','#f3d94e','lemon yellow'], emerald:['에메랄드','#18946a','emerald green'],
 hotpink:['핫핑크','#e84694','hot pink'], purple:['바이올렛','#8651c3','violet'],
 // Concept colors
 white:['화이트','#f7f6f2','white'], cream:['크림','#efe3c8','cream'], oatmeal:['오트밀','#d9ccb4','oatmeal'],
 sand:['샌드 베이지','#cdb690','sand beige'], taupe:['토프','#9c8b7a','taupe'], lightgray:['라이트 그레이','#c9cacd','light gray'],
 ash:['애시 그레이','#8a8d92','ash gray'], silver:['실버','#c3c7cc','metallic silver'], champagne:['샴페인','#e3d0a8','champagne'],
 gold:['골드','#c9a64a','metallic gold'], tan:['탄','#b88a5c','tan'], cognac:['코냑','#9a5630','cognac brown'],
 espresso:['에스프레소','#3f2b22','dark brown'], rust:['러스트','#a4492b','rust'], terracotta:['테라코타','#c46a4a','terracotta'],
 mustard:['머스터드','#c99a2e','mustard yellow'], forest:['포레스트 그린','#2f4a37','forest green'], moss:['모스 그린','#6f7a45','moss green'],
 khaki:['카키','#8c8259','khaki'], pistachio:['피스타치오','#b9cf95','pistachio green'], lime:['라임','#b7dc3c','lime green'],
 teal:['틸','#1f6f73','teal'], aqua:['아쿠아','#7fd6e3','aqua blue'], babyblue:['베이비 블루','#b9d5ee','baby blue'],
 skyblue:['스카이 블루','#7fb6e3','sky blue'], slate:['슬레이트 블루','#5b6b82','slate blue'], indigo:['인디고','#2e3a66','indigo'],
 midnight:['미드나이트','#1e2233','midnight navy'], wine:['와인','#5a1f2d','wine red'], oxblood:['옥스블러드','#4a1820','oxblood'],
 cherry:['체리 레드','#b3122e','cherry red'], rose:['로즈','#d77a91','rose pink'], babypink:['베이비 핑크','#f4c6d3','baby pink'],
 peach:['피치','#f6b896','peach'], lilac:['라일락','#c9b3e0','lilac'], plum:['플럼','#5e3553','plum'],
 lightwash:['라이트 워시','#a3bdd6','light wash blue'], midwash:['미디엄 워시','#5d7fa6','medium wash blue'], darkwash:['다크 워시','#2c3c5a','dark wash indigo']
};
/* Concept palettes: ordered from the style's signature tones to its accents. */
const CONCEPT_PALETTES = {
 '긱시크 프레피':['forest','wine','mustard','navy','cream','camel','cognac','moss','oatmeal','slate','charcoal','rust','plum','babyblue','teal'],
 '맥블링 Y2K':['hotpink','babypink','babyblue','lilac','aqua','lime','lemon','white','silver','champagne','gold','purple','coral','turquoise','cherry','black'],
 '아쿠비 Y2K':['black','charcoal','ash','silver','lightgray','white','midnight','slate','khaki','moss','babyblue','lilac','wine','teal','mint'],
 '인디 슬리즈':['black','charcoal','oxblood','wine','cherry','midnight','forest','plum','rust','ash','cream','khaki','cognac','silver'],
 '핑크 Y2K':['babypink','hotpink','rose','white','cherry','lilac','babyblue','lemon','mint','peach','purple','black','silver'],
 '모토 보헤미안':['cognac','espresso','rust','terracotta','mustard','cream','oatmeal','khaki','moss','wine','tan','sand','teal','black'],
 '발레코어':['babypink','ivory','white','rose','lilac','peach','champagne','babyblue','yellow','mint','pistachio','lightgray','plum','black'],
 '아메리칸 캐주얼':['navy','cherry','forest','white','gray','cream','mustard','cobalt','burgundy','khaki','tan','skyblue','orange','black'],
 '클래식 캐주얼':['navy','sand','khaki','white','olive','camel','forest','babyblue','burgundy','cream','slate','tan','cognac','green'],
 '클래식 레이어드':['camel','espresso','brown','charcoal','black','cream','oatmeal','olive','wine','navy','taupe','forest','rust'],
 '빈티지 스트리트':['black','midnight','navy','charcoal','oxblood','forest','mustard','khaki','cream','rust','ash','teal','wine'],
 '소프트 Y2K':['cream','oatmeal','babypink','babyblue','lilac','white','brown','black','mint','yellow','peach','pistachio','lightgray'],
 '올드머니':['ivory','cream','navy','camel','sand','oatmeal','forest','burgundy','babyblue','taupe','cognac','espresso','green','champagne','wine'],
 'Y2K 스트리트웨어':['cobalt','red','lime','orange','silver','black','white','slate','skyblue','aqua','lemon','purple','ash','navy'],
 '펑크 프레피':['black','oxblood','cherry','navy','forest','plum','charcoal','wine','white','mustard','purple','cobalt','ash'],
 '캐주얼':['navy','white','gray','skyblue','khaki','olive','black','cream','mustard','coral','green','slate','orange'],
 '미니멀':['black','white','ivory','oatmeal','taupe','charcoal','gray','lightgray','green','slate','camel','navy','espresso'],
 '프레피':['navy','white','cream','babyblue','cherry','forest','burgundy','mint','coral','yellow','khaki','teal','pink'],
 '클래식':['camel','brown','charcoal','navy','cream','ivory','burgundy','forest','olive','black','taupe','wine','rust'],
 '스트리트':['black','olive','khaki','gray','charcoal','orange','cobalt','red','white','cream','sand','forest','lime'],
 '포멀':['black','charcoal','navy','midnight','wine','white','ivory','slate','burgundy','forest','gray','plum'],
 '클래식 프레피':['navy','burgundy','forest','cream','white','camel','gray','wine','babyblue','black','mustard','plum']
};
const CATEGORY_PALETTES = {'캐주얼·미니멀':'캐주얼','클래식·올드머니':'클래식','프레피':'프레피','스트리트·Y2K':'Y2K 스트리트웨어'};
const SEASON_ACCENTS = {
 '봄':['babypink','mint','yellow','babyblue','lilac','pistachio','peach'],
 '여름':['aqua','coral','lemon','skyblue','white','turquoise','lime'],
 '가을':['rust','mustard','cognac','wine','moss','terracotta'],
 '겨울':['midnight','oxblood','forest','cream','charcoal','silver']
};
const ACCESSORY_NEUTRALS = ['black','espresso','cognac','tan','white','ivory','burgundy','silver'];
const LEG_NEUTRALS = ['white','black','cream','charcoal','gray','navy'];
const DENIM_WASHES = ['lightwash','midwash','darkwash','black','ash','white','cream'];
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
 const unique=list=>[...new Set(list)].filter(k=>PART_COLORS[k]);
 const concept=CONCEPT_PALETTES[outfit.style]||CONCEPT_PALETTES[CATEGORY_PALETTES[outfit.category]]||CONCEPT_PALETTES['캐주얼'];
 const season=SEASON_ACCENTS[outfit.season]||[];
 // Signature tones stay first; the accent tail rotates per outfit and part for variety.
 const seed=[...(outfit.id+part.type+part.noun)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 const head=concept.slice(0,5),tail=unique([...concept.slice(5),...season]).filter(k=>!head.includes(k));
 const shift=tail.length?seed%tail.length:0,rotated=[...tail.slice(shift),...tail.slice(0,shift)];
 let keys=unique([...head,...rotated]);
 if(/jeans|denim/i.test(part.noun+' '+part.phrase)&&part.type==='bottom')keys=unique([...DENIM_WASHES,...keys]);
 else if(['shoes','belt','bag'].includes(part.type)){
  const earthy=concept.some(k=>['brown','camel','cognac','espresso','tan','khaki','sand'].includes(k));
  const fits=ACCESSORY_NEUTRALS.filter(k=>['black','white'].includes(k)||concept.includes(k)||(earthy&&['espresso','cognac','tan'].includes(k)));
  keys=unique([...fits.slice(0,5),...keys]);
 }
 else if(part.type==='leg')keys=unique([...LEG_NEUTRALS,...keys]);
 return keys.slice(0,14);
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
