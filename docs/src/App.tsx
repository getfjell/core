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
  { id: 'getting-started', title: 'Getting Started', subtitle: 'Your first steps with Fjell Core', file: '/core/examples-README.md' },
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
          console.log('Version loaded:', packageData.version)
        } else {
          console.error('Failed to fetch package.json:', response.status)
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

\\\`\\\`\\\`bash
npm install @fjell/core
\\\`\\\`\\\`

## Quick Start

\\\`\\\`\\\`typescript
import { IFactory, KUtils, AItemService } from '@fjell/core'

// Create items with the factory
const item = IFactory.create('user', { id: '123', name: 'John' })

// Use key utilities for key management
const key = KUtils.generateKey(['user', '123'])

// Service coordination
const service = new AItemService()
\\\`\\\`\\\`

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

## Common Patterns

### Pattern 1: Repository Pattern

\`\`\`typescript
import { AItemService, IFactory, KUtils } from '@fjell/core'

class UserRepository extends AItemService {
  private users = new Map<string, User>()

  async save(user: User): Promise<User> {
    const key = KUtils.generateKey(['users', user.id])
    this.users.set(key, user)
    return user
  }

  async findById(id: string): Promise<User | null> {
    const key = KUtils.generateKey(['users', id])
    return this.users.get(key) || null
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      ...userData
    })
    return this.save(user)
  }
}
\`\`\`

### Pattern 2: Factory with Validation

\`\`\`typescript
import { IFactory } from '@fjell/core'

class ValidatedUserFactory {
  static create(data: Partial<User>): User {
    // Pre-validation
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Valid email is required')
    }

    // Create with IFactory
    const user = IFactory.create<User>('user', {
      id: data.id || this.generateId(),
      name: data.name || 'Unknown',
      email: data.email,
      createdAt: new Date().toISOString(),
      ...data
    })

    // Post-validation
    this.validateUser(user)
    return user
  }

  private static validateUser(user: User): void {
    if (user.name.length < 2) {
      throw new Error('Name must be at least 2 characters')
    }
  }

  private static generateId(): string {
    return \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  }
}
\`\`\`

### Pattern 3: Service Composition

\`\`\`typescript
import { AItemService } from '@fjell/core'

class UserService extends AItemService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {
    super()
  }

  async registerUser(userData: Partial<User>): Promise<User> {
    // Create user
    const user = await this.userRepo.create(userData)

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user)

    // Log activity
    this.logActivity('user_registered', { userId: user.id })

    return user
  }
}
\`\`\`

## Next Steps

1. **Explore Examples**: Check out our comprehensive examples
2. **API Reference**: Review the complete API documentation
3. **Integration**: Learn how to integrate with other Fjell libraries
4. **Testing**: Set up testing with Fjell Core utilities

## Need Help?

- Check the **Examples** section for more code samples
- Review the **API Reference** for detailed documentation
- Visit our GitHub repository for issues and discussions
- Join our community for support and best practices

Ready to build something amazing with Fjell Core!`

      case 'examples':
        return `# Fjell Core Examples

Comprehensive examples showing real-world usage patterns for Fjell Core.

## Basic Examples

### Item Factory Usage

\`\`\`typescript
import { IFactory } from '@fjell/core'

// Simple item creation
const user = IFactory.create('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
})

// With type safety
interface Product {
  id: string
  name: string
  price: number
  category: string
}

const product = IFactory.create<Product>('product', {
  id: 'prod-456',
  name: 'Laptop',
  price: 999.99,
  category: 'Electronics'
})
\`\`\`

### Key Utilities

\`\`\`typescript
import { KUtils } from '@fjell/core'

// Hierarchical key generation
const userKey = KUtils.generateKey(['users', 'user-123'])
const orderKey = KUtils.generateKey(['users', 'user-123', 'orders', 'order-456'])

// Key parsing and validation
const components = KUtils.parseKey(orderKey)
// Result: ['users', 'user-123', 'orders', 'order-456']

const isValid = KUtils.isValidKey(userKey)
// Result: true

// Key manipulation
const parentKey = KUtils.getParentKey(orderKey)
// Result: key for ['users', 'user-123', 'orders']
\`\`\`

## Advanced Examples

### Custom Service Implementation

\`\`\`typescript
import { AItemService, IFactory, KUtils } from '@fjell/core'

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: string
}

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

class OrderService extends AItemService {
  private orders = new Map<string, Order>()

  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    const order = IFactory.create<Order>('order', {
      id: this.generateOrderId(),
      userId,
      items,
      total: this.calculateTotal(items),
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    await this.validateOrder(order)
    await this.save(order)

    return order
  }

  async confirmOrder(orderId: string): Promise<Order> {
    const order = await this.findById(orderId)
    if (!order) {
      throw new Error(\`Order \${orderId} not found\`)
    }

    const updatedOrder = {
      ...order,
      status: 'confirmed' as const
    }

    await this.save(updatedOrder)
    return updatedOrder
  }

  private async save(order: Order): Promise<void> {
    const key = KUtils.generateKey(['orders', order.id])
    this.orders.set(key, order)
  }

  private async findById(id: string): Promise<Order | null> {
    const key = KUtils.generateKey(['orders', id])
    return this.orders.get(key) || null
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  private generateOrderId(): string {
    return \`order-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  }

  private async validateOrder(order: Order): Promise<void> {
    if (order.items.length === 0) {
      throw new Error('Order must contain at least one item')
    }

    if (order.total <= 0) {
      throw new Error('Order total must be greater than zero')
    }
  }
}
\`\`\`

### Query Builder Pattern

\`\`\`typescript
import { IQFactory, IQUtils } from '@fjell/core'

class ProductQueryBuilder {
  private query = IQFactory.create('product')

  inCategory(category: string): this {
    this.query = this.query.where('category', category)
    return this
  }

  priceRange(min: number, max: number): this {
    this.query = this.query
      .where('price', '>=', min)
      .where('price', '<=', max)
    return this
  }

  available(): this {
    this.query = this.query.where('inStock', true)
    return this
  }

  sortByPrice(direction: 'asc' | 'desc' = 'asc'): this {
    this.query = this.query.orderBy('price', direction)
    return this
  }

  limit(count: number): this {
    this.query = this.query.limit(count)
    return this
  }

  async execute(): Promise<Product[]> {
    return IQUtils.execute(this.query)
  }

  build() {
    return this.query
  }
}

// Usage
const expensiveLaptops = await new ProductQueryBuilder()
  .inCategory('Electronics')
  .priceRange(1000, 5000)
  .available()
  .sortByPrice('desc')
  .limit(10)
  .execute()
\`\`\`

### Repository with Caching

\`\`\`typescript
import { AItemService, IFactory, KUtils } from '@fjell/core'

class CachedUserRepository extends AItemService {
  private cache = new Map<string, User>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  async findById(id: string): Promise<User | null> {
    const key = KUtils.generateKey(['users', id])

    // Check cache first
    if (this.isInCache(key)) {
      return this.cache.get(key) || null
    }

    // Fetch from data source
    const user = await this.fetchFromDatabase(id)

    if (user) {
      this.setCache(key, user)
    }

    return user
  }

  async save(user: User): Promise<User> {
    // Save to database
    await this.saveToDatabase(user)

    // Update cache
    const key = KUtils.generateKey(['users', user.id])
    this.setCache(key, user)

    return user
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...userData
    })

    return this.save(user)
  }

  private isInCache(key: string): boolean {
    if (!this.cache.has(key)) {
      return false
    }

    const expiry = this.cacheExpiry.get(key)
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return false
    }

    return true
  }

  private setCache(key: string, user: User): void {
    this.cache.set(key, user)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL)
  }

  private async fetchFromDatabase(id: string): Promise<User | null> {
    // Simulate database fetch
    // In real implementation, this would query your database
    return null
  }

  private async saveToDatabase(user: User): Promise<void> {
    // Simulate database save
    // In real implementation, this would save to your database
  }

  private generateId(): string {
    return \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  }
}
\`\`\`

## Integration Examples

### With Express.js

\`\`\`typescript
import express from 'express'
import { AItemService, IFactory } from '@fjell/core'

const app = express()
app.use(express.json())

class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: express.Request, res: express.Response) {
    try {
      const user = await this.userService.create(req.body)
      res.status(201).json(user)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  async getUser(req: express.Request, res: express.Response) {
    try {
      const user = await this.userService.findById(req.params.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      res.json(user)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

const userService = new UserService()
const userController = new UserController(userService)

app.post('/users', userController.createUser.bind(userController))
app.get('/users/:id', userController.getUser.bind(userController))

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
\`\`\`

### Testing Examples

\`\`\`typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { IFactory, KUtils, AItemService } from '@fjell/core'

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
  })

  it('should create a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    }

    const user = await userService.create(userData)

    expect(user.id).toBeDefined()
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
    expect(user.createdAt).toBeDefined()
  })

  it('should generate valid keys for users', () => {
    const userId = 'user-123'
    const key = KUtils.generateKey(['users', userId])

    expect(KUtils.isValidKey(key)).toBe(true)

    const components = KUtils.parseKey(key)
    expect(components).toEqual(['users', userId])
  })

  it('should create items with IFactory', () => {
    const itemData = {
      id: 'test-123',
      name: 'Test Item',
      value: 42
    }

    const item = IFactory.create('testItem', itemData)

    expect(item.id).toBe(itemData.id)
    expect(item.name).toBe(itemData.name)
    expect(item.value).toBe(itemData.value)
  })
})
\`\`\`

## Performance Examples

### Batch Operations

\`\`\`typescript
import { AItemService, IFactory, KUtils } from '@fjell/core'

class BatchUserService extends AItemService {
  async createUsers(userData: Partial<User>[]): Promise<User[]> {
    const users = userData.map(data =>
      IFactory.create<User>('user', {
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        ...data
      })
    )

    // Validate all users
    await Promise.all(users.map(user => this.validateUser(user)))

    // Batch save
    await this.saveAll(users)

    return users
  }

  private async saveAll(users: User[]): Promise<void> {
    // Simulate batch save operation
    const savePromises = users.map(user => this.save(user))
    await Promise.all(savePromises)
  }

  private async save(user: User): Promise<void> {
    // Individual save logic
  }

  private async validateUser(user: User): Promise<void> {
    // Validation logic
  }

  private generateId(): string {
    return \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  }
}
\`\`\`

These examples demonstrate the flexibility and power of Fjell Core for building
robust, type-safe applications with clean architecture patterns.`

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

#### \`createWithDefaults<T>(type: string, data: Partial<T>, defaults: Partial<T>): T\`
Creates an item with default values applied.

**Parameters:**
- \`type\`: String identifier for the item type
- \`data\`: Partial item data
- \`defaults\`: Default values to apply

**Returns:** Constructed item with defaults applied

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

**Parameters:**
- \`key\`: Key string to parse

**Returns:** Array of key components

#### \`isValidKey(key: string): boolean\`
Validates whether a key is properly formatted.

**Parameters:**
- \`key\`: Key string to validate

**Returns:** Boolean indicating validity

#### \`getParentKey(key: string): string | null\`
Gets the parent key by removing the last component.

**Parameters:**
- \`key\`: Child key

**Returns:** Parent key or null if no parent

## AItemService

Abstract base class for building domain services.

### Properties

#### \`logger: Logger\`
Logger instance for the service.

### Methods

#### \`validate<T>(item: T): Promise<void>\`
Validates an item. Override in subclasses.

**Parameters:**
- \`item\`: Item to validate

**Throws:** ValidationError if invalid

#### \`save<T>(item: T): Promise<T>\`
Saves an item. Override in subclasses.

**Parameters:**
- \`item\`: Item to save

**Returns:** Saved item

#### \`findById<T>(id: string): Promise<T | null>\`
Finds an item by ID. Override in subclasses.

**Parameters:**
- \`id\`: Item identifier

**Returns:** Found item or null

#### \`delete(id: string): Promise<void>\`
Deletes an item by ID. Override in subclasses.

**Parameters:**
- \`id\`: Item identifier to delete

## IQFactory

Factory for building queries.

### Methods

#### \`create(type: string): QueryBuilder\`
Creates a new query builder for the specified type.

**Parameters:**
- \`type\`: Entity type to query

**Returns:** QueryBuilder instance

**Example:**
\`\`\`typescript
const query = IQFactory.create('user')
  .where('status', 'active')
  .limit(10)
\`\`\`

## QueryBuilder

Builder for constructing queries.

### Methods

#### \`where(field: string, value: any): QueryBuilder\`
Adds a where condition.

#### \`where(field: string, operator: string, value: any): QueryBuilder\`
Adds a where condition with operator.

**Parameters:**
- \`field\`: Field name
- \`operator\`: Comparison operator ('=', '>', '<', '>=', '<=', '!=')
- \`value\`: Value to compare

**Returns:** QueryBuilder for chaining

#### \`orderBy(field: string, direction?: 'asc' | 'desc'): QueryBuilder\`
Adds ordering to the query.

**Parameters:**
- \`field\`: Field to order by
- \`direction\`: Sort direction (default: 'asc')

**Returns:** QueryBuilder for chaining

#### \`limit(count: number): QueryBuilder\`
Limits the number of results.

**Parameters:**
- \`count\`: Maximum number of results

**Returns:** QueryBuilder for chaining

#### \`offset(count: number): QueryBuilder\`
Sets the result offset.

**Parameters:**
- \`count\`: Number of results to skip

**Returns:** QueryBuilder for chaining

## IQUtils

Utilities for query execution and manipulation.

### Methods

#### \`execute<T>(query: QueryBuilder): Promise<T[]>\`
Executes a query and returns results.

**Parameters:**
- \`query\`: Query to execute

**Returns:** Array of matching items

#### \`count(query: QueryBuilder): Promise<number>\`
Counts the number of results for a query.

**Parameters:**
- \`query\`: Query to count

**Returns:** Number of matching items

#### \`exists(query: QueryBuilder): Promise<boolean>\`
Checks if any results exist for a query.

**Parameters:**
- \`query\`: Query to check

**Returns:** Boolean indicating existence

## ItemQuery

Interface for query objects.

### Properties

#### \`type: string\`
The entity type being queried.

#### \`conditions: WhereCondition[]\`
Array of where conditions.

#### \`orderBy?: OrderByClause[]\`
Optional ordering clauses.

#### \`limit?: number\`
Optional result limit.

#### \`offset?: number\`
Optional result offset.

## WhereCondition

Interface for query conditions.

### Properties

#### \`field: string\`
Field name to filter on.

#### \`operator: string\`
Comparison operator.

#### \`value: any\`
Value to compare against.

## OrderByClause

Interface for ordering specifications.

### Properties

#### \`field: string\`
Field to order by.

#### \`direction: 'asc' | 'desc'\`
Sort direction.

## Error Types

### \`CoreValidationError\`
Thrown when item validation fails.

**Properties:**
- \`message: string\`: Error message
- \`details: ValidationDetail[]\`: Validation failure details

### \`CoreNotFoundError\`
Thrown when a requested item is not found.

**Properties:**
- \`message: string\`: Error message
- \`id: string\`: ID of the missing item

### \`CoreOperationError\`
Thrown when an operation fails.

**Properties:**
- \`message: string\`: Error message
- \`operation: string\`: Name of the failed operation

## Type Definitions

### \`Item\`
Base interface for all items.

\`\`\`typescript
interface Item {
  id: string
  type?: string
  createdAt?: string
  updatedAt?: string
}
\`\`\`

### \`ServiceConfig\`
Configuration for services.

\`\`\`typescript
interface ServiceConfig {
  name: string
  version?: string
  logger?: Logger
  enableMetrics?: boolean
}
\`\`\`

### \`ValidationResult\`
Result of item validation.

\`\`\`typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
\`\`\`

## Usage Examples

### Complete Service Implementation

\`\`\`typescript
import {
  AItemService,
  IFactory,
  KUtils,
  IQFactory,
  IQUtils,
  CoreValidationError
} from '@fjell/core'

interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
}

class UserService extends AItemService {
  async create(userData: Partial<User>): Promise<User> {
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
      ...userData
    })

    await this.validate(user)
    return this.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = IQFactory.create('user')
      .where('email', email)
      .limit(1)

    const results = await IQUtils.execute<User>(query)
    return results[0] || null
  }

  async findActiveUsers(): Promise<User[]> {
    const query = IQFactory.create('user')
      .where('status', 'active')
      .orderBy('createdAt', 'desc')

    return IQUtils.execute<User>(query)
  }

  protected async validate(user: User): Promise<void> {
    if (!user.email || !user.email.includes('@')) {
      throw new CoreValidationError('Valid email is required')
    }

    if (!user.name || user.name.length < 2) {
      throw new CoreValidationError('Name must be at least 2 characters')
    }
  }

  private generateId(): string {
    return \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
  }
}
\`\`\`

This API reference provides complete coverage of all Fjell Core functionality.
For more examples and usage patterns, see the Examples section.`

      default:
        return `# ${sectionId}

Documentation for this section is being prepared.

Please check back soon for comprehensive content.`
    }
  }

  const handleImageClick = (src: string) => {
    setFullscreenImage(src)
  }

  const handleCloseFullscreen = () => {
    setFullscreenImage(null)
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
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
        <div className="sidebar-header">
          <h1>Fjell Core</h1>
          <p className="subtitle">Core Item and Key Framework</p>
          <div className="version-badge">v{version}</div>
        </div>

        <div className="nav-menu">
          {documentSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setCurrentSection(section.id)
                setSidebarOpen(false) // Close mobile menu
              }}
            >
              <span className="nav-title">{section.title}</span>
              <span className="nav-subtitle">{section.subtitle}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <div className="content-header">
          <h1>{currentSectionData?.title || 'Loading...'}</h1>
          <p>{currentSectionData?.subtitle || ''}</p>
        </div>

        <div className="content-body">
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
                      onClick={() => src && handleImageClick(src)}
                    />
                  )
                }
              }}
            >
              {currentContent || 'Loading content...'}
            </ReactMarkdown>
          </div>
        </div>
      </main>

      {/* Fullscreen image modal */}
      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={handleCloseFullscreen}>
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            className="fullscreen-image"
          />
        </div>
      )}
    </div>
  )
}

export default App
