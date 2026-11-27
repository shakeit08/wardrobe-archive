const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope=vm.createContext({Uint8Array,Uint8ClampedArray,Int32Array});
vm.runInContext(['colors.js','parts.js','data.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nthis.api={garmentParts,partPrompt,partPalette,tintPixels,OUTFITS,PART_COLORS}',scope);
const {garmentParts,partPrompt,partPalette,tintPixels,OUTFITS,PART_COLORS}=scope.api;
for(const o of OUTFITS){const p=garmentParts(o.prompt);assert(p.length>=3,o.id);assert.equal(partPrompt(o.prompt,p,{}),o.prompt);for(const part of p){assert(part.start<=part.end);const pal=partPalette(part,o);assert(pal.length>=12,o.id);assert.equal(new Set(pal).size,pal.length);assert(pal.every(k=>PART_COLORS[k]));}}
let s='navy wool varsity jacket with ivory leather sleeves, white shirt over a black turtleneck, black belt with silver heart buckle';let p=garmentParts(s);assert.equal(p.length,4);assert.equal(partPrompt(s,p,{[p[0].id]:'brown',[p[2].id]:'pink',[p[3].id]:'ivory'}),'chocolate brown wool varsity jacket with ivory leather sleeves, white shirt over a dusty pink turtleneck, ivory belt with silver heart buckle');
s='gray and burgundy argyle sweater vest, white shirt';p=garmentParts(s);assert.equal(p[0].type,'layer');assert.equal(partPrompt(s,p,{[p[0].id]:'navy'}),'navy and burgundy argyle sweater vest, white shirt');
s='white blouse with a burgundy ribbon tie';p=garmentParts(s);assert.equal(p.length,2);assert.equal(partPrompt(s,p,{[p[1].id]:'black'}),'white blouse with a black ribbon tie');
const rgba=new Uint8ClampedArray([100,80,80,255,110,90,90,255,250,250,250,255,100,80,80,255]);const mask=new Uint8Array([255,255,0,0]);const tinted=tintPixels(rgba,mask,'#7196b6');assert.deepEqual([...tinted.slice(8)],[...rgba.slice(8)]);assert(tinted[4]>tinted[0]);assert.notDeepEqual([...tinted.slice(0,3)],[...rgba.slice(0,3)]);assert.deepEqual([...tintPixels(rgba,new Uint8Array(4),'#7196b6')],[...rgba]);s='white and navy low-top sneakers';assert.equal(garmentParts(s)[0].type,'shoes');
// Preset masks: one label PNG per outfit with an image; labels map to parser order.
const zlib=require('node:zlib');
function pngLabels(file){const b=fs.readFileSync(file);let i=8,w,h,ct,idat=[];while(i<b.length){const len=b.readUInt32BE(i),type=b.toString('ascii',i+4,i+8),d=b.subarray(i+8,i+8+len);if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];assert.equal(d[8],8);}if(type==='IDAT')idat.push(d);i+=12+len;}
 const bpp=ct===0?1:ct===2?3:ct===4?2:4,raw=zlib.inflateSync(Buffer.concat(idat)),stride=w*bpp,out=Buffer.alloc(h*stride);
 for(let y=0;y<h;y++){const f=raw[y*(stride+1)],row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));for(let x=0;x<stride;x++){const a=x>=bpp?out[y*stride+x-bpp]:0,up=y?out[(y-1)*stride+x]:0,c=x>=bpp&&y?out[(y-1)*stride+x-bpp]:0;let v=row[x];if(f===1)v+=a;else if(f===2)v+=up;else if(f===3)v+=(a+up)>>1;else if(f===4){const p=a+up-c,pa=Math.abs(p-a),pb=Math.abs(p-up),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?up:c;}out[y*stride+x]=v&255;}}
 const counts={};for(let k=0;k<w*h;k++){const l=Math.round(out[k*bpp]/16);counts[l]=(counts[l]||0)+1;}return {w,h,counts};}
for(const o of OUTFITS){if(!o.image)continue;const file='images/masks/'+o.id+'.png';assert(fs.existsSync(file),file);const m=pngLabels(file),n=garmentParts(o.prompt).length;assert.equal(m.w,1024);assert.equal(m.h,1536);
 for(const l of Object.keys(m.counts).map(Number))assert(l<=n,o.id+' label '+l);
 for(let k=1;k<=n;k++)assert((m.counts[k]||0)>m.w*m.h*.001,o.id+' part '+(k-1)+' missing');}
console.log('PASS: 59 outfit parsers, independent layers, trim/hardware protection, original restore, mask-only shading, 59 preset masks');
