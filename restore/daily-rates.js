const SOURCE='https://www.livechennai.com/gold_silverrate.asp';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let last=null,request;
function valid(r){return r&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&r.date<=today()&&Number.isFinite(r.gold22)&&r.gold22>=100&&r.gold22<=1000000&&Number.isFinite(r.silver)&&r.silver>=1&&r.silver<=10000;}
function draw(r){
 const panel=document.querySelector('#daily-rates');if(!panel||!valid(r))return;
 const current=r.date===today();
 panel.dataset.fresh=current?'current':'older';
 panel.querySelector('.rates-heading strong').textContent=current?'Today’s rates':'Latest published rates';
 panel.querySelector('.rates-date').textContent=new Date(r.date+'T00:00:00+05:30').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
 for(const [selector,key] of [['[data-rate-gold]','gold22'],['[data-rate-silver]','silver']]){
  const el=panel.querySelector(selector);el.replaceChildren(document.createTextNode('₹'+r[key].toLocaleString('en-IN',{maximumFractionDigits:2})));const small=document.createElement('small');small.textContent='/g';el.append(small);
 }
 const note=panel.querySelector('.rates-footnote');
 const board=r.delivery==='showroom-board';
 note.replaceChildren(document.createTextNode(board?'Showroom board rate':'Chennai reference · '));
 const a=document.createElement('a');a.href=SOURCE;a.target='_blank';a.rel='noopener noreferrer';a.textContent=r.delivery==='source-refresh'?'Source ↗':'Last verified · Source ↗';a.title='View the dated gold and silver reference rates on LiveChennai';if(!board)note.append(a);
 const info=document.createElement('span');info.textContent='GST & making charges extra';note.append(info);
}
async function get(url){const response=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Unavailable');const data=await response.json();if(!valid(data))throw Error('Invalid rates');return data;}
async function update(){
 if(!document.querySelector('#daily-rates'))return;
 if(last)draw(last);
 if(request)return;
 request=(async()=>{
  if(!last){try{last=await get('/rates.json');draw(last);}catch{}}
  try{last=await get('/api/rates');draw(last);}catch{
   if(last){last={...last,delivery:'last-verified'};draw(last);}
   else{const p=document.querySelector('.rates-footnote');if(p)p.textContent='Rates unavailable. Please check with the showroom.';}
  }
 })().finally(()=>{request=null});await request;
}
window.addEventListener('bg:render',update);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
setInterval(()=>{if(!document.hidden)update();},900000);update();
