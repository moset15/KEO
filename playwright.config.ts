import {defineConfig} from '@playwright/test';export default defineConfig({testDir:'tests/browser',use:{baseURL:'http://127.0.0.1:8787',viewport:{width:360,height:800}},reporter:'list',workers:1});
