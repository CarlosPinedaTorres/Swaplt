import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import styles from './CustomInput.styles';
import { colors } from '../Styles/Colors';



interface CustomInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}


const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  ...rest
}) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText} 
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.letraSecundaria}
      {...rest}
    />
  );
};




export default CustomInput;
