import { AnyParticle } from "./AnyParticle";
import { PhysicsEngine } from "./PhysicsEngine";
import { SomeParticleForce } from "./SomeParticleForce";
import { SomeSystemForce } from "./SomeSystemForce";


/**
 * Simulation Loop Manager
 *
 * Manages the overall simulation loop, timing, and user controls
 * (e.g. start, stop, reset).
 */
export interface SomeOfflineSimulation<
  SomeParticle extends AnyParticle
> {

  /** The physics engine instance */
  engine: PhysicsEngine<SomeParticle>;

  /** Whether the simulation is currently running */
  isRunning: boolean;

  /** Accumulated simulation time */
  readonly totalSimulatedTime: number

  /** Fixed time step for physics updates (e.g., 1/60th of a second) */
  readonly fixedDeltaTimeSeconds: number;

  // MARK: - Callbacks
  // -----------------

  /** Called before engine.update */
  onPreStep: ((deltaTime: number) => void) | null

  /** Called after engine.update */
  onPostStep: ((deltaTime: number) => void) | null

  /**
   * Resets the simulation: clears the engine and resets simulation time.
   *
   * * Note: For a true "reset to initial state,"
   *   initial particle/force configurations would need to be stored and reloaded.
   */
  reset(): void;

  /**
   * Advances the simulation by a single fixed time step (engine.update).
   * Useful for step-by-step debugging or specific scenarios.
   */
  step(): void;

  /** Adds a particle to the physics engine. */
  addParticle(particle: SomeParticle): void;

  /** Adds a force to the physics engine. */
  addForce(force: SomeParticleForce | SomeSystemForce): void;
}
