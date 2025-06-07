import { AnyParticle } from "./AnyParticle";

/**
 * * interface for forces that apply to a single particle based on its properties
 *   or external factors.
 */
export interface SomeParticleForce {

  /**
   * A flag to easily enable or disable the force.
   * (Determines if this force currently active).
   */
  isActive: boolean;

  /** Applies a force to a given particle (e.g., attraction, damping). */
  apply(particle: AnyParticle): void;
};

export function isSomeParticleForce(obj: unknown): obj is SomeParticleForce {
  return (
       obj != null
    && typeof obj === 'object'
    && "apply" in obj
    && typeof obj.apply === 'function'
  );
};

