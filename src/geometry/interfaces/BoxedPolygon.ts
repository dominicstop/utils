import { Point } from "../Point";
import { BoxedShape } from "./BoxedShape";


export interface BoxedPolygon<
  Value extends Record<string, unknown>
> extends BoxedShape<Value> {

  get cornerPointsAsArray(): Array<Point>;

};
