import axios from "axios";

const api = axios.create({
    baseURL:"https://memorymoviebackend2-4cdya45j.b4a.run"
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

export default api;