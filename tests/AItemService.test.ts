import { AItemService } from "@/AItemService";
import { AllItemTypeArrays } from "@/keys";

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
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