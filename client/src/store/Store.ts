import axios from "axios";
import {makeAutoObservable, toJS} from "mobx";
import {IUser} from "../models/IUser";
import AuthService from "../services/AuthService";
import {AuthResponse} from "../models/AuthResponse";
import {API_URL} from "../api";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = false;


    constructor() {
        makeAutoObservable(this)
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setIsLoading(bool: boolean) {
        this.isLoading = bool;
    }

    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }

    async registration(email: string, password: string) {
        try {
            const response = await AuthService.registration(email, password);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }

    logout = async () => {
        try {
            const response = await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    };

    /**
     * Проверка пользователя на авторизацию
     */
    async checkAuth() {
        this.setIsLoading(true);
        try {
            // обращаемся напрямую к axios для того, чтобы лишний раз не использовать интерсепторы
            // т.к. может вернуться 401 ошибка с тем, что пользователь не авторизован
            const response = await axios.get<AuthResponse>(
                `${API_URL}/refresh`,
                {withCredentials: true}
            );
            // если рефреш токен еще валиден
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        } finally {
            this.setIsLoading(false);
        }
    }

}
