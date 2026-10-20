/* OR-WEB-0101: OldRoot shared Reader's Choice voting service (Cloudflare Workers + D1).
   Private owner analytics: ADMIN_TOKEN is a secret set via wrangler, never committed.
   Basic duplicate protection: one pseudonymous browser ID, + per-IP daily throttle.
   These controls discourage accidental/repeated votes, NOT determined attackers.
*/
const CHOICES = Object.freeze(['Gila Monster', 'Latch', 'Anchorage', 'Flying Saucer']);
const LIMIT_PER_IP_PER_DAY = 8;
const encoder = new TextEncoder();

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const out = await crypto.subtle.sign('HMAC',key,encoder.encode(message));
  return Array.from(new Uint8Array(out), b => b.toString(16).padStart(2,'0')).join('');
}
function safeEq(a,b){
  // Reject short or mismatching-length tokens while keeping byte comparison stable.
  if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length||b.length<32)return false;
  let diff=0;for(let i=0;i<a.length;i++) diff |= a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
function json(data,status=200,extra={}) {
  return new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra}});
}
function cors(origin,allowed){return origin===allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}:null;}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    const origin=request.headers.get('Origin');
    const allowed=env.ALLOWED_ORIGIN || 'https://oldroothq.com';
    const headers=cors(origin,allowed);
    if (request.method==='OPTIONS')return headers?new Response(null,{status:204,headers}):json({error:'Forbidden'},403);
    if (origin && !headers) return json({error:'Forbidden origin'},403);
    const respond=(data,status=200)=>json(data,status,headers||{});
    if (url.pathname==='/api/status' && request.method==='GET'){
      return respond({open:Boolean(env.DB && env.VOTE_PEPPER && env.ADMIN_TOKEN && env.POLL_OPEN==='true')});
    }
    if (url.pathname==='/api/admin/results' && request.method==='GET'){
      const authorization=request.headers.get('Authorization')||'';
      const provided=authorization.startsWith('Bearer ')?authorization.slice(7):'';
      if (!env.ADMIN_TOKEN||!safeEq(provided,env.ADMIN_TOKEN))return respond({error:'Unauthorized'},401);
      if (!env.DB)return respond({error:'Database unavailable'},503);
      const data=await env.DB.prepare('SELECT choice, COUNT(*) AS count FROM votes GROUP BY choice').all();
      const counts=new Map(data.results.map(r=>[r.choice,Number(r.count)]));
      return respond({total:[...counts.values()].reduce((n,v)=>n+v,0),votes:CHOICES.map(choice=>({choice,count:counts.get(choice)||0})),updatedAt:new Date().toISOString()});
    }
    if (url.pathname==='/api/vote' && request.method==='POST'){
      if (!headers) return respond({error:'Browser origin required'},403);
      if (!env.DB || !env.VOTE_PEPPER || !env.ADMIN_TOKEN || env.POLL_OPEN!=='true')return respond({error:'Voting closed'},403);
      if ((Number(request.headers.get('Content-Length'))||0)>2048)return respond({error:'Request too large'},413);
      let body;
      try{body=JSON.parse(await request.text());}catch{return respond({error:'Invalid JSON'},400);}
      if (!body || !CHOICES.includes(body.choice) || typeof body.voterId!=='string' || !/^[0-9a-f-]{36}$/i.test(body.voterId))return respond({error:'Invalid vote'},400);
      const ip=request.headers.get('CF-Connecting-IP');
      if(!ip)return respond({error:'Vote protection unavailable'},503);
      const voter=await hmac(env.VOTE_PEPPER,'voter:'+body.voterId);
      const ipHash=await hmac(env.VOTE_PEPPER,'ip:'+ip);
      try{
        const existing=await env.DB.prepare('SELECT id FROM votes WHERE voter_hash=? LIMIT 1').bind(voter).first();
        if(existing)return respond({status:'already_recorded'},409);
        const day=new Date().toISOString().slice(0,10);
        const daily=await env.DB.prepare('SELECT COUNT(*) AS n FROM votes WHERE ip_hash=? AND created_at>=?').bind(ipHash,day+'T00:00:00Z').first();
        if(Number(daily?.n||0)>=LIMIT_PER_IP_PER_DAY)return respond({error:'Rate limited'},429);
        const insert=await env.DB.prepare('INSERT OR IGNORE INTO votes (voter_hash,ip_hash,choice) VALUES (?,?,?)').bind(voter,ipHash,body.choice).run();
        return insert.meta.changes===1?respond({status:'recorded'},201):respond({status:'already_recorded'},409);
      }catch(error){console.error('Vote service storage failure',String(error));return respond({error:'Service unavailable'},503);}
    }
    return respond({error:'Not found'},404);
  }
};
