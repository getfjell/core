import { build } from 'esbuild';

// Build cross-platform version that works in both Node.js and browser
console.log('Building cross-platform version...');
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'neutral', // Neutral platform for cross-platform compatibility
  target: 'es2022',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    'console',
    '@fjell/logging',
    'deepmerge',
    'luxon'
  ], // Keep external dependencies as they should be installed separately
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  metafile: true,
  minify: false, // Keep readable for debugging
});

console.log('Build completed successfully!');
console.log(`- Cross-platform build: dist/index.js`);
console.log('This build works in both Node.js and browser environments');
