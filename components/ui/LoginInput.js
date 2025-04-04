import React from "react"
import { TextInput, StyleSheet } from "react-native";

export default function LoginInput ({placeholder, value, onChangeText, secureTextEntry}) {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText} 
            secureTextEntry={secureTextEntry}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 12,
        paddingLeft: 8,
        width: "80%",
    }
});