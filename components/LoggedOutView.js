import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function LoggedOutView() {
  const { signIn } = useContext(AuthContext); // koristi signIn iz AuthContext-a
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigation = useNavigation();

  // Handle login funkcija
  const handleLogin = async () => {
    setErrorMsg(""); // Reset error poruka
    try {
      await signIn(email, passw); // koristi AuthContext signIn
      // Ako je prijava uspješna, isLoggedIn će biti true i Navigation će prikazati LoggedInTabs
    } catch (error) {
      setErrorMsg("Greška pri prijavi. Provjerite podatke.");
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