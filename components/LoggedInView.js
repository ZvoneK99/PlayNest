import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import { AuthContext } from "../AuthContext";  // Provjeri da je AuthContext ispravno importan
import { useNavigation } from "@react-navigation/native";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import { TouchableOpacity } from "react-native";

export default function LoggedInView() {
  const { signOut } = useContext(AuthContext);  // Provjeri da koristiš ispravno funkciju iz AuthContext
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    points: 0,
    profileImage: "https://uvlyxwknrtgayncklxjc.supabase.co/storage/v1/object/public/MathApp/pngwing.com.png"
  });
  const [loading, setLoading] = useState(true);

  // Funkcija za dohvat profila korisnika
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({ ...docSnap.data() });
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

  // Funkcija za spremanje profila korisnika
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

  // Funkcija za odjavu
  const handleLogout = async () => {
    try {
      await signOut(navigation);  // Pozivamo signOut funkciju iz AuthContext
      navigation.navigate("Login");  // Preusmjeravanje na Login ekran
    } catch (error) {
      console.error("Greška pri odjavi: ", error);
      Alert.alert("Greška", "Došlo je do greške pri odjavi.");
    }
  };

  // Prikazivanje loading stanja dok se profil učitava
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Učitavanje profila...</Text>
      </View>
    );
  }

  // Funkcija za upload slike (ako je potrebno)
  const handleUploadImage = () => {
    // Implementiraj funkcionalnost za upload slike ovdje
    console.log("Upload image functionality here");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dobrodošli na sustav</Text>

      <LoginButton title="Odjavi se" onPress={handleLogout} />  {/* Gumb za odjavu */}

      {profile.profileImage ? (
        <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
      ) : (
        <Text>Nema profilne slike!</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUploadImage}>
        <Text style={styles.buttonText}>Postavi profilnu sliku</Text>
      </TouchableOpacity>

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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
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
    textAlign: 'center',
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
    color: '#FFFFFF', 
    fontSize: 16,
    textAlign: "center"
  },
});
