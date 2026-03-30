import api from "@/services/api";

export const projectFormService = {
  async getFormData() {
    const [areasRes, categoriesRes] = await Promise.all([
      api.get("areas/"),
      api.get("categories/"),
    ]);

    return {
      areas: areasRes.data.results ?? areasRes.data,
      categories: categoriesRes.data.results ?? categoriesRes.data,
    };
  },

  async createProject(formData) {
    const response = await api.post("projects/", {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    });
    return response.data;
  },
};
