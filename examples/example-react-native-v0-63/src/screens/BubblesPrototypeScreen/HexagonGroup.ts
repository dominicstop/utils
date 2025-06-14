import { BoxedHexagon } from './BoxedHexagon';
import { Point } from './Point';
import { Rect, RectValue } from './Rect';


class PrivateHelpers {

  static moveArrayElements<T>(args: {
    array: Array<T>,
    offset: number 
  }): Array<T>{
    if(args.offset == 0){
      return args.array;
    };

    const newArray: Array<T> = [];

    for (let index = 0; index < args.array.length; index++) {
      const newIndex = index + args.offset;
      const element = args.array[newIndex % args.array.length];
      newArray.push(element);
    };

    return newArray;
  };

};

export class HexagonGroup {

  static computeHexagonsForFlowerArrangment(args: {
    circumRadius: number;
    centerPoint: Point;
    extraPositionOffset?: number;
    startEdgeOffset?: number;
  }): {
    centerHexagon: BoxedHexagon;
    outerHexagonRing: Array<BoxedHexagon>;
    boundingBox: Rect;
  } {
    const startEdgeOffset = args.startEdgeOffset ?? 0;

    const centerHexagon = new BoxedHexagon({
      center: args.centerPoint,
      circumRadius: args.circumRadius,
      mode: 'relativeToCenter',
    });
  
    const centerHexagonEdgesRaw = centerHexagon.edgeLines;
    const centerHexagonEdges = PrivateHelpers.moveArrayElements({
      array: centerHexagonEdgesRaw,
      offset: startEdgeOffset,
    });
  
    const outerHexagonRing = centerHexagonEdges.map((edgeLine) => (
      centerHexagon.tileAlongsideEdge({
        edgeLine, 
        extraPositionOffset: args.extraPositionOffset,
      })
    ));

    const hexagons = [centerHexagon, ...outerHexagonRing];
    const allPoints: Array<Point> = hexagons.reduce(
      (acc, curr) => {
        acc.push(...curr.cornerPoints);
        return acc;
      },
      [...centerHexagon.cornerPoints]
    );

    const boundingBox = Point.getBoundingBoxForPoints(allPoints);

    return {
      centerHexagon,
      outerHexagonRing,
      boundingBox,
    };
  };

  static computeHexagonsForTriangleArrangement(args: {
    circumRadius: number;
    centerPoint: Point;
    extraPositionOffset?: number;
    startEdgeOffset?: number;
  }): {
    hexagons: Array<BoxedHexagon>;
    boundingBox: Rect;
  } {

    const startEdgeOffset = args.startEdgeOffset ?? 0;

    const firstHexagon = new BoxedHexagon({
      center: args.centerPoint,
      circumRadius: args.circumRadius,
      mode: 'relativeToCenter',
    });

    const edgeLinesRaw = firstHexagon.edgeLines;
    const edgeLines = PrivateHelpers.moveArrayElements({
      array: edgeLinesRaw,
      offset: startEdgeOffset,
    });
    
    const secondHexagon = firstHexagon.tileAlongsideEdge({
      edgeLine: edgeLines[0]!, 
      extraPositionOffset: args.extraPositionOffset,
    });

    const thirdHexagon = firstHexagon.tileAlongsideEdge({
      edgeLine: edgeLines[1]!, 
      extraPositionOffset: args.extraPositionOffset,
    });

    const hexagons = [
      firstHexagon,
      secondHexagon,
      thirdHexagon,
    ];

    const allPoints: Array<Point> = [
      ...firstHexagon.cornerPoints,
      ...secondHexagon.cornerPoints,
      ...thirdHexagon.cornerPoints,
    ];

    const boundingBox = Point.getBoundingBoxForPoints(allPoints);

    BoxedHexagon.centerHexagons({
      hexagons,
      centerPoint: args.centerPoint,
    });

    return { hexagons, boundingBox };
  };

  static createHexagons(args: {
    hexagonCount: number;
    circumRadius: number;
    centerPoint: Point;
    extraPositionOffset?: number;
  }): {
    hexagons: Array<BoxedHexagon>;
    boundingBox: Rect;
  }{
    if(args.hexagonCount == 1) {
      const hexagon = new BoxedHexagon({
        mode: 'relativeToCenter',
        center: args.centerPoint,
        circumRadius: args.circumRadius,
      });

      return ({
        hexagons: [hexagon],
        boundingBox: hexagon.boundingRect,
      });
    };

    if(args.hexagonCount <= 3){
      const startEdgeOffset = args.hexagonCount == 2 ? 1 : 0; 
      const shouldReCenter = args.hexagonCount == 2;

      const hexagonsToRemoveCount = 3 - args.hexagonCount;

      const hexagonGroup = this.computeHexagonsForTriangleArrangement({
        ...args,
        startEdgeOffset,
      });

      if(hexagonsToRemoveCount > 0){
        hexagonGroup.hexagons.splice(-hexagonsToRemoveCount);
      };

      if(shouldReCenter){
        BoxedHexagon.centerHexagons({
          hexagons: hexagonGroup.hexagons,
          centerPoint: args.centerPoint,
        });
      };

      return ({
        hexagons: hexagonGroup.hexagons,
        boundingBox: hexagonGroup.boundingBox,
      });

    } else if(args.hexagonCount <= 7){
      const startEdgeOffset = args.hexagonCount == 5 || args.hexagonCount == 6 ? 1 : 0;

      const shouldReCenter = args.hexagonCount == 4;
      const hexagonsToRemoveCount = 7 - args.hexagonCount;

      const hexagonGroup = this.computeHexagonsForFlowerArrangment({
        ...args,
        startEdgeOffset,
      });

      const hexagons = [
        hexagonGroup.centerHexagon, 
        ...hexagonGroup.outerHexagonRing
      ];

      if(hexagonsToRemoveCount > 0){
        hexagons.splice(-hexagonsToRemoveCount);
      };

      if(shouldReCenter){
        BoxedHexagon.centerHexagons({
          hexagons,
          centerPoint: args.centerPoint,
        });
      };

      return {
        hexagons,
        boundingBox: hexagonGroup.boundingBox
      };
    };

    throw new Error("Hexagon count > 6 not supported");
  };
};