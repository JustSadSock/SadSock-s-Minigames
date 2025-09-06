import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        avatar: resolve(__dirname, 'avatar-editor.html'),
        arena: resolve(__dirname, 'arena.html'),
        dodge: resolve(__dirname, 'dodge-rain.html'),
        memory: resolve(__dirname, 'memory-flip.html'),
        miniRogue: resolve(__dirname, 'mini-rogue.html'),
        music: resolve(__dirname, 'music-box.html'),
        animator: resolve(__dirname, 'pixel-animator.html'),
        pong: resolve(__dirname, 'pixel-pong.html'),
        snake: resolve(__dirname, 'pixel-snake.html'),
        breakout: resolve(__dirname, 'retro-breakout.html'),
        rhythm: resolve(__dirname, 'rhythm.html'),
        tower: resolve(__dirname, 'tower.html')
      }
    }
  },
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 5 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ name: 'removeViewBox', active: false }] }
    }),
    viteCompression()
  ]
});
