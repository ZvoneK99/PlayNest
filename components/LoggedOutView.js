import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

export default function LoggedOutView() {
  const { login } = useContext(AuthContext); // login funkcija iz AuthContext-a
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigation = useNavigation();

  // Handle login funkcija
  const handleLogin = async () => {
    setErrorMsg(""); // Reset error poruka

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passw,
    });

    if (error) {
      // Prikazivanje specifičnih poruka o greškama
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("Neispravan email ili lozinka.");
      } else {
        setErrorMsg("Greška pri prijavi: " + error.message);
      }
    } else {
      login(); // Pozivamo login funkciju iz AuthContext-a
    }
  };

  // Preusmjeravanje na ekran za registraciju
  const handleRegisterRedirect = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <LoginInput
        placeholder="Unesite Vašu email adresu"
        value={email}
        secureTextEntry={false}
        onChangeText={setEmail}
      />

      <LoginInput
        placeholder="Unesite vašu lozinku"
        secureTextEntry={true}
        value={passw}
        onChangeText={setPassw}
      />

      <ErrorMessage error={errorMsg} />
      <LoginButton title="Prijava" onPress={handleLogin} />

      <View style={styles.registerContainer}>
        <Text>Nemate račun?</Text>
        <TouchableOpacity onPress={handleRegisterRedirect}>
          <Text style={styles.registerText}>Registrirajte se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#007bff",
    marginTop: 5,
    fontWeight: "bold",
  },
});
