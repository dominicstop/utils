import { AnyParticle } from "./AnyParticle";

/**
 * interface for forces that apply across multiple particles
 * (e.g., repulsion, global gravity).
 * */
export interface SomeSystemForce {

  /**
   * A flag to easily enable or disable the force
   * (Determines if this force currently active).
   */
  isActive: boolean;

  /** Applies a force to the entire system of particles. */
  applyToAll(particles: Array<AnyParticle>): void;
};

export function isSomeSystemForce(obj: unknown): obj is SomeSystemForce {
  return (
       obj != null
    && typeof obj === 'object'
    && "applyToAll" in obj
    && typeof obj.applyToAll === 'function'
  );
};

