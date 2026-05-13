import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../components/Button.jsx";
import { Screen } from "../components/Screen.jsx";
import { Text } from "../components/Text.jsx";
import { api } from "../services/api.js";

export const HomeScreen = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getHealth();
      setHealth(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to reach API");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Muthu Printers</Text>
        <Text>API health check</Text>

        {isLoading ? <Text>Loading API status...</Text> : null}

        {!isLoading && health ? (
          <View style={styles.statusBox}>
            <Text variant="label">Status</Text>
            <Text>{health.status}</Text>
            <Text variant="label">Service</Text>
            <Text>{health.service}</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.statusBox}>
            <Text variant="label">Error</Text>
            <Text>{error}</Text>
          </View>
        ) : null}

        <Button title="Retry" onPress={loadHealth} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16
  },
  statusBox: {
    borderColor: "#d0d5dd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12
  }
});
