import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export const Screen = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  safeArea: {
    backgroundColor: "#ffffff",
    flex: 1
  }
});
