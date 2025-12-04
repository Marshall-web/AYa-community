import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
    id: string;
    name: string;
    email: string;
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
        // Check for stored user on mount
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                // For demo purposes, we'll allow any login if it matches a stored user
                // OR if it's a fresh login, we'll just simulate success for now
                // BUT to be more realistic, let's check against "users" in localStorage

                const users = JSON.parse(localStorage.getItem("users") || "[]");
                const foundUser = users.find((u: any) => u.email === email && u.password === password);

                if (foundUser) {
                    const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role || "user" };
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                    resolve();
                } else {
                    // Fallback for demo: if no users exist yet, allow admin/admin
                    if (email === "admin" && password === "admin123") {
                        const adminUser = { id: "admin-1", name: "Administrator", email: "admin", role: "admin" as const };
                        setUser(adminUser);
                        localStorage.setItem("user", JSON.stringify(adminUser));
                        resolve();
                    } else {
                        reject(new Error("Invalid credentials"));
                    }
                }
            }, 1000);
        });
    };

    const signup = async (name: string, email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem("users") || "[]");

                if (users.find((u: any) => u.email === email)) {
                    reject(new Error("User already exists"));
                    return;
                }

                const newUser = {
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    email,
                    password, // In a real app, NEVER store plain text passwords
                    role: "user",
                };

                users.push(newUser);
                localStorage.setItem("users", JSON.stringify(users));

                const userData = { id: newUser.id, name: newUser.name, email: newUser.email, role: "user" as const };
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
                resolve();
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
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
