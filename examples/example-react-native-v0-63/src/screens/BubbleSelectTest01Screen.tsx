import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import BubbleSelect, { Bubble } from 'react-native-bubble-select';

const { width, height } = Dimensions.get('window');

export const BubbleSelectTest01Screen = () => {
  return (
    <View style={styles.rootContainer}>
      <BubbleSelect
        style={styles.bubbleSelect}
        onSelect={bubble => console.log('Selected: ', bubble.id)}
        onDeselect={bubble => console.log('Deselected: ', bubble.id)}
        width={width}
        height={height}
      >
        <Bubble 
          id={"bubble-1"}
          text={"Hello"}
          color={'rgba(0,0,0,0.1)'}
          fontColor={'black'}
        />
        <Bubble 
          id={"bubble-2"}
          text={"World"}
          color={'rgba(0,0,0,0.1)'}
          fontColor={'black'}
        />
        <Bubble 
          id={"bubble-3"}
          text={"Cimb"}
          color={'rgba(0,0,0,0.1)'}
          fontColor={'black'}
        />
        <Bubble 
          id={"bubble-4"}
          text={"Bank"}
          color={'rgba(0,0,0,0.1)'}
          fontColor={'black'}
        />
        <Bubble 
          id={"bubble-5"}
          text={"App"}
          color={'rgba(0,0,0,0.1)'}
          fontColor={'black'}
        />
      </BubbleSelect>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  bubbleSelect: {
    flex: 1,
  },
});