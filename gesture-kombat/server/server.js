import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 8080);
const publicDir = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
const publicFiles = new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/game.js','game.js']]);
const http = createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const publicPath = publicFiles.get(pathname);
  if (!publicPath) { res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' }); return res.end('Not found'); }
  const file = resolve(publicDir, publicPath);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control':'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});
const wss = new WebSocketServer({ server:http, maxPayload:1024 });
const rooms = new Map();
const moves = { punch:{startup:6,active:3,recovery:14,damage:7,range:150}, kick:{startup:11,active:4,recovery:21,damage:12,range:180}, jump:{startup:0,active:1,recovery:35,damage:0,range:0} };
const send=(ws,data)=>{if(ws.readyState===1)ws.send(JSON.stringify(data))};
function makeRoom(){let code;do{code=randomBytes(3).toString('hex').toUpperCase()}while(rooms.has(code));return code}
function state(room){return {type:'state',tick:room.tick,fighters:room.players.map(p=>({hp:p.hp,x:p.x,guard:p.guard,crouch:p.crouch,jump:p.jump,move:p.move}))}}
function drop(ws){const room=ws.room;if(!room)return;room.players=room.players.filter(p=>p.ws!==ws);room.players.forEach((p,i)=>{p.side=i});if(!room.players.length){clearInterval(room.loop);rooms.delete(room.code)}else room.players.forEach(p=>send(p.ws,{type:'event',event:'opponent-left'}));ws.room=null}
function addPlayer(room,ws,name){if(room.players.length>=2)return false;const p={ws,name:String(name||'FIGHTER').slice(0,16),side:room.players.length,hp:100,x:room.players.length?600:300,axis:0,guard:false,crouch:false,jump:0,move:null,seq:0,lastInput:Date.now(),lastAction:0,moveFrame:0};room.players.push(p);ws.room=room;ws.player=p;return true}
function makeMatch(code){const room={code,players:[],tick:0,ended:false};room.loop=setInterval(()=>step(room),1000/60);rooms.set(code,room);return room}
function step(room){room.tick++;const now=Date.now();for(const p of room.players){if(now-p.lastInput>700){p.guard=false;p.crouch=false;p.axis=0;p.move=null}p.x=Math.max(50,Math.min(850,p.x+p.axis*2.5));if(p.jump>0)p.jump=Math.max(0,p.jump-1);if(p.move){p.moveFrame++;if(!p.move.hit&&p.moveFrame>=p.move.startup&&p.moveFrame<p.move.startup+p.move.active){const other=room.players.find(q=>q!==p);if(other&&Math.abs(other.x-p.x)<=p.move.range&&!(p.move.kind==='punch'&&other.crouch)){p.move.hit=true;const blocked=other.guard;other.hp=Math.max(0,other.hp-(blocked?Math.max(1,Math.round(p.move.damage*.22)):p.move.damage));room.players.forEach(q=>send(q.ws,{type:'event',event:'hit',attacker:p.side,defender:other.side,damage:blocked?2:p.move.damage,blocked,hp:other.hp,tick:room.tick}));if(other.hp===0){room.ended=true;room.players.forEach(q=>send(q.ws,{type:'event',event:'round-end',winner:p.side,tick:room.tick}))}}}if(p.moveFrame>=p.move.startup+p.move.active+p.move.recovery)p.move=null}}
 if(room.tick%3===0)room.players.forEach(p=>send(p.ws,state(room)))}
wss.on('connection',ws=>{ws.on('message',buf=>{let m;try{m=JSON.parse(buf.toString())}catch{return send(ws,{type:'error',message:'Invalid message'})}if(!m||typeof m.type!=='string')return;
 if(m.type==='create'){if(ws.room)drop(ws);const r=makeMatch(makeRoom());addPlayer(r,ws,m.name);send(ws,{type:'room',room:r.code,side:0});return}
 if(m.type==='join'){const r=rooms.get(String(m.room||'').toUpperCase());if(!r)return send(ws,{type:'error',message:'That room does not exist.'});if(!addPlayer(r,ws,m.name))return send(ws,{type:'error',message:'That room is full.'});r.players.forEach((p,i)=>send(p.ws,{type:'event',event:'match-ready',side:i}));return}
 const room=ws.room,p=ws.player;if(!room||!p||room.ended)return;if(m.type==='action'){const seq=Number(m.seq)||0;if(seq&&seq<=p.seq)return;p.seq=seq;const action=String(m.action||'');if(!moves[action]||Date.now()-p.lastAction<180||p.move)return;p.lastAction=Date.now();if(action==='jump')p.jump=35;else{const def=moves[action];p.move={...def,kind:action,hit:false};p.moveFrame=0}p.lastInput=Date.now();room.players.forEach(q=>send(q.ws,{type:'event',event:'action',side:p.side,action,hand:String(m.hand||''),tick:room.tick}));return}
 if(m.type==='hold'){if(!['guard','crouch','move'].includes(m.key))return;if(m.key==='move')p.axis=Math.max(-1,Math.min(1,Number(m.value)||0));else p[m.key]=Boolean(m.value);p.lastInput=Date.now();return}
 });ws.on('close',()=>drop(ws));ws.on('error',()=>drop(ws))});
http.listen(PORT,'0.0.0.0',()=>console.log(`Gesture Kombat server listening on ${PORT}`));
