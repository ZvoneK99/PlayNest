import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GamesScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaberi igru</Text>
      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => navigation.navigate('NewGameScreen')}
      >
        <Text style={styles.gameButtonText}>Igra zbrajanja</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => navigation.navigate('GameOne')}
      >
        <Text style={styles.gameButtonText}>Igra pogađanja</Text>
      </TouchableOpacity>
      {/* Ovdje možeš dodati još igara */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  gameButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  gameButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default GamesScreen;