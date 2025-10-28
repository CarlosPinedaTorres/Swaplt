import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from './CustomInput.styles'; 
import { colors } from '../Styles/Colors';

interface CustomPickerProps {
  selectedValue: any;
  onValueChange: (value: any) => void;
  items: { label: string; value: any }[];
}

const CustomPicker: React.FC<CustomPickerProps> = ({ selectedValue, onValueChange, items }) => {
  return (
        <View style={[styles.input]}>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={{ color: colors.letraSecundaria, width: '100%' }}
        >
            {items.map(item => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
        </Picker>
        </View>

  );
};

export default CustomPicker;
