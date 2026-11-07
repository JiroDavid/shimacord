import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const appId = process.env.SHIMACORD_APP_ID ?? loadEnv(mode, process.cwd(), '').SHIMACORD_APP_ID ?? ''
  return {
  main: {
    plugins: [externalizeDepsPlugin()],
    define: { __SHIMACORD_APP_ID__: JSON.stringify(appId) }
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
}
})
