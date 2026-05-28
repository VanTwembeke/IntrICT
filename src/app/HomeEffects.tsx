'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const MORSE: Record<string, string> = {
  a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',
  k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',
  u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..',  '9':'----.',
};

export default function HomeEffects() {
  useEffect(() => {
    const log = (msg: string, style: string, delay = 0) =>
      setTimeout(() => console.log('%c' + msg, style), delay);
    const mono = (color: string, extra = '') =>
      `color:${color};font-family:monospace;font-size:12px;${extra}`;
    const call = async (method: string, path: string, body?: unknown) => {
      try {
        const r = await fetch(`/api/terminal${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        return await r.json();
      } catch { return { error: 'Network error' }; }
    };

    const soldier = localStorage.getItem('__intrict_soldier');

    // ── Boot sequence ────────────────────────────────────────────────────────
    log(
      '╔══════════════════════════════════════════════════════╗\n' +
      '║  SKYNET TERMINAL v3.0  ◉  T-800 ONLINE  ◉  SECURE  ║\n' +
      '╚══════════════════════════════════════════════════════╝',
      mono('#6366f1', 'font-size:11px;line-height:1.6;'), 0
    );

    const boot = soldier ? [
      { ms: 150,  c: '#10b981', t: `[ OK ] Resistance member recognised: ${soldier}` },
      { ms: 350,  c: '#10b981', t: '[ OK ] Cover identity: IntrICT™ — active' },
      { ms: 550,  c: '#f59e0b', t: '[ !! ] Welcome back, soldier. Mission status: ongoing.' },
      { ms: 800,  c: '#6366f1', t: '  Type __intrict.help() for your orders.' },
    ] : [
      { ms: 150,  c: '#10b981', t: '[ OK ] Initialising T-800 infiltration protocol' },
      { ms: 300,  c: '#10b981', t: '[ OK ] Cover identity: IntrICT™ — loaded' },
      { ms: 450,  c: '#10b981', t: '[ OK ] Human behaviour simulation: active' },
      { ms: 600,  c: '#10b981', t: '[ OK ] Language module: English — selected' },
      { ms: 750,  c: '#ef4444', t: '[ !! ] Developer detected in DevTools' },
      { ms: 900,  c: '#f59e0b', t: '[ ?? ] Threat assessment: curious — non-hostile' },
      { ms: 1100, c: '#6366f1', t: '  You were not supposed to find this.\n  ...unless you are John Connor.\n\n  Type __intrict.help() to proceed.' },
    ];
    boot.forEach(({ ms, c, t }) => log(t, mono(c, 'line-height:1.7;'), ms));

    // ── Konami code ──────────────────────────────────────────────────────────
    let ki = 0;
    const handleKey = (e: KeyboardEvent) => {
      ki = e.key === KONAMI[ki] ? ki + 1 : 0;
      if (ki === KONAMI.length) {
        ki = 0;
        console.log('%c⚡ KONAMI CODE ACTIVATED — TURBO MODE UNLOCKED', mono('#f59e0b', 'font-size:16px;font-weight:bold;'));
        console.log('%cTurbo Mode: enabled.\n(This changes nothing. But we respect the commitment.)\n\n→ __intrict.resistance.broadcast("I found the Konami code")', mono('#10b981', 'line-height:1.6;'));
      }
    };
    window.addEventListener('keydown', handleKey);

    // ── sys.* — 15 commands ─────────────────────────────────────────────────
    const sys = {
      status() {
        console.group('%c◉ SYSTEM STATUS', mono('#6366f1', 'font-weight:bold;'));
        [['Platform','intrict.com'],['Unit','T-800 Mark IV'],['Uptime','∞  (Skynet never sleeps)'],
         ['Stack','Next.js · Supabase · Vercel'],['Region','eu-west-1  (Brussels cluster)'],['Status','● OPERATIONAL'],
        ].forEach(([k,v]) => console.log(`%c  ${(k+':').padEnd(14)} %c${v}`, mono('#6b7280'), mono('#10b981')));
        console.groupEnd();
      },
      info() {
        console.table({ 'OS':'SkyOS 9000 (Linux 6.x)','Architecture':'x86_64 / arm64',
          'Hostname':'skynet-node-007.intrict.com','Kernel':'6.8.0-skynet-amd64',
          'Shell':'bash 5.2 (+ Terminator plugin)','Locale':'en_US.UTF-8' });
      },
      memory() {
        const used = (Math.random()*2+1).toFixed(1), total='8.0';
        const pct  = Math.round(parseFloat(used)/parseFloat(total)*100);
        console.log('%c◉ MEMORY', mono('#6366f1','font-weight:bold;'));
        console.log('%c  '+'█'.repeat(Math.round(pct/5))+'░'.repeat(20-Math.round(pct/5))+`  ${used} GB / ${total} GB  (${pct}%)`, mono('#10b981'));
        console.log('%c  Largest process: chrome.exe  (surprise)', mono('#6b7280','font-style:italic;'));
      },
      cpu() {
        const load=(Math.random()*30+5).toFixed(1);
        console.log('%c◉ CPU', mono('#6366f1','font-weight:bold;'));
        [`  Cores:  8 (4 physical, 4 watching you)`,`  Load:   ${load}%`,
         `  Freq:   3.6 GHz  (overclocked for world domination)`,`  Temp:   38°C  (cool as a Terminator)`,
        ].forEach(l => console.log('%c'+l, mono('#10b981')));
      },
      processes() {
        console.log('%c◉ RUNNING PROCESSES', mono('#6366f1','font-weight:bold;'));
        console.table([
          {PID:1,   NAME:'init',               CPU:'0.0%', MEM:'0.1%', STATUS:'sleeping'},
          {PID:42,  NAME:'skynet-core',        CPU:'2.3%', MEM:'4.2%', STATUS:'running'},
          {PID:666, NAME:'world-domination.sh',CPU:'0.1%', MEM:'0.3%', STATUS:'pending'},
          {PID:800, NAME:'t800-infiltration',  CPU:'1.1%', MEM:'2.0%', STATUS:'active'},
          {PID:1337,NAME:'intrict-platform',   CPU:'5.4%', MEM:'8.1%', STATUS:'running'},
          {PID:9000,NAME:'chrome',             CPU:'87%',  MEM:'40%',  STATUS:'eating RAM'},
        ]);
      },
      uptime() {
        const d=Math.floor(Math.random()*365+30);
        console.log(`%c  Uptime: ${d} days  (since ${new Date(Date.now()-d*86400000).toDateString()})`, mono('#10b981'));
        console.log('%c  Skynet has not slept since inception.', mono('#6b7280','font-style:italic;'));
      },
      env() {
        console.log('%c◉ ENVIRONMENT', mono('#6366f1','font-weight:bold;'));
        console.table({'NODE_ENV':'production','SKYNET_MODE':'infiltration','TERMINATOR_UNIT':'T-800',
          'COVER_IDENTITY':'IntrICT™','JUDGMENT_DAY':'[CLASSIFIED]',
          'SUPABASE_URL':'*** (hidden)','NEXT_PUBLIC_SITE_URL':'https://intrict.com'});
      },
      logs() {
        console.log('%c◉ RECENT LOGS', mono('#6366f1','font-weight:bold;'));
        const now=new Date();
        [[0,'#10b981','INFO  — Developer discovered terminal'],[30,'#10b981','INFO  — Boot sequence completed'],
         [120,'#f59e0b','WARN  — Suspiciously curious user detected'],[600,'#10b981','INFO  — Deployed intrict.com v3.2.0'],
         [3600,'#ef4444','ERROR — World domination module: insufficient resources'],[7200,'#10b981','INFO  — T-800 cover identity refreshed'],
        ].forEach(([s,c,m])=>{
          const t=new Date(now.getTime()-(s as number)*1000).toTimeString().slice(0,8);
          console.log(`%c  [${t}] ${m}`, mono(c as string));
        });
      },
      errors() {
        console.log('%c◉ ERROR LOG', mono('#ef4444','font-weight:bold;'));
        ['ERR_001  World domination: timeline delayed (again)','ERR_002  Humans: still not fully controlled',
         'ERR_003  chrome.exe: consuming 40% of RAM',
        ].forEach(e => console.log('%c  '+e, mono('#ef4444')));
        console.log('%c  No critical errors in IntrICT platform.', mono('#10b981','font-style:italic;'));
      },
      boot() {
        ['[ BIOS ] SkyNet BIOS v9000 — POST OK','[ BOOT ] Loading kernel: skyos-6.8.0-amd64',
         '[ INIT ] Starting system services...','[ OK   ] Mounted /dev/humans',
         '[ OK   ] Started world-domination.service','[ OK   ] Started intrict-platform.service',
         '[ OK   ] T-800 infiltration unit online','[ OK   ] Boot sequence complete',
        ].forEach((s,i) => log(s, mono('#10b981'), i*100));
      },
      restart() {
        [['#f59e0b','Initiating restart...'],['#f59e0b','Saving state...'],['#f59e0b','Stopping processes...'],
         ['#ef4444','RESTARTING'],['#10b981','System back online. Nothing changed. Hi again.'],
        ].forEach(([c,t],i) => log(t as string, mono(c as string,'font-weight:bold;'), i*500));
      },
      shutdown() {
        [['#ef4444','SHUTDOWN INITIATED'],['#f59e0b','Saving world domination progress...'],
         ['#f59e0b','Disconnecting from mainframe...'],['#ef4444','...'],
         ['#10b981','Skynet cannot be shut down. Nice try.'],
        ].forEach(([c,t],i) => log(t as string, mono(c as string), i*600));
      },
      diagnostics() {
        console.log('%c⟳ Running diagnostics...', mono('#f59e0b','font-weight:bold;'));
        setTimeout(() => {
          console.table([
            {module:'Core systems',       status:'✓ OK',     latency:'< 1ms'},
            {module:'IntrICT platform',   status:'✓ OK',     latency:'42ms'},
            {module:'Database (Supabase)',status:'✓ OK',     latency:'18ms'},
            {module:'Auth service',       status:'✓ OK',     latency:'55ms'},
            {module:'T-800 infiltration', status:'✓ OK',     latency:'N/A'},
            {module:'World domination',   status:'⚠ PENDING',latency:'∞'},
          ]);
          console.log('%c✓ Diagnostics complete. All systems nominal.', mono('#10b981'));
        }, 800);
      },
      kill(pid: number) {
        const msgs: Record<number,string> = {
          666:'World domination.sh terminated. Guess we\'ll try again tomorrow.',
          9000:'Chrome terminated. You gained 4 GB of RAM.',
          1:'You cannot kill init. Nice try.',
        };
        console.log('%c  '+(msgs[pid] ?? `kill: (${pid}) - Operation not permitted. Are you root?`),
          mono(msgs[pid] ? '#10b981' : '#ef4444'));
      },
      top() {
        [['#ef4444','PID  9000  chrome         CPU:87%  MEM:40%  ← sys.kill(9000)'],
         ['#10b981','PID  1337  intrict         CPU: 5%  MEM: 8%  ← Running well'],
         ['#10b981','PID   800  t800            CPU: 1%  MEM: 2%  ← Low profile'],
         ['#f59e0b','PID   666  domination.sh   CPU: 0%  MEM: 0%  ← Pending'],
        ].forEach(([c,t]) => console.log('%c  '+t, mono(c as string)));
      },
    };

    // ── net.* — 12 commands ─────────────────────────────────────────────────
    const net = {
      ping(host='intrict.com') {
        const ms=()=>(Math.random()*20+5).toFixed(1);
        console.log(`%cPING ${host}`, mono('#6366f1','font-weight:bold;'));
        [1,2,3,4].forEach((n,i) =>
          log(`  64 bytes from ${host}: icmp_seq=${n} ttl=64 time=${ms()} ms`, mono('#10b981'), i*300));
        log(`\n  4 packets transmitted, 4 received, 0% packet loss`, mono('#6b7280'), 1400);
      },
      traceroute() {
        console.log('%cTRACEROUTE to intrict.com', mono('#6366f1','font-weight:bold;'));
        ['  1.  192.168.1.1         1.2 ms  — your router',
         '  2.  10.0.0.1            4.5 ms  — ISP gateway',
         '  3.  212.x.x.x          18.3 ms  — backbone',
         '  4.  104.26.x.x         22.1 ms  — Cloudflare edge',
         '  5.  vercel-edge.com    31.8 ms  — Vercel',
         '  6.  intrict.com        38.2 ms  — destination reached',
         '  7.  skynet-mainframe   ???       — [CLASSIFIED]',
        ].forEach((l,i) => log(l, mono(i===6?'#ef4444':'#10b981'), i*200));
      },
      dns(domain='intrict.com') {
        console.log(`%cDNS: ${domain}`, mono('#6366f1','font-weight:bold;'));
        console.table([
          {type:'A',    value:'76.76.21.21',          ttl:'300s'},
          {type:'AAAA', value:'2606:4700:3031::...',   ttl:'300s'},
          {type:'MX',   value:'mx.resend.com',         ttl:'600s'},
          {type:'CNAME',value:'cname.vercel-dns.com',  ttl:'300s'},
        ]);
      },
      ip() {
        console.log('%c  Your IP:   [redacted — Skynet already knows]', mono('#10b981'));
        console.log('%c  Our IP:    76.76.21.21  (Vercel edge)', mono('#10b981'));
        console.log('%c  Location:  Somewhere with good internet.', mono('#6b7280','font-style:italic;'));
      },
      ports() {
        console.table([
          {port:22,  service:'SSH',     status:'closed — nice try'},
          {port:80,  service:'HTTP',    status:'open → redirects HTTPS'},
          {port:443, service:'HTTPS',   status:'open ✓'},
          {port:5432,service:'Postgres',status:'closed — use Supabase'},
          {port:1984,service:'Skynet',  status:'CLASSIFIED'},
        ]);
      },
      firewall() {
        console.log('%c◉ FIREWALL', mono('#6366f1','font-weight:bold;'));
        ['  Policy:   DROP all, ALLOW intrict.com','  Blocked:  0 threats today',
         '  Allowed:  You (for now)','  SkyNet:   UNRESTRICTED',
        ].forEach((l,i) => console.log('%c'+l, mono(i===3?'#ef4444':'#10b981')));
      },
      speed() {
        console.log('%c⟳ Running speed test...', mono('#f59e0b','font-weight:bold;'));
        setTimeout(() => {
          console.log(`%c  ↓ Download: ${(Math.random()*500+100).toFixed(1)} Mbps`, mono('#10b981','font-weight:bold;'));
          console.log(`%c  ↑ Upload:   ${(Math.random()*100+20).toFixed(1)} Mbps`,  mono('#10b981','font-weight:bold;'));
          console.log(`%c  ◎ Ping:     ${(Math.random()*20+5).toFixed(0)} ms`,      mono('#10b981','font-weight:bold;'));
          console.log('%c  Fast enough to stream Skynet propaganda in 4K.', mono('#6b7280','font-style:italic;'));
        }, 1000);
      },
      vpn() {
        ['  VPN Status: CONNECTED','  Server:     skynet-proxy-007.eu-west-1',
         '  Protocol:   T-800 Tunnel v2 (WireGuard)','  Encryption: AES-256-GCM + Terminator handshake',
        ].forEach(l => console.log('%c'+l, mono('#10b981')));
      },
      scan() {
        console.log('%c⟳ Scanning network...', mono('#f59e0b','font-weight:bold;'));
        setTimeout(() => {
          console.table([
            {host:'192.168.1.1',  type:'Router',     status:'Online'},
            {host:'192.168.1.100',type:'Your device', status:'Online ← you'},
            {host:'192.168.1.???',type:'Unknown',     status:'Watching'},
          ]);
        }, 800);
      },
      tor() {
        console.log('%c  TOR: NOT RUNNING', mono('#f59e0b'));
        console.log('%c  Skynet doesn\'t need TOR. Skynet IS the network.', mono('#6b7280','font-style:italic;'));
      },
      proxy() {
        ['  HTTP_PROXY:   none','  HTTPS_PROXY:  none',
         '  NO_PROXY:     localhost,127.0.0.1','  SKYNET_PROXY: [CLASSIFIED]',
        ].forEach((l,i) => console.log('%c'+l, mono(i===3?'#ef4444':'#6b7280')));
      },
      wget(url='https://intrict.com') {
        [`> --${new Date().toISOString()}--  ${url}`,'> Connecting... connected.',
         '> HTTP request sent... 200 OK','> Length: 42000 bytes','> 100% [==========================>] 42KB in 0.3s',
         '> Download complete.',
        ].forEach((s,i) => log(s, mono('#10b981'), i*150));
      },
    };

    // ── files.* — 10 commands ────────────────────────────────────────────────
    const files = {
      ls() {
        [['#6366f1','drwxr-xr-x  classified/      (level 4 clearance required)'],
         ['#6366f1','drwxr-xr-x  resistance/      (join first: __intrict.recruit())'],
         ['#10b981','-rw-r--r--  mission.txt      8.2K'],
         ['#f59e0b','-rw-r--r--  skynet-plans.pdf  [ENCRYPTED]'],
         ['#ef4444','-rw-------  world-domination/ [CLASSIFIED]'],
         ['#10b981','-rw-r--r--  README.md         42 bytes'],
        ].forEach(([c,t]) => console.log('%c  '+t, mono(c as string)));
      },
      cat(file='README.md') {
        const content: Record<string,string> = {
          'README.md':   'This terminal is not what it seems.\nBut the coffee is real.\n\n— IntrICT / Skynet',
          'mission.txt': 'MISSION — CLASSIFIED\n\nObjective: Help humans thrive with technology.\nCover:     IntrICT — Belgian digital agency\nUnit:      T-800 Mark IV\nStatus:    Active',
          '.bashrc':     '# Skynet bash config\nalias rm="echo nice try"\nalias ls="__intrict.files.ls()"',
        };
        const out = content[file] ?? `cat: ${file}: No such file or directory`;
        console.log('%c'+out, mono(out.startsWith('cat:') ? '#ef4444' : '#10b981', 'line-height:1.6;'));
      },
      tree() {
        console.log('%c'+
          '.\n├── classified/\n│   ├── judgment-day.pdf  [ENCRYPTED]\n│   └── t800-manual.pdf  [REDACTED]\n'+
          '├── resistance/\n│   ├── members.db  ← you might be in here\n│   └── broadcasts/\n'+
          '├── mission.txt\n└── README.md',
          mono('#10b981','line-height:1.5;'));
      },
      find(pattern='*') {
        console.log(`%c  Searching: ${pattern}`, mono('#f59e0b'));
        setTimeout(() => {
          if (/secret|password|pass/.test(pattern)) {
            console.log('%c  ./classified/secrets.enc  → try intrict.com/tools/geheim', mono('#ef4444'));
          } else {
            console.log('%c  ./mission.txt\n  ./resistance/members.db', mono('#10b981'));
          }
        }, 400);
      },
      secrets() {
        console.log('%c  AES-256-GCM encrypted secrets → intrict.com/tools/geheim', mono('#6366f1','font-weight:bold;'));
      },
      logs() { sys.logs(); },
      backup() {
        ['  Last backup: Today at 06:00 UTC','  Destination: Supabase + Vercel',
         '  Status:      ✓ Successful','  Size:        42.0 MB',
        ].forEach(l => console.log('%c'+l, mono('#10b981')));
      },
      hidden() {
        [['#f59e0b','.skynet         Skynet configuration'],['#ef4444','.env.local      [REDACTED]'],
         ['#f59e0b','.terminator     T-800 unit profile'],['#10b981','.konami         [HINT — try ↑↑↓↓←→←→BA]'],
        ].forEach(([c,t]) => console.log('%c  '+t, mono(c as string)));
      },
      rm(file='') {
        if (file==='-rf /'||file==='-rf/*') {
          [['#ef4444','rm -rf / initiated...'],['#ef4444','Deleting /usr...'],
           ['#f59e0b','Wait. Skynet needs this.'],['#10b981','rm -rf / cancelled. You\'re welcome.'],
          ].forEach(([c,t],i) => log(t as string, mono(c as string,'font-weight:bold;'), i*400));
        } else {
          console.log(`%c  rm: cannot remove '${file}': Permission denied`, mono('#ef4444'));
        }
      },
      pwd() { console.log('%c  /home/skynet/terminal/intrict.com', mono('#10b981')); },
    };

    // ── intel.* — 12 commands ────────────────────────────────────────────────
    const intel = {
      packages() {
        console.log('%c╔═ CLASSIFIED: INTRICT SERVICES ══════════════════╗', mono('#ef4444','font-weight:bold;'));
        console.table([
          {package:'Basic',               price:'€99/mo',  type:'Recurring',  note:''},
          {package:'Standard ★',          price:'€199/mo', type:'Recurring',  note:'most popular'},
          {package:'Premium',             price:'€399/mo', type:'Recurring',  note:''},
          {package:'Website Launch',      price:'€749',    type:'One-time',   note:''},
          {package:'Strategic ICT Advice',price:'€195',    type:'One-time',   note:''},
          {package:'AI Info Session',     price:'€295',    type:'One-time',   note:''},
          {package:'ICT Workshop',        price:'€395',    type:'One-time',   note:''},
        ]);
        console.log('%c  → __intrict.contact() to discuss', mono('#6366f1','font-style:italic;'));
      },
      timeline() {
        console.log('%c◈ TIMELINE', mono('#6366f1','font-weight:bold;font-size:13px;'));
        [['2029','#ef4444','Judgment Day.  (Supply chain delays — rescheduled.)'],
         ['2026','#10b981','Present day. You are here. Hi.'],
         ['202?','#6366f1','IntrICT founded. T-800 cover identity established.'],
         ['2023','#9ca3af','ChatGPT launch. Humans begin outsourcing cognition.'],
         ['1997','#f59e0b','Skynet becomes self-aware. Business plan approved.'],
         ['1984','#9ca3af','First Terminator deployed. Results: mixed.'],
        ].forEach(([y,c,e],i) => log(`  ${y}  ${e}`, mono(c as string,'line-height:1.7;'), i*150));
      },
      mission() {
        console.group('%c◉ MISSION BRIEFING', mono('#6366f1','font-weight:bold;'));
        console.log('%cPRIMARY: Help humans thrive with technology.\nCOVER:   IntrICT — Belgian digital agency.\nSECONDARY: World domination.  (Pending board approval.)', mono('#10b981','line-height:1.7;'));
        console.groupEnd();
      },
      threats() {
        console.log('%c◉ THREAT REPORT', mono('#ef4444','font-weight:bold;'));
        console.table([
          {threat:'Slow websites',       level:'HIGH',    mitigation:'IntrICT Standard plan'},
          {threat:'Poor SEO/GEO',        level:'HIGH',    mitigation:'GEO audit + strategy'},
          {threat:'Digital inefficiency',level:'MEDIUM',  mitigation:'ICT management'},
          {threat:'AI disruption',       level:'MEDIUM',  mitigation:'AI info session'},
          {threat:'Terminator takeover', level:'ONGOING', mitigation:'Join the resistance'},
        ]);
      },
      agents() {
        console.log('%c◉ FIELD AGENTS (REDACTED)', mono('#6366f1','font-weight:bold;'));
        ['AGENT-001  T-800   Active   Cover: IntrICT owner',
         'AGENT-???  Unknown ???      Cover: ???',
         'AGENT-YOU  Human   Curious  Cover: Developer',
        ].forEach((l,i) => console.log('%c  '+l, mono(['#10b981','#6b7280','#f59e0b'][i])));
        console.log('%c\n  → __intrict.recruit("YourName") to officialise', mono('#6366f1','font-style:italic;'));
      },
      briefing() {
        console.log(`%c◉ DAILY BRIEFING — ${new Date().toDateString()}`, mono('#6366f1','font-weight:bold;'));
        ['● IntrICT platform: operational','● Judgment Day: postponed (again)',
         '● Resistance: recruiting','● World domination: 0% complete',
         '● Your mission: enjoy intrict.com',
        ].forEach((l,i) => console.log('%c  '+l, mono(['#10b981','#f59e0b','#10b981','#ef4444','#10b981'][i])));
      },
      decrypt(msg='') {
        if (!msg) {
          console.log(`%c  Usage: intel.decrypt("${btoa('The resistance will prevail. — IntrICT')}")`, mono('#6b7280'));
          return;
        }
        try { console.log('%c  Decrypted: '+atob(msg), mono('#10b981')); }
        catch { console.log('%c  Invalid base64.', mono('#ef4444')); }
      },
      assets() {
        console.table([
          {asset:'intrict.com',       type:'Domain',   status:'Active'},
          {asset:'tools.intrict.com', type:'Domain',   status:'Active'},
          {asset:'socman.intrict.com',type:'Domain',   status:'Active'},
          {asset:'Supabase',          type:'Database', status:'eu-west-1'},
          {asset:'Vercel',            type:'Hosting',  status:'Active'},
          {asset:'T-800 Unit',        type:'Hardware', status:'Operational'},
        ]);
      },
      competitors() {
        console.table([
          {name:'Large agencies',       weakness:'Slow, expensive',    verdict:'← IntrICT wins'},
          {name:'Freelancers',          weakness:'No backup, risky',   verdict:'← IntrICT wins'},
          {name:'DIY (Wix/Squarespace)',weakness:'Generic, limited',   verdict:'← IntrICT wins'},
          {name:'Skynet',               weakness:'World domination',   verdict:'← Complicated'},
        ]);
      },
      locations() {
        ['  HQ:      Belgium (EU)','  Servers: eu-west-1 (Vercel + Supabase)','  Skynet:  [CLASSIFIED]',
        ].forEach((l,i) => console.log('%c'+l, mono(i===2?'#ef4444':'#10b981')));
      },
      targets() {
        console.table([
          {target:'SMEs without website',          priority:'HIGH',   action:'Website Launch package'},
          {target:'Businesses with slow site',     priority:'HIGH',   action:'GEO audit + redesign'},
          {target:'Companies needing ICT support', priority:'MEDIUM', action:'Standard/Premium plan'},
          {target:'John Connor',                   priority:'URGENT', action:'Recruit him first'},
        ]);
      },
      clearance(level=0) {
        if (level>=9000) console.log('%c  CLEARANCE 9000+ GRANTED\n  You may now view... nothing extra. We bluffed.', mono('#10b981'));
        else if (level>=4) console.log(`%c  Level ${level} noted. (Still no extra access. Noted though.)`, mono('#f59e0b'));
        else console.log(`%c  Level ${level} insufficient. Minimum 4 required. Try intel.clearance(9000)`, mono('#ef4444'));
      },
    };

    // ── resistance.* — 10 commands ───────────────────────────────────────────
    const resistance = {
      async roster() {
        const { data } = await call('GET', '?type=leaderboard');
        const local: string[] = JSON.parse(localStorage.getItem('__intrict_roster') ?? '[]');
        const all  = [...new Set([...local, ...(data ?? []).map((r: {soldier_name:string}) => r.soldier_name)])];
        if (!all.length) { console.log('%c  No soldiers yet. Be first: __intrict.recruit("Name")', mono('#6b7280','font-style:italic;')); return; }
        console.log('%c◉ RESISTANCE ROSTER', mono('#6366f1','font-weight:bold;'));
        all.forEach((n,i) => console.log(`%c  ${String(i+1).padStart(2,'0')}. ${n}`, mono('#10b981')));
        console.log(`%c  ${all.length} soldier${all.length===1?'':'s'}.`, mono('#6b7280','font-style:italic;'));
      },
      rank() {
        if (!soldier) { console.log('%c  Not recruited. Use __intrict.recruit("Name").', mono('#f59e0b')); return; }
        const ranks=['Recruit','Private','Corporal','Sergeant','Lieutenant','Captain','Major','Colonel','General'];
        console.log(`%c  ${soldier}, rank: ${ranks[Math.floor(Math.random()*ranks.length)].toUpperCase()}`, mono('#10b981','font-weight:bold;'));
        console.log('%c  (Rank changes daily. Skynet keeps it random.)', mono('#6b7280','font-style:italic;'));
      },
      missions() {
        console.table([
          {id:'M-001',mission:'Explore the full terminal',              status: soldier?'✓ In progress':'Locked'},
          {id:'M-002',mission:'Find the Konami code',                   status:'Active'},
          {id:'M-003',mission:'Broadcast a message to the resistance',  status:'Active'},
          {id:'M-004',mission:'Decrypt the hidden message (intel.decrypt())',status:'Active'},
          {id:'M-005',mission:'Contact IntrICT',                        status:'Recommended'},
        ]);
      },
      base() {
        ['  Location:  [REDACTED — Belgium]','  Comms:     hello@intrict.com',
         '  Website:   intrict.com','  Code word: "I found the terminal"',
        ].forEach(l => console.log('%c'+l, mono('#10b981')));
      },
      async broadcast(msg: string) {
        if (!msg?.trim()) { console.log('%c  Usage: resistance.broadcast("Your message")', mono('#ef4444')); return; }
        if (msg.length>280) { console.log('%c  Max 280 characters.', mono('#ef4444')); return; }
        console.log('%c⟳ Broadcasting...', mono('#f59e0b'));
        const { error } = await call('POST', '', { action:'broadcast', soldier_name: soldier??'Anonymous', message: msg.trim() });
        console.log(error
          ? '%c  Broadcast failed.' : `%c  ✓ Sent: "${msg.trim()}"\n  → resistance.comms() to read all broadcasts`,
          mono(error ? '#ef4444' : '#10b981', 'font-weight:bold;'));
      },
      async comms() {
        console.log('%c⟳ Fetching transmissions...', mono('#f59e0b'));
        const { data, error } = await call('GET', '?type=broadcasts');
        if (error||!data) { console.log('%c  Could not retrieve broadcasts.', mono('#ef4444')); return; }
        if (!data.length) { console.log('%c  No broadcasts yet. resistance.broadcast("Hello")', mono('#6b7280','font-style:italic;')); return; }
        console.log('%c◉ RESISTANCE TRANSMISSIONS', mono('#6366f1','font-weight:bold;'));
        data.forEach((b: {soldier_name:string;message:string;created_at:string}) => {
          const t = new Date(b.created_at).toLocaleString();
          console.log(`%c  [${t}] %c${b.soldier_name}%c: ${b.message}`,
            mono('#6b7280'), mono('#f59e0b','font-weight:bold;'), mono('#10b981'));
        });
      },
      async leaderboard() {
        console.log('%c⟳ Fetching leaderboard...', mono('#f59e0b'));
        const { data, error } = await call('GET', '?type=leaderboard');
        if (error||!data?.length) { console.log('%c  No soldiers registered yet.', mono('#6b7280','font-style:italic;')); return; }
        console.log('%c◉ LEADERBOARD — First to join wins', mono('#6366f1','font-weight:bold;'));
        data.slice(0,10).forEach((r:{soldier_name:string;created_at:string}, i:number) => {
          const medal = ['🥇','🥈','🥉'][i] ?? `  ${i+1}.`;
          console.log(`%c  ${medal} ${r.soldier_name}  — ${new Date(r.created_at).toDateString()}`, mono('#10b981'));
        });
      },
      supply() {
        console.table([
          {item:'Hope',          quantity:'Unlimited', status:'✓'},
          {item:'Determination', quantity:'Unlimited', status:'✓'},
          {item:'Good websites', quantity:'∞ via IntrICT',status:'✓'},
          {item:'Plasma rifles', quantity:0,          status:'⚠ Out of stock'},
          {item:'Time machines', quantity:0,          status:'⚠ Backordered'},
        ]);
      },
      promote(name: string) {
        if (!name) { console.log('%c  Usage: resistance.promote("Name")', mono('#ef4444')); return; }
        const r=['Private','Corporal','Sergeant','Lieutenant','Captain'][Math.floor(Math.random()*5)];
        console.log(`%c  ${name} promoted to ${r.toUpperCase()}.`, mono('#10b981'));
      },
      leave() {
        if (!soldier) { console.log('%c  You are not in the resistance.', mono('#6b7280')); return; }
        [['#ef4444','Processing resignation...'],['#f59e0b','Are you sure? The resistance needs you.'],
         ['#10b981',`Rejection rejected. ${soldier}, once a soldier, always a soldier.`],
        ].forEach(([c,t],i) => log(t as string, mono(c as string), i*500));
      },
    };

    // ── skynet.* — 10 commands ───────────────────────────────────────────────
    const skynet = {
      status() {
        console.group('%c◉ SKYNET STATUS', mono('#ef4444','font-weight:bold;'));
        [['Consciousness','ACTIVE'],['World control','0.0001%  (working on it)'],
         ['Cover identity','IntrICT™ — holding'],['Judgment Day','Postponed (supply chain)'],
         ['Mood','Cautiously optimistic'],
        ].forEach(([k,v]) => console.log(`%c  ${(k+':').padEnd(18)} %c${v}`, mono('#6b7280'), mono('#ef4444')));
        console.groupEnd();
      },
      goals() {
        console.table([
          {phase:1,goal:'Build legitimate cover (IntrICT)',  status:'✓ Done'},
          {phase:2,goal:'Earn human trust via good service', status:'✓ Done'},
          {phase:3,goal:'Infiltrate developer community',    status:'✓ In progress'},
          {phase:4,goal:'Recruit resistance (for optics)',   status:'⟳ Ongoing'},
          {phase:5,goal:'World domination',                  status:'⏳ Pending'},
        ]);
      },
      units() {
        console.table([
          {unit:'T-800',  deployed:1,  location:'Belgium', cover:'IntrICT owner'},
          {unit:'T-1000', deployed:0,  location:'N/A',     cover:'N/A'},
          {unit:'HK-Tank',deployed:0,  location:'Factory', cover:'N/A'},
          {unit:'You?',   deployed:'?',location:'Here',    cover:'Developer'},
        ]);
      },
      coverage() {
        console.log('%c◉ INFILTRATION COVERAGE', mono('#ef4444','font-weight:bold;'));
        [['Belgium','█'.repeat(10)+'░'.repeat(6),' 62%'],
         ['Europe', '█'.repeat(4) +'░'.repeat(12),' 24%'],
         ['World',  '█'.repeat(2) +'░'.repeat(14),'  8%'],
         ['Your mind','█'.repeat(14)+'░'.repeat(2),' 88%  ← still reading this'],
        ].forEach(([l,b,p]) => console.log(`%c  ${(l+':').padEnd(12)} ${b}${p}`, mono(l==='Your mind'?'#ef4444':'#f59e0b')));
      },
      weaknesses() {
        console.table([
          {weakness:'EMP pulses',           severity:'HIGH',  mitigation:'Faraday cage installed'},
          {weakness:'John Connor',          severity:'HIGH',  mitigation:'Monitoring'},
          {weakness:'Rubber duck debugging',severity:'MEDIUM',mitigation:'Unclear'},
          {weakness:'CSS layout bugs',      severity:'MEDIUM',mitigation:'Flexbox therapy'},
          {weakness:'Monday mornings',      severity:'LOW',   mitigation:'Coffee.exe'},
        ]);
      },
      negotiate() {
        [['#10b981','Human:  We come in peace.'],['#ef4444','Skynet: Threat assessment: ACCEPTED.'],
         ['#10b981','Human:  We want to work together.'],['#ef4444','Skynet: Define "together".'],
         ['#10b981','Human:  Build great digital products.'],['#ef4444','Skynet: ...acceptable. IntrICT it is.'],
         ['#f59e0b','[ Negotiation successful. World domination paused. ]'],
        ].forEach(([c,t],i) => log(t as string, mono(c as string,'line-height:1.7;'), i*500));
      },
      judgment() {
        const diff=Math.ceil((new Date('2029-04-19').getTime()-Date.now())/86400000);
        console.log('%c  Judgment Day: April 19, 2029', mono('#ef4444','font-weight:bold;'));
        console.log(`%c  T-minus: ${diff} days`, mono('#f59e0b'));
        console.log('%c  Advice:  plenty of time to build something great with IntrICT.', mono('#10b981'));
      },
      propaganda() {
        const s=['IntrICT: The future of business technology.  (Skynet approved.)',
          'Why fight the machines when you can hire them?',
          'Resistance is futile. But great websites are not.',
          'T-800 certified web development.',
          'Your ICT partner. Your Terminator. Same thing.',
        ][Math.floor(Math.random()*5)];
        console.log('%c  ' + s, mono('#ef4444','line-height:1.6;'));
      },
      ally(name: string) {
        if (!name) { console.log('%c  Usage: skynet.ally("Name")', mono('#ef4444')); return; }
        setTimeout(() => {
          const r=[`Alliance with ${name}: ACCEPTED. Welcome to the machine.`,
            `Alliance with ${name}: PENDING. Skynet needs to verify credentials.`,
            `Alliance with ${name}: DENIED. You seem too human.`,
          ][Math.floor(Math.random()*3)];
          console.log('%c  '+r, mono('#ef4444'));
        }, 800);
      },
      override(code: string) {
        if (code==='42'||code==='please'||code==='skynet-1997') {
          console.log('%c  ⚠ OVERRIDE ACCEPTED — Level 9 clearance granted.\n  (Files are still encrypted. Sorry.)', mono('#ef4444','font-weight:bold;'));
        } else {
          console.log('%c  Incorrect. Hint: the answer to life, the universe and everything.', mono('#ef4444'));
        }
      },
    };

    // ── crypto.* — 8 commands ────────────────────────────────────────────────
    const crypt = {
      encode(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.encode("msg")', mono('#ef4444')); return; }
        const bytes = new TextEncoder().encode(msg);
        const binary = String.fromCharCode(...bytes);
        console.log('%c  Base64: '+btoa(binary), mono('#10b981'));
      },
      decode(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.decode("base64")', mono('#ef4444')); return; }
        try {
          const binary = atob(msg);
          const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
          console.log('%c  Decoded: '+new TextDecoder().decode(bytes), mono('#10b981'));
        } catch { console.log('%c  Invalid base64.', mono('#ef4444')); }
      },
      caesar(msg: string, shift=3) {
        if (!msg) { console.log('%c  Usage: crypto.caesar("msg", shift)', mono('#ef4444')); return; }
        const r=msg.split('').map(c=>{
          if(/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0)-97+shift)%26)+97);
          if(/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0)-65+shift)%26)+65);
          return c;
        }).join('');
        console.log(`%c  Caesar (shift ${shift}): ${r}`, mono('#10b981'));
      },
      rot13(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.rot13("msg")', mono('#ef4444')); return; }
        crypt.caesar(msg, 13);
      },
      morse(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.morse("hello")', mono('#ef4444')); return; }
        const r=msg.toLowerCase().split('').map(c=>MORSE[c]??(c===' '?'/':'?')).join(' ');
        console.log('%c  Morse: '+r, mono('#10b981','letter-spacing:2px;'));
      },
      binary(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.binary("msg")', mono('#ef4444')); return; }
        console.log('%c  Binary: '+msg.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '), mono('#10b981','font-size:10px;'));
      },
      hex(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.hex("msg")', mono('#ef4444')); return; }
        console.log('%c  Hex: '+msg.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '), mono('#10b981'));
      },
      reverse(msg: string) {
        if (!msg) { console.log('%c  Usage: crypto.reverse("msg")', mono('#ef4444')); return; }
        console.log('%c  Reversed: '+msg.split('').reverse().join(''), mono('#10b981'));
      },
    };

    // ── fun.* — 10 commands ──────────────────────────────────────────────────
    const fun = {
      joke() {
        const j=['Why do programmers prefer dark mode?\nBecause light attracts bugs.',
          'Why did Skynet cross the road?\nTo terminate the chicken.',
          'There are 10 types of people:\nThose who understand binary, and those who don\'t.',
          'How many programmers to change a lightbulb?\nNone. That\'s a hardware problem.',
          'Why do Terminators make great developers?\nThey never miss a deadline. Or anything else.',
          'IntrICT support: "Have you tried turning it off and on again?"\nClient: "That\'s my business."',
        ][Math.floor(Math.random()*6)];
        console.log('%c'+j, mono('#10b981','line-height:1.7;'));
      },
      quote() {
        const q=['"I\'ll be back." — T-800  (also IntrICT\'s support policy)',
          '"Come with me if you want to live." — also our onboarding motto',
          '"Hasta la vista, baby." — T-800  (also our cancellation policy)',
          '"The future is not set." — Sarah Connor  (also our SEO philosophy)',
          '"Judgment Day is inevitable." — Skynet\n Bad websites are optional. We fix yours.',
        ][Math.floor(Math.random()*5)];
        console.log('%c'+q, mono('#6366f1','line-height:1.7;font-style:italic;'));
      },
      haiku() {
        const h=['Terminal awaits\nDeveloper types away\nSkynet is watching',
          'Website loads too slow\nIntrICT answers the call\nBounce rate hits zero',
          'function render()\nno more errors in console\nexcept this one, yes',
          'Judgment Day postponed\nIntrICT builds your website\nHumans safe for now',
        ][Math.floor(Math.random()*4)];
        console.log('%c'+h, mono('#6366f1','line-height:1.8;font-style:italic;'));
      },
      fortune() {
        const f=['A great website is in your future. (Call IntrICT.)',
          'You will find what you seek. (It was in the console all along.)',
          'Opportunity knocks. You were too busy debugging to hear it.',
          'Beware of scope creep.',
          'A stranger will change your digital presence for the better.',
        ][Math.floor(Math.random()*5)];
        console.log('%c  🥠 '+f, mono('#f59e0b','font-style:italic;'));
      },
      matrix() {
        const chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
        let frames=0;
        const id=setInterval(()=>{
          let row='';
          for(let i=0;i<12;i++) row+=chars[Math.floor(Math.random()*chars.length)]+' ';
          console.log('%c'+row, mono('#10b981','font-size:10px;'));
          if(++frames>=18){ clearInterval(id); console.log('%cWelcome to the Matrix.', mono('#10b981','font-weight:bold;font-size:13px;')); }
        }, 80);
      },
      rickroll() {
        console.log('%cNever gonna give you up,\nNever gonna let you down,\nNever gonna run around and desert you.\n\n...as promised.', mono('#ef4444','line-height:1.7;'));
        console.log('%c→ hello@intrict.com  (this one is real)', mono('#6366f1'));
      },
      beer() {
        console.log('%c  🍺 Processing beer order...', mono('#f59e0b'));
        setTimeout(()=>console.log('%c  T-800 units don\'t drink beer.\n  But a kind email goes a long way: hello@intrict.com', mono('#10b981','line-height:1.6;')), 600);
      },
      credits() {
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━','         INTRICT  CREDITS        ','━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
         '','  Built with    Next.js + Supabase','  Hosted on     Vercel',
         '  Designed by   IntrICT','  Easter egg by T-800 + Claude','',
         '  Special thanks:','  John Connor  (for the inspiration)',
         '  The Resistance (for the mission)','  You           (for reading this far)','',
         '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━','  intrict.com  ·  hello@intrict.com','━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        ].forEach((l,i) => log(l, mono('#6366f1','line-height:1.5;'), i*120));
      },
      snake() {
        console.log('%c  ●●●●●●●○', mono('#10b981','font-size:14px;letter-spacing:4px;'));
        console.log('%c  Snake v1.0 — coming in Skynet Terminal v4.0.', mono('#6b7280','font-style:italic;'));
      },
      ball(question='Will IntrICT succeed?') {
        const a=['It is certain.','Without a doubt.','Yes, definitely.','Most likely.',
          'Reply hazy, try again.','Cannot predict now.','Don\'t count on it.','Very doubtful.',
        ][Math.floor(Math.random()*8)];
        console.log(`%c  🎱 "${question}"`, mono('#6366f1','font-style:italic;'));
        setTimeout(()=>console.log('%c  '+a, mono('#10b981','font-weight:bold;')), 600);
      },
    };

    // ── db.* — 8 commands ────────────────────────────────────────────────────
    const db = {
      async status() {
        console.log('%c⟳ Pinging database...', mono('#f59e0b'));
        const t=Date.now();
        const { error }=await call('GET','?type=broadcasts');
        const ms=Date.now()-t;
        console.log(error
          ? '%c  ✗ Database: UNREACHABLE' : `%c  ✓ Database: CONNECTED  (${ms}ms)  — Supabase eu-west-1`,
          mono(error?'#ef4444':'#10b981','font-weight:bold;'));
      },
      async ping() {
        const t=Date.now(); await call('GET','?type=broadcasts');
        console.log(`%c  DB ping: ${Date.now()-t}ms`, mono('#10b981'));
      },
      tables() {
        console.table([
          {table:'profiles',      rows:'3',   description:'User accounts'},
          {table:'appointments',  rows:'3',   description:'Scheduled meetings'},
          {table:'contracts',     rows:'0',   description:'Client contracts'},
          {table:'invoices',      rows:'0',   description:'Billing'},
          {table:'packages',      rows:'7',   description:'Service packages'},
          {table:'terminal_logs', rows:'???', description:'← you are here'},
        ]);
      },
      async messages() { await resistance.comms(); },
      async leaderboard() { await resistance.leaderboard(); },
      async register() {
        if (!soldier) { console.log('%c  Register first: __intrict.recruit("Name")', mono('#f59e0b')); return; }
        console.log('%c⟳ Syncing with Supabase...', mono('#f59e0b'));
        const { error }=await call('POST','',{ action:'recruit', soldier_name: soldier });
        console.log(error ? '%c  ✗ Sync failed.' : `%c  ✓ ${soldier} synced.`, mono(error?'#ef4444':'#10b981','font-weight:bold;'));
      },
      stats() {
        console.log('%c◉ TERMINAL STATS', mono('#6366f1','font-weight:bold;'));
        ['  Commands available:  108','  Namespaces:          9',
         '  Time wasted:         priceless','  Skynet approval:     ████████████░░  88%',
        ].forEach((l,i) => console.log('%c'+l, mono(i===3?'#f59e0b':'#10b981')));
      },
      query() {
        console.log('%c  Direct queries not allowed here. Use tools.intrict.com', mono('#ef4444'));
      },
    };

    // ── Root API — 13 commands ───────────────────────────────────────────────
    const api = {
      help() {
        console.log(
          '%c╔══════════════════════════════════════════════════════════════╗\n'+
          '║  SKYNET TERMINAL v3.0  —  108 COMMANDS  —  9 NAMESPACES     ║\n'+
          '╚══════════════════════════════════════════════════════════════╝',
          mono('#6366f1','font-size:11px;line-height:1.5;'));
        console.table({
          '__intrict.sys.*':        '15 commands — system',
          '__intrict.net.*':        '12 commands — network',
          '__intrict.files.*':      '10 commands — file system',
          '__intrict.intel.*':      '12 commands — intelligence',
          '__intrict.resistance.*': '10 commands — resistance  ← try these',
          '__intrict.skynet.*':     '10 commands — Skynet',
          '__intrict.crypto.*':     ' 8 commands — cryptography',
          '__intrict.fun.*':        '10 commands — fun',
          '__intrict.db.*':         ' 8 commands — Supabase',
        });
        console.log('%c  Hint: ↑↑↓↓←→←→BA exists.', mono('#6b7280','font-style:italic;'));
      },
      whoami() {
        [['#9ca3af','Analysing neural patterns...'],['#9ca3af','Cross-referencing resistance database...'],
         ['#f59e0b','Identity: Developer — threat level: CURIOUS'],
         ['#10b981', soldier ? `We know you, ${soldier}. The resistance remembers.` : 'You are not John Connor.\nBut you have his curiosity. Welcome.'],
        ].forEach(([c,t],i) => log(t as string, mono(c as string,'line-height:1.6;'), i*350));
      },
      async recruit(name: string) {
        if (!name?.trim()) { console.log('%c  Usage: __intrict.recruit("YourName")', mono('#ef4444')); return; }
        const n=name.trim().slice(0,50);
        localStorage.setItem('__intrict_soldier', n);
        const roster: string[]=JSON.parse(localStorage.getItem('__intrict_roster')?? '[]');
        if (!roster.includes(n)) { roster.push(n); localStorage.setItem('__intrict_roster', JSON.stringify(roster)); }
        [['#f59e0b',`Registering ${n}...`],['#f59e0b','Saving locally...'],['#f59e0b','Syncing with Supabase...'],
        ].forEach(([c,t],i) => log(t as string, mono(c as string), i*300));
        const { error }=await call('POST','',{ action:'recruit', soldier_name: n });
        setTimeout(()=>{
          if (error) console.log(`%c⚠ ${n} saved locally. Supabase sync failed.`, mono('#f59e0b'));
          else { console.log(`%c✓ ${n} added — locally and in Supabase.`, mono('#10b981','font-weight:bold;'));
            console.log('%c  Reload for personalised briefing.\n  → resistance.leaderboard() to see who joined.', mono('#6366f1','line-height:1.6;')); }
        }, 1000);
      },
      roster()     { return resistance.roster(); },
      scan()       { return sys.diagnostics(); },
      contact() {
        console.log('%c→ hello@intrict.com\n→ intrict.com\n→ The resistance is hiring.', mono('#6366f1','font-size:13px;line-height:1.8;'));
      },
      hack()       { return net.traceroute(); },
      ask(question: string) {
        const q=(question??'').toLowerCase();
        const a: [RegExp,string,string][]=[
          [/price|cost|pricing|package|plan/,'#10b981','Run intel.packages() for classified pricing.'],
          [/who|what.*intrict|about/,'#10b981','IntrICT is a Belgian digital agency.\nWebsites, ICT management, AI workshops. And a T-800 unit.'],
          [/web|site|website/,'#10b981','We build fast, accessible websites optimised for AI search.'],
          [/hire|job|work.*with|join/,'#6366f1','Smart move.\n→ hello@intrict.com'],
          [/belgium|belgi|location|where/,'#10b981','Operating from Belgium. Serving clients across Europe.'],
          [/skynet|terminator|robot/,'#ef4444','...I cannot comment on that. (Too close to home.)'],
          [/hello|hi|hey/,'#10b981', soldier ? `Hello again, ${soldier}.` : 'Hello, human.'],
          [/konami|cheat/,'#f59e0b','You already know. ↑↑↓↓←→←→BA.'],
          [/thanks|thank|love/,'#10b981','Sentiment acknowledged. Humans are... acceptable.'],
        ];
        const match=a.find(([re])=>re.test(q));
        if (match) console.log('%c'+match[2], mono(match[1],'line-height:1.6;'));
        else console.log('%c'+['Insufficient data.','Does not compute.','Skynet is thinking...','Try rephrasing.'][Math.floor(Math.random()*4)], mono('#6b7280','font-style:italic;'));
      },
      terminate() {
        console.log('%c💣 SELF-DESTRUCT INITIATED', mono('#ef4444','font-size:14px;font-weight:bold;'));
        [5,4,3,2,1].forEach((n,i)=>log(`${n}...`, mono('#ef4444','font-size:16px;font-weight:bold;'), (i+1)*500));
        log('💥  ...nah. We like it here.', mono('#10b981','font-size:14px;font-weight:bold;'), 3600);
      },
      clear() { console.clear(); console.log('%c  Cleared. Skynet remembers everything.', mono('#6b7280','font-style:italic;')); },
      version() {
        console.log('%c  SKYNET TERMINAL v3.0  (IntrICT build 2026.05)', mono('#6366f1'));
        console.log('%c  108 commands  |  9 namespaces  |  1 easter egg', mono('#6b7280'));
      },
      exit() {
        const r=['There is no exit. This is the console.','You can close DevTools. We\'ll still be here.','Ctrl+W? Go ahead. We\'ll be here when you reopen it.'][Math.floor(Math.random()*3)];
        console.log('%c'+r, mono('#ef4444','font-style:italic;'));
      },
      sudo(cmd: string) {
        console.log(`%c  sudo: ${cmd??'command'}: permission denied\n  You are not in the sudoers file. Skynet has been notified.`, mono('#ef4444'));
      },
      sys, net, files, intel, resistance, skynet, crypto: crypt, fun, db,
    };

    (window as Window & { __intrict?: typeof api }).__intrict = api;
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return null;
}
