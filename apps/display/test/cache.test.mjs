import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {FeedCache} from '../server/cache.mjs';
const definition={ttl:100,source:'Test source',kind:'estimated',units:'km',url:()=> 'https://test.example/data',valid:d=>d&&Number.isFinite(d.value)};
const good=value=>new Response(JSON.stringify({value}));
test('multiple clients deduplicate one upstream request and preserve freshness',async()=>{
 let calls=0,now=1000;const cache=new FeedCache({definitions:{sample:definition},clock:()=>now,fetcher:async()=>{calls++;await new Promise(r=>setTimeout(r,20));return good(42);}});
 const entries=await Promise.all(Array.from({length:6},()=>cache.refresh('sample')));
 assert.equal(calls,1);assert.equal(entries.length,6);assert.equal(entries[0].received,1000);
 now=1050;await cache.refresh('sample');assert.equal(calls,1);assert.equal(cache.envelope('sample').status,'current');
});
test('rate limits retain last-good time and backoff prevents a request storm',async()=>{
 let now=1000,calls=0;const cache=new FeedCache({definitions:{sample:definition},clock:()=>now,random:()=>0,fetcher:async()=>++calls===1?good(42):new Response('',{status:429})});
 await cache.refresh('sample');now=1200;await cache.refresh('sample');const old=cache.envelope('sample');
 assert.equal(old.status,'stale');assert.equal(old.received,1000);assert.equal(old.data.value,42);assert.match(old.reason,/429/);
 await Promise.all(Array.from({length:6},()=>cache.refresh('sample')));assert.equal(calls,2);
});
test('invalid source schema is rejected, and a later refresh recovers',async()=>{
 let now=1000,valid=false;const cache=new FeedCache({definitions:{sample:definition},clock:()=>now,random:()=>0,fetcher:async()=>new Response(JSON.stringify(valid?{value:2}:{unexpected:true}))});
 await cache.refresh('sample');assert.equal(cache.envelope('sample').status,'unavailable');
 now=40000;valid=true;await cache.refresh('sample');assert.equal(cache.envelope('sample').status,'current');assert.equal(cache.envelope('sample').data.value,2);
});
test('disk snapshots survive gateway restart without manufacturing new timestamps',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'display-cache-'));
 try{const c=new FeedCache({directory,definitions:{sample:definition},clock:()=>1000,fetcher:async()=>good(7)});await c.refresh('sample');
 const restored=new FeedCache({directory,definitions:{sample:definition},clock:()=>2000});await restored.restore();assert.equal(restored.envelope('sample').received,1000);assert.equal(restored.envelope('sample').status,'stale');
 await writeFile(path.join(directory,'sample.json'),'{corrupt');const empty=new FeedCache({directory,definitions:{sample:definition}});await empty.restore();assert.equal(empty.envelope('sample').status,'unavailable');
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('a timed-out optional feed does not stall or erase another source',async()=>{
 const cache=new FeedCache({definitions:{good:{...definition,url:()=> 'https://good.example/data'},slow:{...definition,url:()=> 'https://slow.example/data'}},fetcher:async url=>{if(url.includes('slow'))throw new DOMException('timeout','TimeoutError');return good(9);}});
 const snapshot=await cache.snapshot();assert.equal(snapshot.feeds.good.status,'current');assert.equal(snapshot.feeds.slow.status,'unavailable');assert.match(snapshot.feeds.slow.reason,/timed out/);assert.equal(snapshot.health,'partial');
});
