import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from "../supabase";  // Import Supabase klijent
import { useFocusEffect } from '@react-navigation/native';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('users')  // Pretpostavljam da se tabela zove 'users'
                .select('*')
                .order('points', { ascending: false }); // Poredaj po bodovima u opadajućem redoslijedu

            if (error) {
                throw error;
            }

            setUsers(data);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true); // Postavi loading state
            fetchLeaderboard(); // Dohvati podatke kad se ekran fokusira
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Učitavanje ljestvice...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ljestvica</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()} // Koristi item.id kao ključ
                renderItem={({ item, index }) => (
                    <View style={styles.leaderboardItem}>
                        <Text style={styles.rank}>{index + 1}.</Text>
                        <Text style={styles.name}>{item.name || "Nepoznati korisnik"}</Text>
                        <Text style={styles.points}>{item.points || 0} bodova</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    loadingText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    leaderboardItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    rank: {
        fontSize: 18,
        fontWeight: "bold",
        marginRight: 10,
    },
    name: {
        flex: 1,
        fontSize: 18,
    },
    points: {
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Leaderboard;
