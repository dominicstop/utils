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

  computeDistanceBewteenOtherCircle(otherCircle: BoxedCircle): number {
    return BoxedCircle.distanceBetweenCircles(this, otherCircle);
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

  static distanceBetweenCircles(circleA: BoxedCircle, circleB: BoxedCircle): number {
    const dx = circleA.centerPoint.x - circleB.centerPoint.x;
    const dy = circleA.centerPoint.y - circleB.centerPoint.y;

    return Math.sqrt(dx * dx + dy * dy);
  };
};