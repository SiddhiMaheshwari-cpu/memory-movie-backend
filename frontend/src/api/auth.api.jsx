import api from "./axios";

export const registerUser = (data) => {
    return api.post("/api/auth/register", data);
};

export const loginUser = (data) => {
    return api.post("/api/auth/login", data);
};

export const logoutUser = () => {
    return api.post("/api/auth/logout");
};