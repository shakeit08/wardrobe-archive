// Only explicit color phrases are replaced; silver/gold hardware and fabric terms stay intact.
const COLOR_PRESETS = [
 {id:'original',name:'원본',swatches:['#f8f7f3','#a8a39a','#57544e']},
 {id:'mono',name:'모노톤',swatches:['#252529','#f5f4ef','#999a9f'],colors:['black','white','gray','charcoal']},
 {id:'mocha',name:'모카',swatches:['#f1e5cd','#70513e','#b7a58e'],colors:['cream','chocolate brown','taupe','beige']},
 {id:'lilac',name:'라일락',swatches:['#eee9f4','#b4a1ce','#c4c5cc'],colors:['white','lavender','light gray','dusty purple']},
 {id:'blue',name:'쿨블루',swatches:['#273b57','#a4c8df','#e8edf0'],colors:['navy','sky blue','light blue','ivory']}
];
const COLOR_WORDS = ['dark charcoal','chocolate brown','medium brown','dark brown','sand beige','heather gray','silver gray','light gray','dark gray','steel gray','pale gray','ash gray','slate blue','medium blue','light blue','pale blue','dark navy','dark indigo','deep burgundy','dusty pink','blush pink','pale pink','moss green','sage green','forest green','muted olive','off-white','charcoal','burgundy','champagne','indigo','navy','ivory','cream','white','black','brown','beige','taupe','tan','camel','olive','gray','blue','pink','teal','plum','oatmeal'];
function colorVariant(prompt,presetId){
 const preset=COLOR_PRESETS.find(p=>p.id===presetId);
 if(!preset?.colors)return prompt;
 const mapping=new Map();
 const pattern=new RegExp('\\b('+COLOR_WORDS.join('|')+')\\b','gi');
 return prompt.replace(pattern,color=>{
  const key=color.toLowerCase();
  if(!mapping.has(key))mapping.set(key,preset.colors[mapping.size%preset.colors.length]);
  return mapping.get(key);
 });
}
