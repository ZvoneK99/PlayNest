import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function LoginButton ({title, onPress}) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        backgroundColor: "navy",
        borderWidth: 1,
        borderColor: "blue",
        borderRadius: 5,
        width: "80%",
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF', 
        fontSize: 16,
        textAlign: "center"
    },
});