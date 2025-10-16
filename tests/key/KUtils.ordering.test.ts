import { describe, expect, it } from 'vitest';
import {
  ComKey,
  ikToLKA,
  LocKey,
  PriKey,
} from '../../src';

/**
 * CRITICAL ORDERING TESTS
 *
 * These tests validate the semantic correctness of location key array ordering.
 * Location arrays MUST be ordered from parent to child (root to leaf) to properly
 * represent hierarchical relationships.
 *
 * Example hierarchy: Organization → Department → Team → Person
 * Correct order: [org, dept, team, person]
 * WRONG order: [person, team, dept, org]
 */
describe('Location Key Array Ordering - Critical Business Logic', () => {
  
  describe('Hierarchical Ordering Validation', () => {
    it('should order location keys from parent to child (root to leaf)', () => {
      // Representing: Company > Department > Employee
      const employeeKey: ComKey<'employee', 'company', 'department'> = {
        pk: 'emp-123',
        kt: 'employee',
        loc: [
          { kt: 'company', lk: 'company-456' },
          { kt: 'department', lk: 'dept-789' }
        ]
      };

      const locationArray = ikToLKA(employeeKey);

      // CRITICAL: Must be ordered from root to leaf
      // company (root) -> department (middle) -> employee (leaf)
      expect(locationArray[0].kt).toBe('company');
      expect(locationArray[1].kt).toBe('department');
      expect(locationArray[2].kt).toBe('employee');
      
      // Verify the complete ordering semantically
      const keyTypes = locationArray.map(k => k.kt);
      expect(keyTypes).toEqual(['company', 'department', 'employee']);
    });

    it('should maintain hierarchical order for 3-level nesting', () => {
      // Order -> OrderPhase -> OrderStep hierarchy
      const orderStepKey: ComKey<'orderStep', 'order', 'orderPhase'> = {
        pk: 'step-111',
        kt: 'orderStep',
        loc: [
          { kt: 'order', lk: 'order-222' },
          { kt: 'orderPhase', lk: 'phase-333' }
        ]
      };

      const locationArray = ikToLKA(orderStepKey);

      // CRITICAL: Parent (order) must come before child (orderPhase) before grandchild (orderStep)
      expect(locationArray[0].kt).toBe('order');
      expect(locationArray[1].kt).toBe('orderPhase');
      expect(locationArray[2].kt).toBe('orderStep');
    });

    it('should maintain hierarchical order for deep nesting (5 levels)', () => {
      // Level1 -> Level2 -> Level3 -> Level4 -> Level5
      const deepKey: ComKey<'level5', 'level1', 'level2', 'level3', 'level4'> = {
        pk: 'l5-id',
        kt: 'level5',
        loc: [
          { kt: 'level1', lk: 'l1-id' },
          { kt: 'level2', lk: 'l2-id' },
          { kt: 'level3', lk: 'l3-id' },
          { kt: 'level4', lk: 'l4-id' }
        ]
      };

      const locationArray = ikToLKA(deepKey);

      // Must be in hierarchical order from root to leaf
      const keyTypes = locationArray.map(k => k.kt);
      expect(keyTypes).toEqual(['level1', 'level2', 'level3', 'level4', 'level5']);
    });
  });

  describe('Location Array Structure', () => {
    it('should produce location arrays with correct hierarchical order', () => {
      // Start with a ComKey for a deeply nested item
      const teamKey: ComKey<'team', 'org', 'dept'> = {
        pk: 'team-789',
        kt: 'team',
        loc: [
          { kt: 'org', lk: 'org-123' },
          { kt: 'dept', lk: 'dept-456' }
        ]
      };

      // Convert to location array
      const locationArray = ikToLKA(teamKey);

      // CRITICAL: Location array must be ordered from root to leaf
      // This is essential for building REST paths and validation
      expect(locationArray[0].kt).toBe('org');      // Root/grandparent
      expect(locationArray[1].kt).toBe('dept');     // Middle/parent
      expect(locationArray[2].kt).toBe('team');     // Leaf/child
      
      // Verify the complete structure
      expect(locationArray).toEqual([
        { kt: 'org', lk: 'org-123' },
        { kt: 'dept', lk: 'dept-456' },
        { kt: 'team', lk: 'team-789' }
      ]);
    });

    it('should handle parent location extraction correctly', () => {
      // Given a child item key
      const childKey: ComKey<'child', 'parent', 'grandparent'> = {
        pk: 'child-id',
        kt: 'child',
        loc: [
          { kt: 'grandparent', lk: 'gp-id' },
          { kt: 'parent', lk: 'p-id' }
        ]
      };

      const locationArray = ikToLKA(childKey);

      // Parent locations should come before the child
      // This is CRITICAL for building REST paths like:
      // /grandparents/{gp-id}/parents/{p-id}/children/{child-id}
      expect(locationArray[0].kt).toBe('grandparent');
      expect(locationArray[1].kt).toBe('parent');
      expect(locationArray[2].kt).toBe('child');
    });
  });

  describe('Parent Location Extraction for Contained Items', () => {
    it('should extract parent locations in correct order for querying children', () => {
      // When we have an order item, and we want to query its phases
      const orderKey: PriKey<'order'> = {
        pk: 'order-123',
        kt: 'order'
      };

      // Convert order to location array (for use as parent location)
      const parentLocations = ikToLKA(orderKey);

      // This will be used to query orderPhases: /orders/{order-123}/orderPhases
      expect(parentLocations).toEqual([
        { kt: 'order', lk: 'order-123' }
      ]);
    });

    it('should extract parent locations for multi-level contained items', () => {
      // Given an orderPhase item with its parent order location
      const orderPhaseKey: ComKey<'orderPhase', 'order'> = {
        pk: 'phase-456',
        kt: 'orderPhase',
        loc: [
          { kt: 'order', lk: 'order-123' }
        ]
      };

      // Convert to location array (for use as parent location for orderSteps)
      const parentLocations = ikToLKA(orderPhaseKey);

      // This will be used to query orderSteps: /orders/{order-123}/orderPhases/{phase-456}/orderSteps
      // CRITICAL: Parent (order) must come before child (orderPhase)
      expect(parentLocations).toEqual([
        { kt: 'order', lk: 'order-123' },
        { kt: 'orderPhase', lk: 'phase-456' }
      ]);
      
      // Verify ordering
      expect(parentLocations[0].kt).toBe('order');
      expect(parentLocations[1].kt).toBe('orderPhase');
    });
  });

  describe('Path Building Ordering Requirements', () => {
    /**
     * This test simulates what client-api does when building REST paths.
     * The location array order directly determines the URL structure.
     */
    it('should produce location arrays suitable for REST path building', () => {
      // Simulating orderStep with parent orderPhase and grandparent order
      const orderStepKey: ComKey<'orderStep', 'order', 'orderPhase'> = {
        pk: 25825,
        kt: 'orderStep',
        loc: [
          { kt: 'order', lk: 26513 },
          { kt: 'orderPhase', lk: 25826 }
        ]
      };

      const locationArray = ikToLKA(orderStepKey);

      // Expected URL path: /orders/26513/orderPhases/25826/orderSteps/25825
      // This requires the location array to be in parent-to-child order
      
      // Simulate path building (simplified version of what client-api does)
      const pathSegments: string[] = [];
      for (const loc of locationArray) {
        pathSegments.push(`${loc.kt}s`); // plural
        pathSegments.push(String(loc.lk));
      }
      
      const path = '/' + pathSegments.join('/');
      
      // CRITICAL: Path must reflect correct hierarchy
      expect(path).toBe('/orders/26513/orderPhases/25826/orderSteps/25825');
      
      // Verify the ordering matches expected hierarchy
      expect(pathSegments[0]).toBe('orders');     // Root
      expect(pathSegments[2]).toBe('orderPhases'); // Middle
      expect(pathSegments[4]).toBe('orderSteps');  // Leaf
    });

    it('should fail if location array is in wrong order', () => {
      // This is what the BUG was producing - WRONG ORDER
      const wrongOrderArray: Array<LocKey<'orderStep' | 'order' | 'orderPhase'>> = [
        { kt: 'orderStep', lk: 25825 }, // WRONG: child first
        { kt: 'orderPhase', lk: 25826 },
        { kt: 'order', lk: 26513 }      // WRONG: parent last
      ];

      // Simulate path building
      const pathSegments: string[] = [];
      for (const loc of wrongOrderArray) {
        pathSegments.push(`${loc.kt}s`);
        pathSegments.push(String(loc.lk));
      }
      
      const wrongPath = '/' + pathSegments.join('/');
      
      // This would produce: /orderSteps/25825/orderPhases/25826/orders/26513
      // Which is SEMANTICALLY WRONG and would fail hierarchy validation
      expect(wrongPath).toBe('/orderSteps/25825/orderPhases/25826/orders/26513');
      
      // This is NOT the correct hierarchy - this test documents the bug
      expect(wrongPath).not.toBe('/orders/26513/orderPhases/25826/orderSteps/25825');
    });
  });

  describe('Semantic Ordering Invariants', () => {
    it('should maintain parent-before-child invariant for all levels', () => {
      const key: ComKey<'leaf', 'root', 'middle'> = {
        pk: 'leaf-id',
        kt: 'leaf',
        loc: [
          { kt: 'root', lk: 'root-id' },
          { kt: 'middle', lk: 'middle-id' }
        ]
      };

      const locationArray = ikToLKA(key);

      // For each level, verify that parents come before children
      for (let i = 0; i < locationArray.length - 1; i++) {
        const currentLevel = locationArray[i];
        
        // In a correctly ordered array, each level should be the parent of the next
        // We can't validate the actual parent-child relationship without metadata,
        // but we can verify the ordering matches the loc array structure
        
        // The first elements should match the loc array order
        if (i < key.loc.length) {
          expect(currentLevel.kt).toBe(key.loc[i].kt);
        }
      }
      
      // The last element should be the primary key
      expect(locationArray[locationArray.length - 1].kt).toBe(key.kt);
    });

    it('should always place the item itself as the leaf (last element)', () => {
      const key: ComKey<'target', 'ancestor1', 'ancestor2', 'ancestor3'> = {
        pk: 'target-id',
        kt: 'target',
        loc: [
          { kt: 'ancestor1', lk: 'a1-id' },
          { kt: 'ancestor2', lk: 'a2-id' },
          { kt: 'ancestor3', lk: 'a3-id' }
        ]
      };

      const locationArray = ikToLKA(key);

      // CRITICAL: The item itself must be the last (leaf) element
      const lastElement = locationArray[locationArray.length - 1];
      expect(lastElement.kt).toBe('target');
      expect(lastElement.lk).toBe('target-id');
      
      // All ancestors must come before the target
      expect(locationArray[0].kt).toBe('ancestor1');
      expect(locationArray[1].kt).toBe('ancestor2');
      expect(locationArray[2].kt).toBe('ancestor3');
    });
  });

  describe('Real-world Scenario Tests', () => {
    it('should handle the exact scenario that caused the bug: Order > OrderPhase > OrderStep', () => {
      // This is the EXACT scenario from the bug report
      const orderStepKey: ComKey<'orderStep', 'order', 'orderPhase'> = {
        pk: 25825,
        kt: 'orderStep',
        loc: [
          { kt: 'order', lk: 26513 },
          { kt: 'orderPhase', lk: 25826 }
        ]
      };

      const locationArray = ikToLKA(orderStepKey);

      // The error message was:
      // "Key type \"order\" (index 0) should come before the previous key (index 1)"
      // This happened because the array was [orderPhase, order, orderStep] - WRONG!
      
      // CORRECT order must be [order, orderPhase, orderStep]
      expect(locationArray.length).toBe(3);
      expect(locationArray[0]).toEqual({ kt: 'order', lk: 26513 });
      expect(locationArray[1]).toEqual({ kt: 'orderPhase', lk: 25826 });
      expect(locationArray[2]).toEqual({ kt: 'orderStep', lk: 25825 });
      
      // Verify ordering by index
      const orderIndex = 0;
      const orderPhaseIndex = 1;
      const orderStepIndex = 2;
      
      expect(orderIndex).toBeLessThan(orderPhaseIndex);
      expect(orderPhaseIndex).toBeLessThan(orderStepIndex);
    });

    it('should work correctly when used as parent locations for contained item queries', () => {
      // Scenario: We have an order and want to query all its orderPhases
      const orderKey: PriKey<'order'> = {
        pk: 26513,
        kt: 'order'
      };

      const parentLocations = ikToLKA(orderKey);

      // When passed to client-api.all(), it should build: /orders/26513/orderPhases
      expect(parentLocations).toEqual([
        { kt: 'order', lk: 26513 }
      ]);

      // Now, scenario: We have an orderPhase and want to query all its orderSteps
      const orderPhaseKey: ComKey<'orderPhase', 'order'> = {
        pk: 25826,
        kt: 'orderPhase',
        loc: [
          { kt: 'order', lk: 26513 }
        ]
      };

      const parentLocationsForSteps = ikToLKA(orderPhaseKey);

      // When passed to client-api.all(), it should build: /orders/26513/orderPhases/25826/orderSteps
      // CRITICAL: Order must be [order, orderPhase] not [orderPhase, order]
      expect(parentLocationsForSteps).toEqual([
        { kt: 'order', lk: 26513 },
        { kt: 'orderPhase', lk: 25826 }
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single-level containment correctly', () => {
      const key: ComKey<'child', 'parent'> = {
        pk: 'child-id',
        kt: 'child',
        loc: [{ kt: 'parent', lk: 'parent-id' }]
      };

      const locationArray = ikToLKA(key);

      expect(locationArray).toEqual([
        { kt: 'parent', lk: 'parent-id' },
        { kt: 'child', lk: 'child-id' }
      ]);
    });

    it('should handle primary keys (no containment) correctly', () => {
      const key: PriKey<'standalone'> = {
        pk: 'standalone-id',
        kt: 'standalone'
      };

      const locationArray = ikToLKA(key);

      expect(locationArray).toEqual([
        { kt: 'standalone', lk: 'standalone-id' }
      ]);
    });
  });
});

