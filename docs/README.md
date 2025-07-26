# Fjell Core Documentation Website

This directory contains the documentation website for Fjell Core, built with React and Vite.

## Development

To run the documentation site locally:

```bash
cd docs
npm install
npm run dev
```

The site will be available at `http://localhost:5173`.

## Building

To build the documentation site:

```bash
npm run build
```

The built site will be in the `dist` directory.

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the `.github/workflows/deploy-docs.yml` workflow.

## Structure

- `src/` - React application source code
- `public/` - Static assets and files served by the website
- `dist/` - Built website output (generated)

## Content

The website pulls content from:

- `../README.md` - Main project documentation
- `../examples/README.md` - Examples documentation
- `../examples/*.ts` - Example code files
- `../package.json` - Version information

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **GitHub Pages** - Hosting platform
