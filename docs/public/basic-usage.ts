/**
 * Basic Usage Example - Fjell Core
 *
 * This example demonstrates the fundamental operations available in Fjell Core:
 * - Item creation with IFactory
 * - Key generation and manipulation with KUtils
 * - Basic service implementation with AItemService
 */

import { AItemService, IFactory, KUtils } from '@fjell/core'

// Define our data types
interface User {
  id: string
  name: string
  email: string
  createdAt: string
  status: 'active' | 'inactive'
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
}

/**
 * 1. ITEM CREATION WITH IFACTORY
 *
 * IFactory provides type-safe item creation with validation and defaults.
 */
console.log('=== Item Creation Examples ===')

// Create a user item
const user = IFactory.create<User>('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  createdAt: new Date().toISOString(),
  status: 'active'
})

console.log('Created user:', user)

// Create a product item
const product = IFactory.create<Product>('product', {
  id: 'prod-456',
  name: 'Wireless Headphones',
  price: 199.99,
  category: 'Electronics',
  inStock: true
})

console.log('Created product:', product)

/**
 * 2. KEY MANAGEMENT WITH KUTILS
 *
 * KUtils provides hierarchical key generation and manipulation utilities.
 */
console.log('\n=== Key Management Examples ===')

// Generate hierarchical keys
const userKey = KUtils.generateKey(['users', user.id])
const userProfileKey = KUtils.generateKey(['users', user.id, 'profile'])
const userOrdersKey = KUtils.generateKey(['users', user.id, 'orders'])

console.log('User key:', userKey)
console.log('User profile key:', userProfileKey)
console.log('User orders key:', userOrdersKey)

// Parse keys back to components
const userKeyComponents = KUtils.parseKey(userKey)
const profileKeyComponents = KUtils.parseKey(userProfileKey)

console.log('User key components:', userKeyComponents)
console.log('Profile key components:', profileKeyComponents)

// Validate keys
const isValidUserKey = KUtils.isValidKey(userKey)
const isValidInvalidKey = KUtils.isValidKey('invalid::key::format')

console.log('User key is valid:', isValidUserKey)
console.log('Invalid key is valid:', isValidInvalidKey)

// Get parent keys
const parentOfProfile = KUtils.getParentKey(userProfileKey)
console.log('Parent of profile key:', parentOfProfile)

/**
 * 3. SERVICE LAYER WITH AITEMSERVICE
 *
 * AItemService provides an abstract base for building domain services.
 */
console.log('\n=== Service Layer Examples ===')

class UserService extends AItemService {
  private users = new Map<string, User>()

  async create(userData: Partial<User>): Promise<User> {
    console.log('Creating user with data:', userData)

    // Create user with IFactory
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...userData
    })

    // Validate the user
    await this.validate(user)

    // Save the user
    await this.save(user)

    console.log('User created successfully:', user.id)
    return user
  }

  async findById(id: string): Promise<User | null> {
    const key = KUtils.generateKey(['users', id])
    const user = this.users.get(key)
    console.log(`Finding user by ID ${id}:`, user ? 'found' : 'not found')
    return user || null
  }

  async updateStatus(id: string, status: User['status']): Promise<User | null> {
    const user = await this.findById(id)
    if (!user) {
      console.log(`User ${id} not found for status update`)
      return null
    }

    const updatedUser = { ...user, status }
    await this.save(updatedUser)

    console.log(`User ${id} status updated to ${status}`)
    return updatedUser
  }

  async listActiveUsers(): Promise<User[]> {
    const activeUsers = Array.from(this.users.values())
      .filter(user => user.status === 'active')

    console.log(`Found ${activeUsers.length} active users`)
    return activeUsers
  }

  protected async validate(user: User): Promise<void> {
    if (!user.email || !user.email.includes('@')) {
      throw new Error('Valid email is required')
    }

    if (!user.name || user.name.length < 2) {
      throw new Error('Name must be at least 2 characters')
    }

    console.log('User validation passed for:', user.email)
  }

  protected async save(user: User): Promise<User> {
    const key = KUtils.generateKey(['users', user.id])
    this.users.set(key, user)
    console.log('User saved with key:', key)
    return user
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Demonstrate service usage
async function demonstrateService() {
  const userService = new UserService()

  try {
    // Create users
    const user1 = await userService.create({
      name: 'Alice Smith',
      email: 'alice.smith@example.com'
    })

    const user2 = await userService.create({
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com'
    })

    // Find users
    const foundUser = await userService.findById(user1.id)
    console.log('Found user:', foundUser?.name)

    // Update user status
    await userService.updateStatus(user2.id, 'inactive')

    // List active users
    const activeUsers = await userService.listActiveUsers()
    console.log('Active users:', activeUsers.map(u => u.name))

  } catch (error) {
    console.error('Service error:', error.message)
  }
}

/**
 * 4. PRACTICAL INTEGRATION EXAMPLE
 *
 * Combining all concepts in a realistic scenario.
 */
console.log('\n=== Integration Example ===')

class OrderService extends AItemService {
  private orders = new Map<string, any>()

  constructor(private userService: UserService) {
    super()
  }

  async createOrder(userId: string, items: any[]): Promise<any> {
    // Verify user exists
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    // Create order
    const order = IFactory.create('order', {
      id: this.generateOrderId(),
      userId,
      items,
      total: this.calculateTotal(items),
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // Save order
    const orderKey = KUtils.generateKey(['orders', order.id])
    this.orders.set(orderKey, order)

    console.log(`Order ${order.id} created for user ${user.name}`)
    return order
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateTotal(items: any[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}

async function demonstrateIntegration() {
  const userService = new UserService()
  const orderService = new OrderService(userService)

  try {
    // Create a user
    const user = await userService.create({
      name: 'Customer One',
      email: 'customer@example.com'
    })

    // Create an order for the user
    const order = await orderService.createOrder(user.id, [
      { name: 'Product A', price: 29.99, quantity: 2 },
      { name: 'Product B', price: 15.50, quantity: 1 }
    ])

    console.log('Integration completed successfully')
    console.log('Order total:', order.total)

  } catch (error) {
    console.error('Integration error:', error.message)
  }
}

// Run all demonstrations
async function runExamples() {
  await demonstrateService()
  await demonstrateIntegration()
  console.log('\n=== All examples completed ===')
}

// Execute if running directly
if (require.main === module) {
  runExamples().catch(console.error)
}

export { UserService, OrderService }
