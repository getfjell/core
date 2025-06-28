import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import pkg from './package.json';

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
      swcOptions: {
        sourceMaps: true,
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    }),
    // visualizer({
    //     template: 'network',
    //     filename: 'network.html',
    //     projectRoot: process.cwd(),
    // }),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      exclude: ['./tests/**/*.ts'],
      include: ['./src/**/*.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
    },
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
      input: 'src/index.ts',
      output: [
        {
          dir: 'dist/esm',
          format: 'esm',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
        },
        {
          dir: 'dist/cjs',
          format: 'cjs',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
        },
      ],
    },
    // Make sure Vite generates ESM-compatible code
    modulePreload: false,
    minify: false,
    sourcemap: true
  },
});