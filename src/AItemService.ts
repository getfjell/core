import { AllItemTypeArrays } from "@fjell/types";

export class AItemService<
  S extends string,
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {

  private pkType: S;
  private parentService: AItemService<L1, L2, L3, L4, L5, never> | null = null;

  constructor(
    pkType: S,
    parentService?: AItemService<L1, L2, L3, L4, L5, never>,
  ) {
    this.pkType = pkType;
    if (parentService) {
      this.parentService = parentService;
    }
  }

  public getPkType = (): S => {
    return this.pkType;
  }

  public getKeyTypes = (): AllItemTypeArrays<S, L1, L2, L3, L4, L5> => {
    let keyTypes: readonly string[] = [this.getPkType()];

    if (this.parentService) {
      keyTypes = keyTypes.concat(this.parentService.getKeyTypes());
    }
    return keyTypes as AllItemTypeArrays<S, L1, L2, L3, L4, L5>;
  }

}
