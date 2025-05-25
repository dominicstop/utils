import { Angle } from "./Angle";
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

export class BoxedCircle {
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
  };

  get asValue(): BoxedCircleValue {
    return {
      center: this.centerPoint,
      radius: this.radius,
    };
  };

  get diameter(): number {
    return this.radius * 2;
  };

  get centerPoint(): Point {
    return new Point({
      x: this.origin.x + this.radius,
      y: this.origin.y + this.radius,
    });
  };

  get enclosingRect(): Rect {
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

  pointAlongPath(angle: Angle): Point {
    return angle.getPointAlongCircle({
      centerPoint: this.centerPoint,
      radius: this.radius,
      isClockwise: false,
    });
  };

  computeDistanceFromOtherCircle(otherCircle: BoxedCircle): number {
    return BoxedCircle.computeDistanceBetweenTwoCircles(this, otherCircle);
  };

  isCollidingWithOtherCircle(otherCircle: BoxedCircle): boolean {
    return BoxedCircle.checkCollisionBetweenTwoCircles(this, otherCircle, this.epsilon);
  };

  isEdgeToEdgeWithOtherCircle(otherCircle: BoxedCircle): boolean {
    return BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(this, otherCircle, this.epsilon);
  };

  isInsideRect(rect: Rect): boolean {
    return BoxedCircle.checkIfCircleIsInsideRect(this, rect, this.epsilon);
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
   * Euclidean distance
   * * Given two circles: `c1 = (x1, y1, r1)` and  `c2 = (x2, y2, r2)`
   * 
   * * The distance d between the centers of two circles `(c1, c2)` is computed via the 
   *   Euclidean distance formula.
   * 
   * * formula: `sqrt( (x2 - x1)^2 + (y2 - y1)^2 )`
   */
  static computeDistanceBetweenTwoCircles(circleA: BoxedCircle, circleB: BoxedCircle): number {
    const dx = circleA.centerPoint.x - circleB.centerPoint.x;
    const dy = circleA.centerPoint.y - circleB.centerPoint.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

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
    const distance = this.computeDistanceBetweenTwoCircles(circleA, circleB);
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
    const distance = this.computeDistanceBetweenTwoCircles(circleA, circleB);
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
    const { x: centerX, y: centerY } = circle.centerPoint;
    const r = circle.radius;
  
    return (
      (centerX - r) >= (rect.minX - epsilon) &&
      (centerX + r) <= (rect.maxX + epsilon) &&
      (centerY - r) >= (rect.minY - epsilon) &&
      (centerY + r) <= (rect.maxY + epsilon)
    );
  };
};