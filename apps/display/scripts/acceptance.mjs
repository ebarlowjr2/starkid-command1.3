// Real providers, direct-route refreshes, and review screenshots; no fixtures.
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.DISPLAY_URL||'http://localhost:4174',output=process.env.ACCEPTANCE_DIR||'/tmp/starkid-display-acceptance';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:process.env.SOFTWARE_GL==='1'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]});
const context=await browser.newContext(),page=await context.newPage();
const errors=[],consoleErrors=[],requests=[],screens=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')consoleErrors.push({url:page.url(),message:e.text()});});page.on('requestfailed',r=>requests.push({url:r.url(),error:r.failure()?.errorText}));
const modelTimeout=Number(process.env.MODEL_TIMEOUT_MS)||300000;
const cases=[['/earth','Earth Operations','earth'],['/orbit','Orbital Tracking','orbit'],['/planets/mars','Mars Exploration','mars'],['/missions','Mission Control','mission']];
try{
 for(const [width,height] of [[1920,1080],[3840,2160]]){
  await page.setViewportSize({width,height});
  for(const [route,title,id] of cases){
   await page.goto(base+route+'?kiosk=1&quality=high&tourSeconds=30');
   await page.waitForFunction(t=>document.querySelector('h1')?.textContent===t,title);
   if(['earth','mars'].includes(id))await page.waitForFunction(m=>window.__starkidDisplayDiagnostics?.().model===m,id,{timeout:modelTimeout});
   await page.reload();await page.waitForFunction(t=>document.querySelector('h1')?.textContent===t,title);
   let modelReady=null;if(['earth','mars'].includes(id)){try{await page.waitForFunction(m=>window.__starkidDisplayDiagnostics?.().model===m,id,{timeout:modelTimeout});modelReady=true;}catch{modelReady=false;}}
   const refreshed=await page.waitForResponse(r=>r.url().includes('/api/display/snapshot')&&r.status()===200,{timeout:20000}).catch(()=>null);if(refreshed)await refreshed.finished();await page.waitForTimeout(2000);const file=`${id}-${width}x${height}.png`;await page.screenshot({path:path.join(output,file)});
   const state=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,diagnostic:window.__starkidDisplayDiagnostics?.(),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,verticalOverflow:document.documentElement.scrollHeight>innerHeight+1,asideClipping:document.querySelector('aside')?.scrollHeight>document.querySelector('aside')?.clientHeight+1,details:document.querySelector('#details')?.innerText,sourceLabels:[...document.querySelectorAll('.source')].map(e=>e.innerText),images:[...document.images].map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0}))}));
   screens.push({route,refreshPassed:state.title===title,width,height,file,modelReady,...state});
  }
 }
 const snapshot=await page.evaluate(()=>fetch('/api/display/snapshot').then(r=>r.json()));
 await writeFile(path.join(output,'snapshot.json'),JSON.stringify(snapshot,null,2));
 await writeFile(path.join(output,'acceptance.json'),JSON.stringify({capturedAt:new Date().toISOString(),base,softwareWebGL:process.env.SOFTWARE_GL==='1',errors,consoleErrors,failedRequests:requests,screens,feeds:Object.fromEntries(Object.entries(snapshot.feeds).map(([k,v])=>[k,{...v,data:undefined}]))},null,2));
 console.log(JSON.stringify({output,routeRefreshes:screens.filter(s=>s.refreshPassed).length,expected:8,uncaughtExceptions:errors.length,consoleErrors:consoleErrors.length,clipping:screens.filter(s=>s.verticalOverflow||s.horizontalOverflow||s.asideClipping).map(s=>({route:s.route,size:[s.width,s.height],aside:s.asideClipping}))}));
 if(errors.length||screens.some(s=>!s.refreshPassed||s.verticalOverflow||s.horizontalOverflow||s.modelReady===false))process.exitCode=1;
}finally{await browser.close();}
