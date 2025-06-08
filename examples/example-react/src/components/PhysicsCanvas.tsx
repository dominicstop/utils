import * as React from "react";
import { BoxedCircle, CircleParticle, PhysicsEngine, Vector2D } from '@dominicstop/utils';
import { createSampleParticle } from "./SampleParticle";

const engine = new PhysicsEngine<CircleParticle>();

for (let i = 0; i < 50; i++) {
  const particle = createSampleParticle(`${i}`);
  engine.addParticle(particle);
}

engine.setGravity(new Vector2D({ dx: 0, dy: 100 }));

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


    let timeStepMS = 0;
    const interval = setInterval(() => {
      engine.update(1/10000);
      render();
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
