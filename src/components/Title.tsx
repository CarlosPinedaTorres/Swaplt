import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../Styles/Colors';

interface TitleProps {
  text: string;
}

export default function Title({ text }: TitleProps) {
  return <Text style={styles.title}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.letraTitulos,
    marginBottom: 40,
    textAlign: 'center',
  },
});
