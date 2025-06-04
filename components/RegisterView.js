import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import { supabase } from "../supabase";  // Tvoj Supabase klijent
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext"; 

export default function RegisterView({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

 const handleRegister = async () => {
  setErrorMsg(""); // Resetiraj greške

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

  // ⬇️ Insert u 'profiles' tablicu
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: user.id,      // isti kao id iz auth
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        points: 0,         // inicijalna vrijednost
      },
    ]);

  if (profileError) {
    setErrorMsg("Greška pri spremanju profila: " + profileError.message);
    return;
  }

  // ⬇️ Ako sve prođe OK:
  login(); // ili navigation.navigate("Home")
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
