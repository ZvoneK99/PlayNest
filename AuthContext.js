import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Samo postavi user ako postoji sesija, ali NE isLoggedIn!
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session && data.session.user) {
                setUser(data.session.user);
                // setIsLoggedIn(true); // NE!
            }
        };
        checkSession();

        // Slušaj samo odjavu
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === "SIGNED_OUT") {
                setUser(null);
                setIsLoggedIn(false);
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password) => {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error("Greška pri registraciji:", error);
        } else {
            console.log("Korisnik registriran:", user);
        }
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error("Greška pri prijavi:", error);
            throw error;
        } else {
            setUser(data.user);
            setIsLoggedIn(true);
            console.log("Korisnik prijavljen:", data.user);
        }
    };

    const signOut = async (navigation) => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Greška pri odjavi:", error);
        } else {
            setIsLoggedIn(false);
            setUser(null);
            if (navigation) navigation.navigate("Login");
            console.log("Korisnik odjavljen");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, signUp, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);