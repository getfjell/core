import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import './App.css'

interface DocumentSection {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  content?: string;
}

const documentSections: DocumentSection[] = [
  { id: 'overview', title: 'Foundation', subtitle: 'Core concepts & philosophy', file: '/core/README.md' },
  { id: 'getting-started', title: 'Getting Started', subtitle: 'Your first steps with Fjell Core', file: '/core/README.md' },
  { id: 'examples', title: 'Examples', subtitle: 'Code examples & usage patterns', file: '/core/examples-README.md' },
  { id: 'api', title: 'API Reference', subtitle: 'Complete API documentation', file: '/core/api.md' }
];

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('overview')
  const [documents, setDocuments] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [version, setVersion] = useState<string>('4.4.7')

  useEffect(() => {
    const loadDocuments = async () => {
      const loadedDocs: { [key: string]: string } = {}

      for (const section of documentSections) {
        try {
          const response = await fetch(section.file)

          if (response.ok) {
            loadedDocs[section.id] = await response.text()
          } else {
            // Fallback content for missing files
            loadedDocs[section.id] = getFallbackContent(section.id)
          }
        } catch (error) {
          console.error(`Error loading ${section.file}:`, error)
          loadedDocs[section.id] = getFallbackContent(section.id)
        }
      }

      setDocuments(loadedDocs)
      setLoading(false)
    }

    const loadVersion = async () => {
      try {
        const response = await fetch('/core/package.json')
        if (response.ok) {
          const packageData = await response.json()
          setVersion(packageData.version)
        } else {
          setVersion('4.4.7') // Fallback version
        }
      } catch (error) {
        console.error('Error loading version:', error)
        setVersion('4.4.7') // Fallback version
      }
    }

    loadDocuments()
    loadVersion()
  }, [])

  const getFallbackContent = (sectionId: string): string => {
    switch (sectionId) {
      case 'overview':
        return `# Fjell Core

Core Item and Key Framework for Fjell - The foundational library that provides
essential item management, key utilities, and service coordination for the entire
Fjell ecosystem.

## Installation

\`\`\`bash
npm install @fjell/core
\`\`\`

## Quick Start

\`\`\`typescript
import { IFactory, KUtils, AItemService } from '@fjell/core'

// Create items with the factory
const item = IFactory.create('user', { id: '123', name: 'John' })

// Use key utilities for key management
const key = KUtils.generateKey(['user', '123'])

// Service coordination
const service = new AItemService()
\`\`\`

## Core Features

### Item Factory (IFactory)
- **Type-safe item creation**: Create strongly-typed items with validation
- **Flexible configuration**: Support for various item types and schemas
- **Integration ready**: Works seamlessly with other Fjell libraries

### Key Utilities (KUtils)
- **Key generation**: Create hierarchical keys for item identification
- **Key parsing**: Extract components from complex key structures
- **Key validation**: Ensure key integrity across the system

### Service Layer (AItemService)
- **Abstract service base**: Foundation for building domain services
- **Lifecycle management**: Handle service initialization and cleanup
- **Event coordination**: Built-in event handling capabilities

### Query Support (IQFactory, IQUtils)
- **Query building**: Construct complex queries for item retrieval
- **Query optimization**: Efficient query execution strategies
- **Result processing**: Transform and filter query results

## Architecture Philosophy

Fjell Core is designed around the principle of **progressive enhancement**:

1. **Start Simple**: Basic item and key operations require minimal setup
2. **Scale Gradually**: Add complexity only when needed
3. **Maintain Consistency**: Common patterns across all Fjell libraries
4. **Enable Integration**: Designed to work with the entire Fjell ecosystem

## Integration with Fjell Ecosystem

Fjell Core serves as the foundation for:

- **@fjell/registry**: Service location and dependency injection
- **@fjell/cache**: High-performance caching solutions
- **@fjell/lib**: Database abstraction layers
- **@fjell/providers**: React component state management
- **@fjell/client-api**: HTTP client utilities

## Type Safety

Built with TypeScript-first design:

\`\`\`typescript
// Strongly typed item creation
interface UserItem {
  id: string
  name: string
  email: string
}

const user = IFactory.create<UserItem>('user', {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
})

// Type-safe key operations
const userKey = KUtils.createKey(['users', user.id])
const [collection, id] = KUtils.parseKey(userKey)
\`\`\`

## Performance Characteristics

- **Minimal Runtime Overhead**: Core operations are highly optimized
- **Memory Efficient**: Smart object pooling and reuse strategies
- **Lazy Loading**: Components load only when needed
- **Tree Shaking**: Only bundle what you use

## Testing Support

Comprehensive testing utilities:

\`\`\`typescript
import { TestUtils } from '@fjell/core/testing'

// Mock factories for testing
const mockFactory = TestUtils.createMockFactory()
const testItem = mockFactory.create('test', { id: 'test-123' })

// Assertion helpers
expect(TestUtils.isValidKey(key)).toBe(true)
expect(TestUtils.getKeyComponents(key)).toEqual(['users', '123'])
\`\`\`

## Error Handling

Robust error handling with descriptive messages:

\`\`\`typescript
try {
  const item = IFactory.create('invalid-type', data)
} catch (error) {
  if (error instanceof CoreValidationError) {
    console.log('Validation failed:', error.details)
  }
}
\`\`\`

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API reference
- **Examples**: Real-world usage patterns and best practices
- **Community**: Join discussions and get support

Start building with Fjell Core today and experience the power of a well-designed
foundational framework that grows with your application needs.`

      case 'getting-started':
        return `# Getting Started with Fjell Core

Welcome to Fjell Core! This guide will help you get up and running quickly.

## Installation

\`\`\`bash
# Using npm
npm install @fjell/core

# Using yarn
yarn add @fjell/core

# Using pnpm
pnpm add @fjell/core
\`\`\`

## Basic Usage

### 1. Item Creation with IFactory

\`\`\`typescript
import { IFactory } from '@fjell/core'

// Define your item type
interface User {
  id: string
  name: string
  email: string
}

// Create an item
const user = IFactory.create<User>('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com'
})

console.log(user) // Strongly typed User item
\`\`\`

### 2. Key Management with KUtils

\`\`\`typescript
import { KUtils } from '@fjell/core'

// Generate hierarchical keys
const userKey = KUtils.generateKey(['users', 'user-123'])
const profileKey = KUtils.generateKey(['users', 'user-123', 'profile'])

// Parse keys back to components
const components = KUtils.parseKey(userKey)
console.log(components) // ['users', 'user-123']

// Validate keys
const isValid = KUtils.isValidKey(userKey)
console.log(isValid) // true
\`\`\`

### 3. Service Layer with AItemService

\`\`\`typescript
import { AItemService } from '@fjell/core'

class UserService extends AItemService {
  async createUser(userData: Partial<User>): Promise<User> {
    // Your business logic here
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      ...userData
    })

    // Use the service's built-in methods
    await this.validate(user)
    return this.save(user)
  }

  private generateId(): string {
    return \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

// Use the service
const userService = new UserService()
const newUser = await userService.createUser({
  name: 'Jane Smith',
  email: 'jane@example.com'
})
\`\`\`

### 4. Query Building with IQFactory

\`\`\`typescript
import { IQFactory, IQUtils } from '@fjell/core'

// Build queries for item retrieval
const query = IQFactory.create('user')
  .where('status', 'active')
  .where('role', 'admin')
  .limit(10)
  .orderBy('createdAt', 'desc')

// Execute queries (integration with your data layer)
const results = await IQUtils.execute(query)
console.log(results) // Array of matching User items
\`\`\`

## Next Steps

1. **Explore Examples**: Check out our comprehensive examples
2. **API Reference**: Review the complete API documentation
3. **Integration**: Learn how to integrate with other Fjell libraries
4. **Testing**: Set up testing with Fjell Core utilities

Ready to build something amazing with Fjell Core!`

      case 'examples':
        return `# Fjell Core Examples

Examples are loading from the examples directory...

If you're seeing this message, there may be an issue loading the examples content.
Please check the console for any errors.`

      case 'api':
        return `# Fjell Core API Reference

Complete API documentation for all Fjell Core modules.

## IFactory

Factory for creating strongly-typed items.

### Methods

#### \`create<T>(type: string, data: Partial<T>): T\`
Creates a new item of the specified type.

**Parameters:**
- \`type\`: String identifier for the item type
- \`data\`: Partial item data to initialize the item

**Returns:** Fully constructed item of type T

**Example:**
\`\`\`typescript
const user = IFactory.create<User>('user', {
  id: 'user-123',
  name: 'John Doe'
})
\`\`\`

## KUtils

Utilities for key generation and manipulation.

### Methods

#### \`generateKey(components: string[]): string\`
Generates a hierarchical key from components.

**Parameters:**
- \`components\`: Array of string components

**Returns:** Generated key string

**Example:**
\`\`\`typescript
const key = KUtils.generateKey(['users', 'user-123', 'profile'])
// Returns: "users:user-123:profile"
\`\`\`

#### \`parseKey(key: string): string[]\`
Parses a key back into its components.

#### \`isValidKey(key: string): boolean\`
Validates whether a key is properly formatted.

## AItemService

Abstract base class for building domain services.

### Methods

#### \`validate<T>(item: T): Promise<void>\`
Validates an item. Override in subclasses.

#### \`save<T>(item: T): Promise<T>\`
Saves an item. Override in subclasses.

#### \`findById<T>(id: string): Promise<T | null>\`
Finds an item by ID. Override in subclasses.

## IQFactory

Factory for building queries.

### Methods

#### \`create(type: string): QueryBuilder\`
Creates a new query builder for the specified type.

This API reference provides complete coverage of all Fjell Core functionality.`

      default:
        return `# ${sectionId}

Documentation for this section is being prepared.

Please check back soon for comprehensive content.`
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const currentSectionData = documentSections.find(section => section.id === currentSection)
  const currentContent = documents[currentSection]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading documentation...
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="brand">
            <h1 className="brand-title">
              <span className="brand-fjell">Fjell</span>
              <span className="brand-core">Core</span>
            </h1>
            <p className="brand-tagline">Core Item and Key Framework for Fjell</p>
          </div>

          <div className="header-actions">
            <span className="version-badge">v{version}</span>
            <a
              href="https://github.com/getfjell/fjell-core"
              className="header-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
            <a
              href="https://www.npmjs.com/package/@fjell/core"
              className="header-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Install Package
            </a>
          </div>

          <button
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="layout">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Documentation</h2>
              <p className="sidebar-subtitle">Core concepts & philosophy</p>
            </div>

            <div className="nav-menu">
              {documentSections.map((section) => (
                <button
                  key={section.id}
                  className={`nav-item ${currentSection === section.id ? 'nav-item-active' : ''}`}
                  onClick={() => {
                    setCurrentSection(section.id)
                    setSidebarOpen(false)
                  }}
                >
                  <span className="nav-item-title">{section.title}</span>
                  <span className="nav-item-subtitle">{section.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main">
          <div className="main-content">
            {currentSectionData && (
              <div className="section-header">
                <h1 className="section-title">{currentSectionData.title}</h1>
                <p className="section-subtitle">{currentSectionData.subtitle}</p>
              </div>
            )}

            <div className="content">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneLight as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                    img({ src, alt, ...props }) {
                      return (
                        <img
                          src={src}
                          alt={alt}
                          {...props}
                          onClick={() => src && setFullscreenImage(src)}
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    },
                    a({ href, children, ...props }) {
                      // Handle links to .ts files specially - load and display code
                      if (href && href.endsWith('.ts')) {
                        return (
                          <button
                            className="code-example-link"
                            onClick={async () => {
                              try {
                                const response = await fetch(href.startsWith('/') ? `/core${href}` : `/core/${href}`)
                                if (response.ok) {
                                  const code = await response.text()
                                  // Create a modal or section to display the code
                                  const codeSection = document.createElement('div')
                                  codeSection.className = 'code-example-modal'
                                  codeSection.innerHTML = `
                                    <div class="code-example-content">
                                      <div class="code-example-header">
                                        <h3>${href}</h3>
                                        <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                                      </div>
                                      <pre><code class="language-typescript">${code}</code></pre>
                                    </div>
                                  `
                                  document.body.appendChild(codeSection)
                                } else {
                                  console.error('Failed to load code example:', href)
                                }
                              } catch (error) {
                                console.error('Error loading code example:', error)
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0066cc',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              padding: 0,
                              font: 'inherit'
                            }}
                          >
                            {children}
                          </button>
                        )
                      }

                      // Regular links
                      return (
                        <a href={href} {...props}>
                          {children}
                        </a>
                      )
                    }
                  }}
                >
                  {currentContent || 'Loading content...'}
                </ReactMarkdown>
              </div>

              {/* Navigation suggestions */}
              <div className="nav-suggestions">
                {documentSections.map((section) => {
                  if (section.id === currentSection) return null
                  return (
                    <button
                      key={section.id}
                      className="nav-suggestion"
                      onClick={() => setCurrentSection(section.id)}
                    >
                      <span className="nav-suggestion-label">Next</span>
                      <span className="nav-suggestion-title">{section.title}</span>
                    </button>
                  )
                }).filter(Boolean).slice(0, 1)}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <p className="footer-text">
              Crafted with intention for the Fjell ecosystem
            </p>
            <p className="footer-license">
              Licensed under Apache-2.0 &nbsp;•&nbsp; 2024
            </p>
          </div>
        </div>
      </footer>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <div className="fullscreen-content">
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="fullscreen-image"
            />
            <button
              className="close-button"
              onClick={() => setFullscreenImage(null)}
              aria-label="Close fullscreen view"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? 'mobile-overlay-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  )
}

export default App
