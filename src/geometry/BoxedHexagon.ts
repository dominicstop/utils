import { Rect } from "./Rect";
import { Angle, AngleValue } from "./Angle";
import { BoxedCircle } from "./BoxedCircle";
import { Point } from "./Point";
import { Line } from "./Line";


export type HexagonType = 'pointyTopped' | 'flatTopped';

export type BoxedHexagonValue = {
  circumRadius: number;
  startAngleOffset?: AngleValue;
  center: Point;
};

export type BoxedHexagonInit = (
  Pick<BoxedHexagonValue, 
    | 'circumRadius'
    | 'startAngleOffset'
  >
) & (
  {
    mode: 'relativeToCenter'
    center: Point;
  } | {
    mode: 'relativeToOrigin';
    origin: Point;
  }
);

export class BoxedHexagon {

  origin: Point;
  circumRadius: number;
  startAngleOffset: Angle;

  constructor(args: BoxedHexagonInit){
    this.circumRadius = args.circumRadius;

    const angleValue = args.startAngleOffset ?? {
      angleUnit: 'degrees',
      angleValue: 0,
    };

    this.startAngleOffset = new Angle(angleValue);

    this.origin = (() => {
      switch(args.mode){
        case 'relativeToCenter':
          const originX = args.center.x - args.circumRadius;
          const originY = args.center.y - args.circumRadius;

          return new Point({  
            x: originX,
            y: originY,
          });

        case 'relativeToOrigin':
          return new Point({  
            x: args.origin.x,
            y: args.origin.y,
          });
      };
    })();
  };

  // MARK: Getters
  // -------------

  get asValue(): BoxedHexagonValue {
    return {
      center: this.boundingRect.centerPoint,
      circumRadius: this.circumRadius,
      startAngleOffset: this.startAngleOffset.asValue,
    };
  };

  // distance between two adjacent points
  get sideLength(): number {
    return this.circumRadius;
  };

  get perimeter(): number {
    return this.circumRadius * 6;
  };

  get inRadius(): number {
    return this.circumRadius * Math.sqrt(3) / 2;
  };

  get apothem(): number {
    return this.inRadius;
  };

  get inCircle(): BoxedCircle {
    const inRadius = this.inRadius;
    
    return new BoxedCircle({
      mode: 'relativeToCenter',
      center: this.boundingRect.centerPoint,
      radius: inRadius,
    });
  };

  get circumCircle(): BoxedCircle {
    return new BoxedCircle({
      mode: 'relativeToOrigin',
      origin: this.origin,
      radius: this.circumRadius,
    });
  };

  get boundingRect(): Rect {
    return Point.getBoundingBoxForPoints(this.cornerPointsAsArray);
  };
  
  get angles(): Array<Angle> {
    const angles: Array<Angle> = [];
    const minAngle = 360 / 6;

    let currentAngle = this.startAngleOffset.degrees;
    for(let i = 0; i < 6; i ++){
      currentAngle += minAngle;

      const newAngle = new Angle({ 
        angleUnit: 'degrees', 
        angleValue: currentAngle
      });

      angles.push(newAngle);
    };

    return angles;
  };

  get cornerPointsAsArray(): Array<Point> {
    const centerPoint = this.circumCircle.centerPoint;

    return this.angles.map((angleItem) => (
      angleItem.getPointAlongCircle({
        radius: this.circumRadius,
        centerPoint,
        isClockwise: false,
      })
    ));
  };

  get edgeLines(): Array<Line> {
    const cornerPoints = this.cornerPointsAsArray;

    let lines: Array<Line> = [];
    
    for (let index = 0; index < cornerPoints.length; index++) {
      const nextIndex = (index + 1) % cornerPoints.length;
      
      const pointCurrent = cornerPoints[index];
      const pointNext = cornerPoints[nextIndex];

      const line = new Line({
        startPoint: pointCurrent,
        endPoint: pointNext,
      });
      
      lines.push(line);
    }

    return lines;
  };
  
  // MARK: Methods
  // -------------

  computeTiledHexagonAlongsideEdge(args: {
    edgeLine: Line;
    extraPositionOffset?: number;
  }): BoxedHexagon {
    const extraPositionOffset = args.extraPositionOffset ?? 0;
    const centerPoint = this.boundingRect.centerPoint;

    const apothemLine = new Line({
      startPoint: centerPoint,
      endPoint: args.edgeLine.midPoint,
    });

    const apothemDistance = apothemLine.distance * 2;
    
    const { stopPoint: nextCenterPoint } = 
      apothemLine.traverseByDistance(apothemDistance + extraPositionOffset);

    return new BoxedHexagon({
      mode: 'relativeToCenter',
      center: nextCenterPoint,
      circumRadius: this.circumRadius,
    });
  };

  // MARK: Alias Init
  // ----------------

  static recenterHexagonsRelativeToPoint(args: {
    hexagons: Array<BoxedHexagon>;
    centerPoint: Point;
  }){

    const allPoints = args.hexagons.reduce<Point[]>(
      (acc, curr) => {
        acc.push(...curr.cornerPointsAsArray);
        return acc;
      },
      []
    );

    const boundingBox = Point.getBoundingBoxForPoints(allPoints);

    const currentCenter = boundingBox.centerPoint;
    const pointAdj = currentCenter.getDelta(args.centerPoint);

    args.hexagons.forEach(hexagon => {
      const adjX = hexagon.origin.x - pointAdj.x;
      const adjY = hexagon.origin.y - pointAdj.y;

      hexagon.origin = new Point({
        x: adjX,
        y: adjY,
      });
    });
  };

  static initFromValue(args: BoxedHexagonValue): BoxedHexagon {
    return new BoxedHexagon({
      mode: 'relativeToCenter',
      ...args,
    });
  };

  static initFromPresetHexagon(args: BoxedHexagonInit & { 
    hexagonType: HexagonType
  }){
    // NOTE: 
    // Flat Topped Hexagon: 0°, 60°, 120°, 180°, 240°, 300°... (offset of 60)
    // Pointy-topped Hexagons: 30°, 90°, 150°, 210°, 270°, 330°... (offset of 30)
    // 
    const angleOffset = new Angle({
      angleUnit: 'degrees',
      angleValue: args.hexagonType === 'flatTopped' ? 0 : 30,
    });

    const hexagon = new BoxedHexagon(args);
    hexagon.startAngleOffset = angleOffset;

    return hexagon;
  };
};

