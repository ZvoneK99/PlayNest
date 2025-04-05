import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Alert, Touchable, Image } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import { AuthContext } from "../AuthContext";
//import * as ImagePicker from "expo-image-picker"
//import { supabase } from "../SupabaseClient";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import { TouchableOpacity } from "react-native";

export default function LoggedInView() {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    points: 0,
    profileImage: "https://uvlyxwknrtgayncklxjc.supabase.co/storage/v1/object/public/MathApp/pngwing.com.png"
  });
  const [loading, setLoading] = useState(true);

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

  const handleUploadImage = async () => {
    const userId = auth.currentUser.uid;
    console.log(userId);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    if (!result.canceled) {
      const {uri} = result.assets[0];
      const fileName = `${userId}-${Date.now()}.jpg`;

      try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const {data, error} = await supabase.storage
                        .from("MathApp")
                        .upload(fileName, blob);

        

        if (error) {
          Alert.alert("Greška", "Datoteka nije učitana!");
          return;
        }
        const {data: publicUrlData } = supabase.storage
                        .from("MathApp")
                        .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        setProfile((prev) => ({...prev, profileImage: publicUrl}));
        // await handleSaveProfile ();

      } catch (uploadError) {

      }
    }
  }

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