import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:4321/pellet-market-intelligence/',headless:true},workers:1,reporter:'list',webServer:{command:'npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4321/pellet-market-intelligence/',reuseExistingServer:true,env:{BASE_PATH:'/pellet-market-intelligence'}}});
