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

    // Try to load user from sessionStorage on mount
    const [user, setUser] = useState<User | null>(() => {
        const stored = sessionStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me/');
            setUser(response.data);
            sessionStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            setUser(null);
            sessionStorage.removeItem("user");
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            await checkAuth();
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        try {
            const response = await api.post('/auth/login/', {
                username: emailOrUsername, // Backend accepts username
                password: password
            });
            if (response.data.user) {
                setUser(response.data.user);
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
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
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
            }
        } catch (error: any) {
            let errorMessage = "Could not create account";
            const errorData = error.response?.data?.error;

            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (typeof errorData === 'object' && errorData !== null) {
                // Parse validation errors object into readable message
                const messages = Object.entries(errorData)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(', ');
                errorMessage = messages || "Validation failed";
            }

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
            sessionStorage.removeItem("user");
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
