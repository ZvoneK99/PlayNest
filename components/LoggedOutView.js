import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import LoginInput from "./ui/LoginInput";
import LoginButton from "./ui/LoginButton";
import ErrorMessage from "./ui/ErrorMessage";
import { AuthContext } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const isLargeScreen = Platform.OS === "web" && screenWidth > 600;

export default function LoggedOutView() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [passw, setPassw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigation = useNavigation();

  const handleLogin = async () => {
    setErrorMsg("");
    try {
      await signIn(email, passw);
    } catch (error) {
      setErrorMsg("Greška pri prijavi. Provjerite podatke.");
    }
  };

  const handleRegisterRedirect = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={require("../assets/logo-dark.png")} style={styles.logo} />
      </View>

      <View style={styles.formBox}>
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
          <Text style={styles.registerPrompt}>Nemate račun?</Text>
          <TouchableOpacity onPress={handleRegisterRedirect}>
            <Text style={styles.registerText}>Registrirajte se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  alignItems: "center",          // centriranje djece horizontalno
  justifyContent: "center",      // centriranje djece vertikalno

},

  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerPrompt: {
    color: "#fff",
  },
  registerText: {
    color: "#00bfff",
    marginTop: 5,
    fontWeight: "bold",
  },
});
