import { AnyParticle } from "./AnyParticle";
import { SomeSystemForce } from "./SomeSystemForce";

/**
 * Applies a repulsive force between overlapping particles
 * (to prevent or resolve overlap).
 */
export class RepulsionForce implements SomeSystemForce {

  /**
   * Repulsion strength constant (lambda)
   */
  strength: number;

  /**
   * Maximum distance at which particles influence each other with this force;
   * If 0 or undefined, all pairs might be checked (less performant).
   */
  influenceRadius: number;

  isActive: boolean;

  constructor(strength: number, influenceRadius: number = 0, isActive: boolean = true) {
    this.strength = strength;
    this.influenceRadius = influenceRadius;
    this.isActive = isActive;
  }

  /**
   * Applies repulsive forces between all nearby overlapping particle pairs.
   */
  applyToAll(particles: AnyParticle[]): void {
    if (!this.isActive) return;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      if (p1.isStatic) continue;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (p2.isStatic) continue;

        const centerDistance = p1.computeDistanceToOther(p2);
        const isWithinInfluenceRadius = centerDistance < this.influenceRadius;

        // skip if outside influence radius
        if (!isWithinInfluenceRadius) continue;

        const isOverlapping = p1.isCollidingWithOther(p2);

        // skip if not overlapping
        if (!isOverlapping) continue;

        // * get overlap vector from p2 to p1 (e.g. p1 pushing away from p2)
        // * represents the direction and amount of overlap (e.g., from a collision).
        //
        const overlapVector = p1.computeOverlapVectorWith(p2);
        if (overlapVector.magnitude === 0) continue;

        // compute repulsive force
        const force = (() => {
          // direction of the force (w/o magnitude, i.e. unit vector)
          const overlapDirection = overlapVector.normalized;

          // how strongly p1 and p2 they are intersecting.
          const overlapAmount = overlapVector.magnitude;

          // repulsion force based on how overlap amount
          // e.g. more overlap, nore force
          const overlapRepulsionForce = this.strength * overlapAmount;

          // vector in the direction of `overlapVector`
          // w/ repulsion based on how much they are overlapping
          return overlapDirection.multipliedByScalar(overlapRepulsionForce);
        })();

        // Apply equal and opposite forces
        p1.applyForce(force);
        p2.applyForce(force.multipliedByScalar(-1));
      }
    }
  }
}
