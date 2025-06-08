import { Rect, Vector2D } from "../geometry";
import { AnyParticle } from "./AnyParticle";
import { isSomeParticleForce, SomeParticleForce } from "./SomeParticleForce";
import { ParticleMetadataMap, SomePhysicsEngine } from "./SomePhysicsEngine";
import { isSomeSystemForce, SomeSystemForce } from "./SomeSystemForce";


export class PhysicsEngine<
  SomeParticle extends AnyParticle
> implements SomePhysicsEngine<SomeParticle> {

  particles: Array<SomeParticle> = [];
  particleMetadataMap: ParticleMetadataMap = {};

  particleForces: Array<SomeParticleForce> = [];
  systemForces: Array<SomeSystemForce> = [];

  worldBounds: Rect | null = null;

  gravity: Vector2D = Vector2D.zero;
  restitutionCoefficient: number = 0.8;
  collisionIterations: number = 1;

  dampingFactor: number = 0.98;

  constructor() {
    // no-eop
  }

  addParticle(particle: SomeParticle): void {
    this.particles.push(particle);
  };

  removeParticle(particleOrId: SomeParticle | string): boolean {
    const id = typeof particleOrId === "string"
      ? particleOrId
      : particleOrId.id;

    const index = this.particles.findIndex(p => p.id === id);
    if(index <= -1){
      return false;
    };

    this.particles.splice(index, 1);
    return true;
  };

  getParticleById(id: string): SomeParticle | undefined {
    return this.particles.find(p => p.id === id);
  };

  addForce(force: SomeParticleForce | SomeSystemForce): void {
    if (isSomeParticleForce(force)) {
      this.particleForces.push(force);

    } else if (isSomeSystemForce(force)) {
      this.systemForces.push(force);
    };
  };

  removeForce(force: SomeParticleForce | SomeSystemForce): boolean {
    const forceList = (() => {
      if(isSomeParticleForce(force)){
        return this.particleForces;
      };

      if(isSomeSystemForce(force)){
        return this.systemForces;
      };

      return undefined;
    })();

    if(forceList == null) {
      return false;
    };

    const index = forceList.indexOf(force as any);
    if (index !== -1) {
      forceList.splice(index, 1);
      return true;
    };

    return false;
  };

  update(deltaTime: number): void {
    for (const particle of this.particles) {
      particle.resetAcceleration();

      if (!particle.isStatic) {
        particle.applyForce(this.gravity.multipliedByScalar(particle.mass));
      }
    }

    for (const force of this.systemForces) {
      force.applyToAll(this.particles);
    }

    for (const force of this.particleForces) {
      for (const particle of this.particles) {
        force.apply(particle);
      }
    }

    for (const particle of this.particles) {
      particle.update(deltaTime);

      if (this.worldBounds) {
        this.handleBoundaryConditions(particle);
      };

      const velocityDampended = particle.velocity.multipliedByScalar(this.dampingFactor);
      particle.setVelocity(velocityDampended);
    };

    for (let i = 0; i < this.collisionIterations; i++) {
      this.resolveCollisions();
    };
  }

  resolveCollisions(): void {
    // loop through all possible pairs of particles
    // e.g. `[01, 02, 03, ..., 41, 42...]`
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      if (particleA.isStatic) continue;

      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        if (particleB.isStatic) continue;

        // check if the two particles are colliding,
        // only continue if they have collision
        const hasCollision = particleA.isCollidingWithOther(particleB);
        if (!hasCollision) continue;

        // calculate the amount of overlap
        const overlapVector = particleA.computeOverlapVectorWith(particleB);
        if (overlapVector.isZero) continue;

        // calculate the total inverse mass (used for distributing correction)
        // skip if total is 0 (i.e. to avoid division by zero)
        const totalInverseMass = particleA.inverseMass + particleB.inverseMass;
        if (totalInverseMass === 0) continue;

        // compute adj amount
        // i.e. how much each particle should move to resolve the overlap
        const correctionVector = overlapVector.dividedByScalar(totalInverseMass);

        // add position correction to `particleA` (if needed)
        particleA.setPosition((() => {
          if(particleA.isStatic){
            return particleA.position;
          };

          // * remember: `correctionVector` is the total overlap that needs to be
          //   resolved/min.
          //
          // * each particle should move proportionally to its inverse mass (in other words:
          //   lighter particles move more).
          //
          // * so scale the correction vector by `particleA.inverseMass`
          //   to get particleA's share of the movement.
          //
          const positionAdjScaled = correctionVector.multipliedByScalar(particleA.inverseMass);
          return particleA.position.addedWithOther(positionAdjScaled);
        })());

        // add position correction for `particleB`
        particleB.setPosition((() => {
          if(particleB.isStatic){
            return particleB.position;
          };

          const positionAdjustmentB = correctionVector.multipliedByScalar(particleB.inverseMass);
          return particleB.position.subtractedWithOther(positionAdjustmentB);
        })());

        // get delta of particle velocity
        // calculate relative velocity between the two particles
        const relativeVelocity = particleA.velocity.subtractedWithOther(particleB.velocity);

        // normalize to get the direction of the collision
        const collisionDirection = overlapVector.normalized;

        // scale/re-projecr relative velocity towards collision
        // direction (collision normal)
        const velocityAlongCollisionDirection =
          relativeVelocity.dotProductWithOtherVector(collisionDirection);

        // skip if particles are moving apart
        if (velocityAlongCollisionDirection > 0) continue;

        // compute velocity
        const impulse: Vector2D = (() => {
          // calculate impulse scalar using restitution (bounciness/elasticity)
          const restitution = this.restitutionCoefficient;
          const impulseAmount = -(1 + restitution) * velocityAlongCollisionDirection / totalInverseMass;

          // calculate the impulse vector (direction + amount)
          return collisionDirection.multipliedByScalar(impulseAmount);
        })();

        // apply impulse to `particleA`'s velocity
        particleA.setVelocity((() => {
          if(particleA.isStatic){
            return particleA.velocity;
          };

          const velocityScaled = impulse.multipliedByScalar(particleA.inverseMass);
          return particleA.velocity.addedWithOther(velocityScaled);
        })());

        // apply impulse to `particleB`'s velocity
        particleB.setVelocity((() => {
          if(particleB.isStatic){
            return particleB.velocity;
          };

          const velocityScaled = impulse.multipliedByScalar(particleB.inverseMass);
          return particleB.velocity.subtractedWithOther(velocityScaled);
        })());
      }
    }
  }

  handleBoundaryConditions(particle: SomeParticle): void {
    if (!this.worldBounds || particle.isStatic) return;

    const bounds = this.worldBounds;
    const pos = particle.position;
    const vel = particle.velocity;

    let bounced = false;

    if (pos.dx < bounds.minX) {
      pos.dx = bounds.minX;
      vel.dx *= -this.restitutionCoefficient;
      bounced = true;

    } else if (pos.dx > bounds.maxX) {
      pos.dx = bounds.maxX;
      vel.dx *= -this.restitutionCoefficient;
      bounced = true;
    }

    if (pos.dy < bounds.minY) {
      pos.dy = bounds.minY;
      vel.dy *= -this.restitutionCoefficient;
      bounced = true;

    } else if (pos.dy > bounds.maxY) {
      pos.dy = bounds.maxY;
      vel.dy *= -this.restitutionCoefficient;
      bounced = true;
    }

    if (bounced) {
      particle.setPosition(pos);
      particle.setVelocity(vel);
    }
  }

  clear(): void {
    this.particles = [];
    this.particleForces = [];
    this.systemForces = [];
  }

  getTotalKineticEnergy(): number {
    return this.particles.reduce((sum, p) => sum + p.getKineticEnergy(), 0);
  }

  logState(): void {
    for (const p of this.particles) {
      console.log(`Particle ${p.id}: pos=(${p.position.dx.toFixed(2)}, ${p.position.dy.toFixed(2)}), vel=(${p.velocity.dx.toFixed(2)}, ${p.velocity.dy.toFixed(2)})`);
    }
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  setGravity(gravity: Vector2D): void {
    this.gravity = gravity;
  }

  setWorldBounds(bounds: Rect | null): void {
    this.worldBounds = bounds;
  }

  setRestitutionCoefficient(restitution: number): void {
    this.restitutionCoefficient = restitution;
  }

  setCollisionIterations(iterations: number): void {
    this.collisionIterations = iterations;
  }
}
