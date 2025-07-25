import { DocsConfig } from '@fjell/docs-template';

const config: DocsConfig = {
  projectName: 'Fjell Core',
  basePath: '/core/',
  port: 3003,
  branding: {
    theme: 'core',
    tagline: 'Core Item and Key Framework for Fjell',
    backgroundImage: './pano.png',
    github: 'https://github.com/getfjell/core',
    npm: 'https://www.npmjs.com/package/@fjell/core'
  },
  version: {
    source: 'package.json'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: '/core/README.md'
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/core/examples-README.md'
    }
  ],
  filesToCopy: [
    {
      source: '../README.md',
      destination: 'public/README.md'
    },
    {
      source: '../examples/README.md',
      destination: 'public/examples-README.md'
    }
  ],
  plugins: [],
}

export default config
