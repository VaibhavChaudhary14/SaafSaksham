"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: Initializing...");

        // Safety timeout: If Firebase doesn't respond in 5s, stop loading to allow UI to render
        const safetyTimeout = setTimeout(() => {
            console.warn("AuthProvider: Firebase initialization timed out. Forcing loading=false.");
            setLoading((prev) => {
                if (prev) return false;
                return prev;
            });
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("AuthProvider: Check finished. User:", firebaseUser ? "Logged In" : "Logged Out");
            clearTimeout(safetyTimeout);
            setUser(firebaseUser);
            setLoading(false);
        }, (error) => {
            console.error("AuthProvider: Firebase Error:", error);
            clearTimeout(safetyTimeout);
            setLoading(false);
        });

        return () => {
            clearTimeout(safetyTimeout);
            unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
