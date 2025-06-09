import React from 'react';
import { StyleSheet, View, LayoutRectangle, Text, Image } from 'react-native';

import Stepper from '../../components/Stepper';
import { WhatsNewSection } from './WhatsNewSection';
import { MOCK_DEBUG_CONFIG } from './mock_data/WhatsNewMockData';


export const BubblesPrototypeScreen = () => {
  const [bubbleCount, setBubbleCount] = React.useState(7);

  return (
    <View style={styles.rootContainer}>
      <WhatsNewSection
        debugMaxBubbleCount={bubbleCount}
      />
      <Stepper
        initialValue={7}
        min={1}
        max={7}
        onChange={(val) => {
          MOCK_DEBUG_CONFIG.maxItemsToShow = bubbleCount;
          setBubbleCount(val);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});