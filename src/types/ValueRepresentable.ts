
export type AnyValueRepresentable = Record<string, unknown>;

export interface ValueRepresentable<
  Value extends AnyValueRepresentable
> {

  get asValue(): Value;
};
