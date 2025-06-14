import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '', {
    envDir: process.cwd(),
    envPrefix: 'VITE_'
  })
  
  console.log('Loaded environment variables:', env)
  
  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      })
    ],
    resolve: {
      alias: {
        '@': '/src',
        stream: resolve(__dirname, 'node_modules/stream-browserify'),
        crypto: resolve(__dirname, 'node_modules/crypto-browserify'),
        util: resolve(__dirname, 'node_modules/util'),
        buffer: resolve(__dirname, 'node_modules/buffer'),
        process: resolve(__dirname, 'node_modules/process/browser'),
        zlib: resolve(__dirname, 'node_modules/browserify-zlib'),
        path: resolve(__dirname, 'node_modules/path-browserify'),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      },
    },
    optimizeDeps: {
      include: [
        'stream-browserify',
        'crypto-browserify',
        'util',
        'buffer',
        'process/browser',
        'browserify-zlib',
        'path-browserify',
      ],
      esbuildOptions: {
        target: 'esnext',
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        external: ['fsevents'],
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    define: {
      'process.env': env,
      global: 'globalThis',
    },
  }
}) 