import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function LoggedOutView() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigation = useNavigation();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, passw)
      .then(() => {
        login();
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          setErrorMsg("Email koji ste unijeli nije povezan sa računom.");
        } else if (error.code === "auth/invalid-email") {
          setErrorMsg("Uneseni email nije ispravan.");
        } else if (error.code === "auth/wrong-password") {
          setErrorMsg("Pogrešna lozinka.");
        } else {
          setErrorMsg("Došlo je do pogreške. Pokušajte ponovno.");
        }
      });
  };

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
