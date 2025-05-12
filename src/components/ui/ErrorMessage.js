import React from "react";
import {Text, View, StyleSheet} from "react-native";

export default function ErrorMessage ({error}) {
    if (!error) return null;
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
                {error}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: "#ffd1d1",
        borderColor: "#9e5555",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        marginVertical: 8,
        width: "80%"
    },
    errorText: {
        color: "red",
        fontSize: 14,
        textAlign: "center"
    }
});