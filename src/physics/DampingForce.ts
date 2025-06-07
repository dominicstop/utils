import { AnyParticle } from "./AnyParticle";
import { SomeParticleForce } from "./SomeParticleForce";


/**
 * Applies a damping force to reduce velocity over time.
 * This force is used for simulating friction or air resistance.
 */
export class DampingForce implements SomeParticleForce {

  /**
   * Proportional constant for damping (e.g., gamma).
   *
   * The factor by which velocity is reduced (e.g., 0.05).
   * Higher values mean stronger damping
   */
  dampingFactor: number;

  isActive: boolean;

  constructor(dampingFactor: number, isActive: boolean = true) {
    this.dampingFactor = dampingFactor;
    this.isActive = isActive;
  };

  /**
   * Applies a force:
   * `F = -dampingFactor * particle.velocity`.
   *
   * This simulates friction or air resistance to stabilize
   * the system or slow particles down.
   *
   * @param particle The particle to apply the force to.
   */
  apply(particle: AnyParticle): void {
    if (!this.isActive || particle.isStatic) return;

    const dampingForce = particle.velocity.multipliedByScalar(-this.dampingFactor);
    particle.applyForce(dampingForce);
  };
};
