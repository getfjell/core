import { build, context } from 'esbuild';

const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  target: 'es2022',
  sourcemap: true,
  minify: false,
  external: [
    // Keep Node.js built-ins external
    'util', 'path', 'fs', 'os', 'crypto', 'stream', 'buffer', 'events', 'url',
    'querystring', 'http', 'https', 'zlib', 'net', 'tls', 'cluster', 'child_process'
  ],
  platform: 'neutral',
  mainFields: ['module', 'main'],
  conditions: ['import', 'module', 'default']
};

const isWatchMode = process.argv.includes('--watch');

async function buildESM() {
  const config = {
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/index.js',
    splitting: false,
  };

  if (isWatchMode) {
    const ctx = await context(config);
    await ctx.watch();
    console.log('Watching ES2022 build...');
    return ctx;
  } else {
    await build(config);
  }
}

async function buildAll() {
  try {
    if (isWatchMode) {
      console.log('Starting watch mode...');
      await buildESM();
      console.log('Watch mode active. Press Ctrl+C to stop.');
    } else {
      console.log('Building ES2022...');
      await buildESM();
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildAll();
