import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { supabase } from "../supabase";  // Tvoj Supabase klijent
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import { AuthContext } from "../AuthContext"; // Ako ti treba signOut
import { useNavigation } from "@react-navigation/native";

export default function LoggedInView() {
  const { signOut } = useContext(AuthContext); // Za odjavu korisnika
  const navigation = useNavigation();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    full_name: "",
    age: "",
    avatar_url:
      "https://uvlyxwknrtgayncklxjc.supabase.co/storage/v1/object/public/MathApp/pngwing.com.png",
    points: 0,
  });

  // Dohvati sesiju i profil korisnika
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Greška pri dohvaćanju sesije:", sessionError);
          Alert.alert("Greška", "Nije moguće dohvatiti korisničku sesiju.");
          setLoading(false);
          return;
        }

        if (!session) {
          Alert.alert("Info", "Niste prijavljeni.");
          setLoading(false);
          return;
        }

        setSession(session);

        // Dohvati profil iz baze prema user id-u
        let { data, error } = await supabase
          .from("profiles")
          .select("full_name, age, avatar_url, points")
          .eq("id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
          console.error("Greška pri dohvaćanju profila:", error);
          Alert.alert("Greška", "Nije moguće dohvatiti profil korisnika.");
        }

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            age: data.age ? data.age.toString() : "",
            avatar_url: data.avatar_url || profile.avatar_url,
            points: data.points || 0,
          });
        }
      } catch (error) {
        console.error("Nešto je pošlo po zlu:", error);
        Alert.alert("Greška", "Nešto je pošlo po zlu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndProfile();

    // Slušaj promjene u auth stanju da update sesiju
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSaveProfile = async () => {
  try {
    if (!session?.user) throw new Error("Korisnik nije prijavljen");

    const updates = {
      id: session.user.id,
      email: session.user.email,     // <-- dodaj email ovdje
      full_name: profile.full_name,
      age: profile.age ? parseInt(profile.age, 10) : null,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    };

    console.log("Šaljem u Supabase:", updates);

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) throw error;

    Alert.alert("Uspjeh", "Profil je uspješno spremljen!");
  } catch (error) {
    console.error("Greška pri spremanju profila:", error);
    Alert.alert("Greška", "Nije moguće spremiti profil.");
  }
};


  const handleLogout = async () => {
    try {
      await signOut(navigation);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Greška pri odjavi:", error);
      Alert.alert("Greška", "Došlo je do greške pri odjavi.");
    }
  };

  const handleUploadImage = () => {
    // Ovdje možeš dodati kasnije funkcionalnost za upload slike
    console.log("Upload image functionality here");
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

      <LoginButton title="Odjavi se" onPress={handleLogout} />

      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
      ) : (
        <Text>Nema profilne slike!</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUploadImage}>
        <Text style={styles.buttonText}>Postavi profilnu sliku</Text>
      </TouchableOpacity>

      <LoginInput
        placeholder="Unesite svoje ime i prezime"
        value={profile.full_name}
        onChangeText={(text) => setProfile({ ...profile, full_name: text })}
      />

      <LoginInput
        placeholder="Unesite svoje godine"
        value={profile.age}
        onChangeText={(text) => setProfile({ ...profile, age: text })}
        keyboardType="numeric"
      />

      <LoginButton title="Spremi profil" onPress={handleSaveProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    padding: 10,
    backgroundColor: "navy",
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 5,
    width: "80%",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});
