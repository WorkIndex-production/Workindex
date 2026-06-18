const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain','.xml':'application/xml'};
http.createServer((req,res)=>{
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u === '') u = '/index.html';
  const p = path.normalize(path.join(root, u));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(p, (e,d) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(p)] || 'application/octet-stream'});
    res.end(d);
  });
}).listen(5510, '127.0.0.1', () => console.log('server 5510'));
