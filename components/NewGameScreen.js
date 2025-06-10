import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

const getRandomNumber = () => Math.floor(Math.random() * 50) + 1;

const NewGameScreen = () => {
    const [num1, setNum1] = useState(getRandomNumber());
    const [num2, setNum2] = useState(getRandomNumber());
    const [userAnswer, setUserAnswer] = useState('');
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);

    // Dohvati bodove iz Supabase na početku
    useEffect(() => {
        const fetchPoints = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', user.id)
                .single();
            if (data) setScore(data.points || 0);
        };
        fetchPoints();
    }, []);

    // Funkcija za ažuriranje bodova u Supabase
    const updatePoints = async (pointsChange) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();
        if (data) {
            const newPoints = (data.points || 0) + pointsChange;
            await supabase
                .from('profiles')
                .update({ points: newPoints })
                .eq('id', user.id);
            setScore(newPoints);
        }
    };

    const checkAnswer = () => {
        const correct = num1 + num2;
        if (parseInt(userAnswer) === correct) {
            setMessage('Točno! Bravo!');
            updatePoints(3); // +3 boda
        } else {
            setMessage(`Netočno! Točan odgovor je ${correct}.`);
            updatePoints(-1); // -1 bod
        }
        setNum1(getRandomNumber());
        setNum2(getRandomNumber());
        setUserAnswer('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Igra zbrajanja</Text>
            <Text style={styles.score}>Bodovi: {score}</Text>
            <Text style={styles.question}>{num1} + {num2} = ?</Text>
            <TextInput
                style={styles.input}
                placeholder="Upiši odgovor"
                keyboardType="numeric"
                value={userAnswer}
                onChangeText={setUserAnswer}
            />
            <TouchableOpacity style={styles.button} onPress={checkAnswer}>
                <Text style={styles.buttonText}>Provjeri</Text>
            </TouchableOpacity>
            {message ? <Text style={styles.message}>{message}</Text> : null}
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
        marginBottom: 20,
    },
    score: {
        fontSize: 24,
        marginBottom: 20,
        color: '#007BFF',
    },
    question: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: '60%',
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 15,
        backgroundColor: 'white', 
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        marginTop: 20,
        fontSize: 18,
        color: '#666',
    },
});

export default NewGameScreen;