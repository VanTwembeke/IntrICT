/**
 * INTRICT // INDEX v13.1 — COMPLETE SINGLE FILE, NO NEW VERCEL ENV VARIABLES.
 *
 * Add/replace: src/app/personal/route.ts (or app/personal/route.ts).
 * Repository and branch are hardcoded below using the existing IntrICT deployment.
 * The scanner discovers real folders under src/app/personal/, app/personal/, or
 * personal/, and also recognizes public/personal/ for PUBLIC content ONLY.
 * No unrelated content-root directory is required.
 *
 * GET /personal/                interface
 * GET /personal/?api=tree       authenticated listing
 * GET /personal/?dir=games      directory navigation
 * GET /personal/?file=games/README.md  content gateway
 * POST ?api=login|logout        Supabase account authentication
 *
 * This route first tries GitHub's Git Trees API. If a private repository blocks
 * anonymous API requests and no secret is available, it tries local deploy files.
 * If neither GitHub nor the deployed filesystem is accessible, no files are
 * fabricated: the index displays a diagnostic instead.
 * A PRIVATE repository cannot be dynamically queried from GitHub without
 * server-side credentials. Never hardcode a GitHub token in a public repo.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export const runtime='nodejs';
export const dynamic='force-dynamic';

type Visibility='public'|'games'|'members'|'private';
type Source='github'|'local'|'unavailable';
type FileInfo={path:string;sha:string;size:number;modified:string|null;visibility:Visibility;source:Source;absolute?:string};
type RepoTree={files:FileInfo[];ref:string;loaded:number;root:string;source:Source;warning:string|null};
type SSO={user:{id:string;email?:string;email_confirmed_at?:string|null;is_anonymous?:boolean}|null;cookies:Array<{name:string;value:string;options:CookieOptions}>;client:ReturnType<typeof createServerClient>|null};

type GitHubTreeEntry={type:string;path:string;sha:string;size?:number};
type GitHubTreeResponse={truncated?:boolean;tree?:GitHubTreeEntry[]};
type GitHubBlobResponse={encoding?:string;content?:unknown};

// NON-SECRET SETTINGS — EDITABLE DIRECTLY ON GITHUB.
const REPO='VanTwembeke/IntrICT';
const BRANCH='main';
const ROOT_CANDIDATES=['src/app/personal','app/personal','personal','src/personal','public/personal'];
const OWNER_EMAILS:string[]=[];   // Verified Supabase emails only; keep private disabled until set.
const OWNER_UIDS:string[]=[];     // Or explicitly allow specific Supabase auth user UUIDs.
const VOLUMES:Visibility[]=['public','games','members','private'];
const MAX_BYTES=3*1024*1024;
const ACCEPTED=/\.(html?|css|m?js|json|txt|md|svg|png|jpe?g|gif|webp|ico|pdf|woff2?|mp3|mp4|webm|wasm|map|xml|webmanifest)$/i;
const NO_CACHE='private, no-store, max-age=0';
let memo:RepoTree|null=null;

function goodPath(p:string){return !!p&&p.length<701&&!p.includes('\\')&&!p.includes('\0')&&p.split('/').every(s=>!!s&&s!=='.'&&s!=='..'&&!s.startsWith('.'));}
function scopeOf(p:string):Visibility|null{const first=p.split('/')[0];return VOLUMES.includes(first as Visibility)?first as Visibility:null;}
function acceptFile(p:string,size:number){return goodPath(p)&&p.split('/').length>1&&!!scopeOf(p)&&ACCEPTED.test(p)&&size<=MAX_BYTES;}
function githubHeaders():Record<string,string>{const h:Record<string,string>={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Intrict-Index-13.1'};
  // Optional existing secret: the route does not require changing Vercel configuration.
  const token=process.env.PERSONAL_GITHUB_TOKEN;
  if(token)h.Authorization='Bearer '+token;return h;}
async function githubJson<T>(url:string):Promise<T>{const r=await fetch(url,{headers:githubHeaders(),cache:'no-store',signal:AbortSignal.timeout(11000)});
  if(!r.ok)throw Error(r.status===404?'Repository is private or not accessible to GitHub API':`GitHub API returned HTTP ${r.status}`);return r.json();}
function pickRoot(paths:string[]){
  let best='';let top=0;
  for(const root of ROOT_CANDIDATES){let count=0;
    for(const p of paths){if(!p.startsWith(root+'/'))continue;const rel=p.slice(root.length+1);if(!acceptFile(rel,0))continue;
      // Files in public/personal are publicly reachable by URL: never claim private access.
      if(root==='public/personal'&& !['public','games'].includes(scopeOf(rel)!))continue;
      count++;}
    if(count>top){best=root;top=count;}
  }
  return best;
}
async function fromGitHub():Promise<RepoTree>{
  const url=`https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(BRANCH)}?recursive=1`;
  const data=await githubJson<GitHubTreeResponse>(url);
  if(data.truncated)throw Error('GitHub tree is truncated; cannot safely enumerate the full directory');
  const rows=(Array.isArray(data.tree)?data.tree:[]).filter((e)=>e.type==='blob'&&typeof e.path==='string'&&typeof e.sha==='string');
  const root=pickRoot(rows.map((x)=>x.path));
  if(!root)throw Error('Repository accessible, but no supported files found inside /personal/ folders');
  const files:FileInfo[]=[];
  for(const e of rows){if(!e.path.startsWith(root+'/'))continue;const p=e.path.slice(root.length+1);
    if(!acceptFile(p,e.size||0))continue;
    const v=scopeOf(p)!;
    if(root==='public/personal'&&!['public','games'].includes(v))continue;
    files.push({path:p,sha:e.sha,size:e.size||0,modified:null,visibility:v,source:'github'});
  }
  return {files,root,ref:BRANCH,source:'github',loaded:Date.now(),warning:null};
}
async function fromLocal():Promise<RepoTree>{
  const project=process.cwd();let best:RepoTree|null=null;
  for(const root of ROOT_CANDIDATES){const absolute=path.join(project,...root.split('/'));
    const files:FileInfo[]=[];let checked=0;
    const walk=async(dir:string,rel=''):Promise<void>=>{
      if(checked>5000)return;
      let children;try{children=await fs.readdir(dir,{withFileTypes:true});}catch{return;}
      for(const child of children){checked++;if(checked>5000)break;
        if(child.isSymbolicLink()||child.name.startsWith('.'))continue;
        const next=rel?rel+'/'+child.name:child.name;
        if(child.isDirectory())await walk(path.join(dir,child.name),next);
        if(!child.isFile())continue;
        let st;try{st=await fs.stat(path.join(dir,child.name));}catch{continue;}
        if(!acceptFile(next,st.size))continue;
        const scope=scopeOf(next)!;
        if(root==='public/personal'&&!['public','games'].includes(scope))continue;
        files.push({path:next,sha:'local',size:st.size,modified:st.mtime.toISOString(),visibility:scope,source:'local',absolute:path.join(dir,child.name)});
      }
    };
    await walk(absolute);
    if(files.length>(best?.files.length||0))best={files,root,ref:'deployment',source:'local',loaded:Date.now(),warning:null};
  }
  if(!best)throw Error('No repository content files bundled with this Next.js deployment');
  return best;
}
async function tree(force=false):Promise<RepoTree>{
  if(!force&&memo&&Date.now()-memo.loaded<30000)return memo;
  let github:RepoTree|null=null;let local:RepoTree|null=null;let githubError='';let localError='';
  try{github=await fromGitHub();}catch(e){githubError=e instanceof Error?e.message:String(e);}
  if(!github)try{local=await fromLocal();}catch(e){localError=e instanceof Error?e.message:String(e);}
  const base=github||local||{files:[],root:'',ref:BRANCH,source:'unavailable' as Source,loaded:Date.now(),warning:null};
  const files=base.files;
  const warning=base.source==='unavailable'?
    `No source directories could be indexed. GitHub: ${githubError||'unknown'}. Deployment filesystem: ${localError||'unknown'}. Check repository access; private GitHub repositories require server-side credentials.`:
    base.source==='local'?`Reading deployed local files (GitHub unavailable: ${githubError}). Some repository files might not be bundled by Next.js output tracing.`:null;
  memo={...base,files,warning,loaded:Date.now()};return memo;
}
function allowed(user:SSO['user']):Visibility[]{
  if(!user||user.is_anonymous)return ['public','games'];
  const isOwner=OWNER_UIDS.includes(user.id)||!!(user.email&&user.email_confirmed_at&&OWNER_EMAILS.map(s=>s.toLowerCase()).includes(user.email.toLowerCase()));
  return isOwner?VOLUMES:['public','games','members'];
}
async function getSSO(req:NextRequest):Promise<SSO>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return {user:null,cookies:[],client:null};
  const pending:SSO['cookies']=[];
  const client=createServerClient(url,key,{cookies:{getAll(){return req.cookies.getAll().map(c=>({name:c.name,value:c.value}));},setAll(records){for(const c of records){pending.push({name:c.name,value:c.value,options:c.options||{}});req.cookies.set(c.name,c.value);}}}});
  try{const {data,error}=await client.auth.getUser();return {user:error?null:(data.user||null),cookies:pending,client};}
  catch{return {user:null,cookies:pending,client};}
}
function secure<T extends NextResponse>(res:T,sso:SSO){for(const c of sso.cookies)res.cookies.set(c.name,c.value,c.options);
  res.headers.set('Cache-Control',NO_CACHE);res.headers.set('X-Robots-Tag','noindex, nofollow');res.headers.set('X-Content-Type-Options','nosniff');return res;}
function err(msg:string,status=400){return NextResponse.json({error:msg},{status,headers:{'Cache-Control':NO_CACHE}});}
function mime(p:string){const e=p.split('.').pop()?.toLowerCase()||'';
  return ({html:'text/html; charset=utf-8',htm:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',txt:'text/plain; charset=utf-8',md:'text/plain; charset=utf-8',xml:'application/xml',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',pdf:'application/pdf',woff:'font/woff',woff2:'font/woff2',mp3:'audio/mpeg',mp4:'video/mp4',webm:'video/webm',wasm:'application/wasm',map:'application/json',webmanifest:'application/manifest+json'} as Record<string,string>)[e]||'application/octet-stream';}
function fileUrl(value:string,sourcePath:string){const raw=value.trim();if(!raw||/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#|\?)/i.test(raw))return value;
 const m=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(raw);if(!m||!m[1])return value;
 const arr=sourcePath.split('/').slice(0,-1);for(const s of m[1].split('/')){if(!s||s==='.')continue;if(s==='..'){if(arr.length<2)return value;arr.pop();}else arr.push(s);}
 const p=arr.join('/');if(!goodPath(p)||scopeOf(p)!==scopeOf(sourcePath))return value;
 return '/personal?file='+encodeURIComponent(p)+(m[2]?'&'+m[2].slice(1):'')+(m[3]||'');
}
function rewriteHtml(html:string,p:string){return html.replace(/(\b(?:href|src|poster)\s*=\s*)(["'])([^"']+)\2/gi,(_s,a,b,c)=>a+b+fileUrl(c,p).replace(/&/g,'&amp;')+b);}
function rewriteCss(css:string,p:string){return css.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi,(_s,q,v)=>'url('+q+fileUrl(v,p)+q+')').replace(/(@import\s+)(["'])([^"']+)\2/gi,(_s,a,b,c)=>a+b+fileUrl(c,p)+b);}
async function serveFile(req:NextRequest,p:string,sso:SSO){
  if(!goodPath(p)||!scopeOf(p))return err('Invalid requested path.',400);
  if(!allowed(sso.user).includes(scopeOf(p)!))return err('You are not authorized to open this file.',403);
  const listing=await tree();const item=listing.files.find(f=>f.path===p);if(!item)return err('File not found.',404);
  let buf:Buffer;
  if(item.source==='local'&&item.absolute)buf=await fs.readFile(item.absolute);
  else {const blob=await githubJson<GitHubBlobResponse>(`https://api.github.com/repos/${REPO}/git/blobs/${item.sha}`);
    if(blob.encoding!=='base64'||typeof blob.content!=='string')return err('Unsupported GitHub file format.',415);
    buf=Buffer.from(blob.content.replace(/\s/g,''),'base64');}
  if(buf.byteLength>MAX_BYTES)return err('File exceeds maximum supported size.',413);
  const download=req.nextUrl.searchParams.get('download')==='1';
  const html=/\.html?$/i.test(p);const css=/\.css$/i.test(p);const svg=/\.svg$/i.test(p);
  const headers=new Headers({'Content-Type':mime(p),'Cache-Control':NO_CACHE,'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
  if(download)headers.set('Content-Disposition','attachment; filename="'+p.split('/').pop()?.replace(/[\r\n"\\]/g,'_')+'"');
  if(html&&!download)headers.set('Content-Security-Policy',"sandbox allow-scripts allow-forms allow-popups; default-src 'self' https: data: blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'");
  if(svg&&!download)headers.set('Content-Security-Policy',"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:; frame-ancestors 'self'");
  const body=(html&&!download)?Buffer.from(rewriteHtml(buf.toString('utf8'),p),'utf8'):(css&&!download)?Buffer.from(rewriteCss(buf.toString('utf8'),p),'utf8'):buf;
  return secure(new NextResponse(new Uint8Array(body),{headers}),sso);
}
function renderPage(sso:SSO){return secure(new NextResponse(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'same-origin'}}),sso);}
export async function GET(req:NextRequest){const sso=await getSSO(req);
  const file=req.nextUrl.searchParams.get('file');if(file!==null){try{return await serveFile(req,file,sso);}catch(e){return secure(err(e instanceof Error?e.message:'File unavailable.',503),sso);}}
  const api=req.nextUrl.searchParams.get('api');if(api==='tree'){
    try{const t=await tree(req.nextUrl.searchParams.get('refresh')==='1');const volumes=allowed(sso.user);
      return secure(NextResponse.json({files:t.files.filter(f=>volumes.includes(f.visibility)).map(({absolute,...safe})=>safe),volumes,tier:volumes.includes('private')?'owner':volumes.includes('members')?'member':'guest',user:sso.user?.email||null,ref:t.ref,root:t.root,source:t.source,warning:t.warning,ssoLoginUrl:null}),sso);
    }catch(e){return secure(err(e instanceof Error?e.message:'Directory index unavailable.',503),sso);}}
  if(api)return secure(err('Unknown API endpoint.',404),sso);
  return renderPage(sso);
}
export async function POST(req:NextRequest){const origin=req.headers.get('origin');if(!origin||origin!==req.nextUrl.origin)return err('Invalid request origin.',403);
  const action=req.nextUrl.searchParams.get('api');if(action!=='login'&&action!=='logout')return err('Not found.',404);
  const sso=await getSSO(req);if(!sso.client)return err('IntrICT SSO is not connected to this route. Existing site Supabase variables are required.',503);
  if(action==='logout'){await sso.client.auth.signOut();return secure(NextResponse.json({ok:true}),sso);}
  let body:unknown;try{body=await req.json();}catch{return err('Invalid JSON.',400);}
  const email=typeof body==='object'&&body!==null&&'email' in body&&typeof body.email==='string'?body.email.trim().slice(0,255):'';
  const password=typeof body==='object'&&body!==null&&'password' in body&&typeof body.password==='string'?body.password:'';
  if(!email.includes('@')||!password||password.length>1024)return err('Provide a valid account email and password.');
  const {data,error}=await sso.client.auth.signInWithPassword({email,password});if(error||!data?.user)return err('Authentication failed.',401);
  return secure(NextResponse.json({ok:true}),sso);
}

const HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f6f8"><meta name="color-scheme" content="light"><title>INTRICT // INDEX</title>
<style>
:root{font-synthesis:none;--bg:#eef1f6;--paper:#fff;--ink:#17263a;--muted:#66758e;--accent:#124ab1;--hover:#eaf1ff;--line:#d9e0ea;--sub:#f7f9fc;--green:#0e755d;--orange:#a46824;--radius:5px}*{box-sizing:border-box}html{font-size:13px}body{margin:0;height:100dvh;overflow:hidden;background:var(--bg);color:var(--ink);font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}button,input{font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}a:hover{color:#073279}:focus-visible{outline:2px solid var(--accent);outline-offset:2px}::selection{background:#b7d1ff} .hidden{display:none!important}.shell{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:57px minmax(0,1fr) 33px;height:100dvh;min-height:0;overflow:hidden}.top{background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 23px}.brand{display:flex;align-items:center;gap:13px;min-width:0}.logo{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;color:#fff;background:#143967;font-size:19px;font-weight:900;letter-spacing:-.13em;padding-right:4px;box-shadow:3px 3px 0 #bfcbe0}.brand strong{display:block;font-size:13px;letter-spacing:.065em}.brand small{display:block;color:var(--muted);font-size:10px;letter-spacing:.12em}.statusbar{display:flex;align-items:center;gap:18px;color:var(--muted);font-size:10px;white-space:nowrap}.green{color:var(--green)}.dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#1d9076;margin-right:7px}.loginbutton{padding:7px 10px;background:none;border:1px solid var(--line);color:var(--accent);text-decoration:underline}.loginbutton:hover{background:var(--hover)}.main{display:grid;grid-template-columns:234px minmax(0,1fr) 320px;min-height:0}.rail{background:#f2f5fa;border-right:1px solid var(--line);min-height:0;display:flex;flex-direction:column;overflow:auto}.railtop{padding:25px 21px 22px;border-bottom:1px solid var(--line)}.overline{text-transform:uppercase;letter-spacing:.15em;font-size:10px;color:var(--muted);font-weight:700}.railtop h1{font-size:27px;line-height:1.05;letter-spacing:-.075em;font-weight:600;margin:12px 0 8px;font-family:Georgia,serif}.railtop h1 em{font-style:normal;color:var(--accent)}.railtop p{margin:0;color:var(--muted);font-size:11px}.volumes{padding:22px 12px 10px}.volume{padding:11px 12px;display:flex;align-items:center;gap:10px;width:100%;border:1px solid transparent;color:var(--ink);background:none;text-align:left;border-radius:3px}.volume:hover{background:#e6edf8}.volume.active{background:#fff;border-color:#b9cceb;box-shadow:inset 3px 0 0 var(--accent)}.volume .glyph{color:var(--accent);font-size:17px}.volume strong{font-weight:600;flex:1;font-size:12px}.volume small{font-size:9px;color:var(--muted)}.railhelp{padding:16px 23px;margin-top:auto;border-top:1px dashed var(--line);font-size:11px;color:var(--muted)}.railhelp b{display:block;color:var(--ink);letter-spacing:.06em;margin-bottom:9px}.railhelp code{display:block;margin:5px 0}.railend{padding:12px 23px 20px;font-size:10px;color:var(--muted)}.center{background:var(--paper);min-width:0;min-height:0;display:flex;flex-direction:column}.mast{padding:24px 28px 17px;border-bottom:1px solid var(--line)}.http{font-size:10px;color:var(--muted);letter-spacing:.07em}.http b{border:1px solid var(--line);color:var(--green);padding:2px 5px;font-weight:600;margin-right:5px}.headrow{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-top:12px}.headrow h2{font:normal clamp(30px,3.55vw,57px)/1.05 Georgia,serif;letter-spacing:-.07em;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.headrow h2 em{color:var(--accent);font-style:normal}.headmeta{font-size:10px;color:var(--muted);text-align:right;white-space:nowrap}.crumbs{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:13px;font-size:11px}.crumbs button{border:0;background:none;color:var(--accent);padding:1px;text-decoration:underline}.crumbs strong{font-weight:600}.controls{display:flex;align-items:center;gap:9px;padding:12px 27px;border-bottom:1px solid var(--line);background:#fff}.search{max-width:490px;flex:1;min-width:100px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);padding:9px 10px;background:#fafcff}.search i{font-size:15px;font-style:normal;color:var(--accent)}.search input{background:transparent;border:0;outline:0;color:var(--ink);min-width:0;width:100%}.btn{border:1px solid var(--line);background:#fff;padding:8px 11px;color:var(--ink);white-space:nowrap}.btn:hover{background:var(--hover)}.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.btn.primary:hover{background:#0c3580}.right{background:#f9fbfe;border-left:1px solid var(--line);min-height:0;display:flex;flex-direction:column}.detailtop{padding:25px 24px 18px;border-bottom:1px solid var(--line)}.detailtop h3{margin:15px 0 0;font:normal 23px/1.2 Georgia,serif;overflow-wrap:anywhere}.detailbody{overflow:auto;padding:22px 24px 25px;flex:1}.detailbody p{margin-top:0;color:var(--muted);line-height:1.75;font-size:12px}.properties{display:grid;grid-template-columns:88px 1fr;row-gap:13px;column-gap:8px;margin:20px 0;font-size:11px}.properties dt{color:var(--muted)}.properties dd{margin:0;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}.excerpt{padding:15px;background:#fff;border:1px solid var(--line);font-size:11px;line-height:1.8;white-space:pre-wrap;word-break:break-word;max-height:260px;overflow:auto}.directory{overflow:auto;min-height:0;flex:1}.table{width:100%;table-layout:fixed;border-collapse:collapse;text-align:left}.table thead{position:sticky;top:0;background:#f7f9fe;z-index:1}.table th{border-bottom:1px solid var(--line);padding:11px 9px;color:var(--muted);text-transform:uppercase;font-weight:600;letter-spacing:.1em;font-size:10px}.table th:first-child,.table td:first-child{padding-left:29px}.table th:last-child,.table td:last-child{padding-right:24px}.table tr.item{border-bottom:1px solid #ecf0f5;cursor:pointer}.table tr.item:hover{background:#f5f8fe}.table tr.item.selected{background:#e9f1ff;box-shadow:inset 3px 0 0 var(--accent)}.table td{height:49px;padding:9px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:11px;color:var(--muted)}.table td:first-child{font-size:12px;color:var(--ink)}.filename{border:0;background:none;color:var(--accent);text-decoration:underline;text-underline-offset:3px;padding:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 28px);vertical-align:middle;text-align:left}.fileicon{display:inline-block;width:25px;color:#0d3a93;font-size:15px}.permission{font-size:9px;letter-spacing:.06em;border:1px solid var(--line);padding:4px 5px;text-transform:uppercase}.empty{padding:56px 28px;color:var(--muted)}.empty strong{display:block;font:normal 27px/1.15 Georgia,serif;color:var(--ink);margin-bottom:12px}.empty code{padding:3px 6px;background:#eef3fc;color:#11458b}.bottom{background:var(--paper);border-top:1px solid var(--line);display:flex;align-items:center;gap:15px;justify-content:space-between;padding:0 22px;font-size:10px;color:var(--muted);white-space:nowrap}.footerid{color:var(--accent);font-weight:bold}.mobile-menu{display:none}.scrim{display:none}.badge{border:1px solid var(--line);padding:2px 5px;font-size:9px;letter-spacing:.08em;color:var(--muted)}.loginnotice{margin:16px 0;padding:13px;background:#edf3fd;border-left:3px solid var(--accent);font-size:11px;color:#234777}.modal{border:0;max-width:430px;width:calc(100% - 30px);padding:0;box-shadow:0 28px 100px #111f3e66;color:var(--ink)}.modal::backdrop{background:#071b38ae;backdrop-filter:blur(4px)}.modalhead{padding:20px 24px;background:#f4f7fd;border-bottom:1px solid var(--line);display:flex;justify-content:space-between}.modalhead strong{letter-spacing:.07em}.modalhead button{border:0;background:none;color:var(--accent);font-size:20px}.modalcontent{padding:24px}.modalcontent label{display:block;font-size:11px;color:var(--muted);margin:16px 0 6px}.modalcontent input{display:block;width:100%;border:1px solid var(--line);padding:12px;background:#fafcff;color:var(--ink)}.modalcontent input:focus{outline:1px solid var(--accent)}.modalcontent .btn{width:100%;margin-top:20px;padding:13px}.modalcontent .error{color:#a12d39;font-size:11px;min-height:16px;margin-top:12px}.authnote{color:var(--muted);font-size:11px;line-height:1.75}.kbd{color:#8190a9;font-size:10px}.lock{color:var(--orange)}@media(max-width:1120px){.main{grid-template-columns:204px minmax(0,1fr) 270px}.table th:nth-child(3),.table td:nth-child(3){display:none}.mast{padding:22px}.detailbody{padding:18px}.detailtop{padding:20px}.railhelp{display:none}}@media(max-width:820px){html,body{overflow-x:clip;width:100%}body{height:100dvh}.shell{grid-template-rows:55px minmax(0,1fr) 31px}.top{padding:0 15px}.main{grid-template-columns:minmax(0,1fr)}.rail{position:fixed;inset:55px auto 0 0;width:min(300px,85vw);z-index:30;transform:translateX(-105%);transition:transform .22s ease;box-shadow:10px 0 30px #15254417}.rail.open{transform:translateX(0)}.scrim.open{display:block;position:fixed;inset:55px 0 0;background:#091d396b;z-index:29}.mobile-menu{display:inline-flex;align-items:center;justify-content:center;background:#fff;color:var(--accent);border:1px solid var(--line);width:35px;height:35px}.brand small,.statusbar .hostname{display:none}.statusbar{gap:8px}.statusbar .userline{max-width:115px;text-overflow:ellipsis;overflow:hidden}.right{position:fixed;inset:55px 0 30px auto;width:min(380px,100%);z-index:25;transform:translateX(110%);transition:transform .2s ease;box-shadow:-10px 0 30px #15254417}.right.open{transform:translateX(0)}.headrow h2{font-size:37px}.headmeta{display:none}.mast{padding:21px 19px 17px}.controls{padding:11px 18px}.table th:first-child,.table td:first-child{padding-left:17px}.table th:last-child,.table td:last-child{padding-right:15px}.bottom{padding:0 13px}.brand{gap:10px}.statusbar .dot{display:none}.table th:nth-child(2),.table td:nth-child(2){display:none}}@media(max-width:460px){.controls .btn{text-indent:0;padding:8px}.table td{height:58px}.table th:nth-child(4),.table td:nth-child(4){display:none}.headrow h2{font-size:34px}.http{font-size:9px}.brand strong{font-size:11px}.statusbar .userline{display:none}.search{max-width:none}.bottom{font-size:9px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important}}

/* INTRICT / REPOSITORY PREVIEW */
.center{min-height:0;display:flex;flex-direction:column}.preview[hidden]{display:none!important}.preview{min-height:165px;height:43%;max-height:78%;display:flex;flex-direction:column;position:relative;border-top:2px solid #294e90;background:#fff;flex:0 0 auto}.previewresize{position:absolute;top:-7px;left:0;right:0;height:11px;cursor:ns-resize;touch-action:none;z-index:3}.previewresize:before{content:"";display:block;width:56px;height:3px;background:#7187a9;border-radius:99px;margin:3px auto;opacity:.55}.previewbar{display:flex;align-items:center;gap:12px;min-height:47px;max-height:47px;border-bottom:1px solid var(--line);background:#f7f9fc;padding:0 15px 0 25px}.previewkind{font-size:9px;letter-spacing:.12em;color:#607492;white-space:nowrap}.previewbar strong{color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;min-width:0}.previewtools{margin-left:auto;display:flex;align-items:center;gap:7px;flex:0 0 auto}.previewtools .btn{font-size:10px;text-decoration:none;padding:5px 9px}.previewtools #previewClose{font-size:17px;padding:2px 9px}.previewcontent{position:relative;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;background:#fff}.previewcontent iframe{display:block;width:100%;height:100%;min-height:100%;border:0;background:#fff}.previewhint{padding:25px;color:var(--muted);font-size:12px}.previewcontent .previewimage{width:100%;height:100%;display:grid;place-items:center;padding:22px;background:repeating-conic-gradient(#fafbfd 0% 25%,#edf1f8 0% 50%) 50%/22px 22px}.previewimage img{max-width:100%;max-height:100%;object-fit:contain;border:1px solid #d8e0eb;box-shadow:0 4px 30px #20385913}.previewcontent .previewmedia{height:100%;display:grid;place-items:center;padding:22px;background:#07182b}.previewmedia video{max-width:100%;max-height:100%}.previewmedia audio{width:min(420px,100%)}.previewcontent pre.source{font:12px/1.7 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;tab-size:2;color:#17345d;padding:22px 28px;margin:0}.previewcontent pre.source code{font:inherit}.preview-meta{border-left:3px solid #2a55a6;margin:20px;padding:12px 16px;color:var(--muted);background:#f5f8ff}.preview-markdown{padding:23px clamp(20px,5vw,58px) 45px;max-width:900px;margin:auto;color:#24354b;font:15px/1.75 system-ui,-apple-system,Segoe UI,sans-serif}.preview-markdown h1,.preview-markdown h2,.preview-markdown h3{line-height:1.25;color:#142b50;letter-spacing:-.035em;margin:1.35em 0 .55em}.preview-markdown h1{font-size:clamp(25px,3vw,37px);border-bottom:1px solid #cbd8e9;padding-bottom:12px;margin-top:0}.preview-markdown h2{font-size:23px}.preview-markdown h3{font-size:18px}.preview-markdown p{margin:0 0 1em}.preview-markdown a{color:#124ab1}.preview-markdown code{background:#edf2fa;color:#204c91;border-radius:3px;padding:2px 5px;font:12px/1.7 ui-monospace,monospace}.preview-markdown pre{overflow:auto;background:#10233c;color:#dbe8ff;border:1px solid #29466b;padding:16px 20px;border-radius:5px;margin:14px 0 22px}.preview-markdown pre code{padding:0;color:inherit;background:transparent;white-space:pre;font-size:12px}.preview-markdown blockquote{margin:15px 0;padding:7px 15px;border-left:3px solid #416ca8;color:#54657c;background:#f4f7fc}.preview-markdown ul,.preview-markdown ol{padding-left:24px}.preview-markdown li{margin:5px 0}.preview-markdown hr{border:0;border-top:1px solid #cbd8e9;margin:25px 0}.preview-markdown .mdtable{width:100%;border-collapse:collapse;display:block;overflow:auto;margin:14px 0 23px}.mdtable th,.mdtable td{border:1px solid #d9e2f0;padding:8px 12px;text-align:left;white-space:nowrap;font-size:13px}.mdtable th{background:#f0f5fc;color:#284e88}.preview-markdown .md-notice{font-size:12px;color:#66758e}.preview-error{padding:24px;color:#9b2936}.preview-inert{padding:26px;color:#49627d;line-height:1.9}.preview-inert a{font-weight:600}.previewcontent:focus-visible{outline-offset:-2px}
@media(max-width:820px){.preview{position:fixed;z-index:32;inset:auto 0 30px;height:min(78dvh,740px)!important;max-height:calc(100dvh - 75px);box-shadow:0 -12px 50px #06172b4d;border-radius:10px 10px 0 0}.previewbar{min-height:52px;max-height:52px;padding-left:13px}.previewkind{display:none}.previewtools .btn{padding:7px 8px}.previewresize{display:none}.preview-markdown{padding:22px 20px 50px;font-size:14px}.preview-markdown h1{font-size:29px}.previewcontent pre.source{font-size:11px;padding:16px}}
</style></head>
<body><div class="shell"><header class="top"><div class="brand"><button class="mobile-menu" type="button" id="menuBtn" title="Directories" aria-label="Directories">☷</button><div class="logo">i.</div><div><strong>INTRICT <span style="color:#124ab1">//</span> INDEX</strong><small>INDEPENDENT NETWORK / FILE SYSTEM</small></div></div><div class="statusbar"><span class="hostname">GET intrict.com/personal</span><span class="userline"><i class="dot"></i><span id="sessionLabel">CHECKING SESSION</span></span><button type="button" class="loginbutton" id="authBtn">SIGN IN</button></div></header>
<div class="scrim" id="scrim"></div><div class="main"><aside class="rail" id="rail"><div class="railtop"><div class="overline">System / Index 12.0</div><h1>Find your<br><em>way in.</em></h1><p>Actual directories. No imaginary files.</p></div><div class="volumes"><div class="overline" style="padding:0 13px 12px">AVAILABLE VOLUMES</div><div id="volumeList"></div></div><div class="railhelp"><b>KEYBOARD REFERENCE</b><code>/ &nbsp;&nbsp; Search directory</code><code>Ctrl+K &nbsp; Global find</code><code>Esc &nbsp; Close panels</code><code>↵ &nbsp;&nbsp; Open selected</code></div><div class="railend">INTRICT NETWORK<br>GUEST-SEGREGATED ACCESS<br>© 2026</div></aside>
<main class="center"><section class="mast"><div class="http"><b id="httpBadge">200 OK</b> DIRECTORY SERVICE / <span id="authTier">GUEST</span></div><div class="headrow"><h2>Index of <em id="heroPath">/personal/</em></h2><div class="headmeta"><span id="headerCount">—</span> entries<br><span id="timestamp">LIVE REPOSITORY INDEX</span></div></div><div class="crumbs" id="crumbs"></div></section><div class="controls"><label class="search"><i>⌕</i><input id="search" type="search" placeholder="Filter filenames / paths…" autocomplete="off" aria-label="Search files"><span class="kbd">/</span></label><button class="btn" id="refreshBtn" title="Fetch current directory from GitHub">↻ Refresh</button><button class="btn" id="detailsBtn" title="File details">Details</button></div><div class="directory" id="directory"><table class="table"><thead><tr><th style="width:50%">NAME <span style="color:#9ca9bd">↓</span></th><th style="width:24%">MODIFIED</th><th style="width:16%">TYPE</th><th style="width:10%">ACCESS</th></tr></thead><tbody id="entries"><tr><td colspan="4"><div class="empty">Connecting to directory service…</div></td></tr></tbody></table><div id="empty" class="empty hidden"></div></div><section class="preview" id="preview" aria-label="File preview" hidden><div class="previewbar"><span class="previewkind" id="previewKind">FILE PREVIEW</span><strong id="previewTitle">—</strong><span class="previewtools"><a id="previewDownload" class="btn" href="#" download title="Download file">↓ DOWNLOAD</a><button id="previewClose" class="btn" type="button" aria-label="Close preview">×</button></span></div><div class="previewcontent" id="previewContent" tabindex="0"><p class="previewhint">Select a file to preview it here.</p></div><div class="previewresize" id="previewResize" role="separator" aria-orientation="horizontal" aria-label="Resize file preview" tabindex="0"></div></section></main><aside class="right" id="right"><div class="detailtop"><div style="display:flex;justify-content:space-between;align-items:center"><span class="overline">FILE INSPECTOR / 13.1</span><button class="btn" type="button" id="closeDetail" aria-label="Close details" style="padding:5px 9px">×</button></div><h3 id="fileName">Select an entry</h3></div><div class="detailbody" id="details"><p>Inspect files, browse nested directories, or open applications hosted inside your repository.</p><div class="loginnotice"><b>ACTUAL SOURCE DATA</b><br>The index only displays files discovered in the configured GitHub repository. Hidden volumes remain inaccessible to guests.</div></div></aside></div><footer class="bottom"><span><span class="footerid">INTRICT / INDEX</span> · SERVER-RENDERED ACCESS CONTROL</span><span id="footerText">AWAITING DIRECTORY</span></footer></div>
<dialog id="authDialog" class="modal"><div class="modalhead"><strong>401 / ACCOUNT AUTHENTICATION</strong><button type="button" id="closeAuth" aria-label="Close dialog">×</button></div><div class="modalcontent"><p class="authnote">Sign in with your existing IntrICT account. This uses the same Supabase user directory and session cookies as the other applications, if they share the standard SSR configuration.</p><form id="authForm"><label for="email">ACCOUNT EMAIL</label><input id="email" type="email" required autocomplete="username" placeholder="you@example.com"><label for="password">PASSWORD</label><input id="password" type="password" required autocomplete="current-password" placeholder="••••••••"><button class="btn primary" type="submit" id="submitAuth">AUTHENTICATE →</button><div class="error" id="authError" role="alert"></div></form><a id="externalLogin" class="btn hidden" style="display:block;text-align:center;text-decoration:none;margin-top:12px" href="#">USE EXISTING SSO LOGIN ↗</a><p class="authnote">No separate portal password is stored here. If your account uses passkeys or another login method, use the existing IntrICT login and return to this page.</p></div></dialog>
<script>
(function(){
'use strict';
const el=(id)=>document.getElementById(id);
const esc=(v)=>String(v==null?'':v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base='/personal'; const levels=['public','games','members','private'];let items=[],meta={},current='',selected=null,filter='',all=[],pending=false;
const humanSize=(n)=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const fmt=(d)=>d?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(d)):'—';
const linkFor=(p)=>base+'?file='+encodeURIComponent(p);
const showError=(message)=>{el('httpBadge').textContent='503 UNAVAILABLE';el('entries').innerHTML='';el('empty').classList.remove('hidden');el('empty').innerHTML='<strong>Cannot read this index.</strong>'+esc(message);el('footerText').textContent='DIRECTORY ERROR';};
async function json(url,opts){const r=await fetch(url,{cache:'no-store',...opts});const d=await r.json().catch(()=>({error:'Invalid server response'}));if(!r.ok)throw Error(d.error||'HTTP '+r.status);return d;}
function paths(){return levels.filter(v=>meta.volumes&&meta.volumes.includes(v));}
function drawVolumes(){el('volumeList').innerHTML=paths().map((v)=>'<button class="volume '+(current===v||current.startsWith(v+'/')?'active':'')+'" data-volume="'+v+'"><span class="glyph">▣</span><strong>/'+v+'/</strong><small>'+ (v==='public'?'WORLD':v==='games'?'ARCADE':v==='members'?'SESSION':'OWNER') +'</small></button>').join('');}
function resolveDir(){const p=new URL(location.href).searchParams.get('dir');const allowed=paths();if(p && allowed.some(v=>p===v||p.startsWith(v+'/')))return p;return allowed[0]||'public';}
function directChildren(){const prefix=current+'/';const folders=new Map(),files=[];for(const f of all){if(!f.path.startsWith(prefix))continue;const remainder=f.path.slice(prefix.length);if(!remainder)continue;const i=remainder.indexOf('/');if(i!==-1){const name=remainder.slice(0,i);if(!folders.has(name))folders.set(name,{name,path:prefix+name,type:'directory',size:0,modified:null,visibility:current.split('/')[0]});}else files.push({...f,name:remainder,type:'file',visibility:current.split('/')[0]});}return [...folders.values(),...files].sort((a,b)=>a.type===b.type?a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}):a.type==='directory'?-1:1);}
function itemIcon(x){if(x.type==='directory')return '▰';if(/\.html?$/i.test(x.name))return '⌘';if(/\.(js|ts|css)$/i.test(x.name))return '⌁';if(/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(x.name))return '▧';return '▤';}
function render(){drawVolumes();const allChildren=directChildren();const q=el('search').value.toLowerCase().trim();const visible=q?allChildren.filter(x=>x.name.toLowerCase().includes(q)||x.path.toLowerCase().includes(q)):allChildren;items=visible;el('entries').innerHTML=visible.map((x,i)=>'<tr class="item '+(selected&&x.path===selected.path?'selected':'')+'" data-index="'+i+'" tabindex="0"><td><span class="fileicon">'+itemIcon(x)+'</span><button class="filename" data-open="'+i+'">'+esc(x.name)+(x.type==='directory'?'/':'')+'</button></td><td>'+fmt(x.modified)+'</td><td>'+ (x.type==='directory'?'DIRECTORY':esc((x.name.split('.').pop()||'FILE').toUpperCase()))+'</td><td><span class="permission">'+esc(x.visibility)+'</span></td></tr>').join('');
el('empty').classList.toggle('hidden',visible.length>0);if(!visible.length)el('empty').innerHTML='<strong>'+ (q?'Nothing matches.':'This directory is empty.')+'</strong>'+(q?'Try a different filename.':'Add files under <code>src/app/personal/'+esc(current)+'/</code> (or app/personal/) in GitHub. Refresh after deployment.');
el('heroPath').textContent='/'+current+'/';el('headerCount').textContent=allChildren.length.toString().padStart(2,'0');el('footerText').textContent=all.length+' OBJECTS · '+meta.tier.toUpperCase()+' · '+(meta.warning?'LIMITED INDEX':'AUTO DISCOVERY');
const chunks=current.split('/');const crumbs=['<button data-dir="">/personal</button>'];chunks.forEach((s,i)=>{crumbs.push('<span>/</span><button data-dir="'+esc(chunks.slice(0,i+1).join('/'))+'">'+esc(s)+'</button>')});el('crumbs').innerHTML=crumbs.join('');
el('httpBadge').textContent='200 OK';el('authTier').textContent=meta.tier.toUpperCase();el('timestamp').textContent=meta.root?'SOURCE '+meta.root:'INDEX UNAVAILABLE';}
function inspect(x){selected=x;render();el('fileName').textContent=x.name+(x.type==='directory'?'/':'');let html='<div class="badge">'+(x.type==='directory'?'DIRECTORY':'REPOSITORY FILE')+'</div><dl class="properties"><dt>PATH</dt><dd>'+esc(x.path)+'</dd><dt>ACCESS</dt><dd>'+esc(x.visibility)+'</dd><dt>TYPE</dt><dd>'+esc(x.type)+'</dd><dt>SIZE</dt><dd>'+ (x.size?humanSize(x.size):'—')+'</dd><dt>OBJECT ID</dt><dd>'+(x.sha?esc(x.sha.slice(0,14)):'—')+'</dd></dl>';
if(x.type==='directory')html+='<p>This folder is automatically indexed from your repository. It does not require manual registration.</p><div class="actions"><button class="btn primary" id="openSelected">ENTER DIRECTORY →</button></div>';
else html+='<p>This file opens below the directory. HTML executes in an isolated preview frame.</p><div class="actions"><button class="btn primary" id="openSelected">PREVIEW FILE ↓</button><a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="'+esc(linkFor(x.path))+'&amp;download=1">DOWNLOAD ↓</a></div>';
el('details').innerHTML=html;el('right').classList.add('open');el('openSelected').addEventListener('click',()=>open(x));}

let previewTicket=0;
function hidePreview(){previewTicket++;el('preview').hidden=true;el('previewContent').replaceChildren();el('previewTitle').textContent='—';}
function showPreview(x){
  const ticket=++previewTicket;const url=linkFor(x.path);const target=el('previewContent');
  // On narrow viewports, the inspector drawer otherwise covers the preview.
  if(window.matchMedia('(max-width:820px)').matches)el('right').classList.remove('open');
  el('preview').hidden=false;el('previewTitle').textContent=x.name;el('previewKind').textContent='PREVIEW / '+(x.name.split('.').pop()||'FILE').toUpperCase();
  el('previewDownload').href=url+'&download=1';el('previewDownload').setAttribute('download',x.name);
  target.innerHTML='<p class="previewhint">Reading '+esc(x.name)+'…</p>';
  const ext=x.name.includes('.')?x.name.split('.').pop().toLowerCase():'';
  const isNow=()=>ticket===previewTicket;
  const fail=(message)=>{if(isNow())target.innerHTML='<div class="preview-error"><b>Unable to render preview.</b><br>'+esc(message)+'</div>';};
  if(['png','jpg','jpeg','gif','webp','ico'].includes(ext)){
    target.innerHTML='<div class="previewimage"><img alt="Preview of '+esc(x.name)+'" src="'+esc(url)+'"></div>';
    target.querySelector('img').addEventListener('error',()=>fail('Image cannot be displayed. Check file access.'));
    return;
  }
  if(['html','htm','pdf','svg'].includes(ext)){
    const frame=document.createElement('iframe');frame.setAttribute('title','Preview of '+x.name);frame.setAttribute('referrerpolicy','no-referrer');
    if(ext==='html'||ext==='htm'||ext==='svg')frame.setAttribute('sandbox','allow-scripts allow-forms');
    frame.src=url;target.replaceChildren(frame);return;
  }
  if(['mp3','mp4','webm'].includes(ext)){
    const area=document.createElement('div');area.className='previewmedia';const player=document.createElement(ext==='mp3'?'audio':'video');
    player.controls=true;player.preload='metadata';player.src=url;area.appendChild(player);target.replaceChildren(area);return;
  }
  if(['woff','woff2','wasm'].includes(ext)){
    target.innerHTML='<p class="previewhint">Reading binary header…</p>';
    fetch(url,{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('HTTP '+r.status);return new Uint8Array(await r.arrayBuffer());}).then(bytes=>{
      if(!isNow())return;const head=bytes.slice(0,512);const rows=[];
      for(let i=0;i<head.length;i+=16){const part=head.slice(i,i+16);const hex=Array.from(part,n=>n.toString(16).padStart(2,'0')).join(' ');
        const ascii=Array.from(part,n=>n>31&&n<127?String.fromCharCode(n):'.').join('');rows.push(i.toString(16).padStart(6,'0')+'  '+hex.padEnd(47,' ')+'  '+ascii);}
      target.innerHTML='<div class="preview-inert"><strong>'+esc(x.name)+'</strong><p>Binary asset · '+humanSize(bytes.length)+' · HEX VIEW / FIRST 512 BYTES</p></div><pre class="source"><code>'+esc(rows.join('\n'))+'</code></pre>';
    }).catch(e=>fail(e.message));return;
  }
  fetch(url,{cache:'no-store'}).then(async response=>{
    if(!response.ok)throw Error('HTTP '+response.status);
    const text=await response.text();if(!isNow())return;
    if(ext==='md'){
      const article=document.createElement('article');article.className='preview-markdown';article.innerHTML=renderMarkdown(text,x.path);target.replaceChildren(article);
      article.addEventListener('click',(event)=>{
        const a=event.target.closest('a[data-repopath]');if(!a)return;event.preventDefault();
        const file=all.find(f=>f.path===a.dataset.repopath);if(file){open({...file,name:file.path.split('/').pop(),type:'file'});return;}
        const parent=all.some(f=>f.path.startsWith(a.dataset.repopath+'/'));
        if(parent)navigate(a.dataset.repopath);
      });
    }else{
      const code=document.createElement('code');code.textContent=text;const pre=document.createElement('pre');pre.className='source';pre.appendChild(code);target.replaceChildren(pre);
    }
  }).catch(e=>fail(e.message));
}
// Small self-contained, HTML-escaped Markdown reader. Raw HTML never executes.
function renderMarkdown(input,sourcePath){
  const lines=input.replace(/\r\n?/g,'\n').split('\n');const blocks=[];let paragraph=[],list=[],fence=null,fenceLang='',table=[];
  const flushP=()=>{if(paragraph.length){blocks.push('<p>'+formatInline(paragraph.join(' '),sourcePath)+'</p>');paragraph=[];}};
  const flushList=()=>{if(list.length){blocks.push('<ul>'+list.map(s=>'<li>'+formatInline(s,sourcePath)+'</li>').join('')+'</ul>');list=[];}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter(r=>!/^\s*\|?[\s:|-]+\|?\s*$/.test(r));const cells=s=>s.replace(/^\s*\|/,'').replace(/\|\s*$/,'').split('|').map(x=>x.trim());
    blocks.push('<table class="mdtable">'+rows.map((r,i)=>'<tr>'+cells(r).map(c=>'<'+(i?'td':'th')+'>'+formatInline(c,sourcePath)+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</table>');table=[];};
  for(const raw of lines){const line=raw.trimEnd();const t=line.trim();const codeStart=/^(\x60{3}|~~~)/.exec(t);
    if(fence!==null){if(codeStart&&codeStart[1]===fence){blocks.push('<pre><code>'+esc(fenceLang?('['+fenceLang+']\n'):'')+esc(paragraph.join('\n'))+'</code></pre>');paragraph=[];fence=null;}else paragraph.push(line);continue;}
    if(codeStart){flushP();flushList();flushTable();fence=codeStart[1];fenceLang=t.slice(3).trim();continue;}
    if(!t){flushP();flushList();flushTable();continue;}
    if(/^\|/.test(t)&&t.includes('|')){flushP();flushList();table.push(t);continue;}else flushTable();
    const heading=/^(#{1,6})\s+(.+)$/.exec(t);if(heading){flushP();flushList();const n=Math.min(3,heading[1].length);blocks.push('<h'+n+'>'+formatInline(heading[2],sourcePath)+'</h'+n+'>');continue;}
    if(/^([-*_]\s*){3,}$/.test(t)){flushP();flushList();blocks.push('<hr>');continue;}
    const bullet=/^[-*+]\s+(.+)$/.exec(t);if(bullet){flushP();list.push(bullet[1]);continue;}else flushList();
    const block=/^>\s*(.*)$/.exec(t);if(block){flushP();blocks.push('<blockquote>'+formatInline(block[1],sourcePath)+'</blockquote>');continue;}
    if(/^\s{4}/.test(raw)){flushP();blocks.push('<pre><code>'+esc(raw.trim())+'</code></pre>');continue;}
    paragraph.push(t);
  }
  if(fence!==null)blocks.push('<pre><code>'+esc(paragraph.join('\n'))+'</code></pre>');else flushP();flushList();flushTable();
  return blocks.join('')||'<p class="md-notice">Empty README.</p>';
}
function formatInline(value,sourcePath){
  // Tokenize before HTML escaping. Only http(s) and paths within repository can link.
  const tokens=[];let s=String(value);const hold=(html)=>{const key='MDTOKEN'+tokens.length+'END';tokens.push(html);return key;};
  s=s.replace(/\x60([^\x60]+)\x60/g,(_,c)=>hold('<code>'+esc(c)+'</code>'));
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>{
    const title=esc(label);const raw=url.trim();if(/^https?:\/\//i.test(raw)){try{const u=new URL(raw);return hold('<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+title+'</a>');}catch{return title;}}
    if(raw.startsWith('#'))return title;
    const dest=resolveRelative(sourcePath,raw);if(!dest)return title;
    return hold('<a href="#" data-repopath="'+esc(dest)+'">'+title+'</a>');
  });
  s=esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,'<em>$1</em>');
  return s.replace(/MDTOKEN(\d+)END/g,(_,n)=>tokens[Number(n)]||'');
}
function resolveRelative(sourcePath,href){
  const p=href.split(/[?#]/)[0].trim();if(!p||p.startsWith('/')||p.includes('\\'))return null;
  const stack=sourcePath.split('/').slice(0,-1);
  for(const x of p.split('/')){if(x==='.'||!x)continue;if(x==='..'){if(stack.length<2)return null;stack.pop();}else stack.push(x);}
  if(stack[0]!==sourcePath.split('/')[0])return null;return stack.join('/');
}
el('previewClose').addEventListener('click',hidePreview);
const handle=el('previewResize');let resizing=false;
handle.addEventListener('pointerdown',(e)=>{if(innerWidth<=820)return;resizing=true;handle.setPointerCapture(e.pointerId);e.preventDefault();});
handle.addEventListener('pointermove',(e)=>{if(!resizing)return;const parent=el('preview').parentElement.getBoundingClientRect();const size=Math.max(165,Math.min(parent.height*.78,parent.bottom-e.clientY));el('preview').style.height=size+'px';});
handle.addEventListener('pointerup',()=>{resizing=false});handle.addEventListener('pointercancel',()=>{resizing=false});
handle.addEventListener('keydown',(e)=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();let height=el('preview').getBoundingClientRect().height+(e.key==='ArrowUp'?24:-24);el('preview').style.height=Math.max(165,Math.min(window.innerHeight*.7,height))+'px';}});
function open(x){if(x.type==='directory'){navigate(x.path);return;}inspect(x);showPreview(x);}
function closeMobile(){el('rail').classList.remove('open');el('scrim').classList.remove('open');}
function navigate(dir){hidePreview();if(!dir || dir==='root')dir=paths()[0]||'public';if(!paths().some(p=>dir===p||dir.startsWith(p+'/')))return;current=dir;selected=null;el('right').classList.remove('open');el('fileName').textContent='Select an entry';el('details').innerHTML='<p>Choose a file to inspect its metadata, or click a filename to preview it below.</p>';el('search').value='';const u=new URL(location.href);u.searchParams.set('dir',dir);history.pushState({dir},'',u.toString());render();closeMobile();}
function refreshView(){hidePreview();el('refreshBtn').disabled=true;el('refreshBtn').textContent='↻ Loading';load(true).finally(()=>{el('refreshBtn').disabled=false;el('refreshBtn').textContent='↻ Refresh';});}
async function load(fresh){hidePreview();try{const d=await json(base+'?api=tree'+(fresh?'&refresh=1':''));meta=d;all=d.files||[];el('sessionLabel').textContent=meta.user?meta.user:'GUEST SESSION';el('authBtn').textContent=meta.user?'SIGN OUT':'SIGN IN';if(meta.ssoLoginUrl){el('externalLogin').href=meta.ssoLoginUrl;el('externalLogin').classList.remove('hidden');}else{el('externalLogin').classList.add('hidden');}current=resolveDir();render();if(meta.warning){el('details').innerHTML='<div class="loginnotice"><strong>INDEX NOTICE</strong><br>'+esc(meta.warning)+'</div>';el('fileName').textContent='Connection diagnostics';}}catch(e){showError(e.message)}}
function openAuth(){hidePreview();el('authError').textContent='';el('authDialog').showModal();}
async function doAuth(e){e.preventDefault();const b=el('submitAuth');b.disabled=true;b.textContent='AUTHENTICATING…';try{await json(base+'?api=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:el('email').value,password:el('password').value})});el('authDialog').close();el('password').value='';history.replaceState({},'',base);await load(true);}catch(err){el('authError').textContent=err.message;}finally{b.disabled=false;b.textContent='AUTHENTICATE →';}}
async function signout(){try{await json(base+'?api=logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});history.replaceState({},'',base);await load(true)}catch(e){alert(e.message)}}
el('authBtn').addEventListener('click',()=>meta.user?signout():openAuth());el('closeAuth').addEventListener('click',()=>el('authDialog').close());el('authForm').addEventListener('submit',doAuth);
el('refreshBtn').addEventListener('click',refreshView);el('search').addEventListener('input',()=>{selected=null;render()});el('entries').addEventListener('click',e=>{const row=e.target.closest('[data-index]');if(!row)return;const x=items[Number(row.dataset.index)];if(!x)return;open(x)});el('entries').addEventListener('dblclick',e=>{const row=e.target.closest('[data-index]');if(row)open(items[Number(row.dataset.index)])});el('entries').addEventListener('keydown',e=>{if(e.key==='Enter'){const row=e.target.closest('[data-index]');if(row)open(items[Number(row.dataset.index)]);}});
el('volumeList').addEventListener('click',e=>{const x=e.target.closest('[data-volume]');if(x)navigate(x.dataset.volume)});el('crumbs').addEventListener('click',e=>{const x=e.target.closest('[data-dir]');if(x)navigate(x.dataset.dir)});el('menuBtn').addEventListener('click',()=>{el('rail').classList.toggle('open');el('scrim').classList.toggle('open')});el('scrim').addEventListener('click',closeMobile);el('closeDetail').addEventListener('click',()=>el('right').classList.remove('open'));el('detailsBtn').addEventListener('click',()=>el('right').classList.toggle('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hidePreview();el('right').classList.remove('open');closeMobile();return}if(e.target.matches('input,textarea'))return;if(e.key==='/'||(e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey))){e.preventDefault();el('search').focus();el('search').select()}});
window.addEventListener('popstate',()=>{hidePreview();current=resolveDir();selected=null;render()});load(false);
})();
</script></body></html>
`;
