import { Point, PointValue } from "../Point";
import { Rect } from "../Rect";


export interface BoxedShape<
  Value extends Record<string, unknown>
> {

  origin: Point;

  get asValue(): Value;

  get boundingBox(): Rect;

  get center(): Point;

  isPointInside(pointValue: PointValue): boolean;

  isEdgeToEdgeWithOther(other: this): boolean;

  isCollidingWithOther(other: this): boolean;
};

