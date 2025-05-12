import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const WhackAMole = () => {
  const [molePosition, setMolePosition] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const hitRef = useRef(false); // Pratimo je li korisnik pogodio

  useEffect(() => {
    if (!gameOver) {
      const moleTimer = setTimeout(() => {
        // Ako korisnik NIJE pogodio prethodnu ➔ kraj igre
        if (hitRef.current === false && molePosition !== null) {
          setGameOver(true);
          Alert.alert('Promašio si!', `Tvoj rezultat: ${score}`);
          return;
        }

        // Nova krtica
        const newMolePosition = Math.floor(Math.random() * 9);
        setMolePosition(newMolePosition);
        hitRef.current = false; // Reset za novu krticu
        setRound((prev) => prev + 1);

        if (round >= 20) {
          setGameOver(true);
          Alert.alert('Game Over', `Tvoj rezultat: ${score}`);
        }
      }, 1000); // Nova krtica svakih 1000ms

      return () => clearTimeout(moleTimer);
    }
  }, [round, gameOver, molePosition]);

  const handleHit = (index) => {
    if (index === molePosition) {
      setScore((prev) => prev + 1);
      hitRef.current = true; // Označi da je korisnik pogodio
    } else {
      setGameOver(true);
      Alert.alert('Promašio si!', `Tvoj rezultat: ${score}`);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(0);
    setGameOver(false);
    setMolePosition(null);
    hitRef.current = false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Rezultat: {score}</Text>

      <View style={styles.grid}>
        {Array.from({ length: 9 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              molePosition === index ? styles.mole : null,
            ]}
            onPress={() => handleHit(index)}
            disabled={gameOver}
          >
            {molePosition === index && <Text style={styles.moleText}>🐹</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {gameOver && (
        <TouchableOpacity style={styles.restartButton} onPress={resetGame}>
          <Text style={styles.restartText}>Igraj ponovno</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  score: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  grid: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00796B',
  },
  mole: {
    backgroundColor: '#A5D6A7',
  },
  moleText: {
    fontSize: 30,
  },
  restartButton: {
    marginTop: 30,
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 10,
  },
  restartText: {
    color: 'white',
    fontSize: 18,
  },
});

export default WhackAMole;
