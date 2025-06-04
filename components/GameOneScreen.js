import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from "../supabase";  // Import Supabase klijent

const GameOneScreen = () => {
  const [numbers, setNumbers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sum, setSum] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error);
          return;
        }
        const user = data.user;
        if (!user) {
          console.log("User not logged in");
          return;
        }
        const { data: pointsData, error: pointsError } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        if (pointsError) {
          console.error("Error fetching user points:", pointsError.message);
        } else if (pointsData) {
          setUserPoints(pointsData.points || 0);
        }
      } catch (error) {
        console.error("Error fetching user points:", error);
      }
    };

    fetchUserPoints();
  }, []);

  const startGame = () => {
    setGameStarted(true);
    generateRandomNumbers();
  };

  useEffect(() => {
    if (currentIndex < numbers.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowInput(true);
    }
  }, [currentIndex, numbers]);

  const generateRandomNumbers = () => {
    const nums = [];
    let previousNum = null;
    for (let i = 0; i < 10; i++) {
      let newNum;
      do {
        newNum = Math.floor(Math.random() * 10);
      } while (newNum === previousNum);
      nums.push(newNum);
      previousNum = newNum;
    }
    setNumbers(nums);
    setSum(nums.reduce((acc, num) => acc + num, 0));
    setCurrentIndex(0);
    setShowInput(false);
    setUserInput('');
    setMessage('');
  };

  const handleInputChange = (text) => {
    setUserInput(text);
  };

  const handleSubmit = () => {
    const userSum = parseInt(userInput, 10);
    if (userSum === sum) {
      setMessage('Točan odgovor, bravo samo tako nastavi!');
      updateUserPoints(10); // +10 bodova za točan odgovor
    } else {
      setMessage('Netočan odgovor, pokušaj ponovo!');
      updateUserPoints(0); // 0 bodova za netočan odgovor
    }
  };

  const updateUserPoints = async (pointsEarned) => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Greška kod dohvaćanja korisnika:", error);
        return;
      }

      const user = data.user;
      if (!user) {
        console.log("Korisnik nije prijavljen");
        return;
      }

      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error("Greška kod dohvaćanja bodova:", fetchError.message);
        return;
      }

      const currentPoints = currentData?.points || 0;
      const newPoints = currentPoints + pointsEarned;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

      if (updateError) {
        console.error("Greška kod ažuriranja bodova:", updateError.message);
        return;
      }

      setUserPoints(newPoints);
      console.log(`Bodovi ažurirani: ${newPoints}`);
    } catch (error) {
      console.error("Greška kod updateUserPoints:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pointsText}>Vaši bodovi: {userPoints}</Text>
      {!gameStarted ? (
        <TouchableOpacity onPress={startGame} style={styles.startButton}>
          <Text style={styles.startText}>Započni igricu</Text>
        </TouchableOpacity>
      ) : currentIndex < numbers.length ? (
        <Text style={styles.number}>{numbers[currentIndex]}</Text>
      ) : showInput ? (
        <View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Unesite zbroj brojeva'
              style={styles.input}
              keyboardType="numeric"
              value={userInput}
              onChangeText={handleInputChange}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.iconButton}>
              <Icon name="checkmark-circle-outline" size={30} color="green" />
            </TouchableOpacity>
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity onPress={generateRandomNumbers} style={styles.restartButton}>
            <Icon name="refresh-outline" size={30} color="blue" />
            <Text style={styles.restartText}>Restart</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 96,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 0,
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  message: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  restartButton: {
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  restartText: {
    marginLeft: 5,
    fontSize: 18,
    color: 'blue',
  },
  startButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  startText: {
    color: 'white',
    fontSize: 18,
  },
});

export default GameOneScreen;
