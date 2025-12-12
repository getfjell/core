# Fjell Core API Reference

Complete API documentation for all Fjell Core modules and exports.

## Overview

Fjell Core provides a comprehensive set of tools for item management, key utilities, and service coordination. All APIs are built with TypeScript-first design for maximum type safety.

## Core Exports

### Factory Classes

#### `IFactory<V, S, L1, L2, L3, L4, L5>`
Generic item factory for creating strongly-typed items with hierarchical key support.

**Type Parameters:**
- `V extends Item<S, L1, L2, L3, L4, L5>`: The item type being created
- `S extends string`: Primary key type
- `L1-L5 extends string`: Location key types (optional)

**Constructor:**
```typescript
new IFactory<V, S, L1, L2, L3, L4, L5>(props?: Record<string, any>)
```

**Methods:**

##### `addRef(item: Item, name?: string): IFactory`
Adds a reference to another item.

**Parameters:**
- `item`: The item to reference
- `name`: Optional reference name (defaults to primary type)

**Returns:** Factory instance for chaining

##### `static addRef<V, S, L1, L2, L3, L4, L5>(item: V, name?: string): IFactory`
Static method to create a factory with a reference.

##### `addDefaultEvents(): IFactory`
Adds default event timestamps (created, updated).

**Returns:** Factory instance for chaining

#### `IQFactory`
Factory for building item queries with filtering, sorting, and pagination.

### Utility Classes

#### `KUtils`
Comprehensive key management utilities for hierarchical key operations.

**Methods:**

##### `createNormalizedHashFunction<T>(): (key: T) => string`
Creates a normalized hash function for consistent key comparison.

**Returns:** Hash function that normalizes pk/lk values to strings

##### `normalizeKeyValue(value: string | number): string`
Normalizes key values for consistent comparison.

**Parameters:**
- `value`: The value to normalize

**Returns:** String representation of the value

##### `primaryType(key: ComKey | PriKey): string`
Extracts the primary type from a composite or primary key.

### Service Classes

#### `AItemService<S, L1, L2, L3, L4, L5>`
Abstract base class for building domain-specific item services.

**Type Parameters:**
- `S extends string`: Primary key type
- `L1-L5 extends string`: Location key types (hierarchical)

**Constructor:**
```typescript
new AItemService<S, L1, L2, L3, L4, L5>(
  pkType: S,
  parentService?: AItemService<L1, L2, L3, L4, L5, never>
)
```

**Parameters:**
- `pkType`: The primary key type for this service
- `parentService`: Optional parent service for hierarchical structures

**Methods:**

##### `getPkType(): S`
Gets the primary key type for this service.

**Returns:** The primary key type string

##### `getKeyTypes(): AllItemTypeArrays<S, L1, L2, L3, L4, L5>`
Gets all key types managed by this service, including parent service types.

**Returns:** Array of all key type strings in the hierarchy

## Type Definitions

### Key Types

#### `PriKey<S>`
Primary key structure for items.

#### `ComKey<S, L1, L2, L3, L4, L5>`
Composite key structure supporting hierarchical locations.

#### `LocKey`
Location key for hierarchical positioning.

#### `LocKeyArray`
Array of location keys for complex hierarchies.

### Item Types

#### `Item<S, L1, L2, L3, L4, L5>`
Base item interface with hierarchical key support.

**Properties:**
- `key`: The item's key (PriKey or ComKey)
- `refs?`: Optional references to other items
- `events?`: Optional event timestamps

### Query Types

#### `ItemQuery<S, L1, L2, L3, L4, L5>`
Query structure for filtering and retrieving items.

## Utility Functions

### Dictionary Operations
Exported from `dictionary` module for key-value operations with normalized hashing.

### Key Operations
Exported from `keys` module for advanced key manipulation and validation.

### Item Operations
Exported from `items` module for item creation, validation, and transformation.

## Query Building

### IQFactory
Factory for building complex queries:

```typescript
const query = IQFactory.create('user')
  .where('status', 'active')
  .where('role', 'admin')
  .limit(10)
  .orderBy('createdAt', 'desc')
```

### IQUtils
Utilities for executing and optimizing queries.

### IUtils
General item utilities for validation, transformation, and manipulation.

## Best Practices

### Type Safety
Always use generic type parameters to ensure compile-time type checking:

```typescript
interface User {
  id: string
  name: string
  email: string
}

const userFactory = new IFactory<User, 'user'>()
const user = userFactory.create({ id: '123', name: 'John', email: 'john@example.com' })
```

### Hierarchical Keys
Use the hierarchical key system for complex data relationships:

```typescript
class UserService extends AItemService<'user', 'organization'> {
  constructor(orgService: OrganizationService) {
    super('user', orgService)
  }
}
```

### Key Normalization
Use normalized hash functions for consistent key comparison:

```typescript
const hashFn = KUtils.createNormalizedHashFunction<ComKey<'user', 'org'>>()
const hash = hashFn(userKey)
```

## Error Handling

All methods may throw validation errors or type mismatches. Always wrap operations in try-catch blocks for production code:

```typescript
try {
  const item = factory.create(data)
  const key = KUtils.generateKey(components)
} catch (error) {
  console.error('Operation failed:', error.message)
}
```

## Performance Considerations

- Use normalized hash functions for efficient key comparisons
- Leverage hierarchical services for organized data access
- Implement proper query optimization using IQUtils
- Consider memory usage with large item collections

## Integration

Fjell Core is designed to integrate seamlessly with the entire Fjell ecosystem:

- **@fjell/registry**: Service location and dependency injection
- **@fjell/cache**: High-performance caching with key-based operations
- **@fjell/lib**: Database abstraction layers
- **@fjell/providers**: React state management
- **@fjell/client-api**: HTTP client utilities

Each integration maintains the same type safety and hierarchical key principles established in Fjell Core.
