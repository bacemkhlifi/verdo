import axios from "axios";
import AuthService from "./AuthService";

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "https://verdo-back.onrender.com"
    : "https://verdo-back.onrender.com/api/auth");

const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "").replace(/\/auth$/, "");
const API_URL = `${normalizedBaseUrl}/`;

const getAuthConfig = () => {
  const currentUser = AuthService.getCurrentUser();
  const token = currentUser?.token || currentUser?.data?.token;

  return {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

class ApiService {
  async get(path, config = {}) {
    const response = await axios.get(`${API_URL}${path}`, {
      ...getAuthConfig(),
      ...config,
      headers: {
        ...getAuthConfig().headers,
        ...(config.headers || {}),
      },
    });
    return response.data;
  }

  async post(path, payload) {
    const response = await axios.post(`${API_URL}${path}`, payload, getAuthConfig());
    return response.data;
  }

  async put(path, payload) {
    const response = await axios.put(`${API_URL}${path}`, payload, getAuthConfig());
    return response.data;
  }

  async patch(path, payload) {
    const response = await axios.patch(`${API_URL}${path}`, payload, getAuthConfig());
    return response.data;
  }

  async delete(path) {
    const response = await axios.delete(`${API_URL}${path}`, getAuthConfig());
    return response.data;
  }
}

export default new ApiService();
