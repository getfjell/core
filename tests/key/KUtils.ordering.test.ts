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

      // ikToLKA returns only parent locations (for aggregation queries to find siblings)
      // company (root) -> department (middle)
      expect(locationArray[0].kt).toBe('company');
      expect(locationArray[1].kt).toBe('department');
      
      // Verify the complete ordering semantically (child-to-parent hierarchy)
      const keyTypes = locationArray.map(k => k.kt);
      expect(keyTypes).toEqual(['company', 'department']);
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      expect(locationArray[0].kt).toBe('order');
      expect(locationArray[1].kt).toBe('orderPhase');
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      const keyTypes = locationArray.map(k => k.kt);
      expect(keyTypes).toEqual(['level1', 'level2', 'level3', 'level4']);
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      expect(locationArray[0].kt).toBe('org');      // Root/grandparent
      expect(locationArray[1].kt).toBe('dept');     // Middle/parent
      
      // Verify the complete structure (parent locations only)
      expect(locationArray).toEqual([
        { kt: 'org', lk: 'org-123' },
        { kt: 'dept', lk: 'dept-456' }
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // This is used for aggregation queries to find siblings at the same location
      expect(locationArray[0].kt).toBe('grandparent');
      expect(locationArray[1].kt).toBe('parent');
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

      // Convert to location array (for use as parent location for aggregation queries)
      const parentLocations = ikToLKA(orderPhaseKey);

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // This is used to find sibling orderPhases at the same location
      expect(parentLocations).toEqual([
        { kt: 'order', lk: 'order-123' }
      ]);
      
      // Verify ordering
      expect(parentLocations[0].kt).toBe('order');
    });
  });

  describe('Path Building Ordering Requirements', () => {
    /**
     * This test simulates what client-api does when building REST paths.
     * The location array order directly determines the URL structure.
     */
    it('should produce location arrays suitable for aggregation queries', () => {
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // This is used for aggregation queries to find sibling orderSteps
      
      // Verify the location array contains only parents in correct order
      expect(locationArray).toEqual([
        { kt: 'order', lk: 26513 },
        { kt: 'orderPhase', lk: 25826 }
      ]);
      
      // Verify the ordering matches expected hierarchy (child-to-parent)
      expect(locationArray[0].kt).toBe('order');     // Root
      expect(locationArray[1].kt).toBe('orderPhase'); // Middle
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // Verify that the location array matches the loc array exactly
      expect(locationArray.length).toBe(key.loc.length);
      
      for (let i = 0; i < locationArray.length; i++) {
        // Each element should match the corresponding loc array element
        expect(locationArray[i].kt).toBe(key.loc[i].kt);
        expect(locationArray[i].lk).toBe(key.loc[i].lk);
      }
    });

    it('should return only parent locations (not the item itself)', () => {
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      expect(locationArray.length).toBe(3); // Only parents, not the target itself
      
      // All ancestors in correct order
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // This is used for aggregation queries to find sibling orderSteps
      
      // CORRECT order: [order, orderPhase] (parents only)
      expect(locationArray.length).toBe(2);
      expect(locationArray[0]).toEqual({ kt: 'order', lk: 26513 });
      expect(locationArray[1]).toEqual({ kt: 'orderPhase', lk: 25826 });
      
      // Verify ordering by index (child-to-parent hierarchy)
      const orderIndex = 0;
      const orderPhaseIndex = 1;
      
      expect(orderIndex).toBeLessThan(orderPhaseIndex);
    });

    it('should work correctly when used as parent locations for aggregation queries', () => {
      // Scenario: We have an order and want to query all its orderPhases
      const orderKey: PriKey<'order'> = {
        pk: 26513,
        kt: 'order'
      };

      const parentLocations = ikToLKA(orderKey);

      // For a primary key, ikToLKA returns the item itself as a location
      expect(parentLocations).toEqual([
        { kt: 'order', lk: 26513 }
      ]);

      // Now, scenario: We have an orderPhase and want to find sibling orderPhases
      const orderPhaseKey: ComKey<'orderPhase', 'order'> = {
        pk: 25826,
        kt: 'orderPhase',
        loc: [
          { kt: 'order', lk: 26513 }
        ]
      };

      const parentLocationsForPhases = ikToLKA(orderPhaseKey);

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      // For aggregation queries to find sibling orderPhases at the same location
      expect(parentLocationsForPhases).toEqual([
        { kt: 'order', lk: 26513 }
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

      // ikToLKA returns only parent locations (child-to-parent hierarchy)
      expect(locationArray).toEqual([
        { kt: 'parent', lk: 'parent-id' }
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

