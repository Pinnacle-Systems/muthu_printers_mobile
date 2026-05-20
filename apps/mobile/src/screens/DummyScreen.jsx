import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen } from "../components/Screen.jsx";
import { Text } from "../components/Text.jsx";

export const DummyScreen = () => {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Dummy Page</Text>
        <Text>This is a placeholder page reached through navigation.</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16
  }
});
