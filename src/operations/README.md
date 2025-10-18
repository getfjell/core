# Operations Interface

## Overview

The Operations interface defines the standard contract for all fjell libraries that operate on Items. It provides a unified API for CRUD operations, queries, actions, and facets across different storage backends and transport layers.

## Core Interfaces

### Operations<V, S, L1, L2, L3, L4, L5>

The main interface that all fjell operations implement.

- **V**: The Item type
- **S**: The primary key type
- **L1-L5**: Optional location key types for contained items

### Specialized Interfaces

- **PrimaryOperations**: For items without location hierarchy
- **ContainedOperations**: For items with required location hierarchy
- **CollectionOperations**: For working with groups of items (React providers)
- **InstanceOperations**: For working with single items (React providers)

## Method Types

- **FinderMethod**: Finds multiple items
- **ActionMethod**: Performs action on single item
- **AllActionMethod**: Performs action on multiple items
- **FacetMethod**: Computes view on single item
- **AllFacetMethod**: Computes view on multiple items

## Type Utilities

- **OperationParams**: Standard parameter type for operations
- **AffectedKeys**: Keys affected by actions (for cache invalidation)
- **CreateOptions**: Options for create operation
- **isPriKey()**: Type guard for PriKey
- **isComKey()**: Type guard for ComKey

## Usage Examples

See inline documentation in Operations.ts for detailed examples.

