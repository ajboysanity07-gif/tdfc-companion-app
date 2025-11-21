// src/api/axios-client.ts
import axios from "axios";

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
