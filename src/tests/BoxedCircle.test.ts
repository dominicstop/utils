import { BoxedCircle } from "../geometry";
import { Point } from "../geometry";
import { Angle } from "../geometry";


describe("BoxedCircle", () => {
  test("centerPoint", () => {
    const circle = new BoxedCircle({
      mode: "relativeToOrigin",
      origin: new Point({ x: 10, y: 20 }),
      radius: 5,
    });

    expect(circle.centerPoint).toEqual(new Point({ x: 15, y: 25 }));
  });

  test("origin", () => {
    const circle = BoxedCircle.initFromValue({
      center: new Point({ x: 50, y: 50 }),
      radius: 10,
    });

    expect(circle.origin).toEqual(new Point({ x: 40, y: 40 }));
  });

  test("enclosingRect", () => {
    const circle = new BoxedCircle({
      mode: "relativeToOrigin",
      origin: new Point({ x: 0, y: 0 }),
      radius: 10,
    });

    const rect = circle.enclosingRect;
    expect(rect.origin).toEqual(new Point({ x: 0, y: 0 }));
    expect(rect.size).toEqual({ width: 20, height: 20 });
  });

  test("pointAlongPath", () => {
    const circle = BoxedCircle.initFromValue({
      center: new Point({ x: 0, y: 0 }),
      radius: 10,
    });
    
    const angle = Angle.initFromDegrees(0);
    const point = circle.pointAlongPath(angle);

    expect(point.x).toBeCloseTo(10);
    expect(point.y).toBeCloseTo(0);
  });

