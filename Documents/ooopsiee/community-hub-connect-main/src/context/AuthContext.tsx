import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

type User = {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    role: "user" | "admin";
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me/');
            setUser(response.data);
        } catch (error) {
            // User is not authenticated
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (emailOrUsername: string, password: string) => {
        try {
            const response = await api.post('/auth/login/', {
                username: emailOrUsername, // Backend accepts username
                password: password
            });

            if (response.data.user) {
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Invalid credentials";
            throw new Error(errorMessage);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            // Extract first name from full name
            const firstName = name.split(' ')[0];

            // Use email as username for simplicity
            const username = email.split('@')[0];

            const response = await api.post('/auth/register/', {
                username: username,
                email: email,
                password: password,
                first_name: firstName
            });

            if (response.data.user) {
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Could not create account";
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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
