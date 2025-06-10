import React from 'react';
import { StyleSheet, View } from 'react-native';

import { WhatsNewSection } from './WhatsNewSection';

export const BubblePrototype2Screen = () => {
  const [bubbleCount, setBubbleCount] = React.useState(7);

  return (
    <View style={styles.rootContainer}>
      <WhatsNewSection
        sectionThemeConfig={{}}
        onRequestToShowDetails={() => {
          // no-op
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
