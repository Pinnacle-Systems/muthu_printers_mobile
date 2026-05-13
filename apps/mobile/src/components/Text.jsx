import React from "react";
import { StyleSheet, Text as NativeText } from "react-native";

export const Text = ({ children, variant = "body" }) => {
  const variantStyle =
    variant === "title" ? styles.title : variant === "label" ? styles.label : styles.body;

  return <NativeText style={[styles.base, variantStyle]}>{children}</NativeText>;
};

const styles = StyleSheet.create({
  base: {
    color: "#101828",
    fontSize: 16
  },
  body: {
    fontSize: 16
  },
  label: {
    fontSize: 13,
    fontWeight: "700"
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  }
});
