import axios from 'axios';

// ⚠️ IMPORTANTE: Verifica que este puerto sea el mismo de tu Swagger (Backend)
const BASE_URL = 'https://localhost:7263/api'; 

const api = axios.create({
    baseURL: BASE_URL,
});

// Este "Interceptor" pega tu token en cada petición automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;