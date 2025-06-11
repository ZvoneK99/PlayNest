import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { supabase } from "../supabase";
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
      "https://uvlyxwknrtgayncklxjc.supabase.co/storage/v1/object/public/avatars/default.png",
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

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

  const pickImage = async (fromCamera = false) => {
    let pickerResult;
    if (fromCamera) {
      pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });
    } else {
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });
    }
    return pickerResult;
  };

  const handleUploadImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!cameraPerm.granted && !mediaPerm.granted) {
          Alert.alert("Greška", "Dopuštenje za pristup kameri ili galeriji nije odobreno.");
          return;
        }
      }

      let pickerResult;

      if (Platform.OS === "web") {
        pickerResult = await pickImage(false);
      } else if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Odustani", "Kamera", "Galerija"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              pickerResult = await pickImage(true);
            } else if (buttonIndex === 2) {
              pickerResult = await pickImage(false);
            } else {
              return;
            }
            await processPickedImage(pickerResult);
          }
        );
        return;
      } else {
        await new Promise((resolve) => {
          Alert.alert(
            "Odaberi izvor slike",
            "",
            [
              {
                text: "Kamera",
                onPress: async () => {
                  pickerResult = await pickImage(true);
                  await processPickedImage(pickerResult);
                  resolve();
                },
              },
              {
                text: "Galerija",
                onPress: async () => {
                  pickerResult = await pickImage(false);
                  await processPickedImage(pickerResult);
                  resolve();
                },
              },
              {
                text: "Odustani",
                style: "cancel",
                onPress: () => resolve(),
              },
            ],
            { cancelable: true }
          );
        });
        return;
      }

      await processPickedImage(pickerResult);
    } catch (error) {
      console.error("Greška pri uploadu slike:", error);
      Alert.alert("Greška", "Došlo je do greške pri uploadu slike.");
    }
  };

  const processPickedImage = async (pickerResult) => {
    try {
      if (!pickerResult || pickerResult.canceled) return;

      const fileUri = pickerResult.assets[0].uri;
      const fileExt = fileUri.split(".").pop();
      const fileName =
        Platform.OS === "web"
          ? pickerResult.assets[0].fileName || `web_upload_${Date.now()}.jpg`
          : `${session.user.id}_${Date.now()}.${fileExt}`;

      let fileData;
      let contentType = "image/jpeg";

      if (Platform.OS === "web") {
        const response = await fetch(fileUri);
        fileData = await response.blob();
        contentType = fileData.type || "image/jpeg";
      } else {
        const base64 = pickerResult.assets[0].base64;
        fileData = Buffer.from(base64, "base64");
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, fileData, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        Alert.alert("Greška", "Upload slike nije uspio.");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const avatarUrlWithCacheBust = publicUrl + "?v=" + Date.now();

      setProfile({ ...profile, avatar_url: avatarUrlWithCacheBust });

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Update profile error:", updateError);
      }

      Alert.alert("Uspjeh", "Slika je uspješno postavljena!");
    } catch (error) {
      console.error("Greška pri uploadu slike:", error);
      Alert.alert("Greška", "Došlo je do greške pri uploadu slike.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="navy" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
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
  formBox: {
    width: "100%",
    maxWidth: 400,
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
    width: "100%",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});
