import { AItemService } from "@/AItemService";
import { AllItemTypeArrays } from "@/keys";
import { vi } from 'vitest';

vi.mock('@fjell/logging', () => {
  return {
    get: vi.fn().mockReturnThis(),
    getLogger: vi.fn().mockReturnThis(),
    default: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    alert: vi.fn(),
    critical: vi.fn(),
    notice: vi.fn(),
    time: vi.fn().mockReturnThis(),
    end: vi.fn(),
    log: vi.fn(),
  }
});

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