

import { BoxedCircle, CircleParticle, InterpolationHelpers, Particle, Point, Rect, SizeValue, Vector2D } from "@dominicstop/utils";

export function createSampleParticle(args: {
  particleID: string;
  frame: Rect;
}): CircleParticle {

  const randomX = InterpolationHelpers.rangedLerpUsingInputValue(
    Math.random(),
    0,
    1,
    args.frame.minX,
    args.frame.maxX,
  );

  const randomY = InterpolationHelpers.rangedLerpUsingInputValue(
    Math.random(),
    0,
    1,
    args.frame.minY,
    args.frame.maxY,
  );

  const position = new Vector2D({
    dx: randomX,
    dy: randomY,
  });

  const randomRadius = InterpolationHelpers.rangedLerpUsingInputValue(
    Math.random(),
    0,
    1,
    100,
    500,
  );

  const circleShape = new BoxedCircle({
    mode: 'relativeToCenter',
    center: Point.zero,
    radius: randomRadius,
  });

  return new Particle<BoxedCircle>({
    shape: circleShape,
    id: args.particleID,
    mass: 1,
    position,
    initialVelocity: Vector2D.zero,
  });
}
