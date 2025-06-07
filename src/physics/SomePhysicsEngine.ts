import { Rect, Vector2D } from "../geometry";
import { AnyParticle } from "./AnyParticle";
import { SomeParticleForce } from "./SomeParticleForce";
import { SomeSystemForce } from "./SomeSystemForce";



export type ParticlMetadata = {
  id: AnyParticle['id'];

  /** The particle ID's that are edge-to-edge with this particle */
  edgeToEdgeWithParticlesID: Array<AnyParticle['id']>;
};

export type ParticleMetadataMap = Record<AnyParticle['id'], ParticlMetadata>

export interface SomePhysicsEngine<SomeParticle extends AnyParticle> {

  /** All particles in the simulation */
  particles: Array<SomeParticle>;

  particleMetadataMap: ParticleMetadataMap;

  /** Forces applied to individual particles */
  particleForces: Array<SomeParticleForce>;

  /** Forces applied across the entire system */
  systemForces: Array<SomeSystemForce>;

  /** Global gravitational acceleration */
  gravity: Vector2D;

  /** Optional: Defines the boundaries of the simulation area */
  worldBounds: Rect | null;

  /** Coefficient of restitution for collisions (0=inelastic, 1=perfectly elastic) */
  restitutionCoefficient: number;

  /** Number of iterations to resolve collisions and overlaps per update step */
  collisionIterations: number;

  /** Adds a new particle to the simulation. */
  addParticle(particle: SomeParticle): void;

  /**
   * Removes a particle from the simulation.
   * Can take a particle instance, or its ID.
   *
   * Returns true if removed, false otherwise
   * */
  removeParticle(particleOrId: SomeParticle | string): boolean;

  /** Retrieves a particle by its ID. */
  getParticleById(id: string): SomeParticle | undefined;

  /**
   * Adds a new force to the simulation.
   * @param force The force to add.
   */
  addForce(force: SomeParticleForce | SomeSystemForce): void;

  /**
   * Removes a specific force from the simulation.
   * Returns true if removed
   * */
  removeForce(force: SomeParticleForce | SomeSystemForce): boolean;

  /**
   * Advances the simulation by one time step.
   *
   * Order of operations:
   * 1. Reset acceleration for all particles.
   * 2. Apply all global system forces (e.g., gravity, repulsion).
   * 3. Apply all particle-specific forces.
   * 4. Update particle velocities and positions (integration).
   * 5. Handle boundary conditions (if worldBounds is set).
   * 6. Resolve collisions (iteratively if needed).
   *
   * @param deltaTime The time step for the simulation.
   */
  update(deltaTime: number): void;

  /** Detects and resolves positional overlaps and applies collision responses between particles. */
  resolveCollisions(): void;

  /** Handles particle interactions with world boundaries (e.g., bouncing or wrapping). */
  handleBoundaryConditions(particle: SomeParticle): void;

  /** Clears all particles and forces from the simulation. */
  clear(): void;

  /** Returns the total kinetic energy of all particles in the system. */
  getTotalKineticEnergy(): number;

  /** Logs the current state of all particles (e.g., position, velocity) for debugging. */
  logState(): void;

  /** Returns the number of particles currently in the simulation. */
  getParticleCount(): number;

  /** Sets the global gravitational acceleration. */
  setGravity(gravity: Vector2D): void;

  /** Sets the world boundaries. Pass null to remove boundaries. */
  setWorldBounds(bounds: Rect | null): void;

  /** Sets the coefficient of restitution for collisions. */
  setRestitutionCoefficient(restitution: number): void;

  /** Sets the number of iterations for collision resolution. */
  setCollisionIterations(iterations: number): void;
};
