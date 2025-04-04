import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dobrodošli u sekciju Igrice!</Text>
      {/* Add game-related components here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    textAlign: 'center',
  },
});