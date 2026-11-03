// Real-time soak: no mocked clock, fixtures, forced GC, or duration compression.
import { writeFile, appendFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const minutes = Number(process.env.SOAK_MINUTES || 120);
if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw Error('SOAK_MINUTES must be 1–1440');
const base = process.env.DISPLAY_URL || 'http://localhost:4174';
const output = process.env.SOAK_OUTPUT || '/tmp/starkid-display-soak.json';
const evidence = process.env.SOAK_EVIDENCE_DIR || path.join(path.dirname(output), 'soak-evidence');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: process.env.SOFTWARE_GL === '1' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const browserCdp = await browser.newBrowserCDPSession();
await cdp.send('Performance.enable');
const started = Date.now(), duration = minutes * 60000;
const report = { status: 'running', startedAt: new Date(started).toISOString(), requestedMinutes: minutes,
  url: base, viewport: '1920x1080', quality: process.env.SOAK_QUALITY || 'high',
  softwareWebGL: process.env.SOFTWARE_GL === '1', mockedClock: false, samples: [], events: [], errors: [], warnings: [], consoleErrors: [], failedRequests: [] };
let offline = false, interrupted = false, recovered = false, previousStation = '', previousFrame = 0;
const consoleLog = path.join(evidence, 'console.jsonl');
function log(kind, detail) {
  const item = { at: new Date().toISOString(), elapsedSeconds: (Date.now() - started) / 1000, offline, ...detail };
  if (report[kind]) report[kind].push(item);
  appendFile(consoleLog, JSON.stringify({ kind, ...item }) + '\n').catch(() => {});
}
page.on('pageerror', error => log('errors', { message: error.message }));
page.on('crash', () => log('errors', { message: 'Renderer process crashed' }));
page.on('console', message => {
  if (message.type() === 'error') log('consoleErrors', { message: message.text().slice(0, 1200) });
  if (message.type() === 'warning') log('warnings', { message: message.text().slice(0, 1200) });
});
page.on('requestfailed', request => log('failedRequests', { url: request.url(), message: request.failure()?.errorText }));
async function persist() {
  report.elapsedMinutes = (Date.now() - started) / 60000;
  await writeFile(output + '.tmp', JSON.stringify(report, null, 2));
  await rename(output + '.tmp', output);
}
async function screenshot(name) { await page.screenshot({ path: path.join(evidence, name + '.png'), timeout: 20000 }); }
async function sample() {
  const metrics = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const processes = (await browserCdp.send('SystemInfo.getProcessInfo')).processInfo;
  let browserRssKiB = null;
  try {
    const result = await exec('ps', ['-o', 'rss=', '-p', processes.map(p => p.id).join(',')]);
    browserRssKiB = result.stdout.trim().split(/\s+/).reduce((sum, value) => sum + Number(value), 0);
  } catch { /* RSS may be unavailable on some hosts; JS heap is still captured. */ }
  const view = await page.evaluate(() => ({ ...window.__starkidDisplayDiagnostics?.(),
    title: document.querySelector('h1')?.textContent, status: document.querySelector('#connection')?.textContent,
    utc: document.querySelector('#clock')?.textContent,
    primaryScene: { width: document.querySelector('.viewport')?.clientWidth, height: document.querySelector('.viewport')?.clientHeight },
    pendingImages: [...document.images].filter(i => !i.complete).length,
    brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
    staleLabels: [...document.querySelectorAll('.source')].filter(e => e.textContent.includes('STALE')).length,
    visibleFallback: document.querySelector('.fallback')?.textContent || null }));
  const item = { at: new Date().toISOString(), elapsedSeconds: (Date.now() - started) / 1000,
    offline, browserRssKiB, heap: metrics.JSHeapUsedSize, heapTotal: metrics.JSHeapTotalSize,
    nodes: metrics.Nodes, documents: metrics.Documents, taskDuration: metrics.TaskDuration, ...view };
  item.framesSinceSample = view.renderFrame - previousFrame;
  previousFrame = view.renderFrame;
  report.samples.push(item);
  if (view.station !== previousStation) {
    log('events', { type: 'station-change', station: view.station });
    previousStation = view.station;
    if (!report.events.some(e => e.type === 'station-screenshot' && e.station === view.station)) {
      await screenshot('station-' + view.station);
      log('events', { type: 'station-screenshot', station: view.station });
    }
  }
  if (!offline && interrupted && !recovered && /CURRENT|PARTIAL/.test(view.status || '')) {
    recovered = true;
    log('events', { type: 'browser-network-restored', status: view.status });
    await screenshot('after-network-restoration');
  }
  return item;
}
try {
  await page.goto(base + '/broadcast?seconds=120&tourSeconds=20&quality=' + report.quality + '&kiosk=1');
  await page.locator('h1').waitFor();
  let lastHeartbeat = 0, lastScreen = 0;
  while (Date.now() - started < duration) {
    const elapsed = Date.now() - started;
    if (!interrupted && elapsed >= duration * .45) {
      interrupted = true; await screenshot('before-network-interruption');
      await context.setOffline(true); offline = true; log('events', { type: 'browser-network-disconnected', durationSeconds: 90 });
    }
    const disconnect = report.events.find(e => e.type === 'browser-network-disconnected');
    if (offline && Date.now() - Date.parse(disconnect.at) >= 90000) {
      await screenshot('during-network-interruption');
      await context.setOffline(false); offline = false; log('events', { type: 'browser-network-reconnected' });
    }
    const item = await sample();
    if (elapsed - lastScreen >= 600000) { await screenshot('elapsed-' + Math.floor(elapsed / 60000) + 'm'); lastScreen = elapsed; }
    await persist();
    if (elapsed - lastHeartbeat >= 60000 || !lastHeartbeat) {
      console.log(JSON.stringify({ progressMinutes: Number(report.elapsedMinutes.toFixed(2)), station: item.station,
        heapMiB: +(item.heap / 1048576).toFixed(1), browserRssMiB: item.browserRssKiB ? +(item.browserRssKiB / 1024).toFixed(1) : null,
        status: item.status, exceptions: report.errors.length, offline }));
      lastHeartbeat = elapsed;
    }
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  if (offline) { await context.setOffline(false); offline = false; }
  await sample(); await screenshot('final');
  report.status = 'completed'; report.endedAt = new Date().toISOString();
  const stations = [...new Set(report.events.filter(e => e.type === 'station-change').map(e => e.station))];
  const sampleGaps=report.samples.slice(1).map((sample,i)=>sample.elapsedSeconds-report.samples[i].elapsedSeconds);
  report.samplingContinuity={maximumGapSeconds:Math.max(0,...sampleGaps),gapsOver45Seconds:sampleGaps.filter(gap=>gap>45).length};
  report.acceptance = { uninterruptedSampling:sampleGaps.every(gap=>gap<=45), fullDuration: Date.now() - started >= duration, allFourStations: stations.length === 4,
    noPageExceptions: report.errors.length === 0, networkInterruptionExecuted: interrupted, browserRecoveryObserved: recovered,
    oneRenderer: report.samples.every(s => s.rendererCount === 1), boundedFeedCount: report.samples.every(s => s.feedCount <= 7),
    minimumSceneSize: report.samples.every(s => s.primaryScene?.width > 100 && s.primaryScene?.height > 100) };
  await persist(); console.log('SOAK_COMPLETE ' + output);
  if (Object.values(report.acceptance).some(value => !value)) process.exitCode = 1;
} catch (error) {
  report.status = 'failed'; log('errors', { message: error.stack }); await persist(); throw error;
} finally { await browser.close(); }
