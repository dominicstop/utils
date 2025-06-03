import { Cloneable } from "../../types/Cloneable";
import { ValueRepresentable } from "../../types/ValueRepresentable";
import { Point, PointValue } from "../Point";
import { Rect } from "../Rect";


export interface BoxedShape<
  Self,
  Value extends Record<string, unknown>
> extends
  Cloneable<Self>,
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

