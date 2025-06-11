import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { supabase } from '../supabase';
import { useIsFocused } from '@react-navigation/native';

const DEFAULT_AVATAR =
  'https://uvlyxwknrtgayncklxjc.supabase.co/storage/v1/object/public/avatars/default.png';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, points, avatar_url')
        .order('points', { ascending: false });

      if (data) setPlayers(data);
    };
    fetchLeaderboard();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <ScrollView style={{ width: '100%' }}>
        {players.map((player, idx) => (
          <View key={player.email || idx} style={styles.row}>
            <Text style={styles.rank}>{idx + 1}.</Text>
            <Image
              source={{ uri: player.avatar_url || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {player.full_name ? player.full_name : player.email}
            </Text>
            <Text style={styles.score}>{player.points} bodova</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  rank: {
    fontSize: 20,
    width: 30,
    color: '#888',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 20,
    flex: 1,
    color: '#333',
  },
  score: {
    fontSize: 20,
    color: '#007BFF',
    width: 100,
    textAlign: 'right',
  },
});

export default Leaderboard;
