import {config} from './config.js';
export class ServiceError extends Error{constructor(message,status=0){super(message);this.status=status;}}
export function createService(settings=config,transport=globalThis.fetch){
 let csrfToken=null;
 async function request(path,{method='GET',body,signal}={}){
  if(!settings.servicesEnabled)throw new ServiceError('Serviço indisponível no momento. Tente novamente mais tarde.',503);
  if(!settings.basePath.startsWith('/')||settings.basePath.startsWith('//'))throw new ServiceError('Não foi possível conectar ao serviço.',503);
  if(!path.startsWith('/')||path.startsWith('//'))throw new ServiceError('Solicitação inválida.',400);
  const controller=new AbortController();
  const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
  const timeout=setTimeout(abort,settings.timeoutMs||12000);
  try{
   const headers={'Accept':'application/json'};
   if(method!=='GET'){
    if(!csrfToken){const t=await request('/csrf',{signal:controller.signal});if(typeof t?.token!=='string'||!t.token)throw new ServiceError('Não foi possível validar sua sessão. Atualize a página.',403);csrfToken=t.token;}
    headers['X-CSRF-TOKEN']=csrfToken;
    if(body!==undefined)headers['Content-Type']='application/json';
   }
   if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');
   const response=await transport(settings.basePath+path,{method,headers,credentials:'same-origin',body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
   if(!response.ok){if(response.status===401)csrfToken=null;throw new ServiceError(({401:'Entre na sua conta para continuar.',403:'Você não tem permissão para realizar esta ação.',409:'Os dados foram atualizados. Consulte novamente antes de continuar.',422:'Confira os dados informados e tente novamente.',429:'Muitas tentativas. Aguarde um pouco e tente novamente.'})[response.status]||'Não foi possível concluir. Tente novamente mais tarde.',response.status);}
   if(response.status===204)return null;
   if(!(response.headers.get('content-type')||'').includes('application/json'))throw new ServiceError('Serviço indisponível no momento. Tente novamente mais tarde.',503);
   return await response.json();
  }catch(err){if(err instanceof ServiceError)throw err;throw new ServiceError(err.name==='AbortError'?'A conexão demorou mais que o esperado. Tente novamente.':'Não foi possível conectar. Verifique sua conexão e tente novamente.');}
  finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
 }
 return {request,clearSession:()=>{csrfToken=null;}};
}
export const service=createService();
