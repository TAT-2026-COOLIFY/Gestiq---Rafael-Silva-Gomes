import api from "@/services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function resolvePhotoUrl(photo) {
  if (!photo) return null;
  return photo.startsWith("http") ? photo : `${BASE_URL}${photo}`;
}

export const settingsService = {
  async getProfile() {
    const response = await api.get("me/");
    const data = response.data;
    return {
      ...data,
      photo: resolvePhotoUrl(data.photo),
    };
  },

  async updateProfile(formData, photoFile) {
    const dataToSend = new FormData();
    dataToSend.append("first_name", formData.first_name);
    dataToSend.append("last_name", formData.last_name);
    dataToSend.append("email", formData.email);
    dataToSend.append("job_title", formData.job_title);
    dataToSend.append("department", formData.department);

    if (photoFile) {
      dataToSend.append("photo", photoFile);
    }

    const response = await api.put("me/", dataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      ...response.data,
      photo: resolvePhotoUrl(response.data.photo),
    };
  },
};
