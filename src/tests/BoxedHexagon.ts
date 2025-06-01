import { Angle, BoxedHexagon } from "../geometry";
import { Point } from "../geometry";

describe("BoxedHexagon", () => {
  const center = new Point({ x: 0, y: 0 });

  test("constructor (relativeToCenter)", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.center).toEqual(center);
    expect(hex.circumRadius).toBeCloseTo(10);
  });

  test("asValue", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.asValue.center).toEqual(center);
    expect(hex.asValue.circumRadius).toBeCloseTo(10);
  });

  test("clone", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    const clone = hex.clone();
    expect(clone.asValue).toEqual(hex.asValue);
  });

  test("translatedByOffset", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    const translated = hex.translatedByOffset({ dx: 5, dy: 5 });

    expect(translated.center.x).toBeCloseTo(5);
    expect(translated.center.y).toBeCloseTo(5);
  });

  test("rotatedByAngle", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    const rotated = hex.rotatedByAngle(
      Angle.initFromDegrees(30)
    );

    expect(rotated.startAngleOffset.degrees).toBeCloseTo(
      hex.startAngleOffset.degrees + 30
    );
  });

  test("initFromValue", () => {
    const hex = BoxedHexagon.initFromValue({
      center,
      circumRadius: 10,
    });

    expect(hex.center).toEqual(center);
    expect(hex.circumRadius).toBeCloseTo(10);
  });

  test("sideLength and perimeter", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.sideLength).toBeGreaterThan(0);
    expect(hex.perimeter).toBeCloseTo(hex.sideLength * 6);
  });

  test("inRadius and apothem", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.inRadius).toBeCloseTo(hex.apothem);
  });

  test("inCircle and circumCircle", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.inCircle.radius).toBeCloseTo(hex.inRadius);
    expect(hex.circumCircle.radius).toBeCloseTo(hex.circumRadius);
  });

  test("boundingRect contains center", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    const rect = hex.boundingBox;
    expect(rect.isPointInside(hex.center)).toBe(true);
  });

  test("cornerPointsAsArray length", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.cornerPointsAsArray.length).toBe(6);
  });

  test("edgeLines length", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.edgeLines.length).toBe(6);
  });

  test("edgeMidpoints length", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.edgeMidpoints.length).toBe(6);
  });

  test("area is positive", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.area).toBeGreaterThan(0);
  });

  test("isPointInside center", () => {
    const hex = new BoxedHexagon({
      mode: "relativeToCenter",
      center,
      circumRadius: 10,
    });

    expect(hex.isPointInside(center)).toBe(true);
  });
});
