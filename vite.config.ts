import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type {Plugin} from 'vite';

function localCloudflareApiDevPlugin(): Plugin {
  return {
    name: 'event-pro-local-cf-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const mod = await import('./dev/local-worker-adapter.ts');
          const origUrl = req.url || '/';
          req.url = `/api${origUrl.startsWith('/') ? origUrl : `/${origUrl}`}`;
          await mod.handleLocalApiRequest(req, res, import.meta.dirname);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, import.meta.dirname, '');
  const mapsApiKey =
    env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  return {
    define: {
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
    },
    plugins: [
      react(),
      tailwindcss(),
      localCloudflareApiDevPlugin(),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
