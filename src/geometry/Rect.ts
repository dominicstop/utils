import { BoxedPolygon } from "./interfaces/BoxedPolygon";
import { Point, PointValue } from "./Point";
import { UniformScaleConfig } from "./Scalelable";
import { SizeValue } from "./Size";


export type RectValue = {
  origin: PointValue;
  size: SizeValue;
};

export type RectMinMaxDimensions = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type RectCorners = {
  topLeftPoint: Point;
  topRightPoint: Point;
  bottomLeftPoint: Point;
  bottomRightPoint: Point;
};

export type RectCornerKey = keyof RectCorners;

export type RectInit = (
  RectValue & {
    mode: 'originAndSize';
  }
) | (
  RectMinMaxDimensions & {
    mode: 'corners';
  }
);

export class Rect implements BoxedPolygon<
  RectValue
> {
  origin: Point;
  size: SizeValue;

  constructor(args: RectInit){
    switch (args.mode) {
      case 'originAndSize':
        this.origin = new Point(args.origin);
        this.size = args.size;
        break;

      case 'corners':
        this.origin = new Point({
          x: args.minX,
          y: args.minY
        });

        this.size = {
          width: args.maxX - args.minX,
          height: args.maxY - args.minY
        };
        break;

      default:
        this.origin = Point.zero;
        this.size = { width: 0, height: 0 };
        break;
    };
  };
;
  // MARK: Getter + Setter
  // ---------------------

  get minX(): number {
    return this.origin.x;
  };

  set minX(value: number) {
    this.origin.x = value;
  };

  get minY(): number {
    return this.origin.y;
  };

  set minY(value: number) {
    this.origin.y = value;
  };

  get midX(): number {
    return this.origin.x + (this.size.width / 2);
  };

  set midX(value: number) {
    this.origin.x = value - (this.width / 2);
  };

  get midY(): number {
    return this.origin.y + (this.size.height / 2);
  };

  set midY(value: number) {
    this.origin.y = value - (this.height / 2);
  };

  get maxX(): number {
    return this.origin.x + this.size.width;
  };

  set maxX(value: number) {
    this.origin.x = value - this.width;
  };

  get maxY(): number {
    return this.origin.y + this.size.height;
  };

  set maxY(value: number) {
    this.origin.y = value - this.height;
  };

  // MARK: Computed Properties
  // -------------------------

  get asValue(): RectValue {
    return {
      origin: this.origin,
      size: this.size,
    };
  };

  get boundingBox(): Rect {
    return new Rect({
      mode: 'originAndSize',
      ...this.asValue,
    });
  };

  get width(): number {
    return this.size.width;
  };

  get height(): number {
    return this.size.height;
  };

  get isNaN(): boolean {
    return (
         Number.isNaN(this.origin.x)
      || Number.isNaN(this.origin.y)
      || Number.isNaN(this.size.width)
      || Number.isNaN(this.size.height)
    );
  };

  get area(): number {
    return this.width * this.height;
  };

  // MARK: Computed Properties - Points
  // ----------------------------------

  get minMaxDimensions(): RectMinMaxDimensions {
    return {
      minX: this.minX,
      minY: this.minY,
      maxX: this.maxX,
      maxY: this.maxY,
    };
  };

  get center(): Point {
    return new Point({
        x: this.midX,
        y: this.midY
    });
  };

  get topMidPoint(): Point {
    return new Point({
      x: this.midX,
      y: this.minY
    });
  };

  get bottomMidPoint(): Point {
    return new Point({
      x: this.midX,
      y: this.maxY
    });
  };

  get leftMidPoint(): Point {
    return new Point({
      x: this.minX,
      y: this.midY
    });
  };

  get rightMidPoint(): Point {
    return new Point({
      x: this.maxX,
      y: this.midY
    });
  };

  get topLeftPoint(): Point {
    return new Point({
      x: this.minX,
      y: this.minY
    });
  };

  get topRightPoint(): Point {
    return new Point({
      x: this.maxX,
      y: this.minY
    });
  }

  get bottomLeftPoint(): Point {
    return new Point({
      x: this.minX,
      y: this.maxY
    });
  }

  get bottomRightPoint(): Point {
    return new Point({
      x: this.maxX,
      y: this.maxY
    });
  };

  get cornerPointsAsArray(): Array<Point> {
    return [
      this.topLeftPoint,
      this.topRightPoint,
      this.bottomLeftPoint,
      this.bottomRightPoint,
    ];
  };

  // MARK: Methods
  // -------------

  clone(): Rect {
    return new Rect({
      mode: 'originAndSize',
      origin: this.origin,
      size: this.size,
    });
  };

  computeDistanceToOther(other: Rect){
    return this.center.getDistance(other.center);
  };

  isPointInside(pointValue: PointValue): boolean {
    const { x, y } = pointValue;
    return (
      x >= this.minX &&
      x <= this.maxX &&
      y >= this.minY &&
      y <= this.maxY
    );
  }

  isEdgeToEdgeWithOther(other: this): boolean {
    return (
      this.maxX === other.minX || this.minX === other.maxX ||
      this.maxY === other.minY || this.minY === other.maxY
    ) && (
      this.maxY >= other.minY && this.minY <= other.maxY &&
      this.maxX >= other.minX && this.minX <= other.maxX
    );
  };

  isCollidingWithOther(other: this): boolean {
    return !(
      this.maxX <= other.minX ||
      this.minX >= other.maxX ||
      this.maxY <= other.minY ||
      this.minY >= other.maxY
    );
  };

  setPointCenter(newCenterPoint: Point){
    const newX = newCenterPoint.x - (this.width / 2);
    const newY = newCenterPoint.y - (this.height / 2);

    this.origin.x = newX;
    this.origin.y = newY;
  };

  getCornerPoint(cornerKey: RectCornerKey): Point {
    switch (cornerKey) {
      case 'topLeftPoint':
        return this.topLeftPoint.clone();

      case 'bottomLeftPoint':
        return this.bottomLeftPoint.clone();

      case 'bottomRightPoint':
        return this.bottomRightPoint.clone();

      case 'topRightPoint':
        return this.topRightPoint.clone();
    };
  };

  setCornerPoint(
    cornerKey: RectCornerKey,
    newValue: Point
  ): void {
    switch (cornerKey) {
      case 'topLeftPoint':
        this.minX = newValue.x;
        this.minY = newValue.y;
        break;

      case 'bottomLeftPoint':
        this.minX = newValue.x;
        this.maxY = newValue.y;
        break;

      case 'bottomRightPoint':
        this.maxX = newValue.x;
        this.maxY = newValue.y;
        break;

      case 'topRightPoint':
        this.maxX = newValue.x;
        this.maxY = newValue.y;
        break;
    };
  };

  applyScaleToNewSize(newSize: SizeValue){
    let center = this.center;

    let newX = center.x - (newSize.width / 2);
    let newY = center.y - (newSize.height / 2);

    this.origin.x = newX;
    this.origin.y = newY;
  };

  applyUniformScaleByFactor(args: UniformScaleConfig): void {
    const scaleFactor = args.percentAmount;

    let anchor: Point = (() => {
      switch (args.anchorReference.mode) {
        case 'relativeToOrigin':
          return this.origin.clone();

        case 'relativeToCenter':
          return this.center;

        case 'relativeToRectCorner':
          return this.getCornerPoint(args.anchorReference.cornerKey);
      };
    })();

    const newWidth = this.width * scaleFactor;
    const newHeight = this.height * scaleFactor;

    this.size = {
      width: newWidth,
      height: newHeight,
    };

    switch (args.anchorReference.mode) {
      case 'relativeToOrigin':
        this.origin = anchor;
        break;

      case 'relativeToCenter':
        this.setPointCenter(anchor);
        break;

      case 'relativeToRectCorner':
        this.setCornerPoint(args.anchorReference.cornerKey, anchor);
        break;
    };
  }

  scaledUniformallyByFactor(args: UniformScaleConfig): this {
    const clone = this.clone();
    clone.applyUniformScaleByFactor(args);
    return clone as this;
  };

  // MARK: - Static Members - Alias Init
  // -----------------------------------

  static initFromValue(args: RectValue): Rect {
    return new Rect({
      mode: 'originAndSize',
      ...args,
    });
  };
}
