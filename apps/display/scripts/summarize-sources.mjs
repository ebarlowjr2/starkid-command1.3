// Snapshot audits describe cache availability at sample times, not provider uptime.
import {readFile,writeFile} from 'node:fs/promises';
const file=process.argv[2];if(!file)throw Error('Usage: node apps/display/scripts/summarize-sources.mjs /path/to/source-audit.jsonl');
const rows=(await readFile(file,'utf8')).trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
const samples=rows.filter(row=>row.feeds),feeds={};
for(const row of samples)for(const [key,value] of Object.entries(row.feeds)){
 const item=feeds[key]??={source:value.source,kind:value.kind,sampledStatuses:{},sampledReasons:{},firstRetrieval:null,lastRetrieval:null,observedDates:[]};
 item.sampledStatuses[value.status]=(item.sampledStatuses[value.status]||0)+1;
 if(value.reason)item.sampledReasons[value.reason]=(item.sampledReasons[value.reason]||0)+1;
 if(Number.isFinite(value.received)){const at=new Date(value.received).toISOString();if(!item.firstRetrieval||at<item.firstRetrieval)item.firstRetrieval=at;if(!item.lastRetrieval||at>item.lastRetrieval)item.lastRetrieval=at;}
 if(value.observedAt&&!item.observedDates.includes(value.observedAt))item.observedDates.push(value.observedAt);
}
const summary={description:'Shared gateway snapshot samples; counts are not provider request counts or uptime percentages.',firstSample:rows[0]?.at,lastSample:rows.at(-1)?.at,samples:samples.length,auditErrors:rows.filter(row=>row.error),maximumAuditGapSeconds:Math.max(0,...rows.slice(1).map((row,i)=>(Date.parse(row.at)-Date.parse(rows[i].at))/1000)),feeds};
await writeFile(file.replace(/\.jsonl$/,'.summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
