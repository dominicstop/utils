import { Rect } from "./Rect";
import { Angle, AngleValue } from "./Angle";
import { BoxedCircle } from "./BoxedCircle";
import { Point } from "./Point";
import { Line } from "./Line";
import { Vector2DValue } from "./Vector2D";
import { BoxedPolygon } from "./interfaces/BoxedPolygon";
import { UniformScaleConfig } from "./Scalelable";

export type HexagonType = 'pointyTopped' | 'flatTopped';

export type BoxedHexagonValue = {
  circumRadius: number;
  startAngleOffset?: AngleValue;
  center: Point;
};

export type BoxedHexagonInit = (
  Pick<BoxedHexagonValue,
    | 'circumRadius'
    | 'startAngleOffset'
  >
) & (
  {
    mode: 'relativeToCenter'
    center: Point;
  } | {
    mode: 'relativeToOrigin';
    origin: Point;
  }
);

export class BoxedHexagon implements BoxedPolygon<BoxedHexagonValue> {

  origin: Point;
  circumRadius: number;
  startAngleOffset: Angle;

  constructor(args: BoxedHexagonInit){
    this.circumRadius = args.circumRadius;

    const angleValue = args.startAngleOffset ?? {
      angleUnit: 'degrees',
      angleValue: 0,
    };

    this.startAngleOffset = new Angle(angleValue);

    this.origin = (() => {
      switch(args.mode){
        case 'relativeToCenter':
          const originX = args.center.x - args.circumRadius;
          const originY = args.center.y - args.circumRadius;

          return new Point({
            x: originX,
            y: originY,
          });

        case 'relativeToOrigin':
          return new Point({
            x: args.origin.x,
            y: args.origin.y,
          });
      };
    })();
  }

  // MARK: Getter + Setter Pairs
  // ---------------------------

  get center(): Point {
    return this.circumCircle.center;
  };

  set center(newCenter: Point) {
    const originX = newCenter.x - this.circumRadius;
    const originY = newCenter.y - this.circumRadius;

    this.origin = new Point({
      x: originX,
      y: originY
    });
  };

  // MARK: Getters
  // -------------

  get asValue(): BoxedHexagonValue {
    return {
      center: this.boundingBox.center,
      circumRadius: this.circumRadius,
      startAngleOffset: this.startAngleOffset.asValue,
    };
  };

  // distance between two adjacent points
  get sideLength(): number {
    return this.circumRadius;
  };

  get perimeter(): number {
    return this.circumRadius * 6;
  };

  get inRadius(): number {
    return this.circumRadius * Math.sqrt(3) / 2;
  };

  get apothem(): number {
    return this.inRadius;
  };

  get inCircle(): BoxedCircle {
    const inRadius = this.inRadius;

    return new BoxedCircle({
      mode: 'relativeToCenter',
      center: this.boundingBox.center,
      radius: inRadius,
    });
  };

  get circumCircle(): BoxedCircle {
    return new BoxedCircle({
      mode: 'relativeToOrigin',
      origin: this.origin,
      radius: this.circumRadius,
    });
  };

  get boundingBox(): Rect {
    return Point.getBoundingBoxForPoints(this.cornerPointsAsArray);
  };

  get cornerAngles(): Array<Angle> {
    const angles: Array<Angle> = [];
    const minAngle = 360 / 6;

    let currentAngle = this.startAngleOffset.degrees;
    for(let i = 0; i < 6; i ++){
      currentAngle += minAngle;

      const newAngle = new Angle({
        angleUnit: 'degrees',
        angleValue: currentAngle
      });

      angles.push(newAngle);
    };

    return angles;
  };

  get cornerPointsAsArray(): Array<Point> {
    const centerPoint = this.circumCircle.center;

    return this.cornerAngles.map((angleItem) => (
      angleItem.getPointAlongCircle({
        radius: this.circumRadius,
        centerPoint,
        isClockwise: false,
      })
    ));
  };

  get edgeLines(): Array<Line> {
    const cornerPoints = this.cornerPointsAsArray;

    let lines: Array<Line> = [];

    for (let index = 0; index < cornerPoints.length; index++) {
      const nextIndex = (index + 1) % cornerPoints.length;

      const pointCurrent = cornerPoints[index];
      const pointNext = cornerPoints[nextIndex];

      const line = new Line({
        startPoint: pointCurrent,
        endPoint: pointNext,
      });

      lines.push(line);
    }

    return lines;
  };

  get area(): number {
    return (3 * Math.sqrt(3) * Math.pow(this.circumRadius, 2)) / 2;
  };

  get edgeMidpoints(): Array<Point> {
    return this.edgeLines.map(line => line.midPoint);
  };

  // MARK: Methods
  // -------------

  clone(): BoxedHexagon {
    return new BoxedHexagon({
      mode: 'relativeToOrigin',
      origin: this.origin.clone(),
      circumRadius: this.circumRadius,
      startAngleOffset: this.startAngleOffset.asValue,
    });
  };

  computeTiledHexagonAlongsideEdge(args: {
    edgeLine: Line;
    extraPositionOffset?: number;
  }): BoxedHexagon {
    const extraPositionOffset = args.extraPositionOffset ?? 0;
    const centerPoint = this.boundingBox.center;

    const apothemLine = new Line({
      startPoint: centerPoint,
      endPoint: args.edgeLine.midPoint,
    });

    const apothemDistance = apothemLine.distance * 2;

    const { stopPoint: nextCenterPoint } =
      apothemLine.traverseByDistance(apothemDistance + extraPositionOffset);

    return new BoxedHexagon({
      mode: 'relativeToCenter',
      center: nextCenterPoint,
      circumRadius: this.circumRadius,
    });
  };

