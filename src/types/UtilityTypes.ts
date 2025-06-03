export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type RemapObject<T, U extends Record<keyof T, unknown>> = {
  [TKey in keyof T]: U[TKey];
};

export type ValueOf<T> = T extends any[] ? T[number] : T[keyof T];


export type RecursivelyReplaceProperties<T, U> = {
  [TKey in keyof T]: T[TKey] extends object
    ? T[TKey] extends Function
      ? U
      : RecursivelyReplaceProperties<T[TKey], U>
    : U;
};

export type ReplaceProperty<
  Obj extends object,
  Key extends keyof Obj,
  T
> = Omit<Obj, Key> & { [K in Key]: T };


export type DataWithTimestamp<T> = {
  data: T;
  timestamp: number;
};

export type LoadingStateWithData<T, U> = {
  mode: 'LOADING';
} | {
  mode: 'LOADED';
  loadedData: T;
} | {
  mode: 'LOADING_ERROR';
  errorData: U;
};

export type LoadingState = LoadingStateWithData<unknown, unknown>['mode'];

export const LOADING_STATES: Record<LoadingState, LoadingState> = {
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  LOADING_ERROR: 'LOADING_ERROR',
};
