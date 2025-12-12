# Fjell Core Examples

This directory contains comprehensive examples demonstrating real-world usage patterns for Fjell Core.

## Available Examples

### Basic Examples

#### [basic-usage.ts](./basic-usage.ts)
Demonstrates fundamental Fjell Core operations:
- Item creation with IFactory
- Key generation and manipulation with KUtils
- Basic service implementation with AItemService

#### [service-patterns.ts](./service-patterns.ts)
Shows common service implementation patterns:
- Repository pattern implementation
- Service composition
- Error handling strategies

#### [query-examples.ts](./query-examples.ts)
Query building and execution examples:
- Basic query construction
- Complex filtering and sorting
- Query optimization techniques

### Advanced Examples

#### [enterprise-example.ts](./enterprise-example.ts)
Production-ready enterprise patterns:
- Multi-layered service architecture
- Transaction management
- Comprehensive error handling
- Performance optimization

#### [testing-example.ts](./testing-example.ts)
Testing strategies and utilities:
- Unit testing with Fjell Core
- Mock creation and management
- Integration testing patterns

## Running the Examples

All examples are TypeScript files that can be run directly:

```bash
# Using ts-node
npx ts-node examples/basic-usage.ts

# Using tsx
npx tsx examples/basic-usage.ts

# Compile and run
tsc examples/basic-usage.ts && node examples/basic-usage.js
```

## Prerequisites

Make sure you have Fjell Core installed:

```bash
npm install @fjell/core
```

For the examples that integrate with databases or external services, you may need additional dependencies as noted in each example.

## Example Structure

Each example follows a consistent structure:

1. **Imports**: Required Fjell Core modules
2. **Type Definitions**: TypeScript interfaces and types
3. **Implementation**: Core logic demonstration
4. **Usage**: Practical usage examples
5. **Output**: Expected results and explanations

## Integration Examples

Several examples show integration with popular libraries and frameworks:

- Express.js web applications
- Database ORMs (Sequelize, TypeORM)
- Testing frameworks (Jest, Vitest)
- React applications
- GraphQL APIs

## Best Practices

The examples demonstrate Fjell Core best practices:

- **Type Safety**: Comprehensive TypeScript usage
- **Error Handling**: Robust error management
- **Performance**: Optimized patterns for production
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear code documentation

## Contributing Examples

We welcome new examples! Please follow these guidelines:

1. Create a new TypeScript file with a descriptive name
2. Include comprehensive comments explaining the concepts
3. Add proper type definitions
4. Include usage examples and expected output
5. Update this README with a description of your example

## Getting Help

If you have questions about any example:

1. Check the inline comments for explanations
2. Review the main Fjell Core documentation
3. Open an issue on GitHub for specific questions
4. Join our community discussions

## Common Patterns Demonstrated

### Factory Pattern
```typescript
const user = IFactory.create<User>('user', userData)
```

### Repository Pattern
```typescript
class UserRepository extends AItemService {
  async save(user: User): Promise<User> { ... }
  async findById(id: string): Promise<User | null> { ... }
}
```

### Service Layer
```typescript
class UserService extends AItemService {
  constructor(private userRepo: UserRepository) { super() }
  async registerUser(data: UserData): Promise<User> { ... }
}
```

### Query Building
```typescript
const query = IQFactory.create('user')
  .where('status', 'active')
  .orderBy('createdAt', 'desc')
  .limit(10)
```

These examples provide a solid foundation for building production applications with Fjell Core.
