import api from "@/services/api";

export const authService = {
    login: async (username, password) => {
        const response = await api.post("/token/", { username, password });
        return response.data; 
    },
    refresh: async (refreshToken) => {
        const response = await api.post("/token/refresh/", {
            refresh: refreshToken,
        });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post("/register/", userData);
        return response.data;
    }
};
