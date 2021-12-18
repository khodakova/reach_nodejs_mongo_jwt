import $api from "../api";
import {AxiosResponse} from 'axios';
import {AuthResponse} from "../models/AuthResponse";
import {IUser} from "../models/IUser";

export default class UserService {
    static async getUsers(): Promise<AxiosResponse<IUser[]>> {
        return await $api.get<IUser[]>('/users')
    }
}
