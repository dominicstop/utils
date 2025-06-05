import { SomeCloneable } from "../../types/Cloneable";
import { AnyValueRepresentable, ValueRepresentable } from "../../types/ValueRepresentable";
import { Point, PointValue } from "../Point";
import { Rect } from "../Rect";


export interface BoxedShape<
  Value extends AnyValueRepresentable
> extends
  SomeCloneable,
  ValueRepresentable<Value>
{

  origin: Point;

  get asValue(): Value;

  get boundingBox(): Rect;

  get center(): Point;

  isPointInside(pointValue: PointValue): boolean;

  computeDistanceToOther(other: this): number;

  isEdgeToEdgeWithOther(other: this): boolean;

  isCollidingWithOther(other: this): boolean;
};

export type AnyBoxedShape = BoxedShape<AnyValueRepresentable>;
