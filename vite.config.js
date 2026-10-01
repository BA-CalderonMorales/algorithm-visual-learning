import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ command, isPreview }) => ({
  plugins: [svelte()],
  base: command === 'build' || isPreview ? '/algorithm-visual-learning/' : '/',
}));
