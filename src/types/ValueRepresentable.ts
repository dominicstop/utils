
export interface ValueRepresentable<
  Value extends Record<string, unknown>
> {

  get asValue(): Value;
};
