import { defineConfig } from '../web/node_modules/vite/dist/node/index.js';
import path from 'node:path';
import fs from 'node:fs';
import { api } from './server/http.mjs';
export default defineConfig({
    resolve: { alias: { three: path.resolve('../web/node_modules/three') } },
    plugins: [{ name: 'shared-planet-models', configureServer(server) { server.middlewares.use((req, res, next) => api(req, res, next).catch(next)); server.middlewares.use('/models/', (req, res, next) => { const name = req.url?.split('?')[0]; if (!['earth.glb', 'mars.glb'].includes(name))
                return next(); res.setHeader('Content-Type', 'model/gltf-binary'); fs.createReadStream(path.resolve('../web/public/models/planets', name)).pipe(res); }); } }],
    server: { fs: { allow: ['../..'] } }, build: { target: 'es2022', rollupOptions: { output: { manualChunks: { three: ['three'] } } } }
});
