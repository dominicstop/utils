import { Vector2D, Angle } from "../geometry";

describe("Vector", () => {
  test("constructor === asValue", () => {
    const v = new Vector2D({ dx: 3, dy: 4 });
    expect(v.asValue).toEqual({ dx: 3, dy: 4 });
  });

  test("magnitude", () => {
    const v = new Vector2D({ dx: 3, dy: 4 });
    expect(v.magnitude).toBeCloseTo(5);
  });

  test("normalized", () => {
    const v = new Vector2D({ dx: 3, dy: 4 });
    const n = v.normalized;

    expect(n.magnitude).toBeCloseTo(1);
  });

  test("isZero === isUnit", () => {
    const zero = new Vector2D({ dx: 0, dy: 0 });
    const unit = new Vector2D({ dx: 1, dy: 0 });

    expect(zero.isZero).toBe(true);
    expect(unit.isUnit).toBe(true);
  });

  test("perpendicular", () => {
    const v = new Vector2D({ dx: 1, dy: 0 });
    const p = v.perpendicular;

    expect(p.dx).toBeCloseTo(0);
    expect(p.dy).toBeCloseTo(1);
  });

  test("inverse", () => {
    const v = new Vector2D({ dx: 1, dy: -2 });
    const inv = v.inverse;

    expect(inv.dx).toBeCloseTo(-1);
    expect(inv.dy).toBeCloseTo(2);
  });

  test("computeDistanceFromOtherVector", () => {
    const a = new Vector2D({ dx: 0, dy: 0 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(a.computeDistanceFromOtherVector(b)).toBeCloseTo(5);
  });

  test("isEqualToOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 1 });
    const b = new Vector2D({ dx: 1.00001, dy: 1.00001 });

    expect(a.isEqualToOtherVector(b, 0.001)).toBe(true);
  });

  test("addWithOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 2 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(a.addWithOtherVector(b).asValue).toEqual({ dx: 4, dy: 6 });
  });

  test("subtractWithOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 2 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(b.subtractWithOtherVector(a).asValue).toEqual({ dx: 2, dy: 2 });
  });

  test("multiplyByScalar", () => {
    const v = new Vector2D({ dx: 2, dy: 4 });
    expect(v.multiplyByScalar(2).asValue).toEqual({ dx: 4, dy: 8 });
  });

  test("divideByScalar", () => {
    const v = new Vector2D({ dx: 2, dy: 4 });
    expect(v.divideByScalar(2).asValue).toEqual({ dx: 1, dy: 2 });
  });

  test("dotProductWithOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 2 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(a.dotProductWithOtherVector(b)).toBeCloseTo(11);
  });

  test("crossProductWithOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 2 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(a.crossProductWithOtherVector(b)).toBeCloseTo(-2);
  });

  test("projectOntoOtherVector", () => {
    const a = new Vector2D({ dx: 3, dy: 4 });
    const b = new Vector2D({ dx: 1, dy: 0 });

    const proj = a.projectOntoOtherVector(b);
    expect(proj.dy).toBeCloseTo(0);
  });

  test("angleBetweenOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 0 });
    const b = new Vector2D({ dx: 0, dy: 1 });

    const angle = a.angleBetweenOtherVector(b);
    expect(angle.degrees).toBeCloseTo(90);
  });

  test("reflectOverOtherVector", () => {
    const a = new Vector2D({ dx: 1, dy: 1 });
    const b = new Vector2D({ dx: 1, dy: 0 });

    const reflected = a.reflectOverOtherVector(b);
    expect(reflected.dy).toBeCloseTo(-1);
  });

  test("limit magnitude", () => {
    const v = new Vector2D({ dx: 3, dy: 4 });
    const limited = v.limit(2);

    expect(limited.magnitude).toBeCloseTo(2);
  });

  test("static alias equality", () => {
    expect(Vector2D.zero.asValue).toEqual({ dx: 0, dy: 0 });
    expect(Vector2D.unitX.asValue).toEqual({ dx: 1, dy: 0 });
    expect(Vector2D.unitY.asValue).toEqual({ dx: 0, dy: 1 });
  });

  test("initFromAngle", () => {
    const angle = Angle.initFromDegrees(0);
    const v = Vector2D.initFromAngle(angle, 5);

    expect(v.dx).toBeCloseTo(5);
    expect(v.dy).toBeCloseTo(0);
  });

  test("initFromPoints", () => {
    const v = Vector2D.initFromPoints({ x: 1, y: 2 }, { x: 4, y: 6 });
    expect(v.asValue).toEqual({ dx: 3, dy: 4 });
  });

  test("computeAverage", () => {
    const a = new Vector2D({ dx: 1, dy: 2 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    const avg = Vector2D.computeAverage([a, b]);
    expect(avg.asValue).toEqual({ dx: 2, dy: 3 });
  });

  test("distanceBetweenTwoVectors", () => {
    const a = new Vector2D({ dx: 0, dy: 0 });
    const b = new Vector2D({ dx: 3, dy: 4 });

    expect(Vector2D.distanceBetweenTwoVectors(a, b)).toBeCloseTo(5);
  });
});
