import { Vector2D } from "../geometry";

export interface AnyParticle {

  /* Unique identifier for tracking, debugging, or specific interactions **/
  id: string;

  /** current position in 2D space (center of the particle) */
  position: Vector2D;

  /* Current velocity vector **/
  velocity: Vector2D;

  /* Accumulated acceleration from forces for the current time step **/
  acceleration: Vector2D;

  /**
   * Position in the previous time step
   * (useful for Verlet integration or stable collision response)
   */
  previousPosition: Vector2D;

  /* Mass of the particle (affects acceleration from force) **/
  mass: number;

  /**
   * Inverse of mass (1/mass).
   * Pre-calculated for efficiency. (0 for static/immovable objects).
   * **/
  inverseMass: number;

  /* If true, particle does not move (infinite mass) **/
  isStatic: boolean;

  /**
   * Applies a force vector to the particle, modifying its acceleration.
   * * Formula: acceleration += Force / mass (or Force * inverseMass)
   *
   * @param force The force vector (instance of Vector2D) to apply.
   */
  applyForce(force: Vector2D): void;

  /**
   * * Updates the particle's velocity and position using Euler integration
   *   (or other chosen method).
   *
   * * Stores current position to previousPosition before updating.
   *
   * Basic Euler (Formula):
   * * `v_new = v_old + a * dt`
   * * `p_new = p_old + v_new * dt`
   *
   * @param deltaTime The time step for the update.
   */
  update(deltaTime: number): void;

  /**
   * Resets the acceleration to zero.
   *
   * Called at the beginning of each simulation step because forces are
   * re-accumulated every frame.
   */
  resetAcceleration(): void;

  /** Returns the magnitude of the velocity vector (speed). */
  getSpeed(): number;

  /** Returns the kinetic energy of the particle (0.5 * mass * speed^2). */
  getKineticEnergy(): number;

  /**
   * Sets a new position for the particle,
   * and updates `previousPosition` accordingly.
   */
  setPosition(newPosition: Vector2D): void;

  /** Sets a new velocity for the particle. */
  setVelocity(newVelocity: Vector2D): void;

  /** Sets a new mass for the particle and updates `inverseMass`. */
  setMass(newMass: number): void;

  /**
   * Checks if this particle is colliding with another particle
   * (based on the shape)
   */
  isCollidingWithOther(other: this): boolean;

  /**
   * Returns the shortest distance between the boundaries of two particles
   * (assuming they are the same type).
   *
   * - For circles, this is: `center distance - (r1 + r2)`.
   * - For polygons, it could be computed via SAT or bounding box approximations.
   */
  computeDistanceToOther(other: this): number;

  /**
   * Returns a vector pointing from other to this, with magnitude equal
   * to the overlap depth (directional overlap vector).
   *
   * This is useful for computing the repulsion force direction and
   * magnitude in one go
   *
   * * Direction: Push this particle away from `other` particle in this direction
   *
   * * Has a magnitude equal to the overlap depth; If there’s no overlap, this vector
   *   should be (0, 0) or some equivalent zero vector.
   *
   * * So the resulting vector represents both direction and depth of overlap.
   *
   */
  computeOverlapVectorWith(other: this): Vector2D;

  checkIsAtRest(): boolean;

  isEdgeToEdgeWithOther(other: this): boolean;
};
