import axios from "axios";
import AuthService from "./AuthService";

const baseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "https://verdo-back.onrender.com"
    : "https://verdo-back.onrender.com/api");

const API_URL = `${baseUrl.replace(/\/+$/, "").replace(/\/api(?:\/auth)?$/, "")}/api/`;

const getAuthHeaders = () => {
  const currentUser = AuthService.getCurrentUser();
  const token = currentUser?.token || currentUser?.data?.token;

  if (!token) {
    throw new Error("User not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

class GeoAIService {
  async analyze(payload) {
    const requestBody = {
      ...payload,
    };

    const config = {
      withCredentials: true,
      timeout: 60000,
    };

    try {
      config.headers = getAuthHeaders();
    } catch (error) {
      config.headers = {};
    }

    const response = await axios.post(
      `${API_URL}geoai/analyze`,
      requestBody,
      config,
    );

    return response.data;
  }

  async getHistory() {
    const config = {
      withCredentials: true,
    };

    try {
      config.headers = getAuthHeaders();
    } catch (error) {
      config.headers = {};
    }

    const response = await axios.get(`${API_URL}geoai/history`, config);

    return response.data;
  }

  async estimate(payload) {
    const response = await axios.post(`${API_URL}geoai/estimate`, payload, {
      timeout: 10000,
    });
    return response.data;
  }
}

export default new GeoAIService();
