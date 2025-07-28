import { AItemService } from "../src/AItemService";
import { AllItemTypeArrays } from "../src/keys";
import { describe, expect, it } from 'vitest';

describe('AItemService', () => {
  it('should return the correct pkType', () => {
    const service = new AItemService('pkType1');
    expect(service.getPkType()).toBe('pkType1');
  });

  it('should return the correct key types without parent service', () => {
    const service = new AItemService('pkType1');
    const expectedKeyTypes: AllItemTypeArrays<'pkType1'> = ['pkType1'];
    expect(service.getKeyTypes()).toEqual(expectedKeyTypes);
  });

  it('should return the correct key types with parent service', () => {
    const parentService = new AItemService('parentPkType');
    const service = new AItemService('pkType1', parentService);
    const expectedKeyTypes: AllItemTypeArrays<'pkType1', 'parentPkType'> = ['pkType1', 'parentPkType'];
    expect(service.getKeyTypes()).toEqual(expectedKeyTypes);
  });

  it('should return the correct key types with multiple parent services', () => {
    const grandParentService = new AItemService('grandParentPkType');
    const parentService = new AItemService('parentPkType', grandParentService);
    const service = new AItemService('pkType1', parentService);
    const expectedKeyTypes: AllItemTypeArrays<'pkType1', 'parentPkType', 'grandParentPkType'> =
      ['pkType1', 'parentPkType', 'grandParentPkType'];
    expect(service.getKeyTypes()).toEqual(expectedKeyTypes);
  });
});