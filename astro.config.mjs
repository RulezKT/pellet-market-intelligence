import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
export default defineConfig({output:'static',site:process.env.SITE_URL || 'https://example.github.io',base:process.env.BASE_PATH || '/',integrations:[react()],vite:{plugins:[tailwind()]}});