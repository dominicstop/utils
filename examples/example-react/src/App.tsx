import { PhysicsCanvas } from "./components/PhysicsCanvas";
import { PhysicsCanvasOffline } from "./components/PhysicsCanvasOffline";

function App() {
  return (
    <div>
      <h1>Physics Engine Visualization</h1>
      <PhysicsCanvas />
      <PhysicsCanvasOffline />
    </div>
  );
}

export default App;
