import { build } from '../../web/node_modules/vite/dist/node/index.js';
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
await build();
await mkdir('dist/models', { recursive: true });
for (const name of ['earth', 'mars'])
    await cp(`../web/public/models/planets/${name}.glb`, `dist/models/${name}.glb`);
const assets = (await readdir('dist/assets')).filter(f => /\.(js|css)$/.test(f)).map(f => '/assets/' + f);
const sw = await readFile('dist/sw.js', 'utf8');
await writeFile('dist/sw.js', sw.replace('starkid-display-v1', 'starkid-display-' + assets.find(a => a.includes('index-') && a.endsWith('.js')).split('/').at(-1)).replace("['/','/models/earth.glb','/models/mars.glb']", JSON.stringify(['/', '/models/earth.glb', '/models/mars.glb', ...assets])));
