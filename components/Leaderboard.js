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
                .from('profiles')
                .select('*')
                .order('points', { ascending: false });

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
            setLoading(true);
            fetchLeaderboard();
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
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.leaderboardItem}>
                        <Text style={styles.rank}>{index + 1}.</Text>
                        <Text style={styles.name}>
                            {item.full_name && item.full_name.trim() !== ''
                                ? item.full_name
                                : item.email && item.email.trim() !== ''
                                    ? item.email
                                    : `Guest${item.id}`}
                        </Text>
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
