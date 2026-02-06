import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ajayvardhan.com',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
