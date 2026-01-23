import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: false,
  build: {
    sourcemap: true,
    minify: true,
    cssMinify: true,
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    ...(process.env.VITE_NODE_ENV
      ? [
          sentryVitePlugin({
            org: process.env.VITE_SENTRY_ORG,
            project: process.env.VITE_SENTRY_PROJECT,
            ignore: ['node_modules', 'vite.config.ts'],
            authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
            sourcemaps: {
              assets: './dist/**',
            },
            release: process.env.VITE_SENTRY_RELEASE,
            deploy: {
              env: process.env.VITE_NODE_ENV,
            },
          }),
        ]
      : []),
  ],
  base: '/',
  define: {
    'process.env': process.env,
    VITE_CONFIG: {
      version: JSON.stringify(process.env.npm_package_version),
    },
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
  server: {
    proxy: {
      // Proxy Solana RPC calls to bypass CORS
      '/solana-rpc': {
        target:
          process.env.SOLANA_RPC_URL ||
          'https://mainnet.helius-rpc.com/?api-key=592512f9-9576-477f-ab29-7cfc9ae7d55c',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/solana-rpc/, ''),
        secure: true,
      },
      '/solana-devnet-rpc': {
        target: 'https://api.devnet.solana.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/solana-devnet-rpc/, ''),
        secure: true,
      },
      // EVM RPC proxies - set env vars or update these with your API keys
      '/eth-rpc': {
        target:
          process.env.ETH_RPC_URL ||
          'https://eth-mainnet.g.alchemy.com/v2/h4ykcxQDu4o3DzFV_X5ZS',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eth-rpc/, ''),
        secure: true,
      },
      '/polygon-rpc': {
        target:
          process.env.POLYGON_RPC_URL ||
          'https://polygon-mainnet.g.alchemy.com/v2/demo',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/polygon-rpc/, ''),
        secure: true,
      },
    },
  },
});
