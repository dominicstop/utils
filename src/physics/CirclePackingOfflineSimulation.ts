import { Rect } from "src/geometry";
import { CircleParticle } from "./ParticleShapes";
import { PhysicsEngine } from "./PhysicsEngine";
import { SomeOfflineSimulation } from "./SomeOfflineSimulation";
import { SomeParticleForce } from "./SomeParticleForce";
import { SomeSystemForce } from "./SomeSystemForce";
import { CentralAttractionForce } from "./CentralAttractionForce";


export class CirclePackingOfflineSimulation
  implements SomeOfflineSimulation<CircleParticle>
{
  engine: PhysicsEngine<CircleParticle>;
  isRunning: boolean = false;

  private _totalSimulatedTime: number = 0;
  private _iterationCount: number = 0;

  readonly fixedDeltaTimeSeconds: number;

  minIterations: number = 50;
  maxIterations: number = 250;

  onPreStep: ((deltaTime: number) => void) | null = null;
  onPostStep: ((deltaTime: number) => void) | null = null;
  onUpdate: (() => void) | null = null;

  get totalSimulatedTime(): number {
    return this._totalSimulatedTime;
  }

  get iterationCount(): number {
    return this._iterationCount;
  };

  get frameTimeMS(): number {
    return this.minIterations * 1000;
  };

  constructor(args: {
    frame: Rect;
    centralAttractionStrength?: number;
    timeStep?: number
  }) {
    this.fixedDeltaTimeSeconds = args.timeStep ?? (1 / 60);

    const engine = new PhysicsEngine<CircleParticle>();
    this.engine = engine;

    const centerForce = new CentralAttractionForce(
      args.frame.center.asVector,
      args.centralAttractionStrength ?? 8,
      true
    );

    engine.addForce(centerForce);
  }

  run() {
    this.isRunning = true;
    this._iterationCount = 0;

    while (true) {
      const didReachMaxIterations =
        this._iterationCount >= this.maxIterations;

      if(!this.isRunning || didReachMaxIterations){
        this.isRunning = false;
        break;
      };

      this.step();

      this._iterationCount++;
      this.onUpdate?.();

      const didReachMinIterations =
        this._iterationCount > this.minIterations;

      const shouldStop =
           didReachMinIterations
        && this.isStable();

      if (shouldStop) {
        this.isRunning = false;
      }
    }
  };

  step() {
    this.onPreStep?.(this.fixedDeltaTimeSeconds);
    this.engine.update(this.fixedDeltaTimeSeconds);
    this.onPostStep?.(this.fixedDeltaTimeSeconds);
    this._totalSimulatedTime += this.fixedDeltaTimeSeconds;
  };

  reset() {
    this.isRunning = false;
    this.engine.clear();
    this._totalSimulatedTime = 0;
    this._iterationCount = 0;
  };

  addParticle(particle: CircleParticle) {
    this.engine.addParticle(particle);
  };

  addForce(force: SomeParticleForce | SomeSystemForce) {
    this.engine.addForce(force);
  };

  isKineticEnergyNegligible(): boolean {
    const energyThreshold = 0.01;
    return this.engine.getTotalKineticEnergy() < energyThreshold;
  };

  isStable(): boolean {
    return (
         this.isKineticEnergyNegligible()
      || this.engine.checkIfAllParticlesAtRest()
    );
  };
};
