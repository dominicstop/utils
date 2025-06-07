import { AnyParticle } from "./AnyParticle";
import { PhysicsEngine } from "./PhysicsEngine";
import { SomeOfflineSimulation } from "./SomeOfflineSimulation";
import { SomeParticleForce } from "./SomeParticleForce";
import { SomeSystemForce } from "./SomeSystemForce";


export class OfflineSimulation<SomeParticle extends AnyParticle>
  implements SomeOfflineSimulation<SomeParticle>
{
  engine: PhysicsEngine<SomeParticle>;
  isRunning: boolean = false;

  private _totalSimulatedTime: number = 0;
  private _iterationCount: number = 0;

  readonly fixedDeltaTime: number;
  maxIterations: number = 200;

  onPreStep: ((deltaTime: number) => void) | null = null;
  onPostStep: ((deltaTime: number) => void) | null = null;
  onUpdate: (() => void) | null = null;

  constructor(engine: PhysicsEngine<SomeParticle>, fixedDeltaTime: number = 1 / 60) {
    this.engine = engine;
    this.fixedDeltaTime = fixedDeltaTime;
  }

  get totalSimulatedTime(): number {
    return this._totalSimulatedTime;
  }

  get iterationCount(): number {
    return this._iterationCount;
  }

  run(): void {
    this.isRunning = true;
    this._iterationCount = 0;

    while (this.isRunning && this._iterationCount < this.maxIterations) {
      this.step();

      this._iterationCount++;
      this.onUpdate?.();

      if (this.isStable()) {
        this.isRunning = false;
      }
    }
  };

  step(): void {
    this.onPreStep?.(this.fixedDeltaTime);
    this.engine.update(this.fixedDeltaTime);
    this.onPostStep?.(this.fixedDeltaTime);
    this._totalSimulatedTime += this.fixedDeltaTime;
  }

  reset(): void {
    this.isRunning = false;
    this.engine.clear();
    this._totalSimulatedTime = 0;
    this._iterationCount = 0;
  }

  addParticle(particle: SomeParticle): void {
    this.engine.addParticle(particle);
  }

  addForce(force: SomeParticleForce | SomeSystemForce): void {
    this.engine.addForce(force);
  }

  isStable(): boolean {
    // Placeholder: Replace with actual stability logic
    return this.engine.particles.every(p => p.checkIsAtRest());
  }
}
