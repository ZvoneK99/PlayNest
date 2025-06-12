import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from "../supabase"; // Import Supabase klijent

// Popis riječi za igru
const WORDS = [
    "programiranje", "racunalo", "tipkovnica", "mis", "monitor",
    "internet", "aplikacija", "razvoj", "algoritam", "varijabla",
    "funkcija", "objekt", "klasa", "nasljedivanje", "polimorfizam",
    "baza", "podaci", "tablica", "upit", "server",
    "klijent", "mreza", "protokol", "sigurnost", "enkripcija"
];

// ASCII art za vješala (7 pokušaja)
const HANGMAN_ASCII = [
    `
  +---+
  |   |
      |
      |
      |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
      |
      |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========\
    `,
    `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========\
    `
];

const MAX_GUESSES = HANGMAN_ASCII.length - 1; // Maksimalan broj netočnih pokušaja = broj faza vješala
const POINTS_PER_WIN = 5; // Bodovi koje igrač dobiva za svaku pobjedu

const GameOneScreen = () => {
    // Game State
    const [wordToGuess, setWordToGuess] = useState('');
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [currentGuess, setCurrentGuess] = useState('');
    const [message, setMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    // Supabase related states
    const [userPoints, setUserPoints] = useState(0); // Total points from Supabase (persistent)
    const [loadingPoints, setLoadingPoints] = useState(true);

    // --- Supabase: Fetch current user points on component mount ---
    useEffect(() => {
        const fetchUserPoints = async () => {
            setLoadingPoints(true);
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    console.error("Supabase Auth Error (fetch points):", authError?.message);
                    console.log("DEBUG: Korisnik NIJE prijavljen na Supabase. Nije moguće dohvatiti početne bodove.");
                    setLoadingPoints(false);
                    return;
                }

                const userId = user.id;
                console.log("DEBUG: Korisnik je prijavljen. User ID:", userId);

                const { data, error } = await supabase
                    .from('profiles') // PROMIJENJENO OVDJE: 'users' -> 'profiles'
                    .select('points')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') { // No rows found
                        console.warn("DEBUG: Korisnički zapis u 'profiles' tablici nije pronađen. Kreiranje novog zapisa sa 0 bodova.");
                        await supabase.from('profiles').insert({ id: userId, points: 0 }); // PROMIJENJENO OVDJE: 'users' -> 'profiles'
                        setUserPoints(0);
                    } else {
                        console.error("Supabase Fetch Error (fetching points):", error.message);
                    }
                } else if (data) {
                    setUserPoints(data.points || 0);
                    console.log("DEBUG: Dohvaćeni postojeći bodovi iz Supabasea:", data.points);
                }
            } catch (error) {
                console.error("Unexpected Error (fetching points):", error);
            } finally {
                setLoadingPoints(false);
            }
        };

        fetchUserPoints();
    }, []);

    // --- Game Logic ---
    useEffect(() => {
        // Inicijalizacija nove igre pri montiranju komponente ili resetiranju
        startNewGame();
    }, []); // Only run once on mount

    const startNewGame = () => {
        const randomIndex = Math.floor(Math.random() * WORDS.length);
        const newWord = WORDS[randomIndex].toLowerCase(); // Sve riječi u mala slova
        setWordToGuess(newWord);
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setCurrentGuess('');
        setMessage('');
        setGameOver(false);
        setGameWon(false);
    };

    const displayWord = () => {
        return wordToGuess
            .split('')
            .map(char => (guessedLetters.has(char) ? char : '_'))
            .join(' ');
    };

    const handleGuess = () => {
        if (gameOver || gameWon || !currentGuess) {
            return; // Ne dozvoli unos ako je igra gotova ili prazno polje
        }

        const letter = currentGuess.toLowerCase();

        if (!/^[a-zčćžšđ]$/i.test(letter)) { // Provjeri je li unos jedno slovo (uključuje HR slova)
            setMessage('Molimo unesite jedno slovo (A-Z, ČĆŽŠĐ).');
            setCurrentGuess('');
            return;
        }

        if (guessedLetters.has(letter)) {
            setMessage(`Slovo '${letter.toUpperCase()}' je već pogođeno!`);
            setCurrentGuess('');
            return;
        }

        const newGuessedLetters = new Set(guessedLetters);
        newGuessedLetters.add(letter);
        setGuessedLetters(newGuessedLetters);
        setCurrentGuess('');

        if (wordToGuess.includes(letter)) {
            setMessage(`Točno! Slovo '${letter.toUpperCase()}' je u riječi.`);
        } else {
            setWrongGuesses(prev => prev + 1);
            setMessage(`Netočno! Slovo '${letter.toUpperCase()}' nije u riječi.`);
        }
    };

    // Provjera pobjede ili poraza
    useEffect(() => {
        if (wordToGuess && !gameOver) { // Provjeri da igra nije već završena
            const currentDisplay = displayWord().replace(/ /g, ''); // Ukloni razmake za provjeru
            if (currentDisplay === wordToGuess) {
                setGameWon(true);
                setGameOver(true);
                setMessage(`Čestitamo! Pogodili ste riječ: ${wordToGuess.toUpperCase()}`);
                updateUserPoints(POINTS_PER_WIN); // Ažuriraj bodove u Supabaseu
            } else if (wrongGuesses >= MAX_GUESSES) {
                setGameWon(false);
                setGameOver(true);
                setMessage(`Igra je gotova! Točna riječ je bila: ${wordToGuess.toUpperCase()}`);
            }
        }
    }, [guessedLetters, wrongGuesses, wordToGuess, gameOver]);

    // --- Supabase: Update User Points ---
    const updateUserPoints = async (pointsChange) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Supabase Auth Error (update points):", authError?.message);
                console.log("DEBUG: Nije moguće ažurirati bodove jer korisnik NIJE prijavljen.");
                Alert.alert("Greška", "Niste prijavljeni. Bodovi se ne mogu spremiti.");
                return;
            }

            const userId = user.id;
            console.log("DEBUG: Pokušavam ažurirati bodove za User ID:", userId, "sa promjenom od:", pointsChange);

            const { data, error } = await supabase
                .from('profiles') // PROMIJENJENO OVDJE: 'users' -> 'profiles'
                .select('points')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Supabase Fetch Error (for update):", error.message);
                Alert.alert("Greška", `Nije moguće dohvatiti vaše trenutne bodove: ${error.message}. Provjerite politike!`);
            } else if (data) {
                const currentPoints = data.points || 0;
                const newPoints = currentPoints + pointsChange;
                console.log(`DEBUG: Trenutni bodovi: ${currentPoints}, Novi bodovi (za ažuriranje): ${newPoints}`);

                const { error: updateError } = await supabase
                    .from('profiles') // PROMIJENJENO OVDJE: 'users' -> 'profiles'
                    .update({ points: newPoints })
                    .eq('id', userId);

                if (updateError) {
                    console.error("Supabase Update Error:", updateError.message);
                    Alert.alert("Greška", `Nije moguće spremiti bodove: ${updateError.message}. Provjerite politike!`);
                } else {
                    setUserPoints(newPoints); // Update local state
                    console.log(`DEBUG: Korisnički bodovi uspješno ažurirani u Supabaseu na: ${newPoints}`);
                    Alert.alert("Bodovi", `Čestitamo! Dodano vam je ${pointsChange} bodova. Vaš ukupni zbroj je ${newPoints}.`);
                }
            }
        } catch (error) {
            console.error("Unexpected Error (update points):", error);
            Alert.alert("Greška", `Došlo je do neočekivane pogreške prilikom ažuriranja bodova: ${error.message}`);
        }
    };


    // --- Render Logic ---
    if (loadingPoints) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Učitavam bodove...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.title}>Pogađanje Riječi</Text>

            <Text style={styles.pointsText}>Ukupno bodova: {userPoints}</Text>

            <View style={styles.hangmanArtContainer}>
                <Text style={styles.hangmanArt}>{HANGMAN_ASCII[wrongGuesses]}</Text>
            </View>

            <Text style={styles.wordDisplay}>{displayWord()}</Text>

            {gameOver ? (
                <View style={styles.gameOverSection}>
                    <Text style={[styles.gameOverMessage, gameWon ? styles.winText : styles.loseText]}>
                        {message}
                    </Text>
                    <TouchableOpacity onPress={startNewGame} style={styles.restartButton}>
                        <Icon name="refresh-outline" size={24} color="white" />
                        <Text style={styles.restartButtonText}>Nova Igra</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.inputSection}>
                    <Text style={styles.guessesLeft}>Preostali pokušaji: {MAX_GUESSES - wrongGuesses}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Unesi slovo"
                        maxLength={1}
                        onChangeText={text => setCurrentGuess(text)}
                        value={currentGuess}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!gameOver}
                    />
                    <TouchableOpacity onPress={handleGuess} style={styles.guessButton} disabled={gameOver}>
                        <Text style={styles.guessButtonText}>Pogodi</Text>
                    </TouchableOpacity>
                    {message ? <Text style={styles.statusMessage}>{message}</Text> : null}
                    <Text style={styles.guessedLettersText}>Pogođena slova: {Array.from(guessedLetters).sort().map(l => l.toUpperCase()).join(', ')}</Text>
                </View>
            )}
        </KeyboardAvoidingView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 24,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    hangmanArtContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    hangmanArt: {
        fontSize: 16,
        lineHeight: 18,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#000',
        textAlign: 'center',
    },
    wordDisplay: {
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 8,
        marginBottom: 30,
        color: '#007BFF',
    },
    inputSection: {
        width: '80%',
        alignItems: 'center',
    },
    guessesLeft: {
        fontSize: 20,
        marginBottom: 15,
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    input: {
        height: 50, // OVO JE PROMIJENJENO: Smanjeno s 50 na 40
        width: '65%',
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 28,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    guessButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    guessButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusMessage: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#666',
    },
    guessedLettersText: {
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    gameOverSection: {
        alignItems: 'center',
        marginTop: 30,
    },
    gameOverMessage: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    winText: {
        color: 'green',
    },
    loseText: {
        color: 'red',
    },
    restartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    restartButtonText: {
        marginLeft: 10,
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default GameOneScreen;