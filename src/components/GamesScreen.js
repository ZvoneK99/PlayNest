import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GamesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dobrodošli u sekciju Igrice!</Text>

      {/* Gumb za Whack a Mole */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WhackAMole')}>
        <Text style={styles.buttonText}>Whack a Mole (Krtica)</Text>
      </TouchableOpacity>

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
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
