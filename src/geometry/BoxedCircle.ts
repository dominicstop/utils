import { Angle } from "./Angle";
import { BoxedShape } from "./interfaces/BoxedShape";
import { Point } from "./Point";
import { Rect } from "./Rect";
import { UniformScaleConfig } from "./Scalelable";


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
  };

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

  set center(newCenter: Point) {
    const originX = newCenter.x - this.radius;
    const originY = newCenter.y - this.radius;

    this.origin = new Point({
      x: originX,
      y: originY
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
    return BoxedCircle.computeDistanceBetweenTwoCricles(this, other);
  };

  isEdgeToEdgeWithOther(other: this): boolean {
    return BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(this, other, this.epsilon);
  };

  isCollidingWithOther(other: this): boolean {
    return BoxedCircle.checkCollisionBetweenTwoCircles(this, other, this.epsilon);
  };

  applyUniformScaleByFactor(args: UniformScaleConfig): void {
    const scaleFactor = args.percentAmount;

    const oldRadius = this.radius;
    const newRadius = oldRadius * scaleFactor;

    switch (args.anchorReference.mode) {
      case 'relativeToOrigin':
        this.radius = newRadius;
        break;

      case 'relativeToCenter':
        const currentCenter = this.center;
        this.radius = newRadius;
        this.center = currentCenter;
        break;

      case 'relativeToRectCorner':
        const boundingBox = this.boundingBox;
        const fixedCorner = boundingBox.getCornerPoint(args.anchorReference.cornerKey);

        const newDiameter = newRadius * 2;

        const newBoundingBox = new Rect({
          mode: 'originAndSize',
          origin: Point.zero,
          size: {
            width: newDiameter,
            height: newDiameter,
          },
        });

        newBoundingBox.setCornerPoint(
          args.anchorReference.cornerKey,
          fixedCorner
        );

        this.origin = newBoundingBox.origin;
        this.radius = newRadius;
        break;
    }
  }

  scaledUniformallyByFactor(args: UniformScaleConfig): this {
    const copy = this.clone();
    copy.applyUniformScaleByFactor(args);
    return copy as this;
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

  static rotateCirclesRelativeToPoint(args: {
    circles: Array<BoxedCircle>;
    centerPoint: Point;
    rotationAmount: Angle,
  }){

    const centerPoints = args.circles.map(circle => circle.center);

    const centerPointsRotated = Point.rotatePointsRelativeToCenter({
      points: centerPoints,
      rotationAmount: args.rotationAmount,
      center: args.centerPoint,
    });

    for (let index = 0; index < args.circles.length; index++) {
      const centerPointTranslated = centerPointsRotated[index];
      const circle = args.circles[index];

      circle.center = centerPointTranslated;
    };
  };

  static recenterCirclesRelativeToPoint(args: {
    circles: Array<BoxedCircle>;
    centerPoint: Point;
  }){

    const allPoints = args.circles.reduce<Point[]>(
      (acc, curr) => {
        const boundingBox = curr.boundingBox;
        acc.push(...boundingBox.cornerPointsAsArray);
        return acc;
      },
      []
    );

    const boundingBox = Point.getBoundingBoxForPoints(allPoints);

    const currentCenter = boundingBox.center;
    const pointAdj = currentCenter.getDelta(args.centerPoint);

    args.circles.forEach(circle => {
      const adjX = circle.origin.x - pointAdj.x;
      const adjY = circle.origin.y - pointAdj.y;

      circle.origin = new Point({
        x: adjX,
        y: adjY,
      });
    });
  };

  /**
   * the distance between the circle's centers minus
   * the sum of their radii:  `d < (r1 + r2)`
   */
  static computeDistanceBetweenTwoCricles(
    circleA: BoxedCircle,
    circleB: BoxedCircle
  ): number {
    const centerDistance = circleA.center.getDistance(circleB.center);
    const radiusSum = circleA.radius + circleB.radius;

    return centerDistance - radiusSum;
  };

  /**
   * Collision detection for two circles:
   * returns true if two circles are colliding
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
    return distance < epsilon;
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
    return Math.abs(distance) < epsilon;
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
