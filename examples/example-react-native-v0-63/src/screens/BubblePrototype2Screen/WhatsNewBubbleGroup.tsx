import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { WhatsNewBubble } from './WhatsNewBubble';
import { BoxedHexagon } from '@dominicstop/utils';
import { WhatsNewConsolidatedData } from './WhatsNewService';
import { WhatsNewBubbleTransformationMap } from './UseBubbleTransformDeferredComputation';
import { MOCK_DEBUG_CONFIG } from './mock_data/WhatsNewMockData';


type WhatsNewBubbleSelectionState = {
  mode: 'NONE_SELECTED';
} | {
  mode: 'SELECTED';
  selectedHexagonIndex: number;
};

export function WhatsNewBubbleGroup(props: {
  data: WhatsNewConsolidatedData;
  hexagons: Array<BoxedHexagon>;
  bubbleTransformMap: WhatsNewBubbleTransformationMap;
}){
  const [
    selectionState,
    setSelectionState,
  ] = React.useState<WhatsNewBubbleSelectionState>({
    mode: 'NONE_SELECTED'
  });

  const selectedIndex = selectionState.mode === 'SELECTED'
    ? selectionState.selectedHexagonIndex
    : undefined;

  const didSelectItem = selectionState.mode === 'SELECTED';

  MOCK_DEBUG_CONFIG.shouldLogData && console.log({
    'WhatsNewBubbleGroup.selectedIndex': selectedIndex,
    'WhatsNewBubbleGroup.props.bubbleTransformMap - keys': Object.keys(props.bubbleTransformMap),
  });

  return (
    <View style={styles.rootContainer}>
      {props.hexagons.map((hexagon, index) => {
        const currentEntry = props.data.entries[index]!;

        if (currentEntry == null) {
          return <React.Fragment />;
        };

        const isSelected = selectedIndex == index;

        const transfomedCircle = (() => {
          if(selectedIndex == null) {
            return undefined;
          };

          const transformationMap = props.bubbleTransformMap[selectedIndex];
          return transformationMap[index];
        })();

        return (
          <WhatsNewBubble
            key={`bubble-${index}`}
            index={index}
            totalCircles={props.hexagons.length}
            circle={hexagon.inCircle}
            circleTransformed={
              didSelectItem
                ? transfomedCircle
                : undefined
            }
            whatsNewEntry={currentEntry}
            onPress={() => {
              if(isSelected) {
                setSelectionState({
                  mode: 'NONE_SELECTED',
                });

              } else {
                setSelectionState({
                  mode: 'SELECTED',
                  selectedHexagonIndex: index,
                });
              };
              // props.onRequestToShowDetails(currentEntry);
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
