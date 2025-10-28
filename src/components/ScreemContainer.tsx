// components/ScreenContainer.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../Styles/Colors";

export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.fondo,
    paddingVertical: 20,
  },
});
