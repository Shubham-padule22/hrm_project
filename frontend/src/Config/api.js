// src/config/api.js
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;

    console.log('Current hostname:', hostname); // Debug log

    if (hostname === "localhost") {
        // When developing locally, use the internal IP
        return "http://192.168.1.37/hrmapi";

        // return "http://10.108.1.50:8888";
    } else if (hostname === "122.176.232.35") {
        // When deployed on production server, use PUBLIC_API
        return "http://122.176.232.35:7898/hrmapi";
    } else {
        // Default fallback for production
        return "http://192.168.1.37/hrmapi";
    }
};

export const API_BASE_URL = getApiBaseUrl();