import * as React from "react";
import {
  BoxedCircle,
  CircleParticle,
  Point,
  Rect,
  SizeValue,
  CirclePackingOfflineSimulation,
} from "@dominicstop/utils";
import { createSampleParticle } from "./SampleParticle";


const CANVAS_SIZE: SizeValue = {
  width: 800,
  height: 600,
};

const CANVAS_RECT = new Rect({
  mode: "originAndSize",
  origin: Point.zero,
  size: CANVAS_SIZE,
});

export const PhysicsCanvasOffline: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [showSimulated, setShowSimulated] = React.useState(false);
  const [initialParticles, setInitialParticles] = React.useState<CircleParticle[]>([]);
  const [simulatedParticles, setSimulatedParticles] = React.useState<CircleParticle[]>([]);

  React.useEffect(() => {
    // Create simulation
    const simulation = new CirclePackingOfflineSimulation({
      frame: CANVAS_RECT,
      centralAttractionStrength: 8,
      timeStep: 1 / 60,
    });

    const particles: CircleParticle[] = [];

    for (let i = 0; i < 6; i++) {
      const particle = createSampleParticle({
        particleID: `${i}`,
        frame: CANVAS_RECT,
      });

      particles.push(particle);
      simulation.addParticle(particle.clone());
    }

    setInitialParticles(particles);

    simulation.run();

    const finalParticles = simulation.engine.particles.map(p => p.clone());
    setSimulatedParticles(finalParticles);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const particlesToRender = showSimulated ? simulatedParticles : initialParticles;

    ctx.clearRect(0, 0, width, height);

    for (const p of particlesToRender) {
      const particleShape: BoxedCircle = p.shape;

      ctx.beginPath();
      ctx.arc(
        p.position.dx,
        p.position.dy,
        particleShape.radius,
        0,
        2 * Math.PI
      );

      ctx.fillStyle = showSimulated ? "lightgreen" : "white";
      ctx.fill();
      ctx.stroke();
    }
  }, [showSimulated, initialParticles, simulatedParticles]);

  return (
    <div>
      <button onClick={() => setShowSimulated(prev => !prev)}>
        {showSimulated ? "Show Initial State" : "Show Simulated State"}
      </button>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        style={{ border: "1px solid #ccc", marginTop: "10px" }}
      />
    </div>
  );
};
