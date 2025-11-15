import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../Styles/Colors';
import { fonts } from '../Styles/Fonts';
import { RFPercentage } from "react-native-responsive-fontsize";
interface TitleProps {
  text: string;
}

export default function Title({ text }: TitleProps) {
  return <Text style={styles.title}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: fonts.title,
    fontWeight: 'bold',
    color: colors.letraTitulos,
    marginBottom: RFPercentage(4),
    textAlign: 'center',
  },
});
