import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./supabase"; // Osiguraj da je putanja točna
import { Text } from "react-native";

// Kreiramo AuthContext
export const AuthContext = createContext();

// AuthProvider komponenta koja pruža korisničke podatke i funkcije za prijavu/odjavu
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Dodajemo isLoggedIn stanje

    useEffect(() => {
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Greška pri dohvaćanju sesije:", error);
            } else if (data?.session) {
                setUser(data.session.user);
                setIsLoggedIn(true);  // Korisnik je prijavljen ako postoji sesija
            } else {
                setIsLoggedIn(false);  // Ako nema sesije, korisnik nije prijavljen
                setUser(null);
            }
            setLoading(false);  // Završava učitavanje
        };

        getSession();  // Pozivamo funkciju za dohvat sesije

        // Subscribing to auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoggedIn(!!session?.user); // Ažuriramo isLoggedIn stanje
        });

        return () => {
            listener?.subscription.unsubscribe(); // Čistimo listener kad se komponenta unmounta
        };
    }, []);  // Pokreće se samo jednom, kada se komponenta mounta

    // Funkcija za registraciju korisnika
    const signUp = async (email, password) => {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error("Greška pri registraciji:", error);
        } else {
            console.log("Korisnik registriran:", user);
        }
    };

    // Funkcija za prijavu korisnika
    const signIn = async (email, password) => {
        const { user, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error("Greška pri prijavi:", error);
            
        } else {
            console.log("Korisnik prijavljen:", user);
        }
    };

    // Funkcija za odjavu korisnika
    const signOut = async (navigation) => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Greška pri odjavi:", error);
        } else {
            console.log("Korisnik odjavljen");
            setIsLoggedIn(false); // Nakon odjave postavljamo isLoggedIn na false
            setUser(null); // Čistimo korisničke podatke
            navigation.navigate("Login");  // Navigiraj na Login ekran nakon odjave
        }
    };

    if (loading) {
        return <Text>Učitavam...</Text>; // Prikazuje loading poruku dok se sesija učitava
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook za korištenje AuthContext-a
export const useAuth = () => useContext(AuthContext);
