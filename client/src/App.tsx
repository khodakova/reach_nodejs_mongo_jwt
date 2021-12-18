import React, {useContext, useEffect, useState} from 'react';
import './App.css';
import LoginForm from "./components/LoginForm";
import {Context} from "./index";
import {observer} from "mobx-react-lite";
import UserService from "./services/UserService";
import {IUser} from "./models/IUser";

function App() {
    const {store} = useContext(Context);
    const [users, setUsers] = useState<IUser[]>([]);

    const getUsers = async () => {
        try {
            const res = await UserService.getUsers();
            setUsers(res.data);
        } catch (e: any) {
            console.log(e)
        }
    };

    // проверяем
    useEffect(() => {
        if (localStorage.getItem('token')) {
            store.checkAuth();
        }
    }, []);

    if (store.isLoading) {
        return <div>Загрузка...</div>
    }

    if (!store.isAuth) {
        return (
            <LoginForm/>
        )
    }

    return (
        <div className="App">
            <h2>
                {store.isAuth
                    ? `Пользователь ${store.user.email} авторизован`
                    : 'Необходимо авторизоваться'
                }
            </h2>
            <button onClick={store.logout}>Выйти</button>
            <button onClick={getUsers}>Загрузить пользователей</button>
            {users &&
            users.map((user: IUser) =>
                <div key={user.id}>{user.id} {user.email}</div>
            )}
        </div>
    );
}

export default observer(App);
