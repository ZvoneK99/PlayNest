import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import { AuthContext } from "../AuthContext";

import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";

export default function LoggedInView() {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
        Alert.alert("Greška", "Došlo je do greške pri učitavanju vašeg profila.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      await setDoc(doc(firestore, "users", userId), profile);
      Alert.alert("Profil spremljen", "Vaš profil je uspješno spremljen!");
    } catch (error) {
      console.error("Greška pri spremanju profila: ", error);
      Alert.alert("Greška", "Došlo je do greške pri spremanju vašeg profila.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Učitavanje profila...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dobrodošli na sustav</Text>

      <LoginButton title="Odjavi se" onPress={logout} />

      <LoginInput 
        placeholder="Unesite svoje ime"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />

      <LoginInput 
        placeholder="Unesite svoje godine"
        value={profile.age}
        onChangeText={(text) => setProfile({ ...profile, age: text })}
        keyboardType="numeric"
      />

      <LoginInput 
        placeholder="O meni ..."
        value={profile.bio}
        onChangeText={(text) => setProfile({ ...profile, bio: text })}
        multiline
      />

      <LoginButton title="Spremi profil" onPress={handleSaveProfile} />
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
    marginBottom: 20,
    textAlign: 'center',
  },
});