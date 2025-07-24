import { DocsConfig } from '@fjell/docs-template';

const config: DocsConfig = {
  projectName: 'Fjell Core',
  basePath: '/core/',
  port: 3003,
  branding: {
    theme: 'core',
    tagline: 'Core Item and Key Framework for Fjell',
    backgroundImage: '/pano.png',
    github: 'https://github.com/getfjell/fjell-core',
    npm: 'https://www.npmjs.com/package/@fjell/core'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: '/README.md'
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/examples-README.md'
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
    },
    {
      source: '../examples/*.ts',
      destination: 'public/examples/'
    },
    {
      source: '../package.json',
      destination: 'public/package.json'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  }
}

export default config
