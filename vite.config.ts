import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParadoxUI',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // Radix primitives stay bundled — they are small and it keeps the output
      // predictable. Everything heavy is kept external instead: it is only
      // reachable through one component, and consumers get it from this
      // package's own `dependencies`. Bundling recharts or embla would roughly
      // double the output for code most consumers never import.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-markdown',
        'remark-gfm',
        'rehype-highlight',
        'react-hook-form',
        '@tanstack/react-virtual',
        'embla-carousel-react',
        'react-resizable-panels',
        'recharts',
        'qrcode.react',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: 'styles.css',
      },
    },
    cssCodeSplit: false,
  },
})
