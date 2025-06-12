import { Angle, BoxedCircle, BoxedHexagon, CentralAttractionForce, CirclePackingOfflineSimulation, InterpolationHelpers, Particle, Rect, RectValue, RepulsionForce, Vector2D } from "@dominicstop/utils";
import { useDeferredExecution } from "./Temp";

export type WhatsNewBubbleTransformationMap = Record<number, Array<BoxedCircle>>;

export function useWhatsNewBubbleTransformDeferredComputation(args?: {
  shouldEnableVariableScaling?: boolean;
}) {

  const shouldEnableVariableScaling = args?.shouldEnableVariableScaling ?? false;

  return useDeferredExecution<
    {
      hexagons: Array<BoxedHexagon>;
      bounds: RectValue;
    },
    WhatsNewBubbleTransformationMap
  >(() => (args) => {

    const boundsWithMargin: Rect = (() => {
      const rect = Rect.initFromValue(args.bounds);
      const originalCenter = rect.center;

      const margin = 8;

      rect.size = {
        width: rect.width - (margin * 2),
        height: rect.height
      };

      rect.setPointCenter(originalCenter);
      return rect;
    })();

    const inCircles = args.hexagons.map(hexagon => hexagon.inCircle.clone());
    const map: WhatsNewBubbleTransformationMap = {};

    const totalCircles = inCircles.length;

    inCircles.forEach((_, originalCircleIndex) => {
      const simulation = new CirclePackingOfflineSimulation({
        frame: boundsWithMargin.clone(),
        centralAttractionStrength: 8,
        timeStep: 1 / 60,
      });

      let relativeIndex = 0;

      inCircles.forEach((circle, circleToTransformIndex) => {
        const isTargetBubble = originalCircleIndex == circleToTransformIndex;

        if(!isTargetBubble) {
          relativeIndex++;
        };

        const SCALE_UP_AMOUNT = shouldEnableVariableScaling
          ? 1 + 0.4
          : 1 + 0.3;

        const SCALE_DOWN_AMOUNT = (() => {
          if(!shouldEnableVariableScaling){
            return 1 - 0.2;
          };

          return InterpolationHelpers.rangedLerpUsingInputValue(
            /* inputValue      : */ relativeIndex,
            /* inputValueStart : */ 1,
            /* inputValueEnd   : */ totalCircles,
            /* outputValueStart: */ 0.6,
            /* outputValueEnd  : */ 1.1,
          );
        })();

        const circleAdj = circle.scaledUniformallyByFactor({
          anchorReference: {
            mode: 'relativeToCenter',
          },
          percentAmount: isTargetBubble
            ? SCALE_UP_AMOUNT
            : SCALE_DOWN_AMOUNT,
        });

        const circleParticle = new Particle<BoxedCircle>({
          id: `${circleToTransformIndex}`,
          mass: (isTargetBubble
            ? totalCircles - 1
            : 1
          ),
          position: circle.center.asVector,
          shape: circleAdj.clone(),
          initialVelocity: Vector2D.zero,
        });

        simulation.engine.addParticle(circleParticle);
      });

      simulation.engine.dampingFactor = 1;
      simulation.engine.collisionIterations = 2;
      simulation.maxIterations = 100;
      simulation.engine.setWorldBounds(boundsWithMargin);
      simulation.run();

      const results = simulation.engine.particles.map(particle =>
        (particle.shape as BoxedCircle).clone()
      );

      BoxedCircle.recenterCirclesRelativeToPoint({
        circles: results,
        centerPoint: boundsWithMargin.center,
      });

      if(totalCircles == 7){
        BoxedCircle.rotateCirclesRelativeToPoint({
          circles: results,
          centerPoint: boundsWithMargin.center,
          rotationAmount: new Angle({
            angleUnit: 'degrees',
            angleValue: 30,
          }),
        });

        BoxedCircle.recenterCirclesRelativeToPoint({
          circles: results,
          centerPoint: boundsWithMargin.center,
        });
      };

      map[originalCircleIndex] = results;
    });

    return map;
  });
};
