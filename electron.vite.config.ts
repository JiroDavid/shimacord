import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: { __SHIMACORD_APP_ID__: JSON.stringify(process.env.SHIMACORD_APP_ID ?? '') }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { output: { format: 'cjs', entryFileNames: '[name].cjs' } }
    }
  },
  renderer: {
    root: resolve('src/renderer'),
    build: { rollupOptions: { input: resolve('src/renderer/index.html') } },
    plugins: [react()]
  }
})
