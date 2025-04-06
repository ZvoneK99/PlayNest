import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";

export default function RegisterView({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, passw)
      .then(() => {
        login(); // automatski ulogiraj korisnika
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });
  };

  return (
    <View style={styles.container}>
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
      <ErrorMessage error={errorMsg} />
      <LoginButton title="Registriraj se" onPress={handleRegister} />
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
});
