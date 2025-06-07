import { AnyBoxedShape } from "../geometry";
import { SomeCloneable } from "../types/Cloneable";
import { AnyParticle } from "./AnyParticle";


export interface SomeShapeParticle<
  SomeBoxedShape extends AnyBoxedShape
> extends
  AnyParticle,
  SomeCloneable
{

  /**
   * Shape of the particle.
   * This is used for collision detection and visualization.
   */
  shape: SomeBoxedShape;
};
