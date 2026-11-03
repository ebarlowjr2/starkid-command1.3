import { test } from 'node:test';import assert from 'node:assert/strict';
import {configuration,sunPosition,countdown,freshness,readCache,request,trackSegments} from '../src/logic.js';
test('configuration rejects invalid stations and bounds unattended rotation',()=>{assert.deepEqual(configuration('?stations=nope&seconds=1&station=bad').stations,['earth','orbit','mars','mission']);assert.equal(configuration('?seconds=1').seconds,10);assert.equal(configuration('?seconds=900').seconds,600);assert.equal(configuration('?quality=low&mode=broadcast').broadcast,true);});
test('solar longitude follows UTC and equinox declination is near zero',()=>{const p=sunPosition(new Date('2026-03-21T12:00:00Z'));assert.equal(p.lon,0);assert.ok(Math.abs(p.lat)<2);});
test('countdown never represents past or invalid launches as future',()=>{assert.equal(countdown('bad',0),'Awaiting schedule update');assert.equal(countdown('2026-01-01',Date.parse('2026-01-02')),'Awaiting schedule update');assert.equal(countdown('2026-01-02',Date.parse('2026-01-01')),'T− 1d 00:00:00');});
test('cache labels distinguish missing, current, expired and failed refresh',()=>{assert.equal(freshness(null,100),'UNAVAILABLE');assert.equal(freshness({received:950},100,1000),'CURRENT');assert.equal(freshness({received:0},100,1000),'CACHED / STALE');assert.equal(freshness({received:999,failed:true},100,1000),'CACHED / STALE');assert.equal(readCache({getItem:()=>'{broken'},'x'),null);});
test('network failures and malformed payloads cannot replace observations',async()=>{await assert.rejects(request('x',()=>true,async()=>({ok:false,status:429})),/429/);await assert.rejects(request('x',d=>Array.isArray(d.results),async()=>({ok:true,json:async()=>({})})),/Invalid/);assert.deepEqual(await request('x',d=>d.ok,async()=>({ok:true,json:async()=>({ok:true})})),{ok:true});});
test('ground track splits at the antimeridian',()=>{assert.equal(trackSegments([{longitude:170},{longitude:179},{longitude:-175},{longitude:-160}]).length,2);});

import {launchState, positionUsable, configQuery} from '../src/logic.js';
test('launch delays, holds, cancellations, windows and elapsed NET are explicit',()=>{
 const now=Date.parse('2026-11-03T12:00:00Z'),l={net:'2026-11-04T12:00:00Z',status:{name:'Go'}};
 assert.equal(launchState(l,now).countdown,true);
 for(const name of ['Cancelled','Scrubbed','On Hold','TBD','To Be Confirmed','To Be Determined','Launch Successful'])assert.equal(launchState({...l,status:{name}},now).countdown,false,name);
 assert.equal(launchState({...l,net_precision:{name:'Month'}},now).countdown,false);
 assert.equal(launchState({...l,net:'2026-11-02'},now).countdown,false);
 assert.equal(launchState({...l,net:null},now).countdown,false);
 assert.equal(launchState({...l,net:'2026-11-05T00:00:00Z'},now).countdown,true);
});
test('position validity removes misleading precision beyond 45 seconds',()=>{
 assert.equal(positionUsable({data:{timestamp:100}},120000),true);
 assert.equal(positionUsable({data:{timestamp:100}},146000),false);
 assert.equal(positionUsable({data:{timestamp:200}},100000),false);
});
test('configuration round-trip retains lab context and validates unsafe values',()=>{
 const c=configuration('?lab=Lab%20B&timezone=Europe/London&latitude=51.5&longitude=-0.1&tourSeconds=35&reducedMotion=1&stations=earth,mars');
 assert.deepEqual(configuration(configQuery(c)),c);
 assert.equal(configuration('?timezone=Invalid&latitude=100&relatedBase=javascript:alert(1)').timezone,'UTC');
 assert.equal(configuration('?latitude=100').latitude,null);assert.equal(configuration('?relatedBase=https://user:password@example.com').relatedBase,'');
});

import {groundPoint,lightTimeMinutes} from '../src/logic.js';
test('ground coordinates use known equator, pole and antimeridian reference cases',()=>{
 assert.deepEqual(groundPoint({latitude:0,longitude:0}),{x:500,y:250,longitude:0});
 assert.equal(groundPoint({latitude:90,longitude:0}).y,0);
 assert.equal(groundPoint({latitude:-90,longitude:0}).y,500);
 assert.equal(groundPoint({latitude:0,longitude:180}).x,0);
 assert.equal(groundPoint({latitude:0,longitude:100},100).x,500);
 assert.ok(Math.abs(lightTimeMinutes(299792.458*60)-1)<1e-9);
 assert.ok(Math.abs(lightTimeMinutes(225000000)-12.50865)<0.0001);
});
