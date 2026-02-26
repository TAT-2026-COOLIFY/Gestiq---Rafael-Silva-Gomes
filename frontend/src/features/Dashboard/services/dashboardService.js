import api from "@/services/api";

export const dashboardService = {
    async getProjects() {
        const response = await api.get("projects/");
        return response.data;
    },
};