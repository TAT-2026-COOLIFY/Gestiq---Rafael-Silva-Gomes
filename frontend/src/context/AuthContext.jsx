import { createContext, useState, useEffect } from "react";
import { authService } from "@/features/Auth/services/authService";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser]  = useState(null);
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setUser({ token: savedToken });
        }
        setLoading(false);
    }, []);

    async function signIn(username, password) {
        const data = await authService.login(username, password);
        localStorage.setItem("token", data.access);
        setUser({ token: data.access });
    }

    function signOut() {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login";
    }

    return (
        <AuthContext.Provider value={{ user, signed: !!user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
}