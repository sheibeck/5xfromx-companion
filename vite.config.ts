import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),basicSsl()],
  resolve: {
      alias: [
      {
        find: './runtimeConfig',
        replacement: './runtimeConfig.browser', // ensures browser compatible version of AWS JS SDK is used
      },
    ]
  },
  server: {
    https: true,
    port: 5174
  }
})