  isPointInside(point: Point): boolean {
    const center = this.center;

    const dx = Math.abs(point.x - center.x);
    const dy = Math.abs(point.y - center.y);

    const r = this.circumRadius;

    return (
      (dx <= r && dy <= this.inRadius) &&
      (this.inRadius * r - this.inRadius * dx - r * dy + dx * dy) >= 0
    );
  };

  rotatedByAngle(angle: Angle): BoxedHexagon {
    const newAngle = this.startAngleOffset.addOtherAngle(angle);

    return new BoxedHexagon({
      mode: 'relativeToOrigin',
      origin: this.origin,
      circumRadius: this.circumRadius,
      startAngleOffset: newAngle.asValue,
    });
  };

  translatedByOffset(offset: Vector2DValue): BoxedHexagon {
    const [newOrigin] = Point.translatePoints({
      points: [this.origin],
      dx: offset.dx,
      dy: offset.dy
    });

    return new BoxedHexagon({
      mode: 'relativeToOrigin',
      origin: newOrigin,
      circumRadius: this.circumRadius,
      startAngleOffset: this.startAngleOffset.asValue,
    });
  };

  computeDistanceToOther(other: BoxedHexagon): number {
    return this.center.getDistance(other.center);
  };

  /**
   * returns true if this hexagon is edge-to-edge with another hexagon.
   *
   * * in a regular hex grid, two hexagons are touching if the distance
   *   between their centers equals exactly: `2 * sideLength` (i.e.
   *   one full edge length apart).
   *
   * - This check uses the Manhattan distance approximation for performance and simplicity.
   */
  isEdgeToEdgeWithOther(other: this): boolean {
    const dx = Math.abs(this.center.x - other.center.x);
    const dy = Math.abs(this.center.y - other.center.y);

    const maxDist = this.sideLength * 2;
    return Math.abs(dx + dy - maxDist) < 1e-6;
  }

  /**
   * returns true if this hexagon is colliding with another hexagon.
   *
   * * two hexagons are considered colliding if the distance between their centers
   *   is less than the sum of their in-radius (i.e. shortest distance from center to edge).
   *
   * * this uses squared distance to avoid unnecessary square root computation.
   */
  isCollidingWithOther(other: this): boolean {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;

    const distSq = dx * dx + dy * dy;
    const minDist = this.inRadius + other.inRadius;

    return distSq < minDist * minDist;
  }

  applyUniformScaleByFactor(args: UniformScaleConfig): void {
    const { percentAmount, anchorReference } = args;
    const scaleFactor = percentAmount;

    const originalCenter = this.center;
    this.circumRadius *= scaleFactor;

    let anchor: Point;
    switch (anchorReference.mode) {
      case 'relativeToOrigin':
        anchor = this.origin.clone();
        break;
      case 'relativeToCenter':
        anchor = originalCenter;
        break;
      case 'relativeToRectCorner':
        anchor = this.boundingBox.getCornerPoint(anchorReference.cornerKey);
        break;
    }

    const newCenter = this.center;
    const deltaX = anchor.x - newCenter.x;
    const deltaY = anchor.y - newCenter.y;

    this.origin = new Point({
      x: this.origin.x + deltaX,
      y: this.origin.y + deltaY,
    });
  }

  scaledUniformallyByFactor(args: UniformScaleConfig): this {
    const clone = this.clone();
    clone.applyUniformScaleByFactor(args);
    return clone as this;
  }

  // MARK: Alias Init
  // ----------------

  static recenterHexagonsRelativeToPoint(args: {
    hexagons: Array<BoxedHexagon>;
    centerPoint: Point;
  }){

    const allPoints = args.hexagons.reduce<Point[]>(
      (acc, curr) => {
        acc.push(...curr.cornerPointsAsArray);
        return acc;
      },
      []
    );

    const boundingBox = Point.getBoundingBoxForPoints(allPoints);

    const currentCenter = boundingBox.center;
    const pointAdj = currentCenter.getDelta(args.centerPoint);

    args.hexagons.forEach(hexagon => {
      const adjX = hexagon.origin.x - pointAdj.x;
      const adjY = hexagon.origin.y - pointAdj.y;

      hexagon.origin = new Point({
        x: adjX,
        y: adjY,
      });
    });
  };

  static initFromValue(args: BoxedHexagonValue): BoxedHexagon {
    return new BoxedHexagon({
      mode: 'relativeToCenter',
      ...args,
    });
  };

  static initFromPresetHexagon(args: BoxedHexagonInit & {
    hexagonType: HexagonType
  }){
    // NOTE:
    // Flat Topped Hexagon: 0°, 60°, 120°, 180°, 240°, 300°... (offset of 60)
    // Pointy-topped Hexagons: 30°, 90°, 150°, 210°, 270°, 330°... (offset of 30)
    //
    const angleOffset = new Angle({
      angleUnit: 'degrees',
      angleValue: args.hexagonType === 'flatTopped' ? 0 : 30,
    });

    const hexagon = new BoxedHexagon(args);
    hexagon.startAngleOffset = angleOffset;

    return hexagon;
  };
};

