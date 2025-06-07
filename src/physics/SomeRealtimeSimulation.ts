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
export interface SomeRealtimeSimulation<
  SomeParticle extends AnyParticle
> {

  /** The physics engine instance */
  engine: PhysicsEngine<SomeParticle>;

  /** Whether the simulation is currently running */
  isRunning: boolean;

  /** Timestamp of the last animation frame */
  readonly lastTime: number

  /** ID for requestAnimationFrame to allow cancellation */
  readonly animationFrameId: number | null

  /** Accumulated simulation time */
  readonly totalSimulatedTime: number

  /** Fixed time step for physics updates (e.g., 1/60th of a second) */
  readonly fixedDeltaTime: number;

  /** Accumulates real time to ensure fixed updates for physics */
  readonly timeAccumulator: number;

  // MARK: - Callbacks
  // -----------------

  /** Called before engine.update */
  onPreStep: ((deltaTime: number) => void) | null

  /** Called after engine.update */
  onPostStep: ((deltaTime: number) => void) | null

  /** Called ideally after physics updates, for drawing */
  onUpdate: (() => void) | null

  /** Starts or resumes the simulation loop. */
  start(): void;

  /** The main simulation loop, called by requestAnimationFrame. Manages fixed time step updates for the engine. */
  simulationLoop(currentTime: number): void;

  /** Stops/pauses the simulation loop. */
  stop(): void;

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

  /** Returns the number of particles currently in the simulation. */
  getParticleCount(): number;

  /** Returns the total elapsed simulated time in seconds. */
  getTotalSimulatedTime(): number;

  /** Sets the desired fixed time step for physics updates.
   * @param fps The target frames per second for physics calculations (e.g., 60).
   */
  setFixedTimeStep(fps: number): void;
}
