import 'react-native-url-polyfill/auto';
import React from "react";
import { AuthProvider } from "./AuthContext";
import Navigation from "./Navigation";

export default App = () => {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
};