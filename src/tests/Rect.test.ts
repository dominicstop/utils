import { Rect, Point, SizeValue, PointValue } from '../geometry';

describe('Rect', () => {
  describe('constructor', () => {
    it('should construct from origin and size', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 10, y: 20 },
        size: { width: 100, height: 50 },
      });

      expect(rect.origin.x).toBeCloseTo(10);
      expect(rect.origin.y).toBeCloseTo(20);
      expect(rect.width).toBeCloseTo(100);
      expect(rect.height).toBeCloseTo(50);
    });

    it('should construct from corners', () => {
      const rect = new Rect({
        mode: 'corners',
        minX: 10,
        minY: 20,
        maxX: 110,
        maxY: 70,
      });

      expect(rect.origin.x).toBeCloseTo(10);
      expect(rect.origin.y).toBeCloseTo(20);
      expect(rect.width).toBeCloseTo(100);
      expect(rect.height).toBeCloseTo(50);
    });
  });

  describe('computed properties', () => {
    const rect = new Rect({
      mode: 'originAndSize',
      origin: { x: 10, y: 20 },
      size: { width: 100, height: 60 },
    });

    it('should return correct corner values', () => {
      expect(rect.minMaxDimensions).toEqual({
        minX: 10,
        minY: 20,
        maxX: 110,
        maxY: 80,
      });
    });

    it('should compute center point correctly', () => {
      const center = rect.center;
      expect(center.x).toBeCloseTo(60); // 10 + 100/2
      expect(center.y).toBeCloseTo(50); // 20 + 60/2
    });

    it('should compute midpoints', () => {
      expect(rect.topMidPoint).toEqual(new Point({ x: 60, y: 20 }));
      expect(rect.bottomMidPoint).toEqual(new Point({ x: 60, y: 80 }));
      expect(rect.leftMidPoint).toEqual(new Point({ x: 10, y: 50 }));
      expect(rect.rightMidPoint).toEqual(new Point({ x: 110, y: 50 }));
    });

    it('should compute corners correctly', () => {
      expect(rect.topLeftPoint).toEqual(new Point({ x: 10, y: 20 }));
      expect(rect.topRightPoint).toEqual(new Point({ x: 110, y: 20 }));
      expect(rect.bottomLeftPoint).toEqual(new Point({ x: 10, y: 80 }));
      expect(rect.bottomRightPoint).toEqual(new Point({ x: 110, y: 80 }));
    });
  });

  describe('isNaN', () => {
    it('should detect NaN in origin', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: NaN, y: 20 },
        size: { width: 100, height: 50 },
      });

      expect(rect.isNaN).toBe(true);
    });

    it('should detect NaN in size', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 10, y: 20 },
        size: { width: NaN, height: 50 },
      });

      expect(rect.isNaN).toBe(true);
    });

    it('should not be NaN if all values are valid', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 10, y: 20 },
        size: { width: 100, height: 50 },
      });

      expect(rect.isNaN).toBe(false);
    });
  });

  describe('adjust points', () => {
    let rect: Rect;

    const rectOrigin: PointValue = { x: 10, y: 20 };
    const rectSize: SizeValue = { width: 100, height: 50 };

    beforeEach(() => {
      rect = new Rect({
        mode: 'originAndSize',
        origin: rectOrigin,
        size: rectSize,
      });
    });

    it('should adjust top left corner', () => {
      rect.minX = 0;
      rect.minY = 0;

      expect(rect.minX).toBeCloseTo(0);
      expect(rect.minY).toBeCloseTo(0);

      expect(rect.maxX).toBeCloseTo(rectSize.width);
      expect(rect.maxY).toBeCloseTo(rectSize.height);
    });

    it('should adjust center corner', () => {
      rect.midX = 100;
      rect.midY = 100;

      expect(rect.center.x).toBeCloseTo(100);
      expect(rect.center.y).toBeCloseTo(100);

      expect(rect.width).toBeCloseTo(rectSize.width);
      expect(rect.height).toBeCloseTo(rectSize.height);
    });

    it('should adjust bottom right corner', () => {
      rect.maxX = 150;
      rect.maxY = 90;

      expect(rect.maxX).toBeCloseTo(150);
      expect(rect.maxY).toBeCloseTo(90);

      expect(rect.width).toBeCloseTo(rectSize.width);
      expect(rect.height).toBeCloseTo(rectSize.height);
    });

    it('should adjust top right corner', () => {
      rect.maxX = 200;
      rect.minY = 100;

      expect(rect.maxX).toBeCloseTo(200);
      expect(rect.minY).toBeCloseTo(100);

      expect(rect.width).toBeCloseTo(rectSize.width);
      expect(rect.height).toBeCloseTo(rectSize.height);
    });

    it('should adjust bottom left corner', () => {
      rect.minX = 0;
      rect.maxY = 200;

      expect(rect.minX).toBeCloseTo(0);
      expect(rect.maxY).toBeCloseTo(200);

      expect(rect.width).toBeCloseTo(rectSize.width);
      expect(rect.height).toBeCloseTo(rectSize.height);
    });
  });

  describe('setPointCenter', () => {
    it('should move origin to center new point', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      });

      rect.setPointCenter(new Point({ x: 50, y: 50 }));

      expect(rect.origin.x).toBeCloseTo(0); // 50 - 100/2
      expect(rect.origin.y).toBeCloseTo(25); // 50 - 50/2
    });
  });

  describe('applyScaleByFactor', () => {
    it('should scale relative to origin', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
      });

      rect.applyUniformScaleByFactor({
        anchorReference: {
          mode: 'relativeToOrigin',
        },
        percentAmount: 2
      });

      expect(rect.width).toBeCloseTo(200);
      expect(rect.height).toBeCloseTo(100);
      expect(rect.origin.x).toBeCloseTo(0);
      expect(rect.origin.y).toBeCloseTo(0);
    });

    it('should scale relative to center', () => {
      const rect = new Rect({
        mode: 'originAndSize',
        origin: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      });

      const oldCenter = rect.center.clone();

      rect.applyUniformScaleByFactor({
        anchorReference: {
          mode: 'relativeToCenter',
        },
        percentAmount: 3
      });

      expect(rect.width).toBeCloseTo(300);
      expect(rect.height).toBeCloseTo(300);

      expect(rect.center.x).toBeCloseTo(oldCenter.x);
      expect(rect.center.y).toBeCloseTo(oldCenter.y);
    });
  });
});
