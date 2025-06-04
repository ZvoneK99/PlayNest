import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../supabase"; // tvoj supabase klijent
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import { AuthContext } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function LoggedInView() {
  const { signOut } = useContext(AuthContext);
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

        let { data, error } = await supabase
          .from("profiles")
          .select("full_name, age, avatar_url, points")
          .eq("id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
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
        email: session.user.email,
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age, 10) : null,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

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

  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Greška", "Dopuštenje za pristup galeriji nije odobreno.");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (pickerResult.canceled) return;

      const imageUri = pickerResult.assets?.[0]?.uri;
      if (!imageUri) {
        Alert.alert("Greška", "Nije odabrana nijedna slika.");
        return;
      }

      // čitanje slike kao base64 string
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // kreiramo Blob za upload u Supabase
      const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();

      const fileExt = imageUri.split(".").pop();
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Greška pri uploadu slike:", uploadError);
        Alert.alert("Greška", "Upload slike nije uspio: " + uploadError.message);
        return;
      }

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 dana valjanosti linka

      if (signedUrlError) {
        console.error("Greška kod signed URL:", signedUrlError);
        Alert.alert("Greška", "Ne mogu dobiti signed URL.");
        return;
      }

      setProfile({ ...profile, avatar_url: signedUrlData.signedUrl });
      Alert.alert("Uspjeh", "Slika je postavljena!");
    } catch (error) {
      console.error("Greška pri uploadu slike:", error);
      Alert.alert("Greška", "Došlo je do problema pri postavljanju slike.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="navy" />
        <Text style={styles.text}>Učitavanje profila...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dobrodošli na sustav</Text>

      <LoginButton title="Odjavi se" onPress={handleLogout} />

      {profile.avatar_url ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
        </View>
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
  imageContainer: {
    marginVertical: 15,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "blue",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
