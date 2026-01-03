import axios from "axios";

const api = axios.create({
    baseURL: "http://househub.test/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
            } else if (error.response.status === 403) {
                // Handle 403 Forbidden - user doesn't have permission
                const message = error.response.data?.message || "You don't have permission to perform this action.";
                // Don't redirect, just show error
            }
        }
        return Promise.reject(error);
    }
);

// Helper function to extract user-friendly error messages
export const getErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred.";
    
    if (error.response) {
        const data = error.response.data;
        
        // Handle validation errors
        if (data.errors && typeof data.errors === 'object') {
            const firstError = Object.values(data.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
                return firstError[0];
            }
        }
        
        // Handle message field
        if (data.message) {
            return data.message;
        }
        
        // Handle error field
        if (data.error) {
            return typeof data.error === 'string' ? data.error : data.error.message || "An error occurred.";
        }
    }
    
    // Handle network errors
    if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
            return "Network error. Please check your connection and try again.";
        }
        return error.message;
    }
    
    return "An unexpected error occurred. Please try again.";
};

export default api;
