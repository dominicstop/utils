import { Vector2D } from "../geometry";
import { AnyParticle } from "./AnyParticle";
import { SomeParticleForce } from "./SomeParticleForce";


/**
 * Applies a central attractive force pulling the particle toward
 * a fixed center (e.g., like a spring).
 */
export class CentralAttractionForce implements SomeParticleForce {

  /**
   * the point particles are attracted to, i.e. The point where the particles
   * will move towards to.
   *
   */
  center: Vector2D;

  /** Attraction constant (e.g., spring stiffness k) */
  strength: number;

  isActive: boolean;

  constructor(
    center: Vector2D,
    strength: number,
    isActive: boolean = true
  ) {
    this.center = center;
    this.strength = strength;
    this.isActive = isActive;
  };

  /**
   * Applies a force to the particle:
   * `F = -strength * (particle.position - center)`
   *
   * This simulates a harmonic potential pulling particles inward.
   *
   * @param particle The particle to apply the force to.
   */
  apply(particle: AnyParticle): void {
    if (!this.isActive || particle.isStatic) return;

    const displacement = particle.position.subtractedWithOther(this.center);
    const force = displacement.multipliedByScalar(-this.strength);
    particle.applyForce(force);
  };
};
