import { Angle } from "./Angle";
import { Point, PointValue } from "./Point";

export type VectorValue = {
  dx: number;
  dy: number;
};

export class Vector {

  dx: number;
  dy: number;

  constructor(args: VectorValue) {
    this.dx = args.dx;
    this.dy = args.dy;
  }

  get asValue(): VectorValue {
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

  get normalized(): Vector {
    const magnitude = this.magnitude;
    if (magnitude === 0) {
      return Vector.zero;
    };

    return this.divideByScalar(magnitude);
  }

  get isZero(): boolean {
    return this.dx === 0 && this.dy === 0;
  }

  get isUnit(): boolean {
    return this.magnitude === 1;
  }

  get perpendicular(): Vector {
    return new Vector({ 
      dx: -this.dy, 
      dy: this.dx
    });
  }

  get inverse(): Vector {
    return new Vector({ 
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

  clone(): Vector {
    return new Vector({ 
      dx: this.dx, 
      dy: this.dy
    });
  }

  computeDistanceFromOtherVector(otherVector: Vector): number {
    return Vector.distanceBetweenTwoVectors(this, otherVector);
  }

  isEqualToOtherVector(
    otherVector: Vector, 
    tolerance: number = 0.0001
  ): boolean {
    return (
      Math.abs(this.dx - otherVector.dx) < tolerance &&
      Math.abs(this.dy - otherVector.dy) < tolerance
    );
  };

  addWithOtherVector(otherVector: Vector): Vector {
    return new Vector({
      dx: this.dx + otherVector.dx,
      dy: this.dy + otherVector.dy,
    });
  }

  subtractWithOtherVector(otherVector: Vector): Vector {
    return new Vector({
      dx: this.dx - otherVector.dx,
      dy: this.dy - otherVector.dy,
    });
  }

  multiplyByScalar(scalar: number): Vector {
    return new Vector({
      dx: this.dx * scalar,
      dy: this.dy * scalar,
    });
  }

  divideByScalar(scalar: number): Vector {
    if (scalar === 0) {
      throw new Error("Cannot divide by zero.");
    }
    return new Vector({
      dx: this.dx / scalar,
      dy: this.dy / scalar,
    });
  }

  dotProductWithOtherVector(otherVector: Vector): number {
    return this.dx * otherVector.dx + this.dy * otherVector.dy;
  }

  /**
   * Rotates the vector by a given angle in radians.
   */
  rotateByAngle(angle: Angle): Vector {
    const angleInRadians = angle.radians;

    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    return new Vector({
      dx: this.dx * cos - this.dy * sin,
      dy: this.dx * sin + this.dy * cos,
    });
  }

  projectOntoOtherVector(other: Vector): Vector {
    const scalar = this.dotProductWithOtherVector(other) / other.magnitude ** 2;
    return other.multiplyByScalar(scalar);
  }

  angleBetweenOtherVector(other: Vector): Angle {
    const dot = this.dotProductWithOtherVector(other);
    const mags = this.magnitude * other.magnitude;
    const angle = Math.acos(Math.min(Math.max(dot / mags, -1), 1));
    return Angle.initFromRadians(angle);
  }

  crossProductWithOtherVector(other: Vector): number {
    return this.dx * other.dy - this.dy * other.dx;
  }

  reflectOverOtherVector(vector: Vector): Vector {
    const vectorNormalized = vector.normalized;
    const dot = this.dotProductWithOtherVector(vectorNormalized);

    return vectorNormalized
      .multiplyByScalar(2 * dot)
      .subtractWithOtherVector(this);
  }

  limit(maxMagnitude: number): Vector {
    return this.magnitude > maxMagnitude
      ? this.normalized.multiplyByScalar(maxMagnitude)
      : this.clone();
  }

  // MARK: - Static Alias
  // --------------------

  static get zero(): Vector {
    return new Vector({ dx: 0, dy: 0 });
  }

  static get unitX(): Vector {
    return new Vector({ dx: 1, dy: 0 });
  }

  static get unitY(): Vector {
    return new Vector({ dx: 0, dy: 1 });
  }

  // MARK: - Static Init
  // -------------------

  static initFromAngle(
    angle: Angle, 
    magnitude: number = 1
  ): Vector {

    const radians = angle.radians;
    return new Vector({
      dx: Math.cos(radians) * magnitude,
      dy: Math.sin(radians) * magnitude,
    });
  }

  static initFromPoints(
    p1: PointValue, 
    p2: PointValue
  ): Vector {

    return new Vector({
      dx: p2.x - p1.x,
      dy: p2.y - p1.y,
    });
  }

  // MARK: Static Methods
  // --------------------

  static computeAverage(vectors: Vector[]): Vector {
    if (vectors.length === 0) return Vector.zero;

    const sum = vectors.reduce(
      (acc, v) => acc.addWithOtherVector(v),
      Vector.zero
    );

    return sum.divideByScalar(vectors.length);
  }

  static distanceBetweenTwoVectors(
    vectorA: Vector, 
    vectorB: Vector
  ): number {
    const dx = vectorA.dx - vectorB.dx;
    const dy = vectorA.dy - vectorB.dy;

    return Math.sqrt(dx * dx + dy * dy);
  }
}