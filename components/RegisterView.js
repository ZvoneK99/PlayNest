import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import { supabase } from "../supabase"; // Provjeri da je točan path
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";

export default function RegisterView({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [confirmPassw, setConfirmPassw] = useState(""); // Za potvrdu lozinke
  const [name, setName] = useState("");
  const [surname, setSurname] = useState(""); // Prezime
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    setErrorMsg("");

    // Provjera valjanosti unosa
    if (!email || !passw || !name || !surname || !confirmPassw) {
      setErrorMsg("Sva polja su obavezna!");
      return;
    }

    // Provjera email formata (jednostavna provjera)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Unesite ispravan email.");
      return;
    }

    // Provjera da lozinke odgovaraju
    if (passw !== confirmPassw) {
      setErrorMsg("Lozinke se ne podudaraju.");
      return;
    }

    // Pozivamo Supabase za registraciju korisnika
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passw,
    });

    console.log("Signup response:", data);  // Logiranje odgovora

    if (error) {
      console.log("Signup error:", error);
      setErrorMsg(error.message);
    } else if (data.user) {
      // Umetanje podataka u tabelu 'users'
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: data.user.email,
            name: name,
            surname: surname, // Prezime
            points: 0,
          },
        ]);

      if (insertError) {
        console.log("Insert error:", insertError);
        setErrorMsg(insertError.message);
      } else {
        login(); // Pozivanje funkcije za login, ili navigacija na drugi screen
        // navigation.navigate('Home');  // Ako želiš direktno navigirati na Home screen
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>
      <LoginInput
        placeholder="Unesite ime"
        value={name}
        secureTextEntry={false}
        onChangeText={setName}
      />
      <LoginInput
        placeholder="Unesite prezime"
        value={surname}
        secureTextEntry={false}
        onChangeText={setSurname}
      />
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
