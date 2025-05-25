import { Point } from "../geometry";


describe("Point", () => {
  test("constructor == asValue", () => {
    const point = new Point({ x: 3, y: 4 });

    // `x: 3, y: 4`
    expect(point.x).toBeCloseTo(3);
    expect(point.y).toBeCloseTo(4);

    expect(point.asValue).toEqual({ x: 3, y: 4 });
  });

  test("createLine == startPoint and endPoint", () => {
    const p1 = new Point({ x: 0, y: 0 });
    const p2 = new Point({ x: 3, y: 4 });

    const line = p1.createLine(p2);

    expect(line.startPoint).toBe(p1);
    expect(line.endPoint).toBe(p2);

    expect(line.distance).toBeCloseTo(5);
  });

  test("getDistance", () => {
    const p1 = new Point({ x: 0, y: 0 });
    const p2 = new Point({ x: 3, y: 4 });

    expect(p1.getDistance(p2)).toBeCloseTo(5);
  });

  test("getDelta", () => {
    const p1 = new Point({ x: 5, y: 5 });
    const p2 = new Point({ x: 2, y: 3 });

    const delta = p1.getDelta(p2);
    
    expect(delta.x).toBeCloseTo(3);
    expect(delta.y).toBeCloseTo(2);
  });

  test("zero", () => {
    const point = Point.zero;

    expect(point.isZero).toBe(true);
    expect(point).toEqual(new Point({ x: 0, y: 0 }));
    expect(point.asValue).toEqual({ x: 0, y: 0 });
  });

  test("lerp", () => {
    const start = new Point({ x: 0, y: 0 });
    const end = new Point({ x: 10, y: 20 });
    const mid = Point.lerp(start, end, 0.5);

    expect(mid.x).toBeCloseTo(5);
    expect(mid.y).toBeCloseTo(10);
  });

  test("getBoundingBoxForPoints", () => {
    const points = [
      new Point({ x: 1, y: 2 }),
      new Point({ x: 3, y: 6 }),
      new Point({ x: -2, y: -1 }),
    ];

    const rect = Point.getBoundingBoxForPoints(points);

    // x: -2, y: -1 
    expect(rect.origin.x).toBeCloseTo(-2);
    expect(rect.origin.y).toBeCloseTo(-1);

    expect(rect.width).toBeCloseTo(5); // 3 - (-2)
    expect(rect.height).toBeCloseTo(7); // 6 - (-1)
  });

  test("translatePoints", () => {
    const points = [
      new Point({ x: 1, y: 2 }),
      new Point({ x: 3, y: 4 }),
    ];
    const translated = Point.translatePoints({ points, dx: 5, dy: -2 });

    expect(translated).toEqual([
      new Point({ x: 6, y: 0 }),
      new Point({ x: 8, y: 2 }),
    ]);
  });

  test("sumOfAllPoints", () => {
    const p1 = new Point({ x: 1, y: 2 });
    const p2 = new Point({ x: 3, y: 4 });
    const p3 = new Point({ x: -1, y: -6 });

    const sum = Point.sumOfAllPoints(p1, p2, p3);
    const expectedSum = new Point({ x: 3, y: 0 });

    expect(sum).toEqual(expectedSum);
  });

  test("getSum", () => {
    const base = new Point({ x: 1, y: 1 });
    const p1 = new Point({ x: 2, y: 3 });
    const p2 = new Point({ x: -1, y: 4 });

    const result = base.getSum(p1, p2);
    // (1+2-1, 1+3+4) → (2, 8)
    expect(result).toEqual(new Point({ x: 2, y: 8 }));
  });
});
