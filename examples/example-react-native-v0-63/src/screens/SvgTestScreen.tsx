import * as React from 'react';

import {
  View,
} from 'react-native';

import * as RNSVG from 'react-native-svg';

export class SvgExample extends React.Component {
  render() {
    return (
      <View
        style={[
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <RNSVG.Svg height="50%" width="50%" viewBox="0 0 100 100">
          <RNSVG.Circle
            cx="50"
            cy="50"
            r="45"
            stroke="blue"
            strokeWidth="2.5"
            fill="green"
          />
          <RNSVG.Rect
            x="15"
            y="15"
            width="70"
            height="70"
            stroke="red"
            strokeWidth="2"
            fill="yellow"
          />
        </RNSVG.Svg>
      </View>
    );
  }
}
