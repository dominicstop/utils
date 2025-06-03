
export interface Cloneable<Self> extends SomeCloneable<Self>  {

  clone(): Self | this;
};

export interface SomeCloneable<T = unknown> {

  clone(): this | T;
};
