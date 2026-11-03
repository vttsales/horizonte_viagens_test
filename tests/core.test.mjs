import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {originalPackages,originalHotels} from '../dist/catalog.js';
import {filterPackages,canAccess,isPastEdition,csvCell,e} from '../dist/core.js';
import {createService} from '../dist/services.js';

test('catálogo mantém os seis destinos e valores originais',()=>{
 assert.deepEqual(originalPackages.map(p=>[p.city,p.price]),[['Paris',15000],['Tóquio',18000],['Nova York',12000],['Porto Seguro',4500],['Ubatuba',3200],['Florianópolis',5500]]);
 assert.deepEqual(originalPackages.map(p=>p.days),[15,20,10,10,7,8]);
 assert.ok(originalPackages.every(p=>p.included.length===4));
});
test('eventos e parcelamentos permanecem fiéis à fonte',()=>{
 assert.deepEqual(originalPackages.map(p=>p.event),['Semana de Moda de Paris','Festival Hanami (Cherry Blossom)','Broadway + Times Square NYE','Carnaval de Porto Seguro','Festival de Surf de Ubatuba','Fenaostra — Festival da Ostra']);
 assert.equal(originalPackages[4].installments,'ou 6x de R$ 533,33 sem juros');
 assert.deepEqual(originalHotels.map(h=>h.price),[980,620,1450,530]);
});
test('busca combina origem, destino ou evento e categoria sem alterar a lista',()=>{
 assert.deepEqual(filterPackages(originalPackages,{query:'toquio'}).map(p=>p.id),['lux-2']);
 assert.deepEqual(filterPackages(originalPackages,{query:'surf',category:'Econômico',origin:'sao paulo'}).map(p=>p.id),['eco-2']);
 assert.equal(filterPackages(originalPackages,{origin:'Campinas'}).length,0);
 const before=originalPackages.map(p=>p.id);
 assert.deepEqual(filterPackages(originalPackages,{category:'Econômico',sort:'price'}).map(p=>p.price),[3200,4500,5500]);
 assert.deepEqual(originalPackages.map(p=>p.id),before);
});
test('edições passadas não são anunciadas como datas futuras',()=>{
 assert.ok(originalPackages.every(p=>isPastEdition(p,'2026-11-03')));
 assert.equal(isPastEdition({...originalPackages[0],endDate:'2027-01-01'},'2026-11-03'),false);
});
test('admin não é liberado para visitante ou cliente',()=>{
 assert.equal(canAccess(null,'admin'),false);
 assert.equal(canAccess({role:'Cliente'},'admin'),false);
 assert.equal(canAccess({role:'Admin'},'admin'),true);
});
test('serviço não configurado nunca simula sucesso nem transmite credenciais',async()=>{
 let calls=0;const s=createService({servicesEnabled:false},async()=>{calls++;return new Response('{}');});
 await assert.rejects(()=>s.request('/auth/login',{method:'POST',body:{email:'teste@example.invalid',password:'teste'}}),err=>err.status===503);
 assert.equal(calls,0);
});
test('escrita usa mesma origem, cookies e antiforgery antes do POST',async()=>{
 const calls=[];const s=createService({servicesEnabled:true,basePath:'/interface'},async(url,init)=>{calls.push({url,...init});return new Response(JSON.stringify(url.endsWith('/csrf')?{token:'token-teste'}:{id:'123'}),{headers:{'content-type':'application/json'}});});
 await s.request('/auth/login',{method:'POST',body:{email:'teste@example.invalid',password:'teste'}});
 assert.equal(calls.length,2);assert.equal(calls[0].url,'/interface/csrf');
 assert.equal(calls[1].headers['X-CSRF-TOKEN'],'token-teste');assert.equal(calls[1].credentials,'same-origin');
});
test('401 e respostas HTML são erros, não sessões ou reservas válidas',async()=>{
 const s=createService({servicesEnabled:true,basePath:'/interface'},async()=>new Response('{}',{status:401}));
 await assert.rejects(()=>s.request('/auth/session'),err=>err.status===401);
 const html=createService({servicesEnabled:true,basePath:'/interface'},async()=>new Response('<html>login</html>',{headers:{'content-type':'text/html'}}));
 await assert.rejects(()=>html.request('/auth/session'),err=>err.status===503);
});
test('falha de antiforgery bloqueia a mutação',async()=>{
 let calls=0;const s=createService({servicesEnabled:true,basePath:'/interface'},async()=>{calls++;return new Response('{}',{headers:{'content-type':'application/json'}});});
 await assert.rejects(()=>s.request('/bookings',{method:'POST',body:{}}),err=>err.status===403);assert.equal(calls,1);
});
test('base externa é rejeitada antes da requisição',async()=>{
 const s=createService({servicesEnabled:true,basePath:'https://example.invalid'},async()=>{throw new Error('não deve executar');});
 await assert.rejects(()=>s.request('/auth/session'),err=>err.status===503);
});
test('textos escapados e CSV sem execução de fórmulas',()=>{
 assert.equal(e('<script>'),'&lt;script&gt;');assert.equal(csvCell('=1+1'),'"\'=1+1"');
});
test('interface não contém alternador de perfis ou autenticação local',()=>{
 const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(app,/localStorage|sessionStorage|demo-bar|Simular|simulad|demonstrativ|protótipo/i);
 for(const p of originalPackages)assert.ok(fs.existsSync(new URL('../dist/assets/'+p.image+'.jpg',import.meta.url)));
});
