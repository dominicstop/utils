import * as React from "react";

import { BoxedHexagon } from "./BoxedHexagon";
import { Rect, RectValue } from "./Rect";
import { Point } from "./Point";
import { HexagonGroup } from "./HexagonGroup";
import { WhatsNewDataState } from "./UseWhatsNewData";
import { WhatsNewPayload } from "./WhatsNewService";


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

} | {
  mode: 'LOADING_ERROR';
  errorReason: string;
  containerRect: RectValue;
  hexagons: Array<BoxedHexagon>;

} | {
  mode: 'LOADED';
  containerRect: RectValue;
  hexagons: Array<BoxedHexagon>;
  data: WhatsNewPayload;
};

export type WhatsNewLayoutResult = {
  setContainerRect: (newContainerRect: RectValue) => void;
  state: WhatsNewLayoutState;
};

function computeHexagons(args: {
  containerRectValue: RectValue;
  hexagonCount: number;
}): Array<BoxedHexagon> {

  const containerRect = new Rect({
    mode: 'originAndSize',
    ...args.containerRectValue
  });
  
  containerRect.origin = new Point({ x: 0, y: 0 });

  const circlesPerRowCount = 3;
  const circlePermimeter = containerRect.size.width / circlesPerRowCount;
  const circleRadius = circlePermimeter / 2;

  const hexagonGroup = HexagonGroup.createHexagons({
    hexagonCount: args.hexagonCount,
    centerPoint: containerRect.centerPoint,
    circumRadius: circleRadius,
    extraPositionOffset: 6,
  });

  return hexagonGroup.hexagons;
  // return [hexagons.centerHexagon, ...hexagons.outerHexagonRing];
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

    // block scoped variables
    let hexagonItems: Array<BoxedHexagon> = [];

    switch (whatsNewDataState.mode) {
      case 'LOADING':
        hexagonItems = computedLayout.current.hexagons ?? computeHexagons({
          containerRectValue: layoutMode.containerRect,
          hexagonCount: 7,
        });
        
        // cache if needed
        computedLayout.current.hexagons = hexagonItems;

        return {
          mode: 'LOADING',
          containerRect: layoutMode.containerRect,
          hexagons: hexagonItems,
        };

      case 'LOADED':
        const hexagonCount = whatsNewDataState.loadedData.totalItems;

        hexagonItems = computedLayout.current.hexagons ?? computeHexagons({
          containerRectValue: layoutMode.containerRect,
          hexagonCount: hexagonCount,
        });

        // cache if needed
        computedLayout.current.hexagons = hexagonItems;

        return {
          mode: 'LOADED',
          containerRect: layoutMode.containerRect,
          hexagons: hexagonItems,
          data: whatsNewDataState.loadedData,
        };


      case 'LOADING_ERROR':
        hexagonItems = computedLayout.current.hexagons ?? computeHexagons({
          containerRectValue: layoutMode.containerRect,
          hexagonCount: 7,
        });
        
        // cache if needed
        computedLayout.current.hexagons = hexagonItems;

        return {
          mode: 'LOADING_ERROR',
          containerRect: layoutMode.containerRect,
          errorReason: whatsNewDataState.errorData,
          hexagons: hexagonItems,
        };
    };
  })();
  
  return {
    setContainerRect,
    state: consolidatedState,
  };

};