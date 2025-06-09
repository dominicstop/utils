import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

import { useWhatsNewData } from './UseWhatsNewData';
import { useWhatsNewLayout } from './UseWhatsNewLayout';
import { WhatsNewLoadingBubble } from './WhatsNewLoadingBubble';
import { WhatsNewBubble } from './WhatsNewBubble';
import { MOCK_DEBUG_CONFIG } from './mock_data/WhatsNewMockData';
import { RotatingView } from './RotatingView';
import { FadeInViewOnMount } from './FadeInViewOnMount';


export function WhatsNewSection(props: {
  debugMaxBubbleCount?: number;
}){
  const whatsNewData = useWhatsNewData({
    debugMaxBubbleCount: props.debugMaxBubbleCount,
  });
  
  const whatsNewLayout = useWhatsNewLayout(whatsNewData);

  const bubbles: React.JSX.Element = (() => {
    switch(whatsNewLayout.state.mode){
      case 'WAITING_FOR_LAYOUT':
        return (
          <View style={styles.notReadyForDisplayContainer}>
            <ActivityIndicator
              animating={true}
              color={'rgba(255,255,255,0.3)'}
            />
          </View>
        );

      case 'LOADING':
        return (
          <RotatingView 
            style={{
              width: whatsNewLayout.state.containerRect.size.width,
              height: whatsNewLayout.state.containerRect.size.height,
            }}
            rotateDuration={1000 * 100}
            scaleDuration={1000 * 10}
          >
            {whatsNewLayout.state.hexagons.map((hexagon, index) => (
              <WhatsNewLoadingBubble
                key={`bubble-${index}`}
                index={index}
                hexagon={hexagon}
              />
            ))}
          </RotatingView>
        );

      case 'LOADED':
        const whatsNewData = whatsNewLayout.state.data;

        return (
          <FadeInViewOnMount 
            style={{
              width: whatsNewLayout.state.containerRect.size.width,
              height: whatsNewLayout.state.containerRect.size.height,
            }}
            duration={1000}
          >
            {whatsNewLayout.state.hexagons.map((hexagon, index) => {
              const currentEntry = whatsNewData.entries[index]!;
              if(currentEntry == null){
                return (<React.Fragment/>);
              };
              
              return (
                <WhatsNewBubble
                  key={`bubble-${index}`}
                  index={index}
                  hexagon={hexagon}
                  articleURL={currentEntry.articleURL}
                  imageURL={currentEntry.imagePreviewURL}
                />
              );
            })}
          </FadeInViewOnMount>
        );

      case 'LOADING_ERROR':
        return (
          <View>
            <Text>
              {`Error: ${whatsNewLayout.state.errorReason}`}
            </Text>
          </View>
        );
    };
  })();

  return (
    <View 
      style={styles.rootContainer}
      onLayout={({nativeEvent}) => {
        const maxDimension = Math.max(
          nativeEvent.layout.width,
          nativeEvent.layout.height,
        );

        whatsNewLayout.setContainerRect({
          origin: {
            x: nativeEvent.layout.x,
            y: nativeEvent.layout.y,
          },
          size: {
            width: maxDimension,
            height: maxDimension,
          },
        });
      }}
    >
      {bubbles}
      {MOCK_DEBUG_CONFIG.isDebug && (
        <Text>
          {`state: ${whatsNewLayout.state.mode}`}
          {'\n'}
          {`hexagonCount: ${whatsNewLayout.state.hexagons?.length}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,0,0,0.05)',
    aspectRatio: 1,
  },
  notReadyForDisplayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});