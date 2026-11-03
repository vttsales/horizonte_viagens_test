import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const port=Number(process.env.PORT||8081);
http.createServer((req,res)=>{
  let file;
  try {file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));} catch {res.writeHead(400);return res.end();}
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Não encontrado');}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
