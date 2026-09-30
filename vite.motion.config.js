import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    lib: {
      entry: resolve('src/walkthrough-motion.js'),
      name: 'WalkthroughMotion',
      formats: ['iife'],
      fileName: () => 'motion-runtime.js'
    },
    outDir: resolve('public/walkthroughs'),
    emptyOutDir: false,
    copyPublicDir: false
  }
});

