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
      }
    }

    for (let i = 0; i < this.collisionIterations; i++) {
      this.resolveCollisions();
    }
  }

  resolveCollisions(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      if (p1.isStatic) continue;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        if (p2.isStatic) continue;

        if (!p1.isCollidingWithOther(p2)) continue;

        const overlap = p1.computeOverlapVectorWith(p2);
        if (overlap.isZero) continue;

        const totalInverseMass = p1.inverseMass + p2.inverseMass;
        if (totalInverseMass === 0) continue;

        const correction = overlap.dividedByScalar(totalInverseMass);
        if (!p1.isStatic) {
          p1.setPosition(p1.position.addedWithOther(correction.multipliedByScalar(p1.inverseMass)));
        }
        if (!p2.isStatic) {
          p2.setPosition(p2.position.subtractedWithOther(correction.multipliedByScalar(p2.inverseMass)));
        }

        const relativeVelocity = p1.velocity.subtractedWithOther(p2.velocity);
        const normal = overlap.normalized;
        const velocityAlongNormal = relativeVelocity.dotProductWithOtherVector(normal);

        if (velocityAlongNormal > 0) continue;

        const restitution = this.restitutionCoefficient;
        const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / totalInverseMass;
        const impulse = normal.multipliedByScalar(impulseMagnitude);

        if (!p1.isStatic) {
          p1.setVelocity(p1.velocity.addedWithOther(impulse.multipliedByScalar(p1.inverseMass)));
        }
        if (!p2.isStatic) {
          p2.setVelocity(p2.velocity.subtractedWithOther(impulse.multipliedByScalar(p2.inverseMass)));
        }
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
