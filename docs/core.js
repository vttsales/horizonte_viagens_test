export const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const categories=['Todos','Luxo','Econômico'];
export function filterPackages(items,{query='',origin='',category='Todos',sort='featured'}={}){
 const q=normalize(query.trim()),o=normalize(origin.trim());
 const list=items.filter(p=>p.active&&(!q||normalize(`${p.city} ${p.country} ${p.event}`).includes(q))&&(!o||normalize(p.origin).includes(o))&&(category==='Todos'||p.category===category));
 if(sort==='price')list.sort((a,b)=>a.price-b.price);
 if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);
 return list;
}
export function dateLabel(value){if(!value)return 'A confirmar';const date=new Date(value.length===10?value+'T12:00:00':value);return Number.isNaN(date.valueOf())?'A confirmar':new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(date);}
export function isPastEdition(p,today=new Date().toLocaleDateString('en-CA')){return Boolean(p.endDate&&p.endDate<today);}
export function canAccess(user,area){return Boolean(user&&(area!=='admin'||user.role==='Admin'));}
export function csvCell(value){let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
