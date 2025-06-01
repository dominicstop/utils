import { BoxedCircle, Rect } from "../geometry";
import { Point } from "../geometry";
import { Angle } from "../geometry";


describe("BoxedCircle", () => {
  test("centerPoint", () => {
    const circle = new BoxedCircle({
      mode: "relativeToOrigin",
      origin: new Point({ x: 10, y: 20 }),
      radius: 5,
    });

    expect(circle.center).toEqual(new Point({ x: 15, y: 25 }));
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

    const rect = circle.boundingBox;
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

  describe("computeDistanceBetweenTwoCircles", () => {
    test('non-overlapping', () => {
      const a = new BoxedCircle({
        mode: "relativeToCenter",
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });

      const b = new BoxedCircle({
        mode: "relativeToCenter",
        center: new Point({ x: 30, y: 40 }),
        radius: 5,
      });

      expect(a.distanceToOther(b)).toBeCloseTo(50);
    });

    test('same center', () => {
      const center = new Point({ x: 10, y: 10 });
      const a = BoxedCircle.initFromValue({ center, radius: 5 });
      const b = BoxedCircle.initFromValue({ center, radius: 15 });

      expect(a.distanceToOther(b)).toBeCloseTo(0);
    });
  });

  describe("checkCollisionBetweenTwoCircles", () => {
    test("overlapping circles", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 15, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkCollisionBetweenTwoCircles(a, b)).toBe(true);
    });

    test("non-overlapping circles", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 25, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkCollisionBetweenTwoCircles(a, b)).toBe(false);
    });

    test("touching edge to edge", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 20, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkCollisionBetweenTwoCircles(a, b)).toBe(true);
    });
  });

  describe("checkIfTwoCirclesAreEdgeToEdge", () => {
    test("touching exactly edge to edge", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 20, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(a, b)).toBe(true);
    });

    test("overlapping circles", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 15, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(a, b)).toBe(false);
    });

    test("non-touching circles", () => {
      const a = BoxedCircle.initFromValue({
        center: new Point({ x: 0, y: 0 }),
        radius: 10,
      });
      const b = BoxedCircle.initFromValue({
        center: new Point({ x: 25, y: 0 }),
        radius: 10,
      });

      expect(BoxedCircle.checkIfTwoCirclesAreEdgeToEdge(a, b)).toBe(false);
    });
  });

  describe("checkIfCircleIsInsideRect", () => {
    test("circle fully inside rectangle", () => {
      const circle = BoxedCircle.initFromValue({
        center: new Point({ x: 50, y: 50 }),
        radius: 10,
      });

      const rect = new Rect({
        mode: 'originAndSize',
        origin: new Point({ x: 30, y: 30 }),
        size: { width: 40, height: 40 },
      });

      expect(BoxedCircle.checkIfCircleIsInsideRect(circle, rect)).toBe(true);
    });

    test("circle touching rectangle edge", () => {
      const circle = BoxedCircle.initFromValue({
        center: new Point({ x: 40, y: 40 }),
        radius: 10,
      });

      const rect = new Rect({
        mode: 'originAndSize',
        origin: new Point({ x: 30, y: 30 }),
        size: { width: 20, height: 20 },
      });

      expect(BoxedCircle.checkIfCircleIsInsideRect(circle, rect)).toBe(true);
    });

    test("circle partially outside rectangle", () => {
      const circle = BoxedCircle.initFromValue({
        center: new Point({ x: 45, y: 45 }),
        radius: 10,
      });

      const rect = new Rect({
        mode: 'originAndSize',
        origin: new Point({ x: 30, y: 30 }),
        size: { width: 20, height: 20 },
      });

      expect(BoxedCircle.checkIfCircleIsInsideRect(circle, rect)).toBe(false);
    });

    test("circle completely outside rectangle", () => {
      const circle = BoxedCircle.initFromValue({
        center: new Point({ x: 100, y: 100 }),
        radius: 10,
      });

      const rect = new Rect({
        mode: 'originAndSize',
        origin: new Point({ x: 0, y: 0 }),
        size: { width: 50, height: 50 },
      });

      expect(BoxedCircle.checkIfCircleIsInsideRect(circle, rect)).toBe(false);
    });
  });
});
