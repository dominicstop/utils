import { Point } from "../Point";
import { BoxedShape } from "./BoxedShape";


export interface BoxedPolygon<
  Self,
  Value extends Record<string, unknown>
> extends BoxedShape<Self, Value> {

  get cornerPointsAsArray(): Array<Point>;

};
