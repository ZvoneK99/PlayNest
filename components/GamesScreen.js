import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function GamesScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaberi igru</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("NewGameScreen")}
      >
        <Text style={styles.buttonText}>Igra zbrajanja</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("GameOne")}
      >
        <Text style={styles.buttonText}>Igra pogađanja</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TicTacToe")}
      >
        <Text style={styles.buttonText}>Križić-Kružić</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    width: 220,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});