import axios from 'axios';
import {AuthResponse} from "../models/AuthResponse";

export const API_URL = 'http://localhost:5000/api';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
});

// перехватчик на запросы (установка заголовка Авторизация с токеном)
$api.interceptors.request.use((config) => {
    // @ts-ignore
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});


// перехватчик на ответ
$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && error.config && !originalRequest._isRetry) {
        // если originalRequest опять возвращает 401 статус, интерсептор не должен отработать
        // для этого помечаем isRetry - отработал ли хотя бы один раз запрос на обновление токенов
        originalRequest._isRetry = true;
        try {
            const response = await axios.get<AuthResponse>(
                `${API_URL}/refresh`,
                {withCredentials: true}
            );
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        } catch (e: any) {
            console.log('Пользователь не авторизован')
        }
    }
    throw error;
});

export default $api;
