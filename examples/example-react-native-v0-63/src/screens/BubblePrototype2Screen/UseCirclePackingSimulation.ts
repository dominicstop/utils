import { BoxedCircle, BoxedHexagon, CirclePackingOfflineSimulation, CircleParticle, Particle, Rect, Vector2D } from "@dominicstop/utils";
import { useDeferredExecution } from "./Temp";


export function useCirclePackingSimulation(args: {
  circles: Array<BoxedCircle>;
  frameBounds: Rect;
}){

  return useDeferredExecution<
    typeof args,
    Array<BoxedCircle>
  >(() => (args) => {

    const simulation = new CirclePackingOfflineSimulation({
      frame: args.frameBounds,
      centralAttractionStrength: 8,
      timeStep: 1 / 60,
    });

    args.circles.forEach((circle, index) => {
      const circleParticle = new Particle<BoxedCircle>({
        id: `${index}`,
        mass: 1,
        position: circle.center.asVector,
        shape: circle,
        initialVelocity: Vector2D.zero,
      })

      simulation.engine.addParticle(circleParticle);
    });

    simulation.run();

    return simulation.engine.particles.map(particle =>
      (particle.shape as BoxedCircle).clone()
    );
  });
};;
