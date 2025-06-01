import { InterpolationHelpers } from "../helpers";
import { Cloneable } from "../types/Cloneable";
import { ValueRepresentable } from "../types/ValueRepresentable";
import { Line } from "./Line";
import { Rect } from "./Rect";
import { Vector2D } from "./Vector2D";


export type PointValue = {
  x: number;
  y: number;
};

export class Point implements
  Cloneable<Point>,
  ValueRepresentable<PointValue>
{

  x: number;
  y: number;

  epsilon: number = 1e-10;

  constructor(args: PointValue){
    this.x =  args.x;
    this.y =  args.y;
  };

  get asValue(): PointValue {
    return {
      x: this.x,
      y: this.y,
    };
  };

  get asVector(): Vector2D {
    return new Vector2D({
      dx: this.x,
      dy: this.y,
    });
  };

  get magnitude(): number {
    return this.asVector.magnitude;
  }

  get normalized(): Vector2D {
    return this.asVector.normalized;
  };

  // MARK: - Methods
  // ---------------

  clone(): Point {
    return new Point({
      x: this.x,
      y: this.y
    });
  }

  isEqualToOtherPoint(otherPoint: Point): boolean {
    return (
      Math.abs(this.x - otherPoint.x) < this.epsilon &&
      Math.abs(this.y - otherPoint.y) < this.epsilon
    );
  }

  get isZero(): boolean {
    return (
      Math.abs(this.x) < this.epsilon &&
      Math.abs(this.y) < this.epsilon
    );
  };

  get isNaN(): boolean {
    return (
         Number.isNaN(this.x)
      || Number.isNaN(this.y)
    );
  };


  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }

  createLine(otherPoint: Point): Line {
    return new Line({
      startPoint: this,
      endPoint:  otherPoint
    });
  };

  getDistance(otherPoint: Point): number {
    return Point.getDistanceBetweenTwoPoints(this, otherPoint);
  };

  getDelta(otherPoint: Point): Point {
    return new Point({
      x: this.x - otherPoint.x,
      y: this.y - otherPoint.y,
    });
  };

  getSum(...otherPoints: Array<Point>): Point {
    return Point.sumOfAllPoints(this, ...otherPoints);
  };

  getMidpointBetweenOtherPoint(otherPoint: Point): Point {
    const line = this.createLine(otherPoint);
    return line.midPoint;
  };

  // MARK: - Static Alias
  // --------------------

  static get zero(): Point {
    return new Point({ x: 0, y: 0 });
  };

  // MARK: - Static Methods
  // ----------------------

  static lerp(
    valueStart: Point,
    valueEnd: Point,
    percent: number
  ): Point {

    const nextX = InterpolationHelpers.lerp(
      valueStart.x,
      valueEnd.x,
      percent
    );

    const nextY = InterpolationHelpers.lerp(
      valueStart.y,
      valueEnd.y,
      percent
    );

    return new Point({
      x: nextX,
      y: nextY
    });
  };

  static getBoundingBoxForPoints(points: Array<Point>): Rect {
    const valuesX = points.map(point => point.x);
    const valuesY = points.map(point => point.y);

    const sortedValuesX = valuesX.sort((a, b) => a - b);
    const sortedValuesY = valuesY.sort((a, b) => a - b);

    const minX = sortedValuesX[0] ?? 0;
    const maxX = sortedValuesX[valuesX.length - 1] ?? 0;

    const minY = sortedValuesY[0] ?? 0;
    const maxY = sortedValuesY[valuesY.length - 1] ?? 0;

    return new Rect({
      mode: 'corners',
      minX,
      maxX,
      minY,
      maxY,
    });
  };

  static translatePoints(args: {
    points: Array<Point>;
    dx: number;
    dy: number;
  }): Array<Point> {
    const boundingBox = this.getBoundingBoxForPoints(args.points);

    // calc the translation for the derived bounding box
    const translatedOrigin = new Point({
      x: boundingBox.origin.x + args.dx,
      y: boundingBox.origin.y + args.dy
    });

    // adj each point by translation
    return args.points.map(point => {
      const adjX = translatedOrigin.x - boundingBox.origin.x;
      const adjY = translatedOrigin.y - boundingBox.origin.y;

      return new Point({
        x: point.x + adjX,
        y: point.y + adjY
      });
    });
  };

  static sumOfAllPoints(...points: Array<Point>){
    let sumX = 0;
    let sumY = 0;

    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    };

    return new Point({ x: sumX, y: sumY });
  };

  static getDistanceBetweenTwoPoints(pointA: Point, pointB: Point): number {
    const line = pointA.createLine(pointB);
    return line.distance;
  };
};
