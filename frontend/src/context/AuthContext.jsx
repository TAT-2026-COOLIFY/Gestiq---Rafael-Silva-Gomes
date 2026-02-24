import { createContext, useState, useEffect } from "react";
import { authService } from "@/features/Auth/services/authService";
import api from "@/services/api";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser]  = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const savedToken = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            // Só tenta dar o Parse se savedToken e savedUser existirem E não forem "undefined"
            if (savedToken && savedUser && savedUser !== "undefined") {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    api.defaults.headers.Authorization = `Bearer ${savedToken}`;
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Erro ao ler dados do localStorage:", error);
                    // Se o dado estiver corrompido, limpa para evitar erros infinitos
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                }
            }
            
            setLoading(false);
        }

        loadStorageData();
    }, []);

    async function signIn(username, password) {
        try {
            const data = await authService.login(username, password);
            
            const token = data.access;

            const userData = { 
                username: username,
                id: "1"
            };

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));

            api.defaults.headers.Authorization = `Bearer ${token}`;

            setUser(userData);

        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    }

    function signOut() {
        localStorage.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            signed: !!user, 
            signIn, 
            signOut, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
}