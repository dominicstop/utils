import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type StepperProps = {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
};

export const DebugStepper: React.FC<StepperProps> = ({
  initialValue = 1,
  min = 1,
  max = 100,
  onChange,
}) => {
  const [value, setValue] = useState<number>(initialValue);

  const increment = () => {
    if (value < max) {
      const newValue = value + 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const decrement = () => {
    if (value > min) {
      const newValue = value - 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={decrement} style={styles.button}>
        <Text style={styles.text}>-</Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
      </View>

      <TouchableOpacity onPress={increment} style={styles.button}>
        <Text style={styles.text}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  text: {
    fontSize: 20,
  },
  valueContainer: {
    marginHorizontal: 10,
    minWidth: 30,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
  },
});
