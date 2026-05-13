import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export const Button = ({ onPress, title }) => {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#155eef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  }
});
