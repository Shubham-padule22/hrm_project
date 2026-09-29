import axios from "axios";
import { API_BASE_URL } from "./api";
import { getToken, removeToken } from "../utils/auth";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle auth failure
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      removeToken();
      window.location.href = "/hrm/";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
