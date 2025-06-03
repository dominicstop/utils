import { Angle } from "./Angle";
import { BoxedShape } from "./interfaces/BoxedShape";
import { Point } from "./Point";
import { Rect } from "./Rect";


export type BoxedCircleValue = {
  center: Point;
  radius: number;
};

export type BoxedCircleInit = {
  mode: 'relativeToOrigin';
  origin: Point;
  radius: number;
} | (
  BoxedCircleValue & {
    mode: 'relativeToCenter';
  }
);

export class BoxedCircle implements BoxedShape<
  BoxedCircle,
  BoxedCircleValue
> {
  origin: Point;
  radius: number;

  epsilon: number = 1e-10;

  constructor(args: BoxedCircleInit){
    this.radius = args.radius;

    switch(args.mode) {
      case 'relativeToOrigin':
        this.origin = args.origin;
        break;

      case 'relativeToCenter':
        const originX = args.center.x - args.radius;
        const originY = args.center.y - args.radius;

        this.origin = new Point({
          x: originX,
          y: originY
        });
        break;
    };
  }

  get asValue(): BoxedCircleValue {
    return {
      center: this.center,
      radius: this.radius,
    };
  };

  get diameter(): number {
    return this.radius * 2;
  };

  get center(): Point {
    return new Point({
      x: this.origin.x + this.radius,
      y: this.origin.y + this.radius,
    });
  };

  get boundingBox(): Rect {
    const diameter = this.diameter;

    return new Rect({
      mode: 'originAndSize',
      origin: this.origin,
      size: {
        width: diameter,
        height: diameter,
      },
    });
  };

  clone(): BoxedCircle {
    return new BoxedCircle({
      mode: 'relativeToOrigin',
      origin: this.origin,
      radius: this.radius,
    });
  };

  pointAlongPath(angle: Angle): Point {
    return angle.getPointAlongCircle({
      centerPoint: this.center,
      radius: this.radius,
      isClockwise: false,
    });
  };

  isPointInside(point: Point): boolean {
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;

    // squared distance between the point and the circle's center
    const distSq = dx * dx + dy * dy;

    // squared radius
    const radiusSq = this.radius * this.radius;

    return distSq <= radiusSq;
  };

  computeDistanceToOther(other: BoxedCircle): number {
    return this.center.getDistance(other.center);
  };

  isEdgeToEdgeWithOther(other: this): boolean {
    return BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(this, other, this.epsilon);
  };

  isCollidingWithOther(other: this): boolean {
    return BoxedCircle.checkCollisionBetweenTwoCircles(this, other, this.epsilon);
  };

  // MARK: - Init Alias
  // ------------------

  static initFromValue(args: BoxedCircleValue): BoxedCircle {
    return new BoxedCircle({
      mode: 'relativeToCenter',
      center: args.center,
      radius: args.radius,
    });
  };

  // MARK: - Static Methods
  // ----------------------

  /**
   * Collision detection for two circles
   *
   * * Two circles are overlapping if the distance between their centers is less than
   *   the sum of their radii:  `d < (r1 + r2)`
   */
  static checkCollisionBetweenTwoCircles(
    circleA: BoxedCircle,
    circleB: BoxedCircle,
    epsilon: number = 1e-10
  ): boolean {
    const distance = circleA.computeDistanceToOther(circleB);
    const radiusSum = circleA.radius + circleB.radius;

    return distance <= radiusSum + epsilon;
  };

  /**
   * Two circles are "edge-to-edge" (touching) if: `d=r1+r2`
   */
  static checkIfTwoCirclesAreEdgeToEdge(
    circleA: BoxedCircle,
    circleB: BoxedCircle,
    epsilon: number = 1e-10
  ): boolean {
    const distance = circleA.computeDistanceToOther(circleB);
    const expectedDistance = circleA.radius + circleB.radius;

    return Math.abs(distance - expectedDistance) < epsilon;
  };

  /**
   *
   * Collision Detection (Circle-Box)
   *
   * * A circle (x, y, r) is inside a box defined by minimum (xmin, ymin)
   *   and maximum (xmax, ymax) coordinates if:
   * ```
   * x - r >= xmin
   * x + r <= xmax
   * y - r >= ymin
   * y + r <= ymax
   * ```
   */
  static checkIfCircleIsInsideRect(
    circle: BoxedCircle,
    rect: Rect,
    epsilon: number = 1e-10
  ): boolean {
    const { x: centerX, y: centerY } = circle.center;
    const r = circle.radius;

    return (
      (centerX - r) >= (rect.minX - epsilon) &&
      (centerX + r) <= (rect.maxX + epsilon) &&
      (centerY - r) >= (rect.minY - epsilon) &&
      (centerY + r) <= (rect.maxY + epsilon)
    );
  };
};
