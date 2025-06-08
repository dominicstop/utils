import * as React from "react";
import { BoxedCircle, CentralAttractionForce, CircleParticle, PhysicsEngine, Point, Rect, SizeValue, Vector2D } from '@dominicstop/utils';
import { createSampleParticle } from "./SampleParticle";

const CANVAS_SIZE: SizeValue = {
  width: 800,
  height: 600,
};

const CANVAS_RECT = new Rect({
  mode: 'originAndSize',
  origin: Point.zero,
  size: CANVAS_SIZE,
});

const engine = new PhysicsEngine<CircleParticle>();


for (let i = 0; i < 6; i++) {
  const particle = createSampleParticle({
    particleID: `${i}`,
    frame: CANVAS_RECT,
  });

  engine.addParticle(particle);
}

//engine.setGravity(new Vector2D({ dx: 0, dy: 100 }));

engine.addForce(
  new CentralAttractionForce(
    CANVAS_RECT.center.asVector,
    10,
    true
  )
);


engine.setCollisionIterations(5);

export const PhysicsCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of engine.particles) {
        const particleShape: BoxedCircle = p.shape;

        ctx.beginPath();
        ctx.arc(
          p.position.dx,
          p.position.dy,
          particleShape.radius,
          0,
          2 * Math.PI
        );

        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
      }
    };

    const FPS = 60;
    const TIME_STEP = 1 / FPS;
    const FRAME_TIME_MS = TIME_STEP * 1000;

    let totalTime = 0;
    const interval = setInterval(() => {
      engine.update(TIME_STEP);
      render();
    }, FRAME_TIME_MS);

    return () => clearInterval(interval);
  }, []);

  return <canvas
    ref={canvasRef}
    width={CANVAS_SIZE.width}
    height={CANVAS_SIZE.height}
  />;
};
