export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type RemapObject<T, U extends Record<keyof T, unknown>> = {
  [TKey in keyof T]: U[TKey];
};