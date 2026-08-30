import api from "./axios";

export const analyzeMovie = (movieId) => {
    return api.post(`/movies/${movieId}/analyze`);
};

export const generateScreenplay = (movieId) => {
    return api.post(`/movies/${movieId}/screenplay`);
};

export const generateScenePlan = (movieId) => {
    return api.post(`/movies/${movieId}/scene-plan`);
};

export const renderMovie = (movieId,theme) => {
    return api.post(`/movies/render/${movieId}`,{theme:theme});
};