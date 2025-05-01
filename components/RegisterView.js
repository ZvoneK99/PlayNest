import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import { supabase } from "../supabase";  // Tvoj Supabase klijent
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext"; // Pretpostavljam da koristiš AuthContext za upravljanje prijavama

export default function RegisterView({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    setErrorMsg(""); // Resetiraj prethodne greške

    // Koristi Supabase za registraciju korisnika
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passw,
    });

    if (error) {
      // Ako dođe do greške prikaži poruku
      setErrorMsg(error.message);
    } else {
      // Ako je registracija uspješna, možeš logirati korisnika automatski
      login(); 
      // Možda želiš i navigirati korisnika nakon uspješne registracije
      // navigation.navigate("Home");
    }
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
