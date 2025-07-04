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
  
  // Only expose safe environment variables to frontend
  const safeEnv = {
    VITE_PLATFORM_FEE_RECEIVER: env.VITE_PLATFORM_FEE_RECEIVER,
    VITE_ETHEREUM_RPC_URL: env.VITE_ETHEREUM_RPC_URL,
    VITE_SEPOLIA_RPC_URL: env.VITE_SEPOLIA_RPC_URL,
    VITE_BASE_RPC_URL: env.VITE_BASE_RPC_URL,
    VITE_ALCHEMY_API_KEY: env.VITE_ALCHEMY_API_KEY,
    VITE_BASESCAN_API_KEY: env.VITE_BASESCAN_API_KEY,
    VITE_ETHERSCAN_API_KEY: env.VITE_ETHERSCAN_API_KEY,
    VITE_BSCSCAN_API_KEY: env.VITE_BSCSCAN_API_KEY,
    VITE_AVALANCHE_API_KEY: env.VITE_AVALANCHE_API_KEY,
    VITE_POLYGONSCAN_API_KEY: env.VITE_POLYGONSCAN_API_KEY,
    VITE_REPORT_GAS: env.VITE_REPORT_GAS,
    NODE_ENV: env.NODE_ENV
  }
  
  console.log('Loaded safe environment variables for frontend:', safeEnv)
  
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
      'process.env': safeEnv,
      global: 'globalThis',
    },
  }
}) 