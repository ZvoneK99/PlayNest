import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Jeste li spremni s nama igrati igrice? Zabava počinje sada!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("GamesScreen")}>
        <Text style={styles.buttonText}>Krenimo!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // bijela pozadina
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    color: "#000000", // crni tekst
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00bfff", // plavi gumb
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
