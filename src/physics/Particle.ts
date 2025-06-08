import { AnyBoxedShape, Vector2D } from "../geometry";
import { SomeShapeParticle } from "./SomeShapeParticle";


export type ParticleInit<
  ParticleShape extends AnyBoxedShape
> = {
  id: string;
  position: Vector2D;
  mass: number;
  initialVelocity?: Vector2D;
  shape: ParticleShape;
};


export class Particle<
  ParticleShape extends AnyBoxedShape
> implements SomeShapeParticle<ParticleShape> {

  id: string;

  private _position!: Vector2D;
  previousPosition: Vector2D;

  velocity: Vector2D;
  acceleration: Vector2D;

  mass: number;
  inverseMass: number;

  shape: ParticleShape;
  isStatic: boolean;

  get position(): Vector2D {
    return this._position;
  };

  set position(newValue: Vector2D) {
    this._position = newValue;
    this.shape.center = newValue.asPoint;
  };

  constructor(args: ParticleInit<ParticleShape>) {

    this.shape = args.shape;

    this.id = args.id;

    this.position = args.position.clone();
    this.previousPosition = args.position.clone();

    this.mass = args.mass;

    this.inverseMass = (args.mass === 0
      ? 0
      : 1 / args.mass
    );

    this.velocity = args.initialVelocity ?? Vector2D.zero;
    this.acceleration = Vector2D.zero;

    this.isStatic = args.mass === 0;
  };

  clone() {
    const clone = new Particle<ParticleShape>({
      id: this.id,
      position: this.position.clone(),
      shape: this.shape.clone() as ParticleShape,
      mass: this.mass,
      initialVelocity: this.velocity.clone(),
    });

    clone.previousPosition = this.previousPosition.clone();
    return clone;
  };

  applyForce(force: Vector2D): void {
    if(this.isStatic) return;

    const accelerationFromForce = force.multipliedByScalar(this.inverseMass);
    this.acceleration = this.acceleration.addedWithOther(accelerationFromForce);
  };

  update(deltaTime: number): void {
    if (this.isStatic) return;
    this.previousPosition = this.position.clone();

    // get change in velocity due to acceleration over the time step.
    const velocityDelta = this.acceleration.multipliedByScalar(deltaTime);
    this.velocity = this.velocity.addedWithOther(velocityDelta);

    // get change in position due to velocity over the time step.
    const positionDelta = this.velocity.multipliedByScalar(deltaTime);
    this.position = this.position.addedWithOther(positionDelta);
  };

  resetAcceleration(): void {
    this.acceleration = Vector2D.zero;
  };

  getSpeed(): number {
    return this.velocity.magnitude;
  };

  getKineticEnergy(): number {
    return 0.5 * this.mass * this.getSpeed() ** 2;
  };

  setPosition(newPosition: Vector2D): void {
    this.previousPosition = this.position.clone();
    this.position = newPosition;
  };

  setVelocity(newVelocity: Vector2D): void {
    this.velocity = newVelocity;
  };

  setMass(newMass: number): void {
    this.mass = newMass;
    this.inverseMass = ((newMass === 0)
      ? 0
      : 1 / newMass
    );

    this.isStatic = newMass === 0;
  };

  isCollidingWithOther(other: Particle<ParticleShape>): boolean {
    return this.shape.isCollidingWithOther(other.shape);
  };

  computeDistanceToOther(other: Particle<ParticleShape>): number {
    return this.shape.computeDistanceToOther(other.shape);
  };

  computeOverlapVectorWith(other: Particle<ParticleShape>): Vector2D {
    if (!this.isCollidingWithOther(other)) {
      return Vector2D.zero;
    }

    // Vector from other to this
    const direction = this.position.subtractedWithOther(other.position).normalized;

    // overlap depth (negative distance means overlap)
    const distance = this.computeDistanceToOther(other);
    const overlapDepth = -distance;

    return direction.multipliedByScalar(overlapDepth);
  }

  checkIsAtRest(): boolean {
    const restThreshold = 1e-5;
    return this.velocity.magnitude < restThreshold;
  };


isEdgeToEdgeWithOther(other: Particle<ParticleShape>): boolean {
    const distance = this.computeDistanceToOther(other);
    const epsilon = 1e-8; // Small tolerance for floating-point precision

    return Math.abs(distance) < epsilon && !this.isCollidingWithOther(other);
  }
};
