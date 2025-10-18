/**
 * Types for operation wrappers
 *
 * These wrappers provide automatic parameter validation for all Operations methods.
 */

import type { Coordinate } from "../../Coordinate";

/**
 * Options for configuring wrapper behavior
 */
export interface WrapperOptions {
  /**
   * Skip automatic parameter validation.
   * Use this if you're handling validation elsewhere.
   * @default false
   */
  skipValidation?: boolean;
  
  /**
   * Custom operation name for error messages.
   * If not provided, uses the wrapper's default name.
   */
  operationName?: string;
  
  /**
   * Enable debug logging for wrapper calls.
   * @default false
   */
  debug?: boolean;
  
  /**
   * Custom error handler.
   * If provided, catches and transforms errors from the implementation.
   */
  onError?: (error: Error, context: ErrorContext) => Error | never;
}

/**
 * Context provided to error handlers
 */
export interface ErrorContext {
  operationName: string;
  params: any[];
  coordinate: Coordinate<any, any, any, any, any, any>;
}

/**
 * Internal context passed through wrapper execution
 */
export interface WrapperContext<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>;
  operationName: string;
  options: WrapperOptions;
}

