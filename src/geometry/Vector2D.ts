import { Cloneable } from "../types/Cloneable";
import { Angle } from "./Angle";
import { Point, PointValue } from "./Point";

export type Vector2DValue = {
  dx: number;
  dy: number;
};

export class Vector2D implements Cloneable<Vector2D> {

  dx: number;
  dy: number;

  epsilon: number = 1e-10;

  constructor(args: Vector2DValue) {
    this.dx = args.dx;
    this.dy = args.dy;
  }

  get asValue(): Vector2DValue {
    return {
      dx: this.dx,
      dy: this.dy,
    };
  }

  get asPoint(): Point {
    return new Point({
      x: this.dx,
      y: this.dy,
    });
  };

  get asPointValue(): PointValue {
    return {
      x: this.dx,
      y: this.dy,
     };
  };

  // MARK: - Computed Properties
  // ---------------------------

  get magnitude(): number {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
  }

  get normalized(): Vector2D {
    const magnitude = this.magnitude;
    if (magnitude === 0) {
      return Vector2D.zero;
    };

    return this.divideByScalar(magnitude);
  }

  get isZero(): boolean {
    return (
      Math.abs(this.dx) < this.epsilon &&
      Math.abs(this.dy) < this.epsilon
    );
  }

  get isUnit(): boolean {
    return Math.abs(this.magnitude - 1) < this.epsilon;
  }

  get perpendicular(): Vector2D {
    return new Vector2D({
      dx: -this.dy,
      dy: this.dx
    });
  }

  get inverse(): Vector2D {
    return new Vector2D({
      dx: -this.dx,
      dy: -this.dy
    });
  }

  /**
   * Returns the angle in radians from the positive x-axis to the vector.
   */
  get angle(): Angle {
    const angle = Math.atan2(this.dy, this.dx);
    return Angle.initFromRadians(angle);
  };

  // MARK: - Methods
  // ---------------

  clone(): Vector2D {
    return new Vector2D(this.asValue);
  };

  computeDistanceFromOtherVector(otherVector: Vector2D): number {
    return Vector2D.distanceBetweenTwoVectors(this, otherVector);
  }

  isEqualToOtherVector(
    otherVector: Vector2D,
    tolerance: number = this.epsilon
  ): boolean {

    return (
      Math.abs(this.dx - otherVector.dx) < tolerance &&
      Math.abs(this.dy - otherVector.dy) < tolerance
    );
  }


  addWithOtherVector(otherVector: Vector2D): Vector2D {
    return new Vector2D({
      dx: this.dx + otherVector.dx,
      dy: this.dy + otherVector.dy,
    });
  }

  subtractWithOtherVector(otherVector: Vector2D): Vector2D {
    return new Vector2D({
      dx: this.dx - otherVector.dx,
      dy: this.dy - otherVector.dy,
    });
  }

  multiplyByScalar(scalar: number): Vector2D {
    return new Vector2D({
      dx: this.dx * scalar,
      dy: this.dy * scalar,
    });
  }

  divideByScalar(scalar: number): Vector2D {
    if (scalar === 0) {
      throw new Error("Cannot divide by zero.");
    }
    return new Vector2D({
      dx: this.dx / scalar,
      dy: this.dy / scalar,
    });
  }

  dotProductWithOtherVector(otherVector: Vector2D): number {
    return this.dx * otherVector.dx + this.dy * otherVector.dy;
  }

  /**
   * Rotates the vector by a given angle in radians.
   */
  rotateByAngle(angle: Angle): Vector2D {
    const angleInRadians = angle.radians;

    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    return new Vector2D({
      dx: this.dx * cos - this.dy * sin,
      dy: this.dx * sin + this.dy * cos,
    });
  }

  projectOntoOtherVector(other: Vector2D): Vector2D {
    const scalar = this.dotProductWithOtherVector(other) / other.magnitude ** 2;
    return other.multiplyByScalar(scalar);
  }

  angleBetweenOtherVector(other: Vector2D): Angle {
    const dot = this.dotProductWithOtherVector(other);
    const mags = this.magnitude * other.magnitude;
    const angle = Math.acos(Math.min(Math.max(dot / mags, -1), 1));

    return Angle.initFromRadians(angle);
  }

  crossProductWithOtherVector(other: Vector2D): number {
    return this.dx * other.dy - this.dy * other.dx;
  }

  reflectOverOtherVector(vector: Vector2D): Vector2D {
    const vectorNormalized = vector.normalized;
    const dot = this.dotProductWithOtherVector(vectorNormalized);

    return vectorNormalized
      .multiplyByScalar(2 * dot)
      .subtractWithOtherVector(this);
  }

  limit(maxMagnitude: number): Vector2D {
    return this.magnitude > maxMagnitude
      ? this.normalized.multiplyByScalar(maxMagnitude)
      : this.clone();
  }

  // MARK: - Static Alias
  // --------------------

  static get zero(): Vector2D {
    return new Vector2D({ dx: 0, dy: 0 });
  }

  static get unitX(): Vector2D {
    return new Vector2D({ dx: 1, dy: 0 });
  }

  static get unitY(): Vector2D {
    return new Vector2D({ dx: 0, dy: 1 });
  }

  // MARK: - Static Init
  // -------------------

  static initFromAngle(
    angle: Angle,
    magnitude: number = 1
  ): Vector2D {

    const radians = angle.radians;
    return new Vector2D({
      dx: Math.cos(radians) * magnitude,
      dy: Math.sin(radians) * magnitude,
    });
  }

  static initFromPoints(
    p1: PointValue,
    p2: PointValue
  ): Vector2D {

    return new Vector2D({
      dx: p2.x - p1.x,
      dy: p2.y - p1.y,
    });
  }

  // MARK: Static Methods
  // --------------------

  static computeAverage(vectors: Vector2D[]): Vector2D {
    if (vectors.length === 0) return Vector2D.zero;

    const sum = vectors.reduce(
      (acc, v) => acc.addWithOtherVector(v),
      Vector2D.zero
    );

    return sum.divideByScalar(vectors.length);
  }

  static distanceBetweenTwoVectors(
    vectorA: Vector2D,
    vectorB: Vector2D
  ): number {
    const dx = vectorA.dx - vectorB.dx;
    const dy = vectorA.dy - vectorB.dy;

    return Math.sqrt(dx * dx + dy * dy);
  }
}
