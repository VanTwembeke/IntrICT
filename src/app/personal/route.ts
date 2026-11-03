/**
 * INTRICT // INDEX 11 — single-file, fixed-URL Next.js App Router edition.
 *
 * Place this file at:
 *   src/app/personal/route.ts     (or app/personal/route.ts without src/)
 *
 * URL DESIGN — NO [...slug] FOLDERS OR SUBROUTES:
 *   GET /personal/                    -> interface
 *   GET /personal/?api=tree           -> access-controlled directory tree
 *   GET /personal/?dir=public/games   -> interface, opens the specified directory
 *   GET /personal/?file=public/a.html -> authenticated file gateway
 *   GET /personal/?file=public/a.html&download=1 -> download
 *   POST /personal/?api=login         -> existing Supabase account password login
 *   POST /personal/?api=logout        -> sign out
 *
 * AUTOMATIC GITHUB DIRECTORY DISCOVERY
 *   personal-content/public/**      -> guests and everyone
 *   personal-content/members/**     -> signed-in Supabase users
 *   personal-content/private/**     -> verified owner emails or owner UIDs only
 *
 * Configure Vercel env vars (server-side except NEXT_PUBLIC_*):
 *   PERSONAL_GITHUB_REPO=OWNER/REPO
 *   PERSONAL_GITHUB_REF=main            (optional; deployment SHA by default)
 *   PERSONAL_GITHUB_TOKEN=...           (required for private GitHub repo)
 *   PERSONAL_CONTENT_ROOT=personal-content (optional)
 *   PERSONAL_OWNER_UIDS=uuid1,uuid2      (recommended for private access)
 *   PERSONAL_OWNER_EMAILS=you@domain.be  (requires verified user email)
 *   NEXT_PUBLIC_SUPABASE_URL=...         (use your existing website values)
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   PERSONAL_SSO_LOGIN_URL=/login       (OPTIONAL: path to EXISTING SSO login)
 *
 * Dependency: @supabase/ssr. Reuses standard cookies for the SAME Supabase
 * project and cookie storage settings as the rest of the site. Existing SSO
 * implementations with custom cookie names must adapt getSSO below.
 *
 * SECURITY: Keep genuinely private repository files in a PRIVATE GitHub repo;
 * GitHub repo visibility is independent of this app's volume permissions.
 * Never commit secrets/customer data. This source file is safe to commit as it
 * contains no hardcoded secret. Install rate limiting on POST login in your WAF.
 *
 * HTML apps are sandboxed and have relative src/href URLs rewritten to this
 * query-based file gateway. Some applications requiring dynamic relative fetch,
 * ES module graph imports, service workers, or shared cookies will require a
 * dedicated route or subdomain; this is not a full reverse proxy.
 *
 * Remove any prior app/personal/page.tsx or app/personal/route.ts handler,
 * or the previous [[...slug]] handler, if they conflict with this route.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type Visibility = 'public' | 'members' | 'private';
type FileInfo = { path:string; sha:string; size:number; modified:null; visibility:Visibility };
type RepoTree = {files:FileInfo[];ref:string;loaded:number};
type SSO = {user: {id:string;email?:string;email_confirmed_at?:string|null;is_anonymous?:boolean}|null; cookies:Array<{name:string;value:string;options:Record<string,any>}>; client:any|null};
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROOT = (process.env.PERSONAL_CONTENT_ROOT || 'personal-content').replace(/^\/+|\/+$/g,'');
const volumes:Visibility[] = ['public','members','private'];
const MAX_FILE_BYTES = 3 * 1024 * 1024;
const ACCEPTED = /\.(html?|css|m?js|json|txt|md|svg|png|jpe?g|gif|webp|ico|pdf|woff2?|mp3|mp4|webm|wasm|map|xml|webmanifest)$/i;
const NO_CACHE = 'private, no-store, max-age=0';
let memo: RepoTree|null = null;
function repository(){
  const value = process.env.PERSONAL_GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG ?
      process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG : '');
  if(!/^[\w.-]+\/[\w.-]+$/.test(value)) throw Error('GitHub repository is not configured. Set PERSONAL_GITHUB_REPO=owner/repository in Vercel.');
  return value;
}
function branch(){return process.env.PERSONAL_GITHUB_REF || process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_REF || 'main';}
function githubHeaders():Record<string,string>{
  const h:Record<string,string> = {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'INTRICT-Personal-Index'};
  if(process.env.PERSONAL_GITHUB_TOKEN)h.Authorization='Bearer '+process.env.PERSONAL_GITHUB_TOKEN;
  return h;
}
async function githubJson(url:string):Promise<any>{
  const r=await fetch(url,{headers:githubHeaders(),cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!r.ok){if(r.status===404)throw Error('GitHub repository or ref not found (or token cannot read it).');if(r.status===403)throw Error('GitHub API rate limit or repository permission failure.');throw Error('GitHub API error '+r.status);}
  return r.json();
}
function safePath(path:string){
  if(!path||path.length>700||path.includes('\\')||path.includes('\0'))return false;
  return path.split('/').every(c=>!!c && c!=='.' && c!=='..' && !c.startsWith('.'));
}
async function tree(force=false):Promise<RepoTree>{
  const ref=branch();
  if(!force&&memo&&memo.ref===ref&&Date.now()-memo.loaded<30000)return memo;
  const data=await githubJson('https://api.github.com/repos/'+repository()+'/git/trees/'+encodeURIComponent(ref)+'?recursive=1');
  if(data.truncated)throw Error('Repository tree was truncated; narrow PERSONAL_CONTENT_ROOT or use a smaller content repository.');
  const files:FileInfo[]=[];
  for(const entry of data.tree||[]){
    if(entry.type!=='blob'||typeof entry.path!=='string'||typeof entry.sha!=='string')continue;
    if(!entry.path.startsWith(ROOT+'/'))continue;
    const rel=entry.path.slice(ROOT.length+1);
    if(!safePath(rel)||!ACCEPTED.test(rel)||entry.size>MAX_FILE_BYTES)continue;
    const scope=rel.split('/')[0] as Visibility;
    if(!volumes.includes(scope)||rel.split('/').length<2)continue;
    files.push({path:rel,sha:entry.sha,size:entry.size||0,modified:null,visibility:scope});
  }
  memo={files,ref,loaded:Date.now()};return memo;
}
function externalSsoUrl(){
  const url=process.env.PERSONAL_SSO_LOGIN_URL||'';
  return url.startsWith('/')&&!url.startsWith('//')&&!url.includes('\\')?url:null;
}
function userAccess(user:SSO['user']):Visibility[]{
  if(!user||user.is_anonymous)return ['public'];
  const allowed=(process.env.PERSONAL_OWNER_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const ownerIds=(process.env.PERSONAL_OWNER_UIDS||'').split(',').map(s=>s.trim()).filter(Boolean);
  const owner=!!((user.email&&user.email_confirmed_at&&allowed.includes(user.email.toLowerCase()))||ownerIds.includes(user.id));
  return owner?['public','members','private']:['public','members'];
}
/** The default official Supabase SSR session works with the site's shared auth cookies. */
async function getSSO(req:NextRequest):Promise<SSO>{
  const value=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!value||!anon)return {user:null,cookies:[],client:null};
  const pending:SSO['cookies']=[];
  const client=createServerClient(value,anon,{cookies:{
    getAll(){return req.cookies.getAll().map(c=>({name:c.name,value:c.value}));},
    setAll(records){for(const c of records){pending.push({name:c.name,value:c.value,options:c.options||{}});req.cookies.set(c.name,c.value);}}
  }});
  try{
    const {data,error}=await client.auth.getUser();
    if(error)return {user:null,cookies:pending,client};
    return {user:data.user||null,cookies:pending,client};
  }catch{return {user:null,cookies:pending,client};}
}
function attachCookies<T extends NextResponse>(response:T,sso:SSO){
  for(const c of sso.cookies)response.cookies.set(c.name,c.value,c.options);
  response.headers.set('Cache-Control',NO_CACHE);
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
}
function errorJson(message:string,status=400){return NextResponse.json({error:message},{status,headers:{'Cache-Control':NO_CACHE}});}
function isSameOrigin(req:NextRequest){
  const origin=req.headers.get('origin');
  return !!origin && origin===new URL(req.url).origin;
}
function safeFileName(s:string){return s.replace(/[\r\n"\\]/g,'_').slice(0,140);}
function mime(path:string){const ext=path.split('.').pop()?.toLowerCase();
  return ({html:'text/html; charset=utf-8',htm:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',txt:'text/plain; charset=utf-8',md:'text/plain; charset=utf-8',xml:'application/xml',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',pdf:'application/pdf',woff:'font/woff',woff2:'font/woff2',mp3:'audio/mpeg',mp4:'video/mp4',webm:'video/webm',wasm:'application/wasm',map:'application/json',webmanifest:'application/manifest+json'} as Record<string,string>)[ext||'']||'application/octet-stream';
}
/** Resolve relative HTML/CSS asset paths inside the scoped repository volume. */
function assetHref(value:string, pagePath:string){
  const raw=value.trim();
  if(!raw || /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#|\?)/i.test(raw))return value;
  // Permit conventional relative file references, never escape public/members/private.
  const match=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(raw);
  if(!match || !match[1])return value;
  const base=pagePath.split('/').slice(0,-1);
  for(const segment of match[1].split('/')){
    if(!segment || segment==='.')continue;
    if(segment==='..'){
      if(base.length<=1)return value; // cannot move above access-control root
      base.pop();
    } else base.push(segment);
  }
  const path=base.join('/');
  if(!safePath(path) || path.split('/')[0]!==pagePath.split('/')[0])return value;
  // Query fragment appended AFTER the gateway's own file parameter.
  return '/personal?file='+encodeURIComponent(path)+(match[2]?'&'+match[2].slice(1):'')+(match[3]||'');
}
function rewriteHtmlAssets(source:string,pagePath:string){
  return source.replace(/(\b(?:href|src|poster)\s*=\s*)(["'])([^"']+)\2/gi,
    (_m,prefix,quote,value)=>prefix+quote+assetHref(value,pagePath).replace(/&/g,'&amp;')+quote);
}
function rewriteCssAssets(source:string,pagePath:string){
  return source.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi,
    (_m,quote,value)=>'url('+quote+assetHref(value,pagePath)+quote+')')
    .replace(/(@import\s+)(["'])([^"']+)\2/gi,
      (_m,prefix,quote,value)=>prefix+quote+assetHref(value,pagePath)+quote);
}
async function serveFile(req:NextRequest,requested:string,sso:SSO){
  if(!safePath(requested))return errorJson('Invalid path.',400);
  const scope=requested.split('/')[0] as Visibility;
  if(!userAccess(sso.user).includes(scope))return errorJson('Access denied.',403);
  const listing=await tree();
  const entry=listing.files.find(f=>f.path===requested);
  if(!entry)return errorJson('File not found.',404);
  const blob=await githubJson('https://api.github.com/repos/'+repository()+'/git/blobs/'+entry.sha);
  if(blob.encoding!=='base64'||typeof blob.content!=='string')return errorJson('Unsupported file encoding.',415);
  const buf=Buffer.from(blob.content.replace(/\s/g,''),'base64');
  if(buf.byteLength>MAX_FILE_BYTES)return errorJson('File size exceeds the index gateway limit.',413);
  const u=new URL(req.url);const download=u.searchParams.get('download')==='1';
  const html=/\.html?$/i.test(requested); const css=/\.css$/i.test(requested); const svg=/\.svg$/i.test(requested);
  const headers=new Headers({'Content-Type':mime(requested),'Cache-Control':NO_CACHE,'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'});
  if(download||svg)headers.set('Content-Disposition','attachment; filename="'+safeFileName(requested.split('/').pop()||'download')+'"');
  // The sandbox isolates uploaded HTML from the main app's origin / session cookies.
  if(html){headers.set('Content-Security-Policy',"sandbox allow-scripts allow-forms allow-popups; default-src 'self' https: data: blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");}
  const body=(html&&!download)?new TextEncoder().encode(rewriteHtmlAssets(buf.toString('utf8'),requested)):
    (css&&!download)?new TextEncoder().encode(rewriteCssAssets(buf.toString('utf8'),requested)):new Uint8Array(buf);
  return attachCookies(new NextResponse(body,{status:200,headers}),sso);
}
function htmlResponse(sso:SSO){
 const page = HTML;
 return attachCookies(new NextResponse(page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':NO_CACHE,'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'same-origin'}}),sso);
}
export async function GET(req:NextRequest){
  const sso=await getSSO(req);
  const file=req.nextUrl.searchParams.get('file');
  if(file!==null){
    try{return await serveFile(req,file,sso)}
    catch(e){return attachCookies(errorJson(e instanceof Error?e.message:'Unable to read file.',503),sso)}
  }
  const api=req.nextUrl.searchParams.get('api');
  if(api==='tree'){
    try{
      const t=await tree(req.nextUrl.searchParams.get('refresh')==='1');
      const scopes=userAccess(sso.user);
      const safe=t.files.filter(f=>scopes.includes(f.visibility));
      return attachCookies(NextResponse.json({files:safe,volumes:scopes,tier:scopes.includes('private')?'owner':scopes.includes('members')?'member':'guest',user:sso.user?.email||null,ref:t.ref,ssoLoginUrl:externalSsoUrl()}),sso);
    }catch(e){return attachCookies(errorJson(e instanceof Error?e.message:'GitHub directory unavailable.',503),sso)}
  }
  if(api)return attachCookies(errorJson('Unknown API.',404),sso);
  return htmlResponse(sso);
}
export async function POST(req:NextRequest){
  if(!isSameOrigin(req))return errorJson('Invalid request origin.',403);
  const action=req.nextUrl.searchParams.get('api');
  if(!['login','logout'].includes(action||''))return errorJson('Not found.',404);
  const sso=await getSSO(req);
  if(!sso.client)return errorJson('Existing Supabase SSO is not configured for this route.',503);
  if(action==='logout'){
    try{await sso.client.auth.signOut()}catch{};
    return attachCookies(NextResponse.json({ok:true}),sso);
  }
  let payload:any;
  try{payload=await req.json()}catch{return errorJson('Invalid request body.')}
  const email=typeof payload?.email==='string'?payload.email.trim().slice(0,255):'';
  const password=typeof payload?.password==='string'?payload.password:'';
  if(!email.includes('@')||!password||password.length>1024)return errorJson('Provide a valid account email and password.');
  const result=await sso.client.auth.signInWithPassword({email,password});
  if(result.error||!result.data?.user)return errorJson('Authentication unsuccessful.',401);
  return attachCookies(NextResponse.json({ok:true}),sso);
}

const HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f6f8"><meta name="color-scheme" content="light"><title>INTRICT // INDEX</title>
<style>
:root{font-synthesis:none;--bg:#eef1f6;--paper:#fff;--ink:#17263a;--muted:#66758e;--accent:#124ab1;--hover:#eaf1ff;--line:#d9e0ea;--sub:#f7f9fc;--green:#0e755d;--orange:#a46824;--radius:5px}*{box-sizing:border-box}html{font-size:13px}body{margin:0;height:100dvh;overflow:hidden;background:var(--bg);color:var(--ink);font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}button,input{font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}a:hover{color:#073279}:focus-visible{outline:2px solid var(--accent);outline-offset:2px}::selection{background:#b7d1ff} .hidden{display:none!important}.shell{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:57px minmax(0,1fr) 33px;height:100dvh;min-height:0;overflow:hidden}.top{background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 23px}.brand{display:flex;align-items:center;gap:13px;min-width:0}.logo{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;color:#fff;background:#143967;font-size:19px;font-weight:900;letter-spacing:-.13em;padding-right:4px;box-shadow:3px 3px 0 #bfcbe0}.brand strong{display:block;font-size:13px;letter-spacing:.065em}.brand small{display:block;color:var(--muted);font-size:10px;letter-spacing:.12em}.statusbar{display:flex;align-items:center;gap:18px;color:var(--muted);font-size:10px;white-space:nowrap}.green{color:var(--green)}.dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#1d9076;margin-right:7px}.loginbutton{padding:7px 10px;background:none;border:1px solid var(--line);color:var(--accent);text-decoration:underline}.loginbutton:hover{background:var(--hover)}.main{display:grid;grid-template-columns:234px minmax(0,1fr) 320px;min-height:0}.rail{background:#f2f5fa;border-right:1px solid var(--line);min-height:0;display:flex;flex-direction:column;overflow:auto}.railtop{padding:25px 21px 22px;border-bottom:1px solid var(--line)}.overline{text-transform:uppercase;letter-spacing:.15em;font-size:10px;color:var(--muted);font-weight:700}.railtop h1{font-size:27px;line-height:1.05;letter-spacing:-.075em;font-weight:600;margin:12px 0 8px;font-family:Georgia,serif}.railtop h1 em{font-style:normal;color:var(--accent)}.railtop p{margin:0;color:var(--muted);font-size:11px}.volumes{padding:22px 12px 10px}.volume{padding:11px 12px;display:flex;align-items:center;gap:10px;width:100%;border:1px solid transparent;color:var(--ink);background:none;text-align:left;border-radius:3px}.volume:hover{background:#e6edf8}.volume.active{background:#fff;border-color:#b9cceb;box-shadow:inset 3px 0 0 var(--accent)}.volume .glyph{color:var(--accent);font-size:17px}.volume strong{font-weight:600;flex:1;font-size:12px}.volume small{font-size:9px;color:var(--muted)}.railhelp{padding:16px 23px;margin-top:auto;border-top:1px dashed var(--line);font-size:11px;color:var(--muted)}.railhelp b{display:block;color:var(--ink);letter-spacing:.06em;margin-bottom:9px}.railhelp code{display:block;margin:5px 0}.railend{padding:12px 23px 20px;font-size:10px;color:var(--muted)}.center{background:var(--paper);min-width:0;min-height:0;display:flex;flex-direction:column}.mast{padding:24px 28px 17px;border-bottom:1px solid var(--line)}.http{font-size:10px;color:var(--muted);letter-spacing:.07em}.http b{border:1px solid var(--line);color:var(--green);padding:2px 5px;font-weight:600;margin-right:5px}.headrow{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-top:12px}.headrow h2{font:normal clamp(30px,3.55vw,57px)/1.05 Georgia,serif;letter-spacing:-.07em;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.headrow h2 em{color:var(--accent);font-style:normal}.headmeta{font-size:10px;color:var(--muted);text-align:right;white-space:nowrap}.crumbs{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:13px;font-size:11px}.crumbs button{border:0;background:none;color:var(--accent);padding:1px;text-decoration:underline}.crumbs strong{font-weight:600}.controls{display:flex;align-items:center;gap:9px;padding:12px 27px;border-bottom:1px solid var(--line);background:#fff}.search{max-width:490px;flex:1;min-width:100px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);padding:9px 10px;background:#fafcff}.search i{font-size:15px;font-style:normal;color:var(--accent)}.search input{background:transparent;border:0;outline:0;color:var(--ink);min-width:0;width:100%}.btn{border:1px solid var(--line);background:#fff;padding:8px 11px;color:var(--ink);white-space:nowrap}.btn:hover{background:var(--hover)}.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.btn.primary:hover{background:#0c3580}.right{background:#f9fbfe;border-left:1px solid var(--line);min-height:0;display:flex;flex-direction:column}.detailtop{padding:25px 24px 18px;border-bottom:1px solid var(--line)}.detailtop h3{margin:15px 0 0;font:normal 23px/1.2 Georgia,serif;overflow-wrap:anywhere}.detailbody{overflow:auto;padding:22px 24px 25px;flex:1}.detailbody p{margin-top:0;color:var(--muted);line-height:1.75;font-size:12px}.properties{display:grid;grid-template-columns:88px 1fr;row-gap:13px;column-gap:8px;margin:20px 0;font-size:11px}.properties dt{color:var(--muted)}.properties dd{margin:0;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}.excerpt{padding:15px;background:#fff;border:1px solid var(--line);font-size:11px;line-height:1.8;white-space:pre-wrap;word-break:break-word;max-height:260px;overflow:auto}.directory{overflow:auto;min-height:0;flex:1}.table{width:100%;table-layout:fixed;border-collapse:collapse;text-align:left}.table thead{position:sticky;top:0;background:#f7f9fe;z-index:1}.table th{border-bottom:1px solid var(--line);padding:11px 9px;color:var(--muted);text-transform:uppercase;font-weight:600;letter-spacing:.1em;font-size:10px}.table th:first-child,.table td:first-child{padding-left:29px}.table th:last-child,.table td:last-child{padding-right:24px}.table tr.item{border-bottom:1px solid #ecf0f5;cursor:pointer}.table tr.item:hover{background:#f5f8fe}.table tr.item.selected{background:#e9f1ff;box-shadow:inset 3px 0 0 var(--accent)}.table td{height:49px;padding:9px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:11px;color:var(--muted)}.table td:first-child{font-size:12px;color:var(--ink)}.filename{border:0;background:none;color:var(--accent);text-decoration:underline;text-underline-offset:3px;padding:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 28px);vertical-align:middle;text-align:left}.fileicon{display:inline-block;width:25px;color:#0d3a93;font-size:15px}.permission{font-size:9px;letter-spacing:.06em;border:1px solid var(--line);padding:4px 5px;text-transform:uppercase}.empty{padding:56px 28px;color:var(--muted)}.empty strong{display:block;font:normal 27px/1.15 Georgia,serif;color:var(--ink);margin-bottom:12px}.empty code{padding:3px 6px;background:#eef3fc;color:#11458b}.bottom{background:var(--paper);border-top:1px solid var(--line);display:flex;align-items:center;gap:15px;justify-content:space-between;padding:0 22px;font-size:10px;color:var(--muted);white-space:nowrap}.footerid{color:var(--accent);font-weight:bold}.mobile-menu{display:none}.scrim{display:none}.badge{border:1px solid var(--line);padding:2px 5px;font-size:9px;letter-spacing:.08em;color:var(--muted)}.loginnotice{margin:16px 0;padding:13px;background:#edf3fd;border-left:3px solid var(--accent);font-size:11px;color:#234777}.modal{border:0;max-width:430px;width:calc(100% - 30px);padding:0;box-shadow:0 28px 100px #111f3e66;color:var(--ink)}.modal::backdrop{background:#071b38ae;backdrop-filter:blur(4px)}.modalhead{padding:20px 24px;background:#f4f7fd;border-bottom:1px solid var(--line);display:flex;justify-content:space-between}.modalhead strong{letter-spacing:.07em}.modalhead button{border:0;background:none;color:var(--accent);font-size:20px}.modalcontent{padding:24px}.modalcontent label{display:block;font-size:11px;color:var(--muted);margin:16px 0 6px}.modalcontent input{display:block;width:100%;border:1px solid var(--line);padding:12px;background:#fafcff;color:var(--ink)}.modalcontent input:focus{outline:1px solid var(--accent)}.modalcontent .btn{width:100%;margin-top:20px;padding:13px}.modalcontent .error{color:#a12d39;font-size:11px;min-height:16px;margin-top:12px}.authnote{color:var(--muted);font-size:11px;line-height:1.75}.kbd{color:#8190a9;font-size:10px}.lock{color:var(--orange)}@media(max-width:1120px){.main{grid-template-columns:204px minmax(0,1fr) 270px}.table th:nth-child(3),.table td:nth-child(3){display:none}.mast{padding:22px}.detailbody{padding:18px}.detailtop{padding:20px}.railhelp{display:none}}@media(max-width:820px){html,body{overflow-x:clip;width:100%}body{height:100dvh}.shell{grid-template-rows:55px minmax(0,1fr) 31px}.top{padding:0 15px}.main{grid-template-columns:minmax(0,1fr)}.rail{position:fixed;inset:55px auto 0 0;width:min(300px,85vw);z-index:30;transform:translateX(-105%);transition:transform .22s ease;box-shadow:10px 0 30px #15254417}.rail.open{transform:translateX(0)}.scrim.open{display:block;position:fixed;inset:55px 0 0;background:#091d396b;z-index:29}.mobile-menu{display:inline-flex;align-items:center;justify-content:center;background:#fff;color:var(--accent);border:1px solid var(--line);width:35px;height:35px}.brand small,.statusbar .hostname{display:none}.statusbar{gap:8px}.statusbar .userline{max-width:115px;text-overflow:ellipsis;overflow:hidden}.right{position:fixed;inset:55px 0 30px auto;width:min(380px,100%);z-index:25;transform:translateX(110%);transition:transform .2s ease;box-shadow:-10px 0 30px #15254417}.right.open{transform:translateX(0)}.headrow h2{font-size:37px}.headmeta{display:none}.mast{padding:21px 19px 17px}.controls{padding:11px 18px}.table th:first-child,.table td:first-child{padding-left:17px}.table th:last-child,.table td:last-child{padding-right:15px}.bottom{padding:0 13px}.brand{gap:10px}.statusbar .dot{display:none}.table th:nth-child(2),.table td:nth-child(2){display:none}}@media(max-width:460px){.controls .btn{text-indent:0;padding:8px}.table td{height:58px}.table th:nth-child(4),.table td:nth-child(4){display:none}.headrow h2{font-size:34px}.http{font-size:9px}.brand strong{font-size:11px}.statusbar .userline{display:none}.search{max-width:none}.bottom{font-size:9px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important}}
</style></head>
<body><div class="shell"><header class="top"><div class="brand"><button class="mobile-menu" type="button" id="menuBtn" title="Directories" aria-label="Directories">☷</button><div class="logo">i.</div><div><strong>INTRICT <span style="color:#124ab1">//</span> INDEX</strong><small>INDEPENDENT NETWORK / FILE SYSTEM</small></div></div><div class="statusbar"><span class="hostname">GET intrict.com/personal</span><span class="userline"><i class="dot"></i><span id="sessionLabel">CHECKING SESSION</span></span><button type="button" class="loginbutton" id="authBtn">SIGN IN</button></div></header>
<div class="scrim" id="scrim"></div><div class="main"><aside class="rail" id="rail"><div class="railtop"><div class="overline">System / Index 10.0</div><h1>Find your<br><em>way in.</em></h1><p>Actual directories. No imaginary files.</p></div><div class="volumes"><div class="overline" style="padding:0 13px 12px">AVAILABLE VOLUMES</div><div id="volumeList"></div></div><div class="railhelp"><b>KEYBOARD REFERENCE</b><code>/ &nbsp;&nbsp; Search directory</code><code>Ctrl+K &nbsp; Global find</code><code>Esc &nbsp; Close panels</code><code>↵ &nbsp;&nbsp; Open selected</code></div><div class="railend">INTRICT NETWORK<br>GUEST-SEGREGATED ACCESS<br>© 2026</div></aside>
<main class="center"><section class="mast"><div class="http"><b id="httpBadge">200 OK</b> DIRECTORY SERVICE / <span id="authTier">GUEST</span></div><div class="headrow"><h2>Index of <em id="heroPath">/personal/</em></h2><div class="headmeta"><span id="headerCount">—</span> entries<br><span id="timestamp">LIVE REPOSITORY INDEX</span></div></div><div class="crumbs" id="crumbs"></div></section><div class="controls"><label class="search"><i>⌕</i><input id="search" type="search" placeholder="Filter filenames / paths…" autocomplete="off" aria-label="Search files"><span class="kbd">/</span></label><button class="btn" id="refreshBtn" title="Fetch current directory from GitHub">↻ Refresh</button><button class="btn" id="detailsBtn" title="File details">Details</button></div><div class="directory" id="directory"><table class="table"><thead><tr><th style="width:50%">NAME <span style="color:#9ca9bd">↓</span></th><th style="width:24%">MODIFIED</th><th style="width:16%">TYPE</th><th style="width:10%">ACCESS</th></tr></thead><tbody id="entries"><tr><td colspan="4"><div class="empty">Connecting to directory service…</div></td></tr></tbody></table><div id="empty" class="empty hidden"></div></div></main><aside class="right" id="right"><div class="detailtop"><div style="display:flex;justify-content:space-between;align-items:center"><span class="overline">FILE INSPECTOR / 10</span><button class="btn" type="button" id="closeDetail" aria-label="Close details" style="padding:5px 9px">×</button></div><h3 id="fileName">Select an entry</h3></div><div class="detailbody" id="details"><p>Inspect files, browse nested directories, or open applications hosted inside your repository.</p><div class="loginnotice"><b>ACTUAL SOURCE DATA</b><br>The index only displays files discovered in the configured GitHub repository. Hidden volumes remain inaccessible to guests.</div></div></aside></div><footer class="bottom"><span><span class="footerid">INTRICT / INDEX</span> · SERVER-RENDERED ACCESS CONTROL</span><span id="footerText">AWAITING DIRECTORY</span></footer></div>
<dialog id="authDialog" class="modal"><div class="modalhead"><strong>401 / ACCOUNT AUTHENTICATION</strong><button type="button" id="closeAuth" aria-label="Close dialog">×</button></div><div class="modalcontent"><p class="authnote">Sign in with your existing IntrICT account. This uses the same Supabase user directory and session cookies as the other applications, if they share the standard SSR configuration.</p><form id="authForm"><label for="email">ACCOUNT EMAIL</label><input id="email" type="email" required autocomplete="username" placeholder="you@example.com"><label for="password">PASSWORD</label><input id="password" type="password" required autocomplete="current-password" placeholder="••••••••"><button class="btn primary" type="submit" id="submitAuth">AUTHENTICATE →</button><div class="error" id="authError" role="alert"></div></form><a id="externalLogin" class="btn hidden" style="display:block;text-align:center;text-decoration:none;margin-top:12px" href="#">USE EXISTING SSO LOGIN ↗</a><p class="authnote">No separate portal password is stored here. If your account uses passkeys or another login method, use the existing IntrICT login and return to this page.</p></div></dialog>
<script>
(function(){
'use strict';
const el=(id)=>document.getElementById(id);
const esc=(v)=>String(v==null?'':v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base='/personal'; const levels=['public','members','private'];let items=[],meta={},current='',selected=null,filter='',all=[],pending=false;
const humanSize=(n)=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const fmt=(d)=>d?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(d)):'—';
const linkFor=(p)=>base+'?file='+encodeURIComponent(p);
const showError=(message)=>{el('httpBadge').textContent='503 UNAVAILABLE';el('entries').innerHTML='';el('empty').classList.remove('hidden');el('empty').innerHTML='<strong>Cannot read this index.</strong>'+esc(message);el('footerText').textContent='DIRECTORY ERROR';};
async function json(url,opts){const r=await fetch(url,{cache:'no-store',...opts});const d=await r.json().catch(()=>({error:'Invalid server response'}));if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d;}
function paths(){return levels.filter(v=>meta.volumes&&meta.volumes.includes(v));}
function drawVolumes(){el('volumeList').innerHTML=paths().map((v)=>'<button class="volume '+(current===v||current.startsWith(v+'/')?'active':'')+'" data-volume="'+v+'"><span class="glyph">▣</span><strong>/'+v+'/</strong><small>'+ (v==='public'?'WORLD':v==='members'?'SESSION':'OWNER') +'</small></button>').join('');}
function resolveDir(){const p=new URL(location.href).searchParams.get('dir');const allowed=paths();if(p && allowed.some(v=>p===v||p.startsWith(v+'/')))return p;return allowed[0]||'public';}
function directChildren(){const prefix=current+'/';const folders=new Map(),files=[];for(const f of all){if(!f.path.startsWith(prefix))continue;const remainder=f.path.slice(prefix.length);if(!remainder)continue;const i=remainder.indexOf('/');if(i!==-1){const name=remainder.slice(0,i);if(!folders.has(name))folders.set(name,{name,path:prefix+name,type:'directory',size:0,modified:null,visibility:current.split('/')[0]});}else files.push({...f,name:remainder,type:'file',visibility:current.split('/')[0]});}return [...folders.values(),...files].sort((a,b)=>a.type===b.type?a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}):a.type==='directory'?-1:1);}
function itemIcon(x){if(x.type==='directory')return '▰';if(/\.html?$/i.test(x.name))return '⌘';if(/\.(js|ts|css)$/i.test(x.name))return '⌁';if(/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(x.name))return '▧';return '▤';}
function render(){drawVolumes();const allChildren=directChildren();const q=el('search').value.toLowerCase().trim();const visible=q?allChildren.filter(x=>x.name.toLowerCase().includes(q)||x.path.toLowerCase().includes(q)):allChildren;items=visible;el('entries').innerHTML=visible.map((x,i)=>'<tr class="item '+(selected&&x.path===selected.path?'selected':'')+'" data-index="'+i+'" tabindex="0"><td><span class="fileicon">'+itemIcon(x)+'</span><button class="filename" data-open="'+i+'">'+esc(x.name)+(x.type==='directory'?'/':'')+'</button></td><td>'+fmt(x.modified)+'</td><td>'+ (x.type==='directory'?'DIRECTORY':esc((x.name.split('.').pop()||'FILE').toUpperCase()))+'</td><td><span class="permission">'+esc(x.visibility)+'</span></td></tr>').join('');
el('empty').classList.toggle('hidden',visible.length>0);if(!visible.length)el('empty').innerHTML='<strong>'+ (q?'Nothing matches.':'This directory is empty.')+'</strong>'+(q?'Try a different filename.':'Add files under <code>personal-content/'+esc(current)+'/</code> in GitHub. The next deployment will discover them automatically.');
el('heroPath').textContent='/'+current+'/';el('headerCount').textContent=allChildren.length.toString().padStart(2,'0');el('footerText').textContent=all.length+' INDEXED OBJECTS · '+meta.tier.toUpperCase()+' ACCESS';
const chunks=current.split('/');const crumbs=['<button data-dir="">/personal</button>'];chunks.forEach((s,i)=>{crumbs.push('<span>/</span><button data-dir="'+esc(chunks.slice(0,i+1).join('/'))+'">'+esc(s)+'</button>')});el('crumbs').innerHTML=crumbs.join('');
el('httpBadge').textContent='200 OK';el('authTier').textContent=meta.tier.toUpperCase();el('timestamp').textContent=meta.ref?'REF '+meta.ref.slice(0,12):'GIT SOURCE';}
function inspect(x){selected=x;render();el('fileName').textContent=x.name+(x.type==='directory'?'/':'');let html='<div class="badge">'+(x.type==='directory'?'DIRECTORY':'REPOSITORY FILE')+'</div><dl class="properties"><dt>PATH</dt><dd>'+esc(x.path)+'</dd><dt>ACCESS</dt><dd>'+esc(x.visibility)+'</dd><dt>TYPE</dt><dd>'+esc(x.type)+'</dd><dt>SIZE</dt><dd>'+ (x.size?humanSize(x.size):'—')+'</dd><dt>OBJECT ID</dt><dd>'+(x.sha?esc(x.sha.slice(0,14)):'—')+'</dd></dl>';
if(x.type==='directory')html+='<p>This folder is automatically indexed from your repository. It does not require manual registration.</p><div class="actions"><button class="btn primary" id="openSelected">ENTER DIRECTORY →</button></div>';
else html+='<p>Open this file through the access-controlled file gateway. HTML pages run in a restricted security sandbox.</p><div class="actions"><button class="btn primary" id="openSelected">OPEN FILE ↗</button><a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="'+esc(linkFor(x.path))+'&amp;download=1">DOWNLOAD ↓</a></div>';
el('details').innerHTML=html;el('right').classList.add('open');el('openSelected').addEventListener('click',()=>open(x));}
function open(x){if(x.type==='directory'){navigate(x.path);return;}window.open(linkFor(x.path),'_blank','noopener');}
function closeMobile(){el('rail').classList.remove('open');el('scrim').classList.remove('open');}
function navigate(dir){if(!dir || dir==='root')dir=paths()[0]||'public';if(!paths().some(p=>dir===p||dir.startsWith(p+'/')))return;current=dir;selected=null;el('right').classList.remove('open');el('fileName').textContent='Select an entry';el('details').innerHTML='<p>Choose a file to inspect its metadata, or double-click to open it.</p>';el('search').value='';const u=new URL(location.href);u.searchParams.set('dir',dir);history.pushState({dir},'',u.toString());render();closeMobile();}
function refreshView(){el('refreshBtn').disabled=true;el('refreshBtn').textContent='↻ Loading';load(true).finally(()=>{el('refreshBtn').disabled=false;el('refreshBtn').textContent='↻ Refresh';});}
async function load(fresh){try{const d=await json(base+'?api=tree'+(fresh?'&refresh=1':''));meta=d;all=d.files||[];el('sessionLabel').textContent=meta.user?meta.user:'GUEST SESSION';el('authBtn').textContent=meta.user?'SIGN OUT':'SIGN IN';if(meta.ssoLoginUrl){el('externalLogin').href=meta.ssoLoginUrl;el('externalLogin').classList.remove('hidden');}else{el('externalLogin').classList.add('hidden');}current=resolveDir();render();}catch(e){showError(e.message)}}
function openAuth(){el('authError').textContent='';el('authDialog').showModal();}
async function doAuth(e){e.preventDefault();const b=el('submitAuth');b.disabled=true;b.textContent='AUTHENTICATING…';try{await json(base+'?api=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:el('email').value,password:el('password').value})});el('authDialog').close();el('password').value='';history.replaceState({},'',base);await load(true);}catch(err){el('authError').textContent=err.message;}finally{b.disabled=false;b.textContent='AUTHENTICATE →';}}
async function signout(){try{await json(base+'?api=logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});history.replaceState({},'',base);await load(true)}catch(e){alert(e.message)}}
el('authBtn').addEventListener('click',()=>meta.user?signout():openAuth());el('closeAuth').addEventListener('click',()=>el('authDialog').close());el('authForm').addEventListener('submit',doAuth);
el('refreshBtn').addEventListener('click',refreshView);el('search').addEventListener('input',()=>{selected=null;render()});el('entries').addEventListener('click',e=>{const row=e.target.closest('[data-index]');if(!row)return;const x=items[Number(row.dataset.index)];if(!x)return;if(e.target.closest('[data-open]'))open(x);else inspect(x)});el('entries').addEventListener('dblclick',e=>{const row=e.target.closest('[data-index]');if(row)open(items[Number(row.dataset.index)])});el('entries').addEventListener('keydown',e=>{if(e.key==='Enter'){const row=e.target.closest('[data-index]');if(row)open(items[Number(row.dataset.index)]);}});
el('volumeList').addEventListener('click',e=>{const x=e.target.closest('[data-volume]');if(x)navigate(x.dataset.volume)});el('crumbs').addEventListener('click',e=>{const x=e.target.closest('[data-dir]');if(x)navigate(x.dataset.dir)});el('menuBtn').addEventListener('click',()=>{el('rail').classList.toggle('open');el('scrim').classList.toggle('open')});el('scrim').addEventListener('click',closeMobile);el('closeDetail').addEventListener('click',()=>el('right').classList.remove('open'));el('detailsBtn').addEventListener('click',()=>el('right').classList.toggle('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){el('right').classList.remove('open');closeMobile();return}if(e.target.matches('input,textarea'))return;if(e.key==='/'||(e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey))){e.preventDefault();el('search').focus();el('search').select()}});
window.addEventListener('popstate',()=>{current=resolveDir();selected=null;render()});load(false);
})();
</script></body></html>
`;
