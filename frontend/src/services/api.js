import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth:unauthorized"));
}

function isAuthenticationRequest(url = "") {
  return url.includes("/token/");
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      refreshToken &&
      !isAuthenticationRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/api/token/refresh/`, { refresh: refreshToken })
            .then((response) => response.data.access)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const accessToken = await refreshPromise;
        localStorage.setItem("token", accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  },
);

export default api;
