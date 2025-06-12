import { SomeCloneable } from "../../types/Cloneable";
import { AnyValueRepresentable, ValueRepresentable } from "../../types/ValueRepresentable";
import { Point, PointValue } from "../Point";
import { Rect } from "../Rect";
import { Scalable } from "../Scalelable";

/**
 * A generic interface representing a shape that has a bounding box
 * and can be represented as a value.
 *
 * @template Value - The value representation type of the shape.
 */
export interface BoxedShape<
  Value extends AnyValueRepresentable
> extends
  SomeCloneable,
  ValueRepresentable<Value>,
  Scalable
{
  /**
   * The origin point of the shape
   * (i.e. the top-left corner of its bounding box).
   */
  origin: Point;

  /**
   * Returns the shape's value representation
   * (e.g., center and radius for a circle).
   */
  get asValue(): Value;

  /** Returns the bounding rectangle that fully contains the shape. */
  get boundingBox(): Rect;

  /** Returns the geometric center of the shape. */
  get center(): Point;

  /** sets the geometric center of the shape. */
  set center(newCenter: Point);

  /**
   * Checks whether a given point lies inside the shape.
   *
   * @param pointValue - The point to test.
   * @returns `true` if the point is inside the shape, otherwise `false`.
   */
  isPointInside(pointValue: PointValue): boolean;

  /**
   * Computes the distance from this shape to another shape of the same type.
   *
   * @param other - The other shape to measure distance to.
   */
  computeDistanceToOther(other: this): number;

  /**
   * Determines if this shape is exactly edge-to-edge with another shape.
   *
   * @param other - The other shape to compare with.
   * @returns `true` if the shapes are touching at their edges, otherwise `false`.
   */
  isEdgeToEdgeWithOther(other: this): boolean;

  /**
   * Determines if this shape is colliding (overlapping) with another shape.
   *
   * @param other - The other shape to check collision with.
   * @returns `true` if the shapes are colliding, otherwise `false`.
   */
  isCollidingWithOther(other: this): boolean;
};

/**
 * A type alias for any shape that conforms to the BoxedShape interface.
 */
export type AnyBoxedShape = BoxedShape<AnyValueRepresentable>;
