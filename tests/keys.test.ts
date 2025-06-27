import { describe, it } from 'vitest';
import type { AllItemTypeArrays, AllLocTypeArrays, ComKey, LocKey, PriKey, UUID } from '@/keys';

describe('keys', () => {
    it('should compile with valid types', () => {
        // This test doesn't run any code, but it will fail to compile if the types are incorrect.

        const pk: UUID = '123e4567-e89b-12d3-a456-426614174000';

        const priKey: PriKey<'myPriKey'> = {
            kt: 'myPriKey',
            pk: pk,
        };

        const locKey1: LocKey<'L1'> = {
            kt: 'L1',
            lk: 'loc1-uuid',
        };

        const locKey2: LocKey<'L2'> = {
            kt: 'L2',
            lk: 'loc2-uuid',
        };

        const comKey1: ComKey<'myComKey', 'L1'> = {
            kt: 'myComKey',
            pk: pk,
            loc: [locKey1],
        };

        const comKey2: ComKey<'myComKey', 'L1', 'L2'> = {
            kt: 'myComKey',
            pk: pk,
            loc: [locKey1, locKey2],
        };

        // Example of using the type arrays to ensure they are constructed correctly.
        const itemTypes1: AllItemTypeArrays<'S', 'L1'> = ['S', 'L1'] as const;
        const itemTypes2: AllItemTypeArrays<'S', 'L1', 'L2'> = ['S', 'L1', 'L2'] as const;

        const locTypes1: AllLocTypeArrays<'L1'> = ['L1'] as const;
        const locTypes2: AllLocTypeArrays<'L1', 'L2'> = ['L1', 'L2'] as const;

        // These variables are unused, but their purpose is to validate the types at compile time.
        // The 'any' type is used to suppress unused variable warnings.
        (priKey as any);
        (comKey1 as any);
        (comKey2 as any);
        (itemTypes1 as any);
        (itemTypes2 as any);
        (locTypes1 as any);
        (locTypes2 as any);
    });
});
