import axios from 'axios';

const learningAxios = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default learningAxios;