// Real-time ISS validity and browser recovery check; does not alter the gateway network.
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.DISPLAY_URL||'http://localhost:4174',out=process.env.ACCEPTANCE_DIR||'/tmp/starkid-offline-probe';await mkdir(out,{recursive:true});
const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:process.env.SOFTWARE_GL==='1'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]});const c=await b.newContext({viewport:{width:1920,height:1080}}),p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
const state=()=>p.evaluate(()=>({at:new Date().toISOString(),details:document.querySelector('#details')?.innerText,status:document.querySelector('#connection')?.innerText,marker:!!document.querySelector('#map circle'),cached:JSON.parse(localStorage.getItem('display:iss')||'null')}));
try{
 await p.goto(base+'/orbit?kiosk=1');await p.waitForFunction(()=>document.querySelector('#details')?.textContent.includes(' km'),undefined,{timeout:60000});
 const before=await state();await p.screenshot({path:path.join(out,'before.png')});
 await c.setOffline(true);await p.waitForTimeout(62000);const offline=await state();await p.screenshot({path:path.join(out,'offline-62s.png')});
 await c.setOffline(false);await p.waitForFunction(()=>document.querySelector('#details')?.textContent.includes(' km'),undefined,{timeout:60000});const after=await state();await p.screenshot({path:path.join(out,'restored.png')});
 const checks={freshMarkerBefore:before.marker,staleMarkerRemoved:!offline.marker,stalePrecisionRemoved:!offline.details.includes(' km'),offlineLabel:offline.status.includes('OFFLINE'),originalRetrievalPreserved:before.cached.received===offline.cached.received,recoveredMarker:after.marker,noPageExceptions:errors.length===0};
 await writeFile(path.join(out,'result.json'),JSON.stringify({base,before,offline,after,errors,checks},null,2));console.log(JSON.stringify(checks));if(Object.values(checks).some(v=>!v))process.exitCode=1;
}finally{await b.close();}
