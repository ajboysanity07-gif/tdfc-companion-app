// src/api/axios-client.ts
import axios from "axios";

const AUTH_TOKEN_KEY = "auth_token";

const getStoredToken = () => (typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null);

export const setAuthToken = (token: string | null) => {
    if (typeof window === "undefined") return;
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete axiosClient.defaults.headers.common.Authorization;
    }
};

// Stick to relative paths so the SPA origin and the API always match (important for Sanctum cookies).
const API_BASE_URL = "";

const axiosClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true, // send/receive cookies for Sanctum
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Restore token on reload so protected API calls stay authenticated
const existingToken = getStoredToken();
if (existingToken) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

// Helper to get CSRF cookie for Laravel Sanctum
export const getCsrfCookie = () =>
    axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });

// Also wire the global axios defaults (Inertia boot) to stay in sync
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default axiosClient;
