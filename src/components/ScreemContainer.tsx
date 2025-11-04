
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../Styles/Colors";
import { RFPercentage } from "react-native-responsive-fontsize";
export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.fondo,
    paddingVertical: RFPercentage(3),
    paddingHorizontal: RFPercentage(2)
  },
});
