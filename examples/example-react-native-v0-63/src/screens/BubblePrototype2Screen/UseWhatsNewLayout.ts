import * as React from "react";

import { HexagonGrid, Point, Rect, RectValue, BoxedHexagon } from "@dominicstop/utils";
import { WhatsNewDataState } from "./UseWhatsNewData";
import { WhatsNewConsolidatedData } from "./WhatsNewService";


type LayoutStateInternal = {
  mode: 'WAITING_FOR_LAYOUT';
} | {
  mode: 'DISPLAY';
  containerRect: RectValue;
};

export type WhatsNewLayoutState = {
  // not ready for display and cannot show anything
  mode: 'WAITING_FOR_LAYOUT';

} | {
  // show skeleton
  mode: 'LOADING';
  containerRect: RectValue;
  hexagons: Array<BoxedHexagon>;
  hexagonGroupBoundingBox: Rect;

} | {
  mode: 'LOADING_ERROR';
  errorReason: string;

} | {
  mode: 'LOADED';
  containerRect: RectValue;
  hexagons: Array<BoxedHexagon>;
  hexagonGroupBoundingBox: Rect;
  data: WhatsNewConsolidatedData;

} | {
  mode: 'LOADED_NOTHING_TO_DISPLAY';
};

export type WhatsNewLayoutResult = {
  setContainerRect: (newContainerRect: RectValue) => void;
  state: WhatsNewLayoutState;
};

function computeHexagons(args: {
  circumRadius: number;
  containerRectValue: RectValue;
  hexagonCount: number;
}): {
  hexagons: Array<BoxedHexagon>;
  boundingBox: Rect;
} {

  const containerRect = new Rect({
    mode: 'originAndSize',
    ...args.containerRectValue
  });

  containerRect.origin = new Point({ x: 0, y: 0 });

  return HexagonGrid.computeHexagonsForTriangleAndFlowerArrangement({
    hexagonCount: args.hexagonCount,
    centerPoint: containerRect.center,
    circumRadius: args.circumRadius,
    extraPositionOffset: 8,
  });
};

export function useWhatsNewLayout(
  whatsNewDataState: WhatsNewDataState
): WhatsNewLayoutResult {

  const [
    layoutMode,
    setLayoutModeInternal
  ] = React.useState<LayoutStateInternal>({ mode: 'WAITING_FOR_LAYOUT' });

  const computedLayout = React.useRef<{
    hexagonsFull?: Array<BoxedHexagon>;
    hexagons?: Array<BoxedHexagon>;
    boundingBox?: Rect;
  }>({});

  const setContainerRect: WhatsNewLayoutResult['setContainerRect'] = (newContainerRect) => {
    // reset
    computedLayout.current.hexagons = undefined;

    setLayoutModeInternal({
      mode: 'DISPLAY',
      containerRect: newContainerRect,
    });
  };

  React.useEffect(() => {
    // reset
    computedLayout.current.hexagons = undefined;

  }, [whatsNewDataState]);

  const consolidatedState: WhatsNewLayoutState = (() => {
    if(layoutMode.mode === 'WAITING_FOR_LAYOUT') {
      return({
        mode: 'WAITING_FOR_LAYOUT',
      });
    };

    const containerRect = layoutMode.containerRect;

    function computeHexagonsIfNeeded(args: {
      circlesPerRowCount: number;
      hexagonCount: number;
      containerRectValue: RectValue;
    }): {
      hexagons: Array<BoxedHexagon>;
      boundingBox: Rect;
    } {
      const { hexagons, boundingBox } = computedLayout.current;

      if(hexagons != null && boundingBox != null) {
        return {
          hexagons,
          boundingBox,
        };
      };

      const circlePermimeter = containerRect.size.width / args.circlesPerRowCount;
      const circleRadius = circlePermimeter / 2;

      return computeHexagons({
        ...args,
        circumRadius: circleRadius,
      });
    };

    switch (whatsNewDataState.mode) {
      case 'LOADING':
        const skeletonHexagonGroup = computeHexagonsIfNeeded({
          containerRectValue: layoutMode.containerRect,
          hexagonCount: 7,
          circlesPerRowCount: 3,
        });

        // cache if needed
        computedLayout.current.hexagons = skeletonHexagonGroup.hexagons;

        return {
          mode: 'LOADING',
          containerRect: layoutMode.containerRect,
          hexagons: skeletonHexagonGroup.hexagons,
          hexagonGroupBoundingBox: skeletonHexagonGroup.boundingBox,
        };

      case 'LOADED':
        const hexagonCount = whatsNewDataState.loadedData.totalItems;

        if(hexagonCount <= 0){
          return ({
            mode: 'LOADED_NOTHING_TO_DISPLAY',
          });
        };

        const hexagonGroup = computeHexagonsIfNeeded({
          containerRectValue: layoutMode.containerRect,
          hexagonCount: hexagonCount,
          circlesPerRowCount: hexagonCount > 3 ? 3 : 2.5,
        });

      // cache if needed
      computedLayout.current.hexagons = hexagonGroup.hexagons;

      return {
        mode: 'LOADED',
        containerRect: layoutMode.containerRect,
        hexagons: hexagonGroup.hexagons,
        hexagonGroupBoundingBox: hexagonGroup.boundingBox,
        data: whatsNewDataState.loadedData,
      };

      case 'LOADING_ERROR':
        return {
          mode: 'LOADING_ERROR',
          errorReason: whatsNewDataState.errorData,
        };
    };
  })();

  return {
    setContainerRect,
    state: consolidatedState,
  };

};
