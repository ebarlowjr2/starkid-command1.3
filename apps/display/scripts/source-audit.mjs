// Sidecar audit: same shared gateway, no direct provider requests.
import {appendFile,readFile} from 'node:fs/promises';
const [base='http://localhost:4174',output='/tmp/starkid-source-audit.jsonl',soakFile]=process.argv.slice(2);
const started=Date.now();let previous='';
while(Date.now()-started<125*60000){
 try{
  const response=await fetch(base+'/api/display/snapshot',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('HTTP '+response.status);
  const snapshot=await response.json(),feeds=Object.fromEntries(Object.entries(snapshot.feeds).map(([key,v])=>[key,{source:v.source,kind:v.kind,status:v.status,reason:v.reason,observedAt:v.observedAt,received:v.received,expiresAt:v.expiresAt}]));
  const sample={at:new Date().toISOString(),health:snapshot.health,feeds};await appendFile(output,JSON.stringify(sample)+'\n');
  const key=JSON.stringify(Object.fromEntries(Object.entries(feeds).map(([key,v])=>[key,[v.status,v.reason]])));
  if(key!==previous){console.log(JSON.stringify(sample));previous=key;}
 }catch(e){await appendFile(output,JSON.stringify({at:new Date().toISOString(),error:e.message})+'\n');}
 if(soakFile){try{const soak=JSON.parse(await readFile(soakFile,'utf8'));if(soak.status==='completed'||soak.status==='failed')break;}catch{}}
 await new Promise(resolve=>setTimeout(resolve,60000));
}
