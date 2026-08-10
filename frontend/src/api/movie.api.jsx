import api from "./axios";


export const getMovies = () => {
    return api.get("/movies");
};


export const createMovie = (data) => {
    return api.post("/movies", data);
};