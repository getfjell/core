import { ComKey, LocKeyArray, PriKey } from '@fjell/types';
import type { ErrorInfo } from '../errors/ActionError';

export interface OperationContext {
  itemType: string;
  operationType: ErrorInfo['operation']['type'];
  operationName: string;
  params: Record<string, any>;
  key?: PriKey<any> | ComKey<any, any, any, any, any, any>;
  locations?: LocKeyArray<any, any, any, any, any>;
}

