import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, Image, Dimensions, Platform } from "react-native";
import { supabase } from "../supabase";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";

const screenWidth = Dimensions.get("window").width;
const isLargeScreen = Platform.OS === "web" && screenWidth > 600;

export default function RegisterView({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [confirmPassw, setConfirmPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    setErrorMsg("");

    if (passw !== confirmPassw) {
      setErrorMsg("Lozinke se ne podudaraju.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: passw,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setErrorMsg("Korisnik nije vraćen iz Supabase.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          points: 0,
        },
      ]);

    if (profileError) {
      setErrorMsg("Greška pri spremanju profila: " + profileError.message);
      return;
    }

    // Automatska prijava nakon uspješne registracije
    try {
      await signIn(email, passw);
    } catch (err) {
      setErrorMsg("Račun je kreiran, ali prijava nije uspjela.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={require("../assets/logo-dark.png")} style={styles.logo} />
      </View>

      <View style={styles.formBox}>
        <Text style={styles.title}>Registracija</Text>

        <LoginInput
          placeholder="Unesite Vašu email adresu"
          value={email}
          secureTextEntry={false}
          onChangeText={setEmail}
        />

        <LoginInput
          placeholder="Unesite lozinku"
          value={passw}
          secureTextEntry={true}
          onChangeText={setPassw}
        />

        <LoginInput
          placeholder="Potvrdite lozinku"
          value={confirmPassw}
          secureTextEntry={true}
          onChangeText={setConfirmPassw}
        />

        <ErrorMessage error={errorMsg} />

        <LoginButton title="Registriraj se" onPress={handleRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoBox: {
    marginBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  formBox: {
    width: isLargeScreen ? 400 : "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#000000",
  },
});
