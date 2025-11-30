import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import styles from './CustomInput.styles';
import { colors } from '../Styles/Colors';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface CustomInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean; 
  height?: number;  
}

const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  height,
  keyboardType = 'default',
  secureTextEntry = false,
  ...rest
}) => {
  return (
    <TextInput
      style={[
        styles.input,
        multiline && { height: height || RFPercentage(12), textAlignVertical: "top" }
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.letraSecundaria}
      multiline={multiline}
      {...rest}
    />
  );
};

export default CustomInput;
