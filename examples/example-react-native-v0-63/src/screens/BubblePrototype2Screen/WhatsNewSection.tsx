import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// import SectionHeader from '@components/_v2/sectionHeader';
// import { Dashboard } from '@modules/home/interfaces/iDashboard';
// import { Deeplink } from '@modules/common/stores/deeplinkStore';
import { Dashboard } from '../../dummy/Dummy';
import { SectionHeader } from '../../dummy/SectionHeader';

import { DebugStepper } from './DebugStepper';
import { FadeInViewOnMount } from './FadeInViewOnMount';
import { MOCK_DEBUG_CONFIG } from './mock_data/WhatsNewMockData';
import { RotatingView } from './RotatingView';
import { useWhatsNewData } from './UseWhatsNewData';
import { useWhatsNewLayout } from './UseWhatsNewLayout';
import { WhatsNewBubble } from './WhatsNewBubble';
import { WhatsNewLoadingBubble } from './WhatsNewLoadingBubble';
import { WhatsNewEntry } from './WhatsNewService';

export function WhatsNewSection(props: {
  sectionThemeConfig?: Dashboard.SectionItem;
  onRequestToShowDetails: (item: WhatsNewEntry) => void;
}) {
  const [debugBubbleCount, setDebugBubbleCount] = React.useState(7);

  const whatsNewData = useWhatsNewData({
    debugMaxBubbleCount: MOCK_DEBUG_CONFIG.isDebug
      ? debugBubbleCount
      : undefined,
  });

  const whatsNewLayout = useWhatsNewLayout(whatsNewData);

  const bubbles: React.JSX.Element = (() => {
    switch (whatsNewLayout.state.mode) {
      case 'WAITING_FOR_LAYOUT':
        return (
          <View style={styles.notReadyForDisplayContainer}>
            <ActivityIndicator
              animating={true}
              color={
                props.sectionThemeConfig?.sectionTitleColor ??
                'rgba(255,255,255,0.3)'
              }
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
              if (currentEntry == null) {
                return <React.Fragment />;
              }

              return (
                <WhatsNewBubble
                  key={`bubble-${index}`}
                  index={index}
                  hexagon={hexagon}
                  whatsNewEntry={currentEntry}
                  onPress={() => {
                    props.onRequestToShowDetails(currentEntry);
                  }}
                />
              );
            })}
            {MOCK_DEBUG_CONFIG.showBubbleGroupBoundingBox && (
              <View
                style={{
                  zIndex: -1,
                  backgroundColor: 'rgba(255,0,0,0.5)',
                  width: whatsNewLayout.state.hexagonGroupBoundingBox.width,
                  height: whatsNewLayout.state.hexagonGroupBoundingBox.height,
                  transform: [
                    {
                      translateX:
                        whatsNewLayout.state.hexagonGroupBoundingBox.minX,
                    },
                    {
                      translateY:
                        whatsNewLayout.state.hexagonGroupBoundingBox.minY,
                    },
                  ],
                }}
              />
            )}
          </FadeInViewOnMount>
        );

      case 'LOADING_ERROR':
        // TODO: Add Styling
        return (
          <View>
            <Text>{`Error: ${whatsNewLayout.state.errorReason}`}</Text>
          </View>
        );

      case 'LOADED_NOTHING_TO_DISPLAY':
        return <React.Fragment />;
    }
  })();

  switch (whatsNewLayout.state.mode) {
    case 'LOADED_NOTHING_TO_DISPLAY':
      return <React.Fragment />;

    default:
      return (
        <View style={styles.rootContainer}>
          {props.sectionThemeConfig && (
            <SectionHeader
              id="whats_new"
              title={props.sectionThemeConfig.sectionTitle ?? "What's New"}
              textStyle={{
                color: props.sectionThemeConfig.sectionTitleColor ?? 'white',
              }}
            />
          )}
          <View
            style={styles.bubblesContainer}
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
          </View>
          {MOCK_DEBUG_CONFIG.isDebug && (
            <Text>
              {`state: ${whatsNewLayout.state.mode}`}
              {'\n'}
              {`hexagonCount: ${
                (whatsNewLayout.state as Record<string, any>).hexagons?.length
              }`}
            </Text>
          )}
          {MOCK_DEBUG_CONFIG.isDebug && (
            <DebugStepper
              initialValue={7}
              min={1}
              max={7}
              onChange={(newValue) => {
                MOCK_DEBUG_CONFIG.maxItemsToShow = debugBubbleCount;
                setDebugBubbleCount(newValue);
              }}
            />
          )}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    marginTop: 12,
  },
  bubblesContainer: {
    alignSelf: 'stretch',
    aspectRatio: 1,
  },
  notReadyForDisplayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
